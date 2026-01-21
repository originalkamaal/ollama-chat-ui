'use client';

import { useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { useChatStore } from '@/lib/store';

export default function Home() {
  const { loadFromStorage, sessions, currentSession, createSession } = useChatStore();

  useEffect(() => {
    loadFromStorage();
    // Create first session if none exists
    if (sessions.length === 0 && !currentSession) {
      createSession('Welcome to AI Chat');
    }
  }, []);

  return <ChatInterface />;
}