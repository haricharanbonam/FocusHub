import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { SavedItem } from '../types';
import { TagBadge } from './TagBadge';

interface SaveCardProps {
  item: SavedItem;
  onPress: () => void;
  onLongPress: () => void;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getTypeIcon(type: SavedItem['type']): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'video': return 'play-circle-outline';
    case 'article': return 'document-text-outline';
    default: return 'link-outline';
  }
}

export function SaveCard({ item, onPress, onLongPress }: SaveCardProps) {
  const initials = item.domain.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.card, item.isRead && styles.cardRead]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <View style={styles.meta}>
            <Ionicons name={getTypeIcon(item.type)} size={12} color={Colors.textMuted} />
            <Text style={styles.domain}>{item.domain}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.time}>{timeAgo(item.savedAt)}</Text>
            {item.reminderAt && (
              <>
                <Text style={styles.dot}>·</Text>
                <Ionicons name="alarm-outline" size={12} color={Colors.warning} />
              </>
            )}
          </View>
          {item.highlights.length > 0 && (
            <View style={styles.highlightRow}>
              <Ionicons name="sparkles" size={11} color={Colors.secondaryAccent} />
              <Text style={styles.highlightCount}>{item.highlights.length} highlight{item.highlights.length > 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
        {item.isRead && (
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} style={styles.readIcon} />
        )}
      </View>
      {item.tags.length > 0 && (
        <View style={styles.tags}>
          {item.tags.slice(0, 3).map(tag => (
            <TagBadge key={tag} label={tag} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardRead: {
    opacity: 0.65,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarText: {
    color: Colors.primaryAccent,
    fontSize: 16,
    fontWeight: Typography.bold,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.medium,
    lineHeight: Typography.lineHeightBody,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  domain: {
    color: Colors.textMuted,
    fontSize: Typography.caption,
  },
  dot: {
    color: Colors.textMuted,
    fontSize: Typography.caption,
  },
  time: {
    color: Colors.textMuted,
    fontSize: Typography.caption,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  highlightCount: {
    color: Colors.secondaryAccent,
    fontSize: Typography.caption,
  },
  readIcon: {
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
