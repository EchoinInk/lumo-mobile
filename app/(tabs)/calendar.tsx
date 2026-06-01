import { CalmPlaceholderNote } from "@/src/components/ui/CalmPlaceholderNote";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const weekDays = [
  { day: "M", date: "13", isToday: false },
  { day: "T", date: "14", isToday: false },
  { day: "W", date: "15", isToday: true },
  { day: "T", date: "16", isToday: false },
  { day: "F", date: "17", isToday: false },
  { day: "S", date: "18", isToday: false },
  { day: "S", date: "19", isToday: false },
];

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState("15");

  return (
    <Screen scrollable padded>
      <SectionHeader
        title="Schedule"
        subtitle="A calm view of your day"
        rightElement={
          <View style={styles.headerControls}>
            <TouchableOpacity
              style={styles.controlButton}
              accessibilityRole="button"
              accessibilityLabel="Previous week"
            >
              <ChevronLeft size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              accessibilityRole="button"
              accessibilityLabel="Next week"
            >
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.calendarButton}
              accessibilityRole="button"
              accessibilityLabel="Open calendar view"
            >
              <CalendarIcon size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <Card variant="elevated" style={styles.weekStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekStripContent}
        >
          {weekDays.map((item, index) => {
            const isSelected = selectedDate === item.date;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDate(item.date)}
                style={[
                  styles.dayItem,
                  item.isToday && styles.dayItemToday,
                  isSelected && styles.dayItemSelected,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${item.day} ${item.date}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  variant="caption"
                  color={
                    item.isToday || isSelected
                      ? Colors.textInverse
                      : Colors.textSecondary
                  }
                >
                  {item.day}
                </Text>
                <Text
                  variant="body"
                  color={
                    item.isToday || isSelected
                      ? Colors.textInverse
                      : Colors.textPrimary
                  }
                  style={styles.dayDate}
                >
                  {item.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Card>

      <SectionHeader title="Today's schedule" />
      <Card variant="outlined" style={styles.emptyCard}>
        <Text variant="body" color={Colors.textSecondary}>
          Nothing needs your attention here yet.
        </Text>
        <Text variant="caption" color={Colors.textTertiary}>
          Your tasks and reminders will land here as scheduling grows.
        </Text>
      </Card>

      <CalmPlaceholderNote
        title="This space is coming together."
        description="You can come back to this later."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  controlButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lavender,
    borderRadius: Radius.md,
    marginLeft: Spacing.xs,
  },
  weekStrip: {
    marginBottom: Spacing.xl,
    padding: Spacing.md,
  },
  weekStripContent: {
    gap: Spacing.sm,
  },
  dayItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xl,
    minWidth: 48,
    minHeight: 44,
  },
  dayItemToday: {
    backgroundColor: Colors.pink,
  },
  dayItemSelected: {
    backgroundColor: Colors.primary,
  },
  dayDate: {
    marginTop: Spacing.xs,
    fontWeight: "600",
  },
  emptyCard: {
    gap: Spacing.xs,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
});
