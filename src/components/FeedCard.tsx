import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { FeedItem } from '../types';

interface FeedCardProps {
  item: FeedItem;
  onBookmark: () => void;
  onPress: () => void;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const sourceConfig = {
  github: { icon: 'logo-github' as const, color: '#E6EDF3', label: 'GitHub' },
  medium: { icon: 'reader-outline' as const, color: '#4ECDC4', label: 'Medium' },
};

export function FeedCard({ item, onBookmark, onPress }: FeedCardProps) {
  const src = sourceConfig[item.source];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.header}>
        <View style={[styles.sourceChip, { borderColor: src.color + '44' }]}>
          <Ionicons name={src.icon} size={12} color={src.color} />
          <Text style={[styles.sourceLabel, { color: src.color }]}>{src.label}</Text>
        </View>
        <Text style={styles.time}>{timeAgo(item.publishedAt)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={3}>{item.title}</Text>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      )}

      <View style={styles.footer}>
        {item.author && (
          <Text style={styles.author}>by {item.author}</Text>
        )}
        <TouchableOpacity style={styles.bookmarkBtn} onPress={onBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="bookmark-outline" size={18} color={Colors.primaryAccent} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sourceLabel: {
    fontSize: 11,
    fontWeight: Typography.semiBold,
    letterSpacing: 0.5,
  },
  time: {
    color: Colors.textMuted,
    fontSize: Typography.caption,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.medium,
    lineHeight: Typography.lineHeightBody,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  author: {
    color: Colors.textMuted,
    fontSize: Typography.caption,
    flex: 1,
  },
  bookmarkBtn: {
    padding: 4,
  },
});
