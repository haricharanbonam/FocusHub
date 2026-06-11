import { FeedItem } from '../types';

interface GitHubEvent {
  id: string;
  type: string;
  actor: { login: string };
  repo: { name: string; url: string };
  payload: {
    commits?: Array<{ message: string }>;
    pull_request?: { title: string; html_url: string };
    ref?: string;
  };
  created_at: string;
}

function eventToFeedItem(event: GitHubEvent, index: number): FeedItem | null {
  let title = '';
  let url = `https://github.com/${event.repo.name}`;

  switch (event.type) {
    case 'PushEvent': {
      const commits = event.payload.commits ?? [];
      const msg = commits[0]?.message ?? 'Pushed commits';
      title = `Pushed to ${event.repo.name}: ${msg.split('\n')[0]}`;
      break;
    }
    case 'WatchEvent':
      title = `⭐ Starred ${event.repo.name}`;
      break;
    case 'ForkEvent':
      title = `🍴 Forked ${event.repo.name}`;
      break;
    case 'PullRequestEvent': {
      const pr = event.payload.pull_request;
      title = `PR: ${pr?.title ?? 'Pull request'} in ${event.repo.name}`;
      if (pr?.html_url) url = pr.html_url;
      break;
    }
    case 'CreateEvent':
      title = `Created ${event.payload.ref ?? 'branch'} in ${event.repo.name}`;
      break;
    case 'IssuesEvent':
      title = `Issue activity in ${event.repo.name}`;
      break;
    default:
      title = `Activity in ${event.repo.name}`;
  }

  return {
    id: `github-${event.id}-${index}`,
    title,
    url,
    source: 'github',
    publishedAt: new Date(event.created_at).toISOString(),
    author: event.actor.login,
  };
}

export async function fetchGitHubFeed(username: string): Promise<FeedItem[]> {
  if (!username) return [];
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=30`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const events: GitHubEvent[] = await res.json();
    return events
      .map((e, i) => eventToFeedItem(e, i))
      .filter((item): item is FeedItem => item !== null)
      .slice(0, 20);
  } catch (e) {
    console.error('GitHub feed error:', e);
    return [];
  }
}
