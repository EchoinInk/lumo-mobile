import { EmptyState } from "@/src/components/ui/EmptyState";
import type { FocusSuggestion } from "@/src/features/dashboard/utils/focusSuggestions";
import { Spacing } from "@/src/theme/tokens";
import { StyleSheet, View } from "react-native";
import { NextStepCard } from "./NextStepCard";

interface FocusSuggestionListProps {
  suggestions: FocusSuggestion[];
  onStart: (taskId: string) => void;
  onDone: (taskId: string) => void;
  onSnooze: (taskId: string) => void;
  onLater: (taskId: string) => void;
}

export function FocusSuggestionList({
  suggestions,
  onStart,
  onDone,
  onSnooze,
  onLater,
}: FocusSuggestionListProps) {
  if (suggestions.length === 0) {
    return (
      <EmptyState
        title="No next step needed"
        description="You can add one small thing when it feels useful."
      />
    );
  }

  return (
    <View style={styles.container}>
      {suggestions.map((suggestion) => (
        <NextStepCard
          key={suggestion.task.id}
          suggestion={suggestion}
          onStart={onStart}
          onDone={onDone}
          onSnooze={onSnooze}
          onLater={onLater}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
});
