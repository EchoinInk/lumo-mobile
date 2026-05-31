import { EmptyState } from "@/src/components/ui/EmptyState";
import { Input } from "@/src/components/ui/Input";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { useBrainDump } from "@/src/features/brain-dump";
import type {
  BrainDumpConversionTarget,
  BrainDumpEntry,
} from "@/src/features/brain-dump";
import { useReminders } from "@/src/features/reminders";
import { useTasks } from "@/src/features/tasks";
import { Spacing } from "@/src/theme/tokens";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "@/src/components/ui/Button";
import { BrainDumpEntryCard } from "../components/BrainDumpEntryCard";

export default function BrainDumpScreen() {
  const [text, setText] = useState("");
  const { addEntry, convertEntry, openEntries } = useBrainDump();
  const { createTask } = useTasks();
  const reminders = useReminders();

  const handleAdd = () => {
    const entry = addEntry({ text });
    if (entry) {
      setText("");
    }
  };

  const handleConvert = (
    entry: BrainDumpEntry,
    target: BrainDumpConversionTarget,
  ) => {
    if (target === "task") {
      const task = createTask({ title: entry.text, priority: "medium" });
      convertEntry(entry.id, target, task?.id);
      return;
    }

    if (target === "reminder") {
      const reminder = reminders.addReminder({ title: entry.text });
      convertEntry(entry.id, target, reminder?.id);
      return;
    }

    convertEntry(entry.id, target);
  };

  return (
    <Screen scrollable padded keyboardAvoiding>
      <SectionHeader
        title="Brain Dump"
        subtitle="Unload first. Decide later."
      />

      <View style={styles.capture}>
        <Input
          value={text}
          onChangeText={setText}
          placeholder="Drop the thought here"
          accessibilityLabel="Brain dump thought"
          multiline
          helperText="No categories. No pressure."
        />
        <Button
          onPress={handleAdd}
          disabled={!text.trim()}
          accessibilityHint="Saves this thought locally"
        >
          Capture thought
        </Button>
      </View>

      <View style={styles.list}>
        {openEntries.length === 0 ? (
          <EmptyState
            title="Nothing waiting"
            description="When your mind feels full, this space can hold it for you."
          />
        ) : (
          openEntries.map((entry) => (
            <BrainDumpEntryCard
              key={entry.id}
              entry={entry}
              onConvert={handleConvert}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  capture: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  list: {
    gap: Spacing.md,
  },
});
