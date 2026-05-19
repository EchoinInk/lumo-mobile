import { StatCard } from '@/components/cards/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Spacing } from '@/theme/tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardSection } from '../components/DashboardSection';
import { QuickActions } from '../components/QuickActions';
import { TodayFocusCard } from '../components/TodayFocusCard';
import { WeeklyProgress } from '../components/WeeklyProgress';

export default function DashboardScreen() {
  // Mock static data for layout validation
  const mockStats = [
    { label: 'Tasks Completed', value: '12', change: '+3 today', positive: true },
    { label: 'Focus Time', value: '4h 32m', change: '+45m', positive: true },
    { label: 'Habits Tracked', value: '8/10', change: '-1', positive: false },
  ];

  return (
    <Screen scrollable padded>
      {/* Header Section */}
      <DashboardHeader />

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
      <DashboardSection title="Today's Focus" actionLabel="View All">
        <TodayFocusCard />
      </DashboardSection>

      {/* Weekly Progress */}
      <DashboardSection title="Weekly Progress">
        <WeeklyProgress />
      </DashboardSection>

      {/* Quick Actions */}
      <DashboardSection title="Quick Actions">
        <QuickActions />
      </DashboardSection>

      {/* Empty State Demo */}
      <DashboardSection title="Upcoming">
        <EmptyState 
          title="No upcoming events"
          description="You're all caught up for today"
        />
      </DashboardSection>
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
});
