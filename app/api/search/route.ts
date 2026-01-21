// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        // Using DuckDuckGo API (free, no key required)
        // For production, use Bing Search, Google Custom Search, or Perplexity API
        const response = await fetch('https://api.duckduckgo.com/', {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        const text = await response.text();

        // Parse DuckDuckGo HTML response (simplified)
        // For production, use a proper web search API
        const results = [
            {
                title: `Search results for: ${query}`,
                url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
                snippet: 'Use a proper search API key for production search results.',
            },
        ];

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Failed to perform search' },
            { status: 500 }
        );
    }
}