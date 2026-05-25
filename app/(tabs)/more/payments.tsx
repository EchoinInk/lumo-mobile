import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { Text } from "@/src/components/ui/Text";
import { MoreScreenHeader } from "@/src/features/more/components";
import { Colors, Radius, Shadows, Spacing } from "@/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Receipt } from "lucide-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock payments data
const mockPayments = [
  { id: "1", name: "Rent", amount: 1200, status: "paid", date: "May 1" },
  { id: "2", name: "Electricity", amount: 85, status: "paid", date: "May 3" },
  { id: "3", name: "Internet", amount: 60, status: "pending", date: "May 15" },
  {
    id: "4",
    name: "Phone Bill",
    amount: 45,
    status: "pending",
    date: "May 20",
  },
];

export default function PaymentsScreen() {
  return (
    <Screen scrollable padded>
      <MoreScreenHeader title="Payment Logs" subtitle="May 2024" />

      {/* Payments List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {mockPayments.map((payment) => (
          <Card key={payment.id} variant="elevated" style={styles.paymentCard}>
            <View style={styles.paymentContent}>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      payment.status === "paid"
                        ? Colors.success + "20"
                        : Colors.warning + "20",
                  },
                ]}
              >
                <Receipt
                  size={18}
                  color={
                    payment.status === "paid" ? Colors.success : Colors.warning
                  }
                />
              </View>
              <View style={styles.paymentInfo}>
                <Text variant="body" style={styles.paymentName}>
                  {payment.name}
                </Text>
                <Text variant="caption" color={Colors.textSecondary}>
                  {payment.date}
                </Text>
              </View>
              <View style={styles.paymentAmount}>
                <Text variant="subheading" style={styles.amount}>
                  ${payment.amount}
                </Text>
                <Text
                  variant="small"
                  color={
                    payment.status === "paid" ? Colors.success : Colors.warning
                  }
                >
                  {payment.status === "paid" ? "Paid" : "Pending"}
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
            Add Payment
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  paymentCard: {
    padding: Spacing.md,
  },
  paymentContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  paymentAmount: {
    alignItems: "flex-end",
  },
  amount: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
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
