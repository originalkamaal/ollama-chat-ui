// lib/api-client.ts
import { APIRequest, PROMPT_TYPES, PromptType } from '@/types';

export class APIClient {
    private baseUrl: string = '/api';
    private abortController: AbortController | null = null;

    async chat(
        messages: Array<{ role: string; content: string }>,
        model: string,
        promptType: PromptType,
        onChunk?: (chunk: string) => void
    ): Promise<string> {
        const systemPrompt = PROMPT_TYPES[promptType].systemPrompt;
        const fullMessages = [
            { role: 'system', content: systemPrompt },
            ...messages,
        ];

        const request: APIRequest = {
            messages: fullMessages,
            model,
            stream: !!onChunk,
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
        };

        if (onChunk) {
            return this.streamChat(request, onChunk);
        } else {
            return this.nonStreamChat(request);
        }
    }

    abort(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    private async streamChat(request: APIRequest, onChunk: (chunk: string) => void): Promise<string> {
        // Create new abort controller for this request
        this.abortController = new AbortController();

        try {
            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
                signal: this.abortController.signal,
            });

            if (!response.ok) throw new Error('Chat request failed');

            let fullResponse = '';
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error('No response body');

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n').filter((line) => line.trim());

                    for (const line of lines) {
                        try {
                            const parsed = JSON.parse(line);
                            // Ollama chat API returns message.content, not response
                            const content = parsed.message?.content || '';
                            if (content) {
                                onChunk(content);
                                fullResponse += content;
                            }
                        } catch {
                            // Ignore parse errors for incomplete JSON
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }

            return fullResponse;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Stream chat aborted');
                return ''; // Return empty on abort
            }
            console.error('Stream chat error:', error);
            throw error;
        } finally {
            this.abortController = null;
        }
    }

    private async nonStreamChat(request: APIRequest): Promise<string> {
        this.abortController = new AbortController();

        try {
            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
                signal: this.abortController.signal,
            });

            if (!response.ok) throw new Error('Chat request failed');
            const data = await response.json();
            return data.message?.content || '';
        } finally {
            this.abortController = null;
        }
    }

    async getModels(): Promise<string[]> {
        try {
            const response = await fetch(`${this.baseUrl}/models`);
            if (!response.ok) throw new Error('Failed to fetch models');
            const data = await response.json();
            return data.models?.map((m: any) => m.name) || ['mistral'];
        } catch (error) {
            console.error('Error fetching models:', error);
            return ['mistral', 'neural-chat'];
        }
    }

    async search(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
        try {
            const response = await fetch(`${this.baseUrl}/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error searching:', error);
            return [];
        }
    }
}

export const apiClient = new APIClient();