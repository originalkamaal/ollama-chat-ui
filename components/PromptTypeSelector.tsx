// components/PromptTypeSelector.tsx
'use client';

import React from 'react';
import { useChatStore } from '@/lib/store';
import { PROMPT_TYPES, PromptType } from '@/types';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MessageCircle,
    Sparkles,
    Code2,
    BookOpen,
    Search,
    ChevronDown,
    Check,
} from 'lucide-react';

const ICON_MAP = {
    MessageCircle,
    Sparkles,
    Code2,
    BookOpen,
    Search,
};

export default function PromptTypeSelector() {
    const { currentPromptType, setPromptType } = useChatStore();
    const current = PROMPT_TYPES[currentPromptType];
    const CurrentIcon = ICON_MAP[current.icon as keyof typeof ICON_MAP];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="bg-white border-gray-300 hover:bg-gray-50 text-gray-800 text-sm"
                >
                    <CurrentIcon className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-gray-800">{current.label}</span>
                    <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-gray-200 min-w-[220px]">
                {Object.entries(PROMPT_TYPES).map(([key, config]) => {
                    const Icon = ICON_MAP[config.icon as keyof typeof ICON_MAP];
                    const isSelected = key === currentPromptType;
                    return (
                        <DropdownMenuItem
                            key={key}
                            onClick={() => setPromptType(key as PromptType)}
                            className="cursor-pointer hover:bg-gray-100 flex items-start gap-2 py-2"
                        >
                            <Icon className="w-4 h-4 mt-0.5 text-gray-600" />
                            <div className="flex-1">
                                <span className="font-medium text-gray-900">{config.label}</span>
                                <p className="text-xs text-gray-500">{config.description}</p>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-gray-900 mt-0.5" />}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}