import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useSavesContext } from '../../context/SavesContext';

const SETTINGS_KEY = '@focushub_settings';

interface Settings {
  displayName: string;
  githubUsername: string;
  mediumUsername: string;
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingsRow({ label, icon, children }: { label: string; icon: keyof typeof Ionicons.glyphMap; children?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={16} color={Colors.primaryAccent} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { saves } = useSavesContext();
  const [settings, setSettings] = useState<Settings>({
    displayName: '',
    githubUsername: '',
    mediumUsername: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) setSettings(JSON.parse(stored));
    } catch {}
  };

  const saveSettings = async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your saved items, highlights, and chat history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([SETTINGS_KEY, '@focushub_saves']);
            setSettings({ displayName: '', githubUsername: '', mediumUsername: '' });
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          {saved && (
            <View style={styles.savedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.savedText}>Saved</Text>
            </View>
          )}
        </View>

        {/* Profile */}
        <SectionHeader title="Profile" />
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={Colors.textMuted}
            value={settings.displayName}
            onChangeText={v => setSettings(prev => ({ ...prev, displayName: v }))}
            onBlur={() => saveSettings({ displayName: settings.displayName })}
          />
        </View>

        {/* Integrations */}
        <SectionHeader title="Integrations" />
        <View style={styles.card}>
          <Text style={styles.inputLabel}>GitHub Username</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="e.g. torvalds"
              placeholderTextColor={Colors.textMuted}
              value={settings.githubUsername}
              onChangeText={v => setSettings(prev => ({ ...prev, githubUsername: v }))}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.connectBtn}
              onPress={() => saveSettings({ githubUsername: settings.githubUsername })}
            >
              <Text style={styles.connectText}>Connect</Text>
            </TouchableOpacity>
          </View>
          {settings.githubUsername ? (
            <View style={styles.connectedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.connectedText}>Connected as @{settings.githubUsername}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <Text style={styles.inputLabel}>Medium Username</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="e.g. yourhandle"
              placeholderTextColor={Colors.textMuted}
              value={settings.mediumUsername}
              onChangeText={v => setSettings(prev => ({ ...prev, mediumUsername: v }))}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.connectBtn}
              onPress={() => saveSettings({ mediumUsername: settings.mediumUsername })}
            >
              <Text style={styles.connectText}>Connect</Text>
            </TouchableOpacity>
          </View>
          {settings.mediumUsername ? (
            <View style={styles.connectedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.connectedText}>Connected as @{settings.mediumUsername}</Text>
            </View>
          ) : null}
        </View>

        {/* Data */}
        <SectionHeader title="Your Data" />
        <View style={styles.card}>
          <SettingsRow icon="bookmark" label="Total Saves">
            <Text style={styles.valueText}>{saves.length} items</Text>
          </SettingsRow>
          <View style={styles.divider} />
          <SettingsRow icon="sparkles" label="Highlights">
            <Text style={styles.valueText}>{saves.reduce((a, s) => a + s.highlights.length, 0)}</Text>
          </SettingsRow>
        </View>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
          <Text style={styles.dangerText}>Clear All Data</Text>
        </TouchableOpacity>

        {/* About */}
        <SectionHeader title="About" />
        <View style={styles.card}>
          <SettingsRow icon="apps" label="FocusHub">
            <Text style={styles.valueText}>v{version}</Text>
          </SettingsRow>
          <View style={styles.divider} />
          <SettingsRow icon="hardware-chip-outline" label="AI Model">
            <Text style={styles.valueText}>claude-sonnet-4-6</Text>
          </SettingsRow>
          <View style={styles.divider} />
          <SettingsRow icon="shield-checkmark-outline" label="Storage">
            <Text style={styles.valueText}>Local only</Text>
          </SettingsRow>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Built with Expo SDK 56 · No cloud, no tracking</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.heading2,
    fontWeight: Typography.bold,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '22',
    borderWidth: 1,
    borderColor: Colors.success + '44',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  savedText: { color: Colors.success, fontSize: 12, fontWeight: Typography.medium },
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: Typography.caption,
    fontWeight: Typography.semiBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 16,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: Typography.medium,
    marginTop: 12,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: Typography.body,
    marginBottom: 12,
  },
  inputFlex: { flex: 1, marginBottom: 0 },
  connectBtn: {
    backgroundColor: Colors.primaryAccent,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  connectText: { color: '#fff', fontSize: 13, fontWeight: Typography.semiBold },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  connectedText: { color: Colors.success, fontSize: Typography.caption },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primaryAccent + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
  },
  valueText: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    backgroundColor: Colors.error + '18',
    borderWidth: 1,
    borderColor: Colors.error + '44',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dangerText: {
    color: Colors.error,
    fontSize: Typography.body,
    fontWeight: Typography.medium,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 32,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: Typography.caption,
  },
});
