import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface TagBadgeProps {
  label: string;
  variant?: 'primary' | 'secondary';
}

export function TagBadge({ label, variant = 'secondary' }: TagBadgeProps) {
  const isPrimary = variant === 'primary';
  return (
    <View style={[styles.badge, isPrimary ? styles.badgePrimary : styles.badgeSecondary]}>
      <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
        #{label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgePrimary: {
    backgroundColor: Colors.primaryAccent + '22',
    borderColor: Colors.primaryAccent + '55',
  },
  badgeSecondary: {
    backgroundColor: Colors.secondaryAccent + '18',
    borderColor: Colors.secondaryAccent + '44',
  },
  label: {
    fontSize: 11,
    fontWeight: Typography.medium,
  },
  labelPrimary: {
    color: Colors.primaryAccent,
  },
  labelSecondary: {
    color: Colors.secondaryAccent,
  },
});
