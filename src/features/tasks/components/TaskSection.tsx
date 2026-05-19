import { SectionHeader } from '@/components/ui/SectionHeader';
import { Spacing } from '@/theme/tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface TaskSectionProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children: React.ReactNode;
}

export function TaskSection({ 
  title, 
  subtitle,
  actionLabel, 
  onActionPress,
  children 
}: TaskSectionProps) {
  return (
    <View style={styles.container}>
      <SectionHeader 
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        onAction={onActionPress}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
  },
});
