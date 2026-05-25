import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import { router } from "expo-router";
import {
    ArrowRight,
    CreditCard,
    Dumbbell,
    Home,
    Scale,
    Settings,
    ShoppingCart,
    Sparkles,
    Utensils,
    Wallet,
} from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface FeatureCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  onPress?: () => void;
}

function FeatureCard({ title, icon, color, onPress }: FeatureCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.cardContainer}
    >
      <Card variant="elevated" style={styles.featureCard}>
        <View style={[styles.iconWrapper, { backgroundColor: color + "15" }]}>
          {icon}
        </View>
        <View style={styles.cardContent}>
          <Text variant="body" style={styles.cardTitle}>
            {title}
          </Text>
          <ArrowRight size={18} color={Colors.textTertiary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const features = [
  {
    title: "Budget Tracker",
    icon: <Wallet size={22} color={Colors.success} />,
    color: Colors.success,
    route: "/more/budget",
  },
  {
    title: "Payment Logs",
    icon: <CreditCard size={22} color={Colors.blue} />,
    color: Colors.blue,
    route: "/more/payments",
  },
  {
    title: "Weekly Groceries",
    icon: <ShoppingCart size={22} color={Colors.purple} />,
    color: Colors.purple,
    route: "/more/groceries",
  },
  {
    title: "My Meals",
    icon: <Utensils size={22} color={Colors.pink} />,
    color: Colors.pink,
    route: "/more/meals",
  },
  {
    title: "Cleaning Schedule",
    icon: <Home size={22} color={Colors.warning} />,
    color: Colors.warning,
    route: "/more/cleaning",
  },
  {
    title: "Weight Loss Tracker",
    icon: <Scale size={22} color={Colors.primary} />,
    color: Colors.primary,
    route: "/more/weight",
  },
  {
    title: "My Workout Log",
    icon: <Dumbbell size={22} color={Colors.pink} />,
    color: Colors.pink,
    route: "/more/workouts",
  },
  {
    title: "Settings",
    icon: <Settings size={22} color={Colors.textSecondary} />,
    color: Colors.textSecondary,
    route: "/more/settings",
  },
];

export default function MoreScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader title="More" subtitle="All your features" />

      {/* Feature Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            icon={feature.icon}
            color={feature.color}
            onPress={() => router.push(feature.route as any)}
          />
        ))}
      </ScrollView>

      {/* Support Card */}
      <Card variant="gradient" style={styles.supportCard}>
        <View style={styles.supportContent}>
          <Sparkles size={20} color={Colors.textInverse} />
          <Text
            variant="body"
            color={Colors.textInverse}
            style={styles.supportText}
          >
            Need help? We&apos;re here for you.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  cardContainer: {
    flex: 1,
    minWidth: "45%",
  },
  featureCard: {
    padding: Spacing.lg,
    alignItems: "flex-start",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  cardTitle: {
    fontWeight: "500",
    flex: 1,
  },
  supportCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  supportContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  supportText: {
    fontWeight: "600",
  },
});
