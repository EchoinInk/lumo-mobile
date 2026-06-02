import { Screen } from "@/src/components/ui/Screen";
import { ScreenBackButton } from "@/src/components/ui/ScreenBackButton";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { ReminderSettingsCard } from "../components/ReminderSettingsCard";

export default function ReminderSettingsScreen() {
  return (
    <Screen scrollable padded>
      <ScreenBackButton fallbackPath="/(tabs)/more" />
      <SectionHeader
        title="Reminder Settings"
        subtitle="Customize how reminders feel."
      />
      <ReminderSettingsCard />
    </Screen>
  );
}
