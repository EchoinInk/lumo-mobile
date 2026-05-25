import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import { Bell, Droplets } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

interface ReminderCardProps {
  title?: string;
  message?: string;
  time?: string;
}

export function ReminderCard({
  title = "Reminder",
  message = "Drink water",
  time = "Every 2 hours",
}: ReminderCardProps) {
  return (
    <Card variant="outlined" style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Droplets size={20} color={Colors.blue} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text variant="body" style={styles.title}>
              {message}
            </Text>
            <Bell size={14} color={Colors.textTertiary} />
          </View>
          <Text variant="caption" color={Colors.textSecondary}>
            {time}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.backgroundAlt,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.blue + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  title: {
    fontWeight: "500",
  },
});
