import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/cards/StatCard';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spacing } from '@/theme/tokens';

export default function BudgetScreen() {
  // Mock static data for layout validation
  const mockBudget = {
    total: 2500,
    spent: 1250,
    remaining: 1250,
  };

  const mockCategories = [
    { name: 'Food & Dining', spent: 450, budget: 600, progress: 75 },
    { name: 'Transportation', spent: 200, budget: 300, progress: 67 },
    { name: 'Entertainment', spent: 150, budget: 200, progress: 75 },
  ];

  return (
    <Screen scrollable padded>
      {/* Header Section */}
      <SectionHeader 
        title="Budget" 
        subtitle="January 2026"
        actionLabel="Settings"
      />

      {/* Budget Overview */}
      <Card variant="gradient" padding="lg" style={styles.overviewCard}>
        <Text variant="caption" style={styles.overviewLabel}>
          Monthly Budget
        </Text>
        <Text variant="display" style={styles.overviewAmount}>
          ${mockBudget.total}
        </Text>
        <View style={styles.overviewStats}>
          <View style={styles.overviewStat}>
            <Text variant="small" style={styles.overviewStatLabel}>Spent</Text>
            <Text variant="heading">${mockBudget.spent}</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewStat}>
            <Text variant="small" style={styles.overviewStatLabel}>Remaining</Text>
            <Text variant="heading">${mockBudget.remaining}</Text>
          </View>
        </View>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard 
          label="Daily Average"
          value="$83"
          change="+$12"
          positive={true}
        />
        <StatCard 
          label="Savings Rate"
          value="50%"
          change="+5%"
          positive={true}
        />
      </View>

      {/* Categories */}
      <SectionHeader 
        title="Categories" 
        actionLabel="View All"
        style={styles.sectionSpacing}
      />
      <View style={styles.categoriesList}>
        {mockCategories.map((category, index) => (
          <Card key={index} variant="elevated" padding="lg" style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text variant="heading" style={styles.categoryName}>
                {category.name}
              </Text>
              <Text variant="caption" style={styles.categoryAmount}>
                ${category.spent} / ${category.budget}
              </Text>
            </View>
            <ProgressBar 
              progress={category.progress} 
              showLabel
              style={styles.categoryProgress}
            />
          </Card>
        ))}
      </View>

      {/* Empty State Demo */}
      <SectionHeader 
        title="Recent Transactions" 
        style={styles.sectionSpacing}
      />
      <EmptyState 
        title="No recent transactions"
        description="Your recent transactions will appear here"
        actionLabel="Add Transaction"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  overviewCard: {
    marginBottom: Spacing.lg,
  },
  overviewLabel: {
    marginBottom: Spacing.xs,
  },
  overviewAmount: {
    marginBottom: Spacing.lg,
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewStat: {
    flex: 1,
  },
  overviewStatLabel: {
    marginBottom: Spacing.xs,
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionSpacing: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  categoriesList: {
    gap: Spacing.md,
  },
  categoryCard: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryName: {
    flex: 1,
  },
  categoryAmount: {
    marginLeft: Spacing.sm,
  },
  categoryProgress: {
    marginTop: Spacing.sm,
  },
});
