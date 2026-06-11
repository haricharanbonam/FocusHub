import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useSaves } from '../hooks/useSaves';
import { useNotifications } from '../hooks/useNotifications';

interface AddSaveModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddSaveModal({ visible, onClose }: AddSaveModalProps) {
  const { addSave, fetchPageMeta, extractDomain, detectType } = useSaves();
  const { scheduleReminder } = useNotifications();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [domain, setDomain] = useState('');

  const handleUrlChange = useCallback(async (text: string) => {
    setUrl(text);
    if (text.startsWith('http') && text.length > 10) {
      setIsFetching(true);
      const meta = await fetchPageMeta(text);
      setTitle(meta.title);
      setDomain(meta.domain);
      setIsFetching(false);
    }
  }, [fetchPageMeta]);

  const handleSave = async () => {
    if (!url.trim()) return;
    setIsSaving(true);
    try {
      const finalDomain = domain || extractDomain(url);
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      const type = detectType(url);

      const reminderDate = reminderEnabled ? new Date(Date.now() + 3600000) : undefined; // 1hr from now default

      await addSave({
        url: url.trim(),
        title: title || finalDomain,
        domain: finalDomain,
        tags: tagList,
        type,
        reminderAt: reminderDate?.toISOString(),
      });

      if (reminderEnabled && reminderDate) {
        await scheduleReminder('', title || finalDomain, reminderDate);
      }

      resetAndClose();
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const resetAndClose = () => {
    setUrl('');
    setTitle('');
    setTags('');
    setDomain('');
    setReminderEnabled(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={resetAndClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add to FocusHub</Text>
            <TouchableOpacity onPress={resetAndClose}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>URL</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="link-outline" size={16} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Paste a URL..."
                placeholderTextColor={Colors.textMuted}
                value={url}
                onChangeText={handleUrlChange}
                autoCapitalize="none"
                keyboardType="url"
                autoCorrect={false}
              />
              {isFetching && <ActivityIndicator size="small" color={Colors.primaryAccent} />}
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={[styles.inputBox]}
              placeholder="Auto-fetched or enter manually..."
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Tags (comma-separated)</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="react, design, productivity"
              placeholderTextColor={Colors.textMuted}
              value={tags}
              onChangeText={setTags}
              autoCapitalize="none"
            />

            <View style={styles.reminderRow}>
              <View style={styles.reminderLeft}>
                <Ionicons name="alarm-outline" size={18} color={Colors.warning} />
                <Text style={styles.reminderText}>Schedule a reminder</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: Colors.border, true: Colors.primaryAccent + '88' }}
                thumbColor={reminderEnabled ? Colors.primaryAccent : Colors.textMuted}
              />
            </View>
            {reminderEnabled && (
              <Text style={styles.reminderNote}>📅 Reminder set for 1 hour from now</Text>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={resetAndClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, (!url.trim() || isSaving) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!url.trim() || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="bookmark" size={16} color="#fff" />
                  <Text style={styles.saveText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.heading4,
    fontWeight: Typography.semiBold,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    fontWeight: Typography.medium,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.body,
  },
  inputBox: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: Typography.body,
    marginBottom: 16,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderText: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
  },
  reminderNote: {
    color: Colors.warning,
    fontSize: Typography.caption,
    marginBottom: 16,
    paddingLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    fontWeight: Typography.medium,
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryAccent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#fff',
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
  },
});
