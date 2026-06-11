import { useSavesContext } from '../context/SavesContext';
import { SavedItem } from '../types';

export function useSaves() {
  const { saves, addSave, deleteSave, updateSave, addHighlight, markAsRead, isLoading } = useSavesContext();

  const getSaveById = (id: string): SavedItem | undefined => {
    return saves.find(s => s.id === id);
  };

  const filterSaves = (query: string, type?: string) => {
    return saves.filter(save => {
      const matchesQuery = query
        ? save.title.toLowerCase().includes(query.toLowerCase()) ||
          save.domain.toLowerCase().includes(query.toLowerCase()) ||
          save.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
        : true;
      const matchesType = type && type !== 'all' ? save.type === type : true;
      return matchesQuery && matchesType;
    });
  };

  const extractDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const detectType = (url: string): SavedItem['type'] => {
    if (/youtube\.com|youtu\.be|vimeo\.com/.test(url)) return 'video';
    return 'article';
  };

  const fetchPageMeta = async (url: string): Promise<{ title: string; domain: string }> => {
    const domain = extractDomain(url);
    try {
      const res = await fetch(url);
      const html = await res.text();
      const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)?.[1];
      const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
      const title = ogTitle ?? titleTag ?? domain;
      return { title: title.trim(), domain };
    } catch {
      return { title: domain, domain };
    }
  };

  return {
    saves,
    addSave,
    deleteSave,
    updateSave,
    addHighlight,
    markAsRead,
    isLoading,
    getSaveById,
    filterSaves,
    extractDomain,
    detectType,
    fetchPageMeta,
  };
}
