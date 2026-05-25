import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { Colors, Radius, Shadows, Spacing } from "@/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, Plus, Utensils } from "lucide-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock meals data
const mockMeals = [
  { id: "1", name: "Chicken Stir Fry", calories: 450, time: "Breakfast" },
  { id: "2", name: "Overnight Oats", calories: 320, time: "Lunch" },
  { id: "3", name: "Salmon Bowl", calories: 580, time: "Dinner" },
];

export default function MealsScreen() {
  return (
    <Screen scrollable padded>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <SectionHeader title="My Meals" subtitle="Today" />
      </View>

      {/* Calorie Summary */}
      <Card variant="gradient" style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <Text variant="caption" color={Colors.textInverse}>
            Calories Today
          </Text>
          <Text variant="heading" color={Colors.textInverse}>
            1,350
          </Text>
          <Text variant="body" color={Colors.textInverse}>
            of 1,800 kcal
          </Text>
        </View>
      </Card>

      {/* Meals List */}
      <SectionHeader title="Today's Meals" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {mockMeals.map((meal) => (
          <Card key={meal.id} variant="elevated" style={styles.mealCard}>
            <View style={styles.mealContent}>
              <View style={styles.mealIconContainer}>
                <Utensils size={20} color={Colors.pink} />
              </View>
              <View style={styles.mealInfo}>
                <Text variant="body" style={styles.mealName}>
                  {meal.name}
                </Text>
                <Text variant="caption" color={Colors.textSecondary}>
                  {meal.time}
                </Text>
              </View>
              <Text variant="body" style={styles.calories}>
                {meal.calories} kcal
              </Text>
            </View>
          </Card>
        ))}
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
            Add Meal
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  summaryCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  summaryContent: {
    alignItems: "center",
  },
  list: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  mealCard: {
    padding: Spacing.md,
  },
  mealContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  mealIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.pink + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  calories: {
    fontWeight: "600",
    color: Colors.pink,
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
