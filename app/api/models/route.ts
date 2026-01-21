
import { NextResponse } from 'next/server';
import { OllamaModel } from '@/types';

const OLLAMA_BASE_URL = process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || 'http://localhost:11434';

export async function GET() {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        const models: OllamaModel[] = data.models || [];

        return NextResponse.json({
            models: models.map((m) => ({
                name: m.name,
                modified_at: m.modified_at,
                size: m.size,
            })),
        });
    } catch (error) {
        console.error('Models API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch models',
                models: [
                    { name: 'mistral', modified_at: new Date().toISOString(), size: 0 },
                    { name: 'neural-chat', modified_at: new Date().toISOString(), size: 0 },
                ],
            },
            { status: 200 } // Return 200 with fallback models
        );
    }
}