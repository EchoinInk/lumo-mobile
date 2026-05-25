import { Screen } from "@/src/components/ui/Screen";
import {
    ProgressSummaryCard,
    QuickActions,
    ReminderCard,
    StartHeader,
    TodaysFocusCard,
} from "@/src/features/start/components";

export default function StartScreen() {
  return (
    <Screen scrollable padded>
      <StartHeader name="Alex" />
      <TodaysFocusCard />
      <QuickActions />
      <ProgressSummaryCard completedTasks={3} totalTasks={6} />
      <ReminderCard message="Drink water" time="Every 2 hours" />
    </Screen>
  );
}
