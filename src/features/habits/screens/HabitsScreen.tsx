import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spacing } from '@/theme/tokens';

export default function HabitsScreen() {
  // Mock static data for layout validation
  const mockHabits = [
    { name: 'Morning Meditation', streak: 7, progress: 100 },
    { name: 'Exercise', streak: 5, progress: 71 },
    { name: 'Reading', streak: 12, progress: 85 },
    { name: 'Journaling', streak: 3, progress: 43 },
  ];

  return (
    <Screen scrollable padded>
      {/* Header Section */}
      <SectionHeader 
        title="Habits" 
        subtitle="4 active habits"
        actionLabel="Add New"
      />

      {/* Stats Summary */}
      <Card variant="gradient" padding="lg" style={styles.summaryCard}>
        <Text variant="heading" style={styles.summaryTitle}>
          This Week
        </Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text variant="display" style={styles.summaryValue}>27</Text>
            <Text variant="caption">Completed</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text variant="display" style={styles.summaryValue}>85%</Text>
            <Text variant="caption">Success Rate</Text>
          </View>
        </View>
      </Card>

      {/* Habits List */}
      <SectionHeader 
        title="Today's Habits" 
        style={styles.sectionSpacing}
      />
      <View style={styles.habitsList}>
        {mockHabits.map((habit, index) => (
          <Card key={index} variant="elevated" padding="lg" style={styles.habitCard}>
            <View style={styles.habitHeader}>
              <Text variant="heading" style={styles.habitName}>
                {habit.name}
              </Text>
              <Text variant="caption" style={styles.habitStreak}>
                🔥 {habit.streak} day streak
              </Text>
            </View>
            <ProgressBar 
              progress={habit.progress} 
              showLabel
              variant="gradient"
              style={styles.habitProgress}
            />
          </Card>
        ))}
      </View>

      {/* Empty State Demo */}
      <SectionHeader 
        title="Paused Habits" 
        style={styles.sectionSpacing}
      />
      <EmptyState 
        title="No paused habits"
        description="Habits you've paused will appear here"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    marginBottom: Spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryValue: {
    marginBottom: Spacing.xs,
  },
  sectionSpacing: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  habitsList: {
    gap: Spacing.md,
  },
  habitCard: {
    flex: 1,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  habitName: {
    flex: 1,
  },
  habitStreak: {
    marginLeft: Spacing.sm,
  },
  habitProgress: {
    marginTop: Spacing.sm,
  },
});
