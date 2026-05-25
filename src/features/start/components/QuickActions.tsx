import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import {
    CheckSquare,
    DollarSign,
    Dumbbell,
    Plus,
    Utensils,
} from "lucide-react-native";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  route?: string;
}

const quickActions: QuickAction[] = [
  {
    icon: CheckSquare,
    label: "Add Task",
    color: Colors.blue,
    bgColor: Colors.blue + "15",
  },
  {
    icon: Dumbbell,
    label: "Log Habit",
    color: Colors.purple,
    bgColor: Colors.purple + "15",
  },
  {
    icon: Utensils,
    label: "Log Meal",
    color: Colors.pink,
    bgColor: Colors.pink + "15",
  },
  {
    icon: DollarSign,
    label: "Add Expense",
    color: Colors.success,
    bgColor: Colors.success + "15",
  },
];

export function QuickActions() {
  return (
    <View style={styles.container}>
      <Text variant="subheading" style={styles.sectionTitle}>
        Quick Actions
      </Text>
      <View style={styles.grid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPress={() => {
              if (action.route) {
                router.push(action.route as any);
              }
            }}
          >
            <Card variant="outlined" padding="md" style={styles.actionCard}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: action.bgColor },
                ]}
              >
                <action.icon size={22} color={action.color} />
              </View>
              <Text variant="caption" style={styles.actionLabel}>
                {action.label}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: "22%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontWeight: "500",
    textAlign: "center",
  },
});
