import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { Colors, Spacing } from "@/src/theme/tokens";
import { router } from "expo-router";
import {
    Calendar,
    CheckSquare,
    DollarSign,
    Dumbbell,
    Utensils,
    X,
} from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const quickAddOptions = [
  { icon: CheckSquare, label: "New Task", color: Colors.blue },
  { icon: Dumbbell, label: "Log Habit", color: Colors.purple },
  { icon: Utensils, label: "Log Meal", color: Colors.pink },
  { icon: DollarSign, label: "Add Expense", color: Colors.success },
  { icon: Calendar, label: "Add Event", color: Colors.warning },
];

export default function AddModal() {
  return (
    <Screen scrollable padded>
      <View style={styles.header}>
        <SectionHeader title="What would you like to add?" />
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.optionsGrid}>
        {quickAddOptions.map((option, index) => (
          <Card
            key={index}
            variant="elevated"
            pressable
            onPress={() => {
              // TODO: Navigate to specific add screen
              router.back();
            }}
            style={styles.optionCard}
          >
            <View style={[styles.iconContainer, { backgroundColor: option.color + "20" }]}>
              <option.icon size={24} color={option.color} />
            </View>
            <Text variant="body" style={styles.optionLabel}>
              {option.label}
            </Text>
          </Card>
        ))}
      </View>

      <View style={styles.footer}>
        <Button variant="ghost" onPress={() => router.back()}>
          Cancel
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  optionCard: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  optionLabel: {
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
  },
});
