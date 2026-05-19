import { SectionHeader } from '@/components/ui/SectionHeader';
import { Spacing } from '@/theme/tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface DashboardSectionProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export function DashboardSection({ 
  title, 
  actionLabel, 
  onAction,
  children 
}: DashboardSectionProps) {
  return (
    <View style={styles.container}>
      <SectionHeader 
        title={title}
        actionLabel={actionLabel}
        onAction={onAction}
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
