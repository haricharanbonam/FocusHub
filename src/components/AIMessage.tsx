import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { ChatMessage } from '../types';

interface AIMessageProps {
  message: ChatMessage;
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function AIMessage({ message }: AIMessageProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAI]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>✦</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAI]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAI]}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    gap: 8,
  },
  wrapperUser: {
    justifyContent: 'flex-end',
  },
  wrapperAI: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryAccent + '33',
    borderWidth: 1,
    borderColor: Colors.primaryAccent + '55',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  aiAvatarText: {
    color: Colors.primaryAccent,
    fontSize: 12,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    paddingBottom: 8,
    gap: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.primaryAccent,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: Typography.body,
    lineHeight: Typography.lineHeightBody,
  },
  textUser: {
    color: '#FFFFFF',
  },
  textAI: {
    color: Colors.textPrimary,
  },
  time: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  timeUser: {
    color: 'rgba(255,255,255,0.6)',
  },
  timeAI: {
    color: Colors.textMuted,
  },
});
