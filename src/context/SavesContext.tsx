import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedItem, Highlight } from '../types';

const STORAGE_KEY = '@focushub_saves';

interface SavesContextType {
  saves: SavedItem[];
  addSave: (item: Omit<SavedItem, 'id' | 'savedAt' | 'isRead' | 'highlights'>) => Promise<void>;
  deleteSave: (id: string) => Promise<void>;
  updateSave: (id: string, updates: Partial<SavedItem>) => Promise<void>;
  addHighlight: (saveId: string, text: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  isLoading: boolean;
}

const SavesContext = createContext<SavesContextType | undefined>(undefined);

export function SavesProvider({ children }: { children: React.ReactNode }) {
  const [saves, setSaves] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSaves(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saves:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const persistSaves = async (newSaves: SavedItem[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSaves));
    setSaves(newSaves);
  };

  const addSave = useCallback(async (item: Omit<SavedItem, 'id' | 'savedAt' | 'isRead' | 'highlights'>) => {
    const newItem: SavedItem = {
      ...item,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      isRead: false,
      highlights: [],
    };
    const newSaves = [newItem, ...saves];
    await persistSaves(newSaves);
  }, [saves]);

  const deleteSave = useCallback(async (id: string) => {
    const newSaves = saves.filter(s => s.id !== id);
    await persistSaves(newSaves);
  }, [saves]);

  const updateSave = useCallback(async (id: string, updates: Partial<SavedItem>) => {
    const newSaves = saves.map(s => s.id === id ? { ...s, ...updates } : s);
    await persistSaves(newSaves);
  }, [saves]);

  const addHighlight = useCallback(async (saveId: string, text: string) => {
    const highlight: Highlight = {
      id: Date.now().toString(),
      text,
      savedAt: new Date().toISOString(),
      color: '#4ECDC4',
    };
    const newSaves = saves.map(s =>
      s.id === saveId ? { ...s, highlights: [...s.highlights, highlight] } : s
    );
    await persistSaves(newSaves);
  }, [saves]);

  const markAsRead = useCallback(async (id: string) => {
    await updateSave(id, { isRead: true });
  }, [updateSave]);

  return (
    <SavesContext.Provider value={{ saves, addSave, deleteSave, updateSave, addHighlight, markAsRead, isLoading }}>
      {children}
    </SavesContext.Provider>
  );
}

export function useSavesContext() {
  const ctx = useContext(SavesContext);
  if (!ctx) throw new Error('useSavesContext must be used within SavesProvider');
  return ctx;
}
