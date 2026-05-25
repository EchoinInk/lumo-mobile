import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { StatCard } from "@/src/components/ui/StatCard";
import { Text } from "@/src/components/ui/Text";
import { Colors, Radius, Shadows, Spacing } from "@/src/theme/tokens";
import {
    CheckCircle2,
    Flame,
    Plus,
    Sparkles,
    Trophy,
    Utensils,
    Wallet,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock data for stats
const mockStats = [
  { label: "Tasks", value: "18", change: "5 done", icon: CheckCircle2, color: Colors.blue },
  { label: "Habits", value: "7", change: "streak", icon: Flame, color: Colors.purple },
  { label: "Calories", value: "1,320", change: "of 1,800", icon: Utensils, color: Colors.pink },
  { label: "Budget", value: "$420", change: "left", icon: Wallet, color: Colors.success },
];

// Mock small wins
const smallWins = [
  { text: "Kept your streak for 5 days!", icon: Flame },
  { text: "Planned all meals", icon: Utensils },
  { text: "Stayed under budget", icon: Wallet },
];

export default function DashboardScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader
        title="At a glance"
        subtitle="This week"
        rightElement={
          <TouchableOpacity style={styles.settingsButton}>
            <Text variant="caption" color={Colors.primary}>
              This week
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {mockStats.map((stat, index) => (
          <Card key={index} variant="elevated" style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + "15" }]}>
                <stat.icon size={18} color={stat.color} />
              </View>
              <Text variant="caption" color={Colors.textSecondary}>
                {stat.label}
              </Text>
            </View>
            <Text variant="heading" style={styles.statValue}>
              {stat.value}
            </Text>
            <Text variant="small" color={Colors.textSecondary}>
              {stat.change}
            </Text>
          </Card>
        ))}
      </View>

      {/* Weekly Overview */}
      <SectionHeader title="This week overview" />
      <Card variant="elevated" style={styles.weeklyCard}>
        <View style={styles.weekDays}>
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
            const isToday = index === 4; // Friday as example
            return (
              <View key={index} style={styles.dayColumn}>
                <Text
                  variant="caption"
                  color={isToday ? Colors.primary : Colors.textSecondary}
                  style={isToday && styles.dayTextActive}
                >
                  {day}
                </Text>
                <View
                  style={[
                    styles.dayDot,
                    isToday && styles.dayDotActive,
                  ]}
                />
              </View>
            );
          })}
        </View>
        {/* Simple line chart visualization */}
        <View style={styles.chartContainer}>
          <View style={styles.chartLine}>
            <LinearGradient
              colors={[Colors.pinkSoft, Colors.purpleSoft]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.chartGradient}
            />
          </View>
          <View style={styles.chartPoints}>
            {[0.3, 0.5, 0.4, 0.7, 0.9, 0.6, 0.8].map((height, index) => (
              <View
                key={index}
                style={[
                  styles.chartPoint,
                  { bottom: height * 60 },
                  index === 4 && styles.chartPointActive,
                ]}
              />
            ))}
          </View>
        </View>
      </Card>

      {/* Small Wins */}
      <SectionHeader title="Top wins" />
      <View style={styles.winsList}>
        {smallWins.map((win, index) => (
          <Card key={index} variant="outlined" style={styles.winCard}>
            <View style={styles.winContent}>
              <View style={styles.winIconContainer}>
                <win.icon size={16} color={Colors.warning} />
              </View>
              <Text variant="body" style={styles.winText}>
                {win.text}
              </Text>
            </View>
          </Card>
        ))}
      </View>

      {/* Encouragement Card */}
      <Card variant="gradient" style={styles.encouragementCard}>
        <View style={styles.encouragementContent}>
          <Sparkles size={20} color={Colors.textInverse} />
          <Text variant="body" color={Colors.textInverse} style={styles.encouragementText}>
            You are amazing! Keep going!
          </Text>
          <Trophy size={20} color={Colors.textInverse} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.lavender,
    borderRadius: Radius.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.lg,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  weeklyCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  dayColumn: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  dayTextActive: {
    fontWeight: "600",
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dayDotActive: {
    backgroundColor: Colors.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartContainer: {
    height: 80,
    position: "relative",
    marginTop: Spacing.md,
  },
  chartLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
  },
  chartGradient: {
    flex: 1,
    height: 2,
  },
  chartPoints: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: "100%",
    paddingHorizontal: Spacing.xs,
  },
  chartPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  chartPointActive: {
    backgroundColor: Colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
    ...Shadows.glowPurple,
  },
  winsList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  winCard: {
    padding: Spacing.md,
  },
  winContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  winIconContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.warning + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  winText: {
    flex: 1,
    fontWeight: "500",
  },
  encouragementCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  encouragementContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  encouragementText: {
    fontWeight: "600",
  },
});
