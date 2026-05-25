import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { MoreScreenHeader } from "@/src/features/more/components";
import { Colors, Radius, Shadows, Spacing } from "@/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { Plus } from "lucide-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock budget data
const mockBudgets = [
  { id: "1", name: "Groceries", spent: 420, total: 500, color: Colors.success },
  { id: "2", name: "Bills", spent: 150, total: 200, color: Colors.blue },
  { id: "3", name: "Personal", spent: 180, total: 150, color: Colors.pink },
  {
    id: "4",
    name: "Entertainment",
    spent: 60,
    total: 100,
    color: Colors.purple,
  },
];

export default function BudgetScreen() {
  const totalSpent = mockBudgets.reduce((acc, b) => acc + b.spent, 0);
  const totalBudget = mockBudgets.reduce((acc, b) => acc + b.total, 0);
  const progress = (totalSpent / totalBudget) * 100;

  return (
    <Screen scrollable padded>
      <MoreScreenHeader title="Budget Tracker" subtitle="May 2024" />

      {/* Budget Overview Card */}
      <Card variant="gradient" style={styles.overviewCard}>
        <View style={styles.overviewContent}>
          <Text variant="caption" color={Colors.textInverse}>
            Budget Overview
          </Text>
          <Text variant="heading" color={Colors.textInverse}>
            ${totalBudget - totalSpent} left
          </Text>
          <Text variant="body" color={Colors.textInverse}>
            of ${totalBudget}
          </Text>
          <View style={styles.progressContainer}>
            <ProgressBar progress={progress} height={8} variant="default" />
          </View>
        </View>
      </Card>

      {/* Category List */}
      <SectionHeader title="Categories" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {mockBudgets.map((budget) => {
          const percent = (budget.spent / budget.total) * 100;
          return (
            <Card key={budget.id} variant="elevated" style={styles.budgetCard}>
              <View style={styles.budgetHeader}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: budget.color },
                  ]}
                />
                <Text variant="body" style={styles.budgetName}>
                  {budget.name}
                </Text>
                <Text variant="caption" color={Colors.textSecondary}>
                  ${budget.spent} / ${budget.total}
                </Text>
              </View>
              <ProgressBar
                progress={percent}
                height={6}
                variant="default"
                style={styles.budgetProgress}
              />
            </Card>
          );
        })}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton}>
        <LinearGradient
          colors={[Colors.pink, Colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <Plus size={20} color={Colors.textInverse} />
          <Text
            variant="body"
            color={Colors.textInverse}
            style={styles.addButtonText}
          >
            Add Expense
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  overviewCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  overviewContent: {
    alignItems: "center",
  },
  progressContainer: {
    width: "100%",
    marginTop: Spacing.md,
  },
  list: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  budgetCard: {
    padding: Spacing.md,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  budgetName: {
    flex: 1,
    fontWeight: "500",
  },
  budgetProgress: {
    marginTop: Spacing.xs,
  },
  addButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius["2xl"],
    ...Shadows.glow,
  },
  addButtonText: {
    fontWeight: "600",
  },
});
