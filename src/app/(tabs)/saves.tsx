import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { SaveCard } from '../../components/SaveCard';
import { EmptyState } from '../../components/EmptyState';
import { AddSaveModal } from '../../components/AddSaveModal';
import { TagBadge } from '../../components/TagBadge';
import { useSaves } from '../../hooks/useSaves';
import { SavedItem } from '../../types';

type FilterType = 'all' | 'article' | 'video' | 'link';
const TYPE_FILTERS: { key: FilterType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'apps-outline' },
  { key: 'article', label: 'Articles', icon: 'document-text-outline' },
  { key: 'video', label: 'Videos', icon: 'play-circle-outline' },
  { key: 'link', label: 'Links', icon: 'link-outline' },
];

export default function SavesScreen() {
  const router = useRouter();
  const { saves, deleteSave, updateSave, filterSaves } = useSaves();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const filtered = filterSaves(searchQuery, typeFilter);

  const handleLongPress = useCallback((item: SavedItem) => {
    setSelectedItem(item);
    setShowActionSheet(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedItem) return;
    Alert.alert('Delete Save', `Remove "${selectedItem.title}" from your saves?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteSave(selectedItem.id);
          setShowActionSheet(false);
          setSelectedItem(null);
        }
      },
    ]);
  }, [selectedItem, deleteSave]);

  const handleOpenInBrowser = useCallback(() => {
    if (selectedItem) {
      const { Linking } = require('react-native');
      Linking.openURL(selectedItem.url);
      setShowActionSheet(false);
    }
  }, [selectedItem]);

  const handleAddTag = useCallback(() => {
    setShowActionSheet(false);
    Alert.prompt?.('Add Tag', 'Enter a tag name:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add', onPress: (tag?: string) => {
          if (tag && selectedItem) {
            updateSave(selectedItem.id, { tags: [...selectedItem.tags, tag.trim()] });
          }
        }
      },
    ], 'plain-text');
  }, [selectedItem, updateSave]);

  const renderItem = useCallback(({ item }: { item: SavedItem }) => (
    <SaveCard
      item={item}
      onPress={() => router.push(`/reader/${item.id}` as any)}
      onLongPress={() => handleLongPress(item)}
    />
  ), [router, handleLongPress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Saves</Text>
          <Text style={styles.subtitle}>{saves.length} item{saves.length !== 1 ? 's' : ''} saved</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={16} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search saves, tags, domains..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {TYPE_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, typeFilter === f.key && styles.filterChipActive]}
            onPress={() => setTypeFilter(f.key)}
          >
            <Ionicons
              name={f.icon}
              size={13}
              color={typeFilter === f.key ? Colors.primaryAccent : Colors.textMuted}
            />
            <Text style={[styles.filterText, typeFilter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title={saves.length === 0 ? "Nothing saved yet" : "No matches found"}
          subtitle={saves.length === 0 ? "Tap the + button to save your first article, video, or link" : "Try a different search or filter"}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Save Modal */}
      <AddSaveModal visible={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* Action Sheet */}
      <Modal visible={showActionSheet} transparent animationType="slide">
        <Pressable style={styles.actionBackdrop} onPress={() => setShowActionSheet(false)}>
          <View style={styles.actionSheet}>
            <View style={styles.actionHandle} />
            {selectedItem && (
              <>
                <Text style={styles.actionTitle} numberOfLines={1}>{selectedItem.title}</Text>
                <Text style={styles.actionDomain}>{selectedItem.domain}</Text>
                {selectedItem.tags.length > 0 && (
                  <View style={styles.actionTags}>
                    {selectedItem.tags.map(t => <TagBadge key={t} label={t} />)}
                  </View>
                )}
              </>
            )}
            <View style={styles.actionDivider} />

            {[
              { icon: 'open-outline' as const, label: 'Open in Browser', action: handleOpenInBrowser },
              { icon: 'pricetag-outline' as const, label: 'Add Tag', action: handleAddTag },
            ].map(item => (
              <TouchableOpacity key={item.label} style={styles.actionRow} onPress={item.action}>
                <Ionicons name={item.icon} size={18} color={Colors.textPrimary} />
                <Text style={styles.actionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.actionRow, styles.actionDelete]} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
              <Text style={[styles.actionLabel, { color: Colors.error }]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCancel} onPress={() => setShowActionSheet(false)}>
              <Text style={styles.actionCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.heading2,
    fontWeight: Typography.bold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    marginTop: 2,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.body,
  },
  filterScroll: { maxHeight: 44, marginBottom: 8 },
  filterContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
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
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: Typography.medium },
  filterTextActive: { color: Colors.primaryAccent, fontWeight: Typography.semiBold },
  listContent: { paddingBottom: 100 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  actionBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
    paddingBottom: 40,
    paddingTop: 8,
  },
  actionHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    paddingHorizontal: 20,
  },
  actionDomain: {
    color: Colors.textMuted,
    fontSize: Typography.caption,
    paddingHorizontal: 20,
    marginTop: 2,
    marginBottom: 8,
  },
  actionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  actionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  actionDelete: {},
  actionLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
  },
  actionCancel: {
    marginTop: 8,
    marginHorizontal: 20,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCancelText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    fontWeight: Typography.medium,
  },
});
