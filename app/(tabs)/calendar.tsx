import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { Colors, Radius, Shadows, Spacing } from "@/src/theme/tokens";
import {
    Calendar as CalendarIcon,
    Check,
    ChevronLeft,
    ChevronRight,
    Sparkles,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock schedule data
const mockSchedule = [
  { id: "1", time: "8:00 AM", title: "Take meds", completed: true },
  {
    id: "2",
    time: "9:00 AM",
    title: "Work on project",
    completed: false,
    highlighted: true,
  },
  { id: "3", time: "11:00 AM", title: "Doctor appointment", completed: false },
  { id: "4", time: "1:00 PM", title: "Lunch", completed: false },
  { id: "5", time: "3:00 PM", title: "Laundry", completed: false },
  { id: "6", time: "5:00 PM", title: "Gym", completed: false },
];

// Week days data
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
        subtitle="May 2024"
        rightElement={
          <View style={styles.headerControls}>
            <TouchableOpacity style={styles.controlButton}>
              <ChevronLeft size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.calendarButton}>
              <CalendarIcon size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Weekly Date Strip */}
      <Card variant="elevated" style={styles.weekStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekStripContent}
        >
          {weekDays.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedDate(item.date)}
              style={[
                styles.dayItem,
                item.isToday && styles.dayItemToday,
                selectedDate === item.date && styles.dayItemSelected,
              ]}
            >
              <Text
                variant="caption"
                color={
                  item.isToday || selectedDate === item.date
                    ? Colors.textInverse
                    : Colors.textSecondary
                }
              >
                {item.day}
              </Text>
              <Text
                variant="body"
                color={
                  item.isToday || selectedDate === item.date
                    ? Colors.textInverse
                    : Colors.textPrimary
                }
                style={styles.dayDate}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>

      {/* Day Schedule */}
      <SectionHeader title="Today's schedule" />
      <View style={styles.scheduleList}>
        {mockSchedule.map((item, index) => (
          <Card
            key={item.id}
            variant={item.highlighted ? "elevated" : "outlined"}
            style={[
              styles.scheduleItem,
              item.highlighted && styles.scheduleItemHighlighted,
            ]}
          >
            <View style={styles.scheduleContent}>
              <Text
                variant="caption"
                color={Colors.textSecondary}
                style={styles.scheduleTime}
              >
                {item.time}
              </Text>
              <Text
                variant="body"
                style={[
                  styles.scheduleTitle,
                  item.completed && styles.completedTitle,
                ]}
              >
                {item.title}
              </Text>
            </View>
            {item.completed ? (
              <View style={styles.checkContainer}>
                <Check size={18} color={Colors.success} />
              </View>
            ) : item.highlighted ? (
              <View style={styles.highlightedIndicator} />
            ) : null}
          </Card>
        ))}
      </View>

      {/* Encouragement Card */}
      <Card variant="gradient" style={styles.encouragementCard}>
        <View style={styles.encouragementContent}>
          <Sparkles size={20} color={Colors.textInverse} />
          <Text
            variant="body"
            color={Colors.textInverse}
            style={styles.encouragementText}
          >
            You are amazing! Keep going!
          </Text>
        </View>
      </Card>
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
    padding: Spacing.xs,
  },
  calendarButton: {
    padding: Spacing.xs,
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
  scheduleList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  scheduleItemHighlighted: {
    ...Shadows.floating,
    borderLeftWidth: 3,
    borderLeftColor: Colors.pink,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTime: {
    marginBottom: Spacing.xs,
  },
  scheduleTitle: {
    fontWeight: "500",
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.success + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  highlightedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.pink,
    ...Shadows.glow,
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
