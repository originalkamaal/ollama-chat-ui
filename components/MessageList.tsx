// components/MessageList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Message } from '@/types';
import { Copy, Check, User, Bot, Brain, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

// Parse thinking content from response (for models like DeepSeek R1)
function parseThinkingContent(content: string): { thinking: string | null; response: string } {
    // Match <think>...</think> tags (case insensitive)
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i);

    if (thinkMatch) {
        const thinking = thinkMatch[1].trim();
        const response = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        return { thinking, response };
    }

    return { thinking: null, response: content };
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [expandedThinking, setExpandedThinking] = useState<Set<string>>(new Set());
    const [previousMessageCount, setPreviousMessageCount] = useState(0);

    // Auto-collapse thinking when new messages arrive (response complete)
    useEffect(() => {
        if (messages.length > previousMessageCount && !isLoading) {
            // A new message arrived and we're not loading - collapse all thinking
            setExpandedThinking(new Set());
        }
        setPreviousMessageCount(messages.length);
    }, [messages.length, isLoading, previousMessageCount]);

    // Auto-expand thinking for the last message while loading
    useEffect(() => {
        if (isLoading && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
                const { thinking } = parseThinkingContent(lastMessage.content);
                if (thinking) {
                    setExpandedThinking(prev => new Set(prev).add(lastMessage.id));
                }
            }
        }
    }, [isLoading, messages]);

    const handleCopy = (id: string, content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleThinking = (id: string) => {
        setExpandedThinking(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((message, index) => {
                const { thinking, response } = message.role === 'assistant'
                    ? parseThinkingContent(message.content)
                    : { thinking: null, response: message.content };
                const isThinkingExpanded = expandedThinking.has(message.id);
                const isLastMessage = index === messages.length - 1;
                const isStreaming = isLoading && isLastMessage && message.role === 'assistant';

                return (
                    <div
                        key={message.id}
                        className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {/* Avatar for assistant */}
                        {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                        )}

                        <div className={`flex-1 space-y-3 ${message.role === 'user' ? 'max-w-[75%]' : 'max-w-full'}`}>
                            {/* Thinking section (collapsible) */}
                            {thinking && (
                                <div className="bg-gray-100 border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => toggleThinking(message.id)}
                                        className="w-full px-4 py-2.5 flex items-center gap-2 text-left hover:bg-gray-200 transition-colors"
                                    >
                                        {isThinkingExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-gray-600" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-gray-600" />
                                        )}
                                        <Brain className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium" style={{ color: '#374151' }}>Thinking</span>
                                        {isStreaming && (
                                            <span className="ml-2 flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" />
                                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                            </span>
                                        )}
                                        <span className="text-xs ml-auto" style={{ color: '#6b7280' }}>
                                            {thinking.length} chars
                                        </span>
                                    </button>
                                    {isThinkingExpanded && (
                                        <div className="px-4 py-3 border-t border-gray-300 bg-gray-50">
                                            <div
                                                className="text-sm whitespace-pre-wrap max-h-80 overflow-y-auto font-mono leading-relaxed"
                                                style={{ color: '#1f2937' }}
                                            >
                                                {thinking}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Main response */}
                            {(response || message.role === 'user') && (
                                <div
                                    className={`group relative rounded-2xl ${message.role === 'user'
                                        ? 'bg-gray-900 text-white px-4 py-3 ml-auto'
                                        : 'text-gray-900'
                                        }`}
                                >
                                    <div className="overflow-hidden" style={{ overflowWrap: 'anywhere' }}>
                                        {message.role === 'assistant' ? (
                                            <div className="markdown-body">
                                                <ReactMarkdown

                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        // Paragraphs
                                                        p: ({ children }) => (
                                                            <p className="text-gray-800 leading-7 mb-4 last:mb-0">
                                                                {children}
                                                            </p>
                                                        ),
                                                        // Headings
                                                        h1: ({ children }) => (
                                                            <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 pb-2 border-b border-gray-200">
                                                                {children}
                                                            </h1>
                                                        ),
                                                        h2: ({ children }) => (
                                                            <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3">
                                                                {children}
                                                            </h2>
                                                        ),
                                                        h3: ({ children }) => (
                                                            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                                                                {children}
                                                            </h3>
                                                        ),
                                                        // Code blocks
                                                        code: ({ node, inline, className, children, ...props }: any) => {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            const language = match ? match[1] : '';

                                                            if (inline) {
                                                                return (
                                                                    <code
                                                                        className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-gray-200"
                                                                        {...props}
                                                                    >
                                                                        {children}
                                                                    </code>
                                                                );
                                                            }

                                                            return (
                                                                <div className="rounded-lg overflow-hidden">
                                                                    {language && (
                                                                        <div className="px-4 flex items-center justify-between">
                                                                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                                                {language}
                                                                            </span>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => navigator.clipboard.writeText(String(children))}
                                                                                className="h-6 px-2 text-xs text-gray-500 cursor-pointer"
                                                                            >
                                                                                <Copy className="w-3 h-3 mr-1" />
                                                                                Copy
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                    <pre className="p-4 overflow-x-auto">
                                                                        <code className="text-sm font-mono leading-relaxed" {...props}>
                                                                            {children}
                                                                        </code>
                                                                    </pre>
                                                                </div>
                                                            );
                                                        },
                                                        // Links
                                                        a: ({ href, children }) => (
                                                            <a
                                                                href={href}
                                                                className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {children}
                                                            </a>
                                                        ),
                                                        // Lists
                                                        ul: ({ children }) => (
                                                            <ul className="list-disc pl-6 my-3 space-y-2 text-gray-800">
                                                                {children}
                                                            </ul>
                                                        ),
                                                        ol: ({ children }) => (
                                                            <ol className="list-decimal pl-6 my-3 space-y-2 text-gray-800">
                                                                {children}
                                                            </ol>
                                                        ),
                                                        li: ({ children }) => (
                                                            <li className="leading-7">{children}</li>
                                                        ),
                                                        // Blockquote
                                                        blockquote: ({ children }) => (
                                                            <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700">
                                                                {children}
                                                            </blockquote>
                                                        ),
                                                        // Tables
                                                        table: ({ children }) => (
                                                            <div className="overflow-x-auto my-4">
                                                                <table className="min-w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                                                                    {children}
                                                                </table>
                                                            </div>
                                                        ),
                                                        thead: ({ children }) => (
                                                            <thead className="bg-gray-100">{children}</thead>
                                                        ),
                                                        th: ({ children }) => (
                                                            <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-900">
                                                                {children}
                                                            </th>
                                                        ),
                                                        td: ({ children }) => (
                                                            <td className="border border-gray-200 px-4 py-2 text-gray-800">
                                                                {children}
                                                            </td>
                                                        ),
                                                        // Horizontal rule
                                                        hr: () => <hr className="my-6 border-gray-200" />,
                                                        // Strong & emphasis
                                                        strong: ({ children }) => (
                                                            <strong className="font-semibold text-gray-900">{children}</strong>
                                                        ),
                                                        em: ({ children }) => (
                                                            <em className="italic">{children}</em>
                                                        ),
                                                    }}
                                                >
                                                    {response}
                                                </ReactMarkdown>
                                                {isStreaming && !response && (
                                                    <span className="inline-block w-2 h-5 bg-gray-400 animate-pulse ml-0.5" />
                                                )}
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap leading-relaxed" style={{ overflowWrap: 'anywhere' }}>
                                                {message.content}
                                            </p>
                                        )}
                                    </div>

                                    {/* Copy button for response */}
                                    {message.role === 'assistant' && response && !isStreaming && (
                                        <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(message.id, response)}
                                                className="h-7 px-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                            >
                                                {copiedId === message.id ? (
                                                    <>
                                                        <Check className="w-3 h-3 mr-1 text-green-600" />
                                                        <span className="text-xs text-green-600">Copied!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3 mr-1" />
                                                        <span className="text-xs">Copy response</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Avatar for user */}
                        {message.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                <User className="w-4 h-4 text-gray-700" />
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Loading indicator for new message */}
            {isLoading && messages.length > 0 && messages[messages.length - 1].role !== 'assistant' && (
                <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 shadow-sm">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                        <span className="text-sm">Thinking...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
