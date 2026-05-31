import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { ReminderSettingsCard } from "../components/ReminderSettingsCard";

export default function ReminderSettingsScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader
        title="Reminder Settings"
        subtitle="Customize how reminders feel."
      />
      <ReminderSettingsCard />
    </Screen>
  );
}
