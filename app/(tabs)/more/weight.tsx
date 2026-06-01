import { CalmPlaceholderNote } from "@/src/components/ui/CalmPlaceholderNote";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { MoreScreenHeader } from "@/src/features/more/components";
import { Colors, Radius, Shadows, Spacing } from "@/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Scale, TrendingDown } from "lucide-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock weight history
const mockWeights = [
  { id: "1", weight: 165.2, date: "Today", change: -0.5 },
  { id: "2", weight: 165.7, date: "Yesterday", change: -0.3 },
  { id: "3", weight: 166.0, date: "May 24", change: -0.2 },
  { id: "4", weight: 166.2, date: "May 23", change: 0.1 },
];

export default function WeightScreen() {
  return (
    <Screen scrollable padded>
      <MoreScreenHeader title="Weight Loss Tracker" subtitle="Progress" />

      {/* Current Weight Card */}
      <Card variant="gradient" style={styles.weightCard}>
        <View style={styles.weightContent}>
          <Text variant="caption" color={Colors.textInverse}>
            Current Weight
          </Text>
          <Text variant="heading" color={Colors.textInverse}>
            165.2 lbs
          </Text>
          <View style={styles.changeIndicator}>
            <TrendingDown size={16} color={Colors.textInverse} />
            <Text variant="body" color={Colors.textInverse}>
              -2.8 lbs this month
            </Text>
          </View>
        </View>
      </Card>

      {/* Weight History */}
      <SectionHeader title="Recent History" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {mockWeights.map((entry) => (
          <Card key={entry.id} variant="elevated" style={styles.entryCard}>
            <View style={styles.entryContent}>
              <View style={styles.entryIconContainer}>
                <Scale size={18} color={Colors.primary} />
              </View>
              <View style={styles.entryInfo}>
                <Text variant="body" style={styles.entryWeight}>
                  {entry.weight} lbs
                </Text>
                <Text variant="caption" color={Colors.textSecondary}>
                  {entry.date}
                </Text>
              </View>
              <Text
                variant="body"
                style={[
                  styles.change,
                  { color: entry.change < 0 ? Colors.success : Colors.warning },
                ]}
              >
                {entry.change > 0 ? "+" : ""}
                {entry.change} lbs
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        disabled
        accessibilityRole="button"
        accessibilityLabel="Log weight"
        accessibilityHint="Weight logging is coming soon"
        accessibilityState={{ disabled: true }}
      >
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
            Log Weight
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <CalmPlaceholderNote />
    </Screen>
  );
}

const styles = StyleSheet.create({
  weightCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  weightContent: {
    alignItems: "center",
  },
  changeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  list: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  entryCard: {
    padding: Spacing.md,
  },
  entryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  entryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  entryInfo: {
    flex: 1,
  },
  entryWeight: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  change: {
    fontWeight: "500",
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
