import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { FeedCard } from '../../components/FeedCard';
import { EmptyState } from '../../components/EmptyState';
import { useFeed } from '../../hooks/useFeed';
import { useSaves } from '../../hooks/useSaves';
import { FeedItem } from '../../types';

const SETTINGS_KEY = '@focushub_settings';

type FilterType = 'all' | 'github' | 'medium';
const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'github', label: 'GitHub' },
  { key: 'medium', label: 'Medium' },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function HomeScreen() {
  const { feedItems, isRefreshing, refreshFeed, filter, setFilter, hasConnections } = useFeed();
  const { addSave, detectType, extractDomain } = useSaves();
  const [displayName, setDisplayName] = useState('');

  React.useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then(s => {
      if (s) {
        const parsed = JSON.parse(s);
        setDisplayName(parsed.displayName ?? '');
      }
    });
  }, []);

  const handleBookmark = useCallback(async (item: FeedItem) => {
    await addSave({
      url: item.url,
      title: item.title,
      domain: extractDomain(item.url),
      tags: [item.source],
      type: detectType(item.url),
    });
  }, [addSave, extractDomain, detectType]);

  const handlePress = useCallback((item: FeedItem) => {
    Linking.openURL(item.url);
  }, []);

  const renderItem = useCallback(({ item }: { item: FeedItem }) => (
    <FeedCard
      item={item}
      onBookmark={() => handleBookmark(item)}
      onPress={() => handlePress(item)}
    />
  ), [handleBookmark, handlePress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {getGreeting()}{displayName ? `, ${displayName}` : ''} 👋
          </Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>F</Text>
        </View>
      </View>

      {/* No connections banner */}
      {!hasConnections && (
        <View style={styles.banner}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.warning} />
          <Text style={styles.bannerText}>Connect GitHub / Medium in Settings to load your feed</Text>
        </View>
      )}

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed */}
      {feedItems.length === 0 && !isRefreshing ? (
        <EmptyState
          icon="newspaper-outline"
          title="No feed items yet"
          subtitle={hasConnections ? "Pull down to refresh your feed" : "Connect your accounts in Settings to see your personalized feed"}
        />
      ) : (
        <FlatList
          data={feedItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => refreshFeed()}
              tintColor={Colors.primaryAccent}
              colors={[Colors.primaryAccent]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    color: Colors.textPrimary,
    fontSize: Typography.heading2,
    fontWeight: Typography.bold,
  },
  date: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    marginTop: 2,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: Typography.bold,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.warning + '18',
    borderWidth: 1,
    borderColor: Colors.warning + '44',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bannerText: {
    color: Colors.warning,
    fontSize: Typography.caption,
    flex: 1,
  },
  filterScroll: {
    maxHeight: 48,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryAccent + '22',
    borderColor: Colors.primaryAccent,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: Typography.medium,
  },
  filterTextActive: {
    color: Colors.primaryAccent,
    fontWeight: Typography.semiBold,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
