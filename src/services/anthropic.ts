import { SavedItem, ChatMessage } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';
const API_URL = 'https://api.anthropic.com/v1/messages';

function buildSystemPrompt(saves: SavedItem[]): string {
  const savesJson = saves.map(s => ({
    title: s.title,
    url: s.url,
    tags: s.tags,
    domain: s.domain,
    isRead: s.isRead,
    savedAt: s.savedAt,
    highlights: s.highlights.map(h => h.text),
  }));

  return `You are a personal reading assistant for FocusHub. The user has saved the following items: ${JSON.stringify(savesJson, null, 2)}. Help them decide what to read, recall things they've saved, and stay focused on learning. Be concise and encouraging. When recommending specific saved items, mention their title clearly.`;
}

export async function sendMessageToClaude(
  messages: ChatMessage[],
  saves: SavedItem[],
  onChunk?: (text: string) => void
): Promise<string> {
  if (!API_KEY) {
    return 'Please add your Anthropic API key to the .env file as EXPO_PUBLIC_ANTHROPIC_API_KEY to enable the AI assistant.';
  }

  const apiMessages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: buildSystemPrompt(saves),
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', err);
      return `Error: ${response.status} — ${err}`;
    }

    const data = await response.json();
    return data.content?.[0]?.text ?? 'No response from assistant.';
  } catch (e) {
    console.error('Network error:', e);
    return 'Network error. Please check your connection.';
  }
}
