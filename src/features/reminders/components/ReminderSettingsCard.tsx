import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import { useReminders } from "@/src/features/reminders";
import type { ReminderTone } from "@/src/features/reminders";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const tones: ReminderTone[] = ["gentle", "practical", "encouraging"];

export function ReminderSettingsCard() {
  const { settings, updateSettings } = useReminders();

  return (
    <Card variant="outlined" style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text variant="subheading">Gentle reminders</Text>
          <Text variant="caption" color={Colors.textSecondary}>
            Soft nudges, quiet hours respected.
          </Text>
        </View>
        <Button
          size="sm"
          variant={settings.remindersEnabled ? "secondary" : "ghost"}
          onPress={() =>
            updateSettings({ remindersEnabled: !settings.remindersEnabled })
          }
          accessibilityRole="switch"
          accessibilityState={{ checked: settings.remindersEnabled }}
        >
          {settings.remindersEnabled ? "On" : "Off"}
        </Button>
      </View>

      <View style={styles.tones}>
        {tones.map((tone) => {
          const isSelected = settings.tone === tone;
          return (
            <TouchableOpacity
              key={tone}
              style={[styles.tone, isSelected && styles.toneSelected]}
              onPress={() => updateSettings({ tone })}
              accessibilityRole="button"
              accessibilityLabel={`${tone} reminder tone`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                variant="caption"
                color={isSelected ? Colors.textInverse : Colors.textSecondary}
              >
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.md,
  },
  tones: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tone: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
  },
  toneSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
