import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Screen } from "@/src/components/ui/Screen";
import { Text } from "@/src/components/ui/Text";
import { MoreScreenHeader } from "@/src/features/more/components";
import { Colors, Radius, Shadows, Spacing } from "@/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, ShoppingCart } from "lucide-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock grocery list
const mockGroceries = [
  { id: "1", name: "Bananas", category: "Produce", checked: false },
  { id: "2", name: "Spinach", category: "Produce", checked: true },
  { id: "3", name: "Almond milk", category: "Dairy", checked: false },
  { id: "4", name: "Eggs", category: "Dairy", checked: false },
];

export default function GroceriesScreen() {
  return (
    <Screen scrollable padded>
      <MoreScreenHeader title="Weekly Groceries" subtitle="May 12 - May 18" />

      {/* Grocery List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {mockGroceries.map((item) => (
          <Card key={item.id} variant="outlined" style={styles.itemCard}>
            <View style={styles.itemContent}>
              <View
                style={[
                  styles.checkbox,
                  item.checked && styles.checkboxChecked,
                ]}
              >
                {item.checked && (
                  <ShoppingCart size={14} color={Colors.textInverse} />
                )}
              </View>
              <View style={styles.itemText}>
                <Text
                  variant="body"
                  style={[styles.itemName, item.checked && styles.itemChecked]}
                >
                  {item.name}
                </Text>
                <Text variant="caption" color={Colors.textSecondary}>
                  {item.category}
                </Text>
              </View>
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
            Add Item
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Empty State (shown when no items) */}
      {mockGroceries.length === 0 && (
        <EmptyState
          title="Your grocery list is empty"
          description="Add items to plan your weekly shopping"
          actionLabel="Add First Item"
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  itemCard: {
    padding: Spacing.md,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  itemText: {
    flex: 1,
  },
  itemName: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  itemChecked: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
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
