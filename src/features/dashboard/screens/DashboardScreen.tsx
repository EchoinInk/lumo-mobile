import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/cards/StatCard';
import { ProgressCard } from '@/components/cards/ProgressCard';
import { FocusCard } from '@/components/cards/FocusCard';
import { QuickActionCard } from '@/components/cards/QuickActionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spacing } from '@/theme/tokens';

export default function DashboardScreen() {
  // Mock static data for layout validation
  const mockStats = [
    { label: 'Tasks Completed', value: '12', change: '+3 today', positive: true },
    { label: 'Focus Time', value: '4h 32m', change: '+45m', positive: true },
    { label: 'Habits Tracked', value: '8/10', change: '-1', positive: false },
  ];

  const mockQuickActions = [
    { title: 'Add Task', icon: <View style={styles.mockIcon} /> },
    { title: 'Start Focus', icon: <View style={styles.mockIcon} /> },
    { title: 'Log Habit', icon: <View style={styles.mockIcon} /> },
    { title: 'Quick Note', icon: <View style={styles.mockIcon} /> },
  ];

  return (
    <Screen scrollable padded>
      {/* Header Section */}
      <SectionHeader 
        title="Good Morning" 
        subtitle="Let's make today productive"
      />

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {mockStats.map((stat, index) => (
          <StatCard 
            key={index}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            positive={stat.positive}
          />
        ))}
      </View>

      {/* Today's Focus */}
      <SectionHeader 
        title="Today's Focus" 
        actionLabel="View All"
        style={styles.sectionSpacing}
      />
      <FocusCard 
        title="Complete Project Proposal"
        description="Finish the draft and send to team for review"
        initials="PP"
      />

      {/* Progress Section */}
      <SectionHeader 
        title="Weekly Progress" 
        style={styles.sectionSpacing}
      />
      <ProgressCard 
        title="Weekly Goals"
        progress={65}
        subtitle="5 of 8 goals completed"
        variant="gradient"
      />

      {/* Quick Actions */}
      <SectionHeader 
        title="Quick Actions" 
        style={styles.sectionSpacing}
      />
      <View style={styles.quickActionsGrid}>
        {mockQuickActions.map((action, index) => (
          <QuickActionCard 
            key={index}
            title={action.title}
            icon={action.icon}
          />
        ))}
      </View>

      {/* Empty State Demo */}
      <SectionHeader 
        title="Upcoming" 
        style={styles.sectionSpacing}
      />
      <EmptyState 
        title="No upcoming events"
        description="You're all caught up for today"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionSpacing: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  mockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E1E6',
  },
});
