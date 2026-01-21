// components/InputArea.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Square } from 'lucide-react';

interface InputAreaProps {
    onSend: (content: string) => void;
    onStop?: () => void;
    isLoading?: boolean;
}

export default function InputArea({ onSend, onStop, isLoading }: InputAreaProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            onSend(input);
            setInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading) {
                handleSend();
            }
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end bg-gray-100 border border-gray-200 rounded-2xl p-2">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={isLoading ? "AI is responding..." : "Ask me anything... (Shift+Enter for new line)"}
                    className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 p-3 resize-none focus:outline-none text-sm min-h-[44px] disabled:opacity-50"
                    rows={1}
                    disabled={isLoading}
                />
                {isLoading ? (
                    <Button
                        onClick={onStop}
                        className="bg-red-500 hover:bg-red-600 text-white h-10 w-10 p-0 rounded-xl shrink-0 transition-colors"
                        title="Stop generating"
                    >
                        <Square className="w-4 h-4 fill-current" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300 disabled:text-gray-500 h-10 w-10 p-0 rounded-xl shrink-0 transition-colors"
                        title="Send message"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                )}
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
                {isLoading ? "Click the stop button to cancel" : "AI can make mistakes. Consider checking important information."}
            </p>
        </div>
    );
}