export type PromptType = 'chat' | 'creative' | 'code' | 'research' | 'deep-research';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    promptType: PromptType;
    timestamp: Date;
    citations?: Citation[];
    researchMetadata?: ResearchMetadata;
}

export interface Citation {
    title: string;
    url: string;
    snippet: string;
}

export interface ResearchMetadata {
    searchQueries: string[];
    sources: Citation[];
    researchTime: number;
    relatedQueries: string[];
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    model: string;
}

export interface OllamaModel {
    name: string;
    modified_at: string;
    size: number;
}

export interface StreamChunk {
    model: string;
    response: string;
    done: boolean;
    created_at: string;
}

export interface APIRequest {
    messages: Array<{ role: string; content: string }>;
    model: string;
    stream: boolean;
    temperature?: number;
    topP?: number;
    topK?: number;
}

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

export interface ResearchResult {
    answer: string;
    sources: SearchResult[];
    relatedQueries: string[];
}

export const PROMPT_TYPES = {
    chat: {
        label: 'Chat',
        icon: 'MessageCircle',
        description: 'General conversation',
        systemPrompt: 'You are a helpful AI assistant. Provide clear, concise responses.'
    },
    creative: {
        label: 'Creative',
        icon: 'Sparkles',
        description: 'Creative writing & ideas',
        systemPrompt: 'You are a creative AI assistant. Generate imaginative, engaging, and original content. Think outside the box and provide unique perspectives.'
    },
    code: {
        label: 'Code',
        icon: 'Code2',
        description: 'Programming & debugging',
        systemPrompt: 'You are an expert programming assistant. Provide well-commented code, explain solutions, and follow best practices. Support multiple languages.'
    },
    research: {
        label: 'Research',
        icon: 'BookOpen',
        description: 'Research & analysis',
        systemPrompt: 'You are a research assistant. Provide detailed, well-sourced answers with citations. Be thorough and cite credible sources.'
    },
    'deep-research': {
        label: 'Deep Research',
        icon: 'Search',
        description: 'In-depth research with web search',
        systemPrompt: 'You are an advanced research assistant. Conduct comprehensive research, analyze multiple sources, and provide detailed insights with citations.'
    }
} as const;