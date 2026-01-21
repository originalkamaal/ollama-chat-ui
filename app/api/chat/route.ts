// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { APIRequest } from '@/types';

const OLLAMA_BASE_URL = process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || 'http://localhost:11434';

export async function POST(request: NextRequest) {
    try {
        const body: APIRequest = await request.json();

        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: body.model,
                messages: body.messages,
                stream: body.stream,
                temperature: body.temperature ?? 0.7,
                top_p: body.topP ?? 0.9,
                top_k: body.topK ?? 40,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        if (body.stream) {
            // Stream the response
            return new NextResponse(response.body, {
                headers: {
                    'Content-Type': 'application/json',
                    'Transfer-Encoding': 'chunked',
                },
            });
        } else {
            const data = await response.json();
            return NextResponse.json(data);
        }
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}