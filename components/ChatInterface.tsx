// components/ChatInterface.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import { Message } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import MessageList from './MessageList';
import InputArea from './InputArea';
import PromptTypeSelector from './PromptTypeSelector';
import ModelSelector from './ModelSelector';
import { Button } from '@/components/ui/button';
import {
    MessageCircle,
    Plus,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';

export default function ChatInterface() {
    const {
        sessions,
        currentSession,
        currentModel,
        currentPromptType,
        createSession,
        clearMessages,
        addMessage,
        updateLastMessage,
        deleteSession,
        selectSession,
        loadFromStorage,
    } = useChatStore();

    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [models, setModels] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load from storage on mount
    useEffect(() => {
        loadFromStorage();
    }, [loadFromStorage]);

    useEffect(() => {
        apiClient.getModels().then(setModels);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentSession?.messages]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || !currentSession || isLoading) return;

        try {
            setIsLoading(true);

            // Get existing messages BEFORE adding new ones (for API call)
            const existingMessages = currentSession.messages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            // Add user message to UI
            const userMessage: Message = {
                id: uuidv4(),
                role: 'user',
                content,
                promptType: currentPromptType,
                timestamp: new Date(),
            };
            addMessage(userMessage);

            // Create assistant message placeholder
            const assistantMessage: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: '',
                promptType: currentPromptType,
                timestamp: new Date(),
            };
            addMessage(assistantMessage);

            // Build messages for API: existing history + new user message
            const messagesForAPI = [
                ...existingMessages,
                { role: 'user', content }
            ];

            // Stream the response
            let fullResponse = '';
            await apiClient.chat(
                messagesForAPI,
                currentModel,
                currentPromptType,
                (chunk) => {
                    fullResponse += chunk;
                    updateLastMessage(fullResponse);
                }
            );

            setIsLoading(false);
        } catch (error) {
            // Don't show error for aborted requests
            if (error instanceof Error && error.name === 'AbortError') {
                setIsLoading(false);
                return;
            }
            console.error('Chat error:', error);
            setIsLoading(false);
            updateLastMessage('Error: Failed to get response. Is Ollama running?');
        }
    };

    const handleStopResponse = () => {
        apiClient.abort();
        setIsLoading(false);
    };

    const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        deleteSession(sessionId);
    };

    if (!currentSession) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-gray-600" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">AI Chat</h1>
                    <p className="text-gray-500 mb-6">Start a new conversation</p>
                    <Button
                        onClick={() => createSession('New Chat')}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Chat
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-gray-100">
            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? 'w-72' : 'w-0'
                    } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
            >
                {sidebarOpen && (
                    <>
                        <div className="p-4 border-b border-gray-200">
                            <Button
                                onClick={() => createSession()}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Chat
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-1">
                            {sessions.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No chats yet</p>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`group p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${currentSession.id === session.id
                                            ? 'bg-gray-100'
                                            : 'hover:bg-gray-50'
                                            }`}
                                        onClick={() => selectSession(session.id)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate font-medium text-gray-900 text-sm">{session.title}</p>
                                            <p className="text-xs text-gray-500">
                                                {session.messages.length} messages
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteSession(e, session.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                                        >
                                            <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50"
                                onClick={() => clearMessages()}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear Chat
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Header */}
                <div className="border-b border-gray-200 bg-white p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-600 hover:bg-gray-100"
                        >
                            {sidebarOpen ? (
                                <ChevronLeft className="w-5 h-5" />
                            ) : (
                                <ChevronRight className="w-5 h-5" />
                            )}
                        </Button>
                        <h1 className="text-lg font-semibold text-gray-900 truncate">{currentSession.title}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <ModelSelector models={models} />
                        <PromptTypeSelector />
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {currentSession.messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center">
                            <div>
                                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                                    <MessageCircle className="w-6 h-6 text-gray-500" />
                                </div>
                                <p className="text-gray-600">Start a conversation</p>
                            </div>
                        </div>
                    ) : (
                        <MessageList messages={currentSession.messages} isLoading={isLoading} />
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 bg-white p-4">
                    <InputArea onSend={handleSendMessage} onStop={handleStopResponse} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}
