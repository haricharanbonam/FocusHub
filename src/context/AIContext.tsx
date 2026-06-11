import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChatMessage } from '../types';

interface AIContextType {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  clearMessages: () => void;
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: Date.now().toString() + Math.random(),
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <AIContext.Provider value={{ messages, addMessage, clearMessages, isStreaming, setIsStreaming }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAIContext() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAIContext must be used within AIProvider');
  return ctx;
}
