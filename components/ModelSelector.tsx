// components/ModelSelector.tsx
'use client';

import React from 'react';
import { useChatStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Cpu, ChevronDown, Check } from 'lucide-react';

interface ModelSelectorProps {
    models: string[];
}

export default function ModelSelector({ models }: ModelSelectorProps) {
    const { currentModel, setModel } = useChatStore();

    // Get a shorter display name
    const displayName = currentModel.length > 20
        ? currentModel.split(':')[0].split('/').pop() || currentModel
        : currentModel;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="bg-white border-gray-300 hover:bg-gray-50 text-gray-800 text-sm"
                >
                    <Cpu className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="truncate max-w-[120px] text-gray-800">{displayName}</span>
                    <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-gray-200 max-h-64 overflow-y-auto min-w-[200px]">
                {models.length > 0 ? (
                    models.map((model) => (
                        <DropdownMenuItem
                            key={model}
                            onClick={() => setModel(model)}
                            className="cursor-pointer hover:bg-gray-100 flex items-center justify-between text-gray-800"
                        >
                            <span className="truncate">{model}</span>
                            {model === currentModel && <Check className="w-4 h-4 ml-2 text-gray-900" />}
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled className="text-gray-500">
                        No models available (Is Ollama running?)
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}