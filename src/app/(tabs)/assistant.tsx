import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AIMessage } from '../../components/AIMessage';
import { useAIContext } from '../../context/AIContext';
import { useSavesContext } from '../../context/SavesContext';
import { sendMessageToClaude } from '../../services/anthropic';
import { ChatMessage } from '../../types';

const STARTERS = [
  "What should I read today?",
  "Summarize what I've saved this week",
  "I have 10 minutes — what's a quick read?",
  "What topics am I most interested in?",
];

export default function AssistantScreen() {
  const { messages, addMessage, clearMessages, isStreaming, setIsStreaming } = useAIContext();
  const { saves } = useSavesContext();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    addMessage({ role: 'user', content: trimmed });
    setInputText('');
    setIsStreaming(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const allMessages: ChatMessage[] = [
      ...messages,
      { id: 'temp', role: 'user' as const, content: trimmed, createdAt: new Date().toISOString() },
    ];

    const reply = await sendMessageToClaude(allMessages, saves);
    addMessage({ role: 'assistant', content: reply });
    setIsStreaming(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, saves, addMessage, isStreaming, setIsStreaming]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => (
    <AIMessage message={item} />
  ), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AI Assistant</Text>
          <Text style={styles.subtitle}>Powered by Claude · {saves.length} saves in context</Text>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearMessages}>
            <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {messages.length === 0 ? (
          <ScrollView contentContainerStyle={styles.emptyContainer} showsVerticalScrollIndicator={false}>
            {/* AI Avatar */}
            <View style={styles.aiAvatarLarge}>
              <Text style={styles.aiAvatarSymbol}>✦</Text>
            </View>
            <Text style={styles.emptyTitle}>Your reading assistant</Text>
            <Text style={styles.emptySubtitle}>
              Ask me about your saved articles, get reading recommendations, or explore your interests.
            </Text>

            {/* Starter suggestions */}
            <View style={styles.starters}>
              {STARTERS.map(s => (
                <TouchableOpacity key={s} style={styles.starterChip} onPress={() => sendMessage(s)}>
                  <Text style={styles.starterText}>{s}</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primaryAccent} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Streaming indicator */}
        {isStreaming && (
          <View style={styles.streamingRow}>
            <View style={styles.streamingBubble}>
              <ActivityIndicator size="small" color={Colors.primaryAccent} />
              <Text style={styles.streamingText}>Thinking...</Text>
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your saves..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(inputText)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isStreaming) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isStreaming}
          >
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 16,
  },
  aiAvatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: Colors.primaryAccent + '22',
    borderWidth: 1.5,
    borderColor: Colors.primaryAccent + '55',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  aiAvatarSymbol: {
    fontSize: 28,
    color: Colors.primaryAccent,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.heading3,
    fontWeight: Typography.semiBold,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    textAlign: 'center',
    lineHeight: Typography.lineHeightBody,
  },
  starters: {
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  starterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  starterText: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    flex: 1,
  },
  messageList: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  streamingRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  streamingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    marginLeft: 36,
  },
  streamingText: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: Typography.body,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
