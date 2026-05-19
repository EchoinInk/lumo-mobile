import React from 'react';
import { View, StyleSheet } from 'react-native';
import { QuickActionCard } from '@/components/cards/QuickActionCard';
import { Plus, Clock, CheckCircle, FileText } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';

interface QuickAction {
  title: string;
  icon: React.ReactNode;
  onPress?: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  { title: 'Add Task', icon: <Plus size={24} color={Colors.textPrimary} /> },
  { title: 'Start Focus', icon: <Clock size={24} color={Colors.textPrimary} /> },
  { title: 'Log Habit', icon: <CheckCircle size={24} color={Colors.textPrimary} /> },
  { title: 'Quick Note', icon: <FileText size={24} color={Colors.textPrimary} /> },
];

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <View key={index} style={styles.actionWrapper}>
          <QuickActionCard 
            title={action.title}
            icon={action.icon}
            onPress={action.onPress}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionWrapper: {
    flex: 1,
    minWidth: '45%',
  },
});
