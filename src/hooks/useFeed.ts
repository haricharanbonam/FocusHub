import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedItem } from '../types';
import { fetchGitHubFeed } from '../services/github';
import { fetchMediumFeed } from '../services/rss';

const SETTINGS_KEY = '@focushub_settings';

export function useFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [mediumUsername, setMediumUsername] = useState('');
  const [filter, setFilter] = useState<'all' | 'github' | 'medium'>('all');

  useEffect(() => {
    loadSettingsAndFetch();
  }, []);

  const loadSettingsAndFetch = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        setGithubUsername(settings.githubUsername ?? '');
        setMediumUsername(settings.mediumUsername ?? '');
        await refreshFeed(settings.githubUsername, settings.mediumUsername);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshFeed = useCallback(async (ghUser?: string, mdUser?: string) => {
    setIsRefreshing(true);
    try {
      const gh = ghUser ?? githubUsername;
      const md = mdUser ?? mediumUsername;
      const [ghItems, mdItems] = await Promise.all([
        fetchGitHubFeed(gh),
        fetchMediumFeed(md),
      ]);
      const combined = [...ghItems, ...mdItems].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      setFeedItems(combined);
    } catch (e) {
      console.error('Feed refresh error:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [githubUsername, mediumUsername]);

  const filteredItems = feedItems.filter(item => {
    if (filter === 'all') return true;
    return item.source === filter;
  });

  const hasConnections = !!(githubUsername || mediumUsername);

  return {
    feedItems: filteredItems,
    allFeedItems: feedItems,
    isRefreshing,
    refreshFeed,
    filter,
    setFilter,
    githubUsername,
    mediumUsername,
    hasConnections,
  };
}
