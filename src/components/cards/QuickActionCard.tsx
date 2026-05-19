import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Colors, Spacing } from '@/theme/tokens';

interface QuickActionCardProps {
  title: string;
  icon: React.ReactNode;
  onPress?: () => void;
}

export function QuickActionCard({ title, icon, onPress }: QuickActionCardProps) {
  return (
    <Card variant="outlined" padding="md" pressable onPress={onPress} style={styles.container}>
      <View style={styles.icon}>{icon}</View>
      <Text variant="body" textAlign="center" style={styles.title}>
        {title}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  icon: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontWeight: '500',
  },
});
