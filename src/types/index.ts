export interface Highlight {
  id: string;
  text: string;
  savedAt: string;
  color: string;
}

export interface SavedItem {
  id: string;
  url: string;
  title: string;
  domain: string;
  tags: string[];
  savedAt: string; // ISO date
  isRead: boolean;
  reminderAt?: string; // ISO date
  highlights: Highlight[];
  type: 'article' | 'video' | 'link';
}

export interface FeedItem {
  id: string;
  title: string;
  url: string;
  source: 'github' | 'medium';
  description?: string;
  publishedAt: string;
  author?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
