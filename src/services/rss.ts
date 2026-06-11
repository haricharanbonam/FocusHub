import { FeedItem } from '../types';

function parseXML(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let index = 0;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const getTag = (tag: string): string => {
      const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
      const m = r.exec(block);
      return m ? (m[1] ?? m[2] ?? '').trim() : '';
    };

    const title = getTag('title') || 'Untitled';
    const link = getTag('link') || '';
    const pubDate = getTag('pubDate') || new Date().toISOString();
    const description = getTag('description').replace(/<[^>]*>/g, '').slice(0, 200) + '...';

    if (link) {
      items.push({
        id: `medium-${index++}`,
        title,
        url: link,
        source: 'medium',
        description,
        publishedAt: new Date(pubDate).toISOString(),
      });
    }
  }

  return items;
}

export async function fetchMediumFeed(username: string): Promise<FeedItem[]> {
  if (!username) return [];
  try {
    const url = `https://medium.com/feed/@${username}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return parseXML(text);
  } catch (e) {
    console.error('Medium RSS error:', e);
    return [];
  }
}
