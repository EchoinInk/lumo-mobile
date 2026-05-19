import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { Spacing } from '@/theme/tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function TasksScreen() {
  // Mock static data for layout validation
  const mockTasks = [
    { title: 'Design System Review', progress: 75, priority: 'High' },
    { title: 'API Integration', progress: 30, priority: 'Medium' },
    { title: 'User Testing', progress: 0, priority: 'Low' },
  ];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High':
        return styles.priorityHigh;
      case 'Medium':
        return styles.priorityMedium;
      case 'Low':
        return styles.priorityLow;
      default:
        return styles.priorityLow;
    }
  };

  return (
    <Screen scrollable padded>
      {/* Header Section */}
      <SectionHeader 
        title="Tasks" 
        subtitle="3 active tasks"
        actionLabel="Filter"
      />

      {/* Task Cards */}
      <View style={styles.taskList}>
        {mockTasks.map((task, index) => (
          <Card key={index} variant="elevated" padding="lg" style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text variant="heading" style={styles.taskTitle}>
                {task.title}
              </Text>
              <View style={[styles.priorityBadge, getPriorityStyle(task.priority)]}>
                <Text variant="small" style={styles.priorityText}>
                  {task.priority}
                </Text>
              </View>
            </View>
            <ProgressBar 
              progress={task.progress} 
              showLabel 
              label="Progress"
              style={styles.taskProgress}
            />
          </Card>
        ))}
      </View>

      {/* Completed Section */}
      <SectionHeader 
        title="Completed" 
        style={styles.sectionSpacing}
      />
      <EmptyState 
        title="No completed tasks"
        description="Completed tasks will appear here"
        actionLabel="View History"
      />

      {/* Floating Action Button */}
      <FloatingActionButton position="bottom-right">
        <Text style={styles.fabIcon}>+</Text>
      </FloatingActionButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  taskList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  taskCard: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  taskTitle: {
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityMedium: {
    backgroundColor: '#FEF3C7',
  },
  priorityLow: {
    backgroundColor: '#E0E7FF',
  },
  priorityText: {
    fontWeight: '600',
  },
  taskProgress: {
    marginTop: Spacing.sm,
  },
  sectionSpacing: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  fabIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
