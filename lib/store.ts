// lib/store.ts
import { create } from 'zustand';
import { Message, ChatSession, PromptType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ChatStore {
    sessions: ChatSession[];
    currentSession: ChatSession | null;
    currentModel: string;
    currentPromptType: PromptType;

    // Session management
    createSession: (title?: string) => void;
    deleteSession: (id: string) => void;
    selectSession: (id: string) => void;
    updateSessionTitle: (id: string, title: string) => void;
    clearAllSessions: () => void;

    // Message management
    addMessage: (message: Message) => void;
    updateLastMessage: (content: string) => void;
    removeMessage: (id: string) => void;
    clearMessages: () => void;

    // Settings
    setModel: (model: string) => void;
    setPromptType: (type: PromptType) => void;

    // Persistence
    loadFromStorage: () => void;
    saveToStorage: () => void;
}

const DEFAULT_SESSION_TITLE = 'New Chat';

const createNewSession = (): ChatSession => ({
    id: uuidv4(),
    title: DEFAULT_SESSION_TITLE,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    model: 'hrbrmstr/jamba:latest'
});

export const useChatStore = create<ChatStore>((set, get) => ({
    sessions: [],
    currentSession: null,
    currentModel: 'hrbrmstr/jamba:latest',
    currentPromptType: 'chat',

    createSession: (title) => {
        const newSession = createNewSession();
        if (title) newSession.title = title;

        set((state) => ({
            sessions: [newSession, ...state.sessions],
            currentSession: newSession,
        }));

        get().saveToStorage();
    },

    deleteSession: (id) => {
        set((state) => {
            const sessions = state.sessions.filter((s) => s.id !== id);
            const currentSession =
                state.currentSession?.id === id
                    ? sessions[0] || null
                    : state.currentSession;
            return { sessions, currentSession };
        });
        get().saveToStorage();
    },

    selectSession: (id) => {
        set((state) => ({
            currentSession:
                state.sessions.find((s) => s.id === id) || state.currentSession,
        }));
    },

    updateSessionTitle: (id, title) => {
        set((state) => ({
            sessions: state.sessions.map((s) =>
                s.id === id ? { ...s, title } : s
            ),
            currentSession:
                state.currentSession?.id === id
                    ? { ...state.currentSession, title }
                    : state.currentSession,
        }));
        get().saveToStorage();
    },

    clearAllSessions: () => {
        set({ sessions: [], currentSession: null });
        get().saveToStorage();
    },

    addMessage: (message) => {
        set((state) => {
            if (!state.currentSession) return state;
            const updatedSession = {
                ...state.currentSession,
                messages: [...state.currentSession.messages, message],
                updatedAt: new Date(),
            };
            return {
                sessions: state.sessions.map((s) =>
                    s.id === state.currentSession!.id ? updatedSession : s
                ),
                currentSession: updatedSession,
            };
        });
        get().saveToStorage();
    },

    updateLastMessage: (content) => {
        set((state) => {
            if (!state.currentSession || state.currentSession.messages.length === 0)
                return state;

            const messages = [...state.currentSession.messages];
            const lastMessage = messages[messages.length - 1];
            messages[messages.length - 1] = { ...lastMessage, content };

            const updatedSession = {
                ...state.currentSession,
                messages,
                updatedAt: new Date(),
            };

            return {
                sessions: state.sessions.map((s) =>
                    s.id === state.currentSession!.id ? updatedSession : s
                ),
                currentSession: updatedSession,
            };
        });
        get().saveToStorage();
    },

    removeMessage: (id) => {
        set((state) => {
            if (!state.currentSession) return state;
            const updatedSession = {
                ...state.currentSession,
                messages: state.currentSession.messages.filter((m) => m.id !== id),
                updatedAt: new Date(),
            };
            return {
                sessions: state.sessions.map((s) =>
                    s.id === state.currentSession!.id ? updatedSession : s
                ),
                currentSession: updatedSession,
            };
        });
        get().saveToStorage();
    },

    clearMessages: () => {
        set((state) => {
            if (!state.currentSession) return state;
            const updatedSession = {
                ...state.currentSession,
                messages: [],
                updatedAt: new Date(),
            };
            return {
                sessions: state.sessions.map((s) =>
                    s.id === state.currentSession!.id ? updatedSession : s
                ),
                currentSession: updatedSession,
            };
        });
        get().saveToStorage();
    },

    setModel: (model) => {
        set({ currentModel: model });
        set((state) => {
            if (!state.currentSession) return state;
            const updatedSession = { ...state.currentSession, model };
            return {
                sessions: state.sessions.map((s) =>
                    s.id === state.currentSession!.id ? updatedSession : s
                ),
                currentSession: updatedSession,
            };
        });
        get().saveToStorage();
    },

    setPromptType: (type) => {
        set({ currentPromptType: type });
    },

    loadFromStorage: () => {
        if (typeof window === 'undefined') return;
        try {
            const stored = localStorage.getItem('chatStore');
            if (stored) {
                const data = JSON.parse(stored);
                set({
                    sessions: data.sessions || [],
                    currentSession: data.currentSession || null,
                    currentModel: data.currentModel || 'hrbrmstr/jamba:latest',
                    currentPromptType: data.currentPromptType || 'chat',
                });
            }
        } catch (error) {
            console.error('Error loading chat store:', error);
        }
    },

    saveToStorage: () => {
        if (typeof window === 'undefined') return;
        try {
            const state = get();
            localStorage.setItem(
                'chatStore',
                JSON.stringify({
                    sessions: state.sessions,
                    currentSession: state.currentSession,
                    currentModel: state.currentModel,
                    currentPromptType: state.currentPromptType,
                })
            );
        } catch (error) {
            console.error('Error saving chat store:', error);
        }
    },
}));
