import { EmptyState } from "@/src/components/ui/EmptyState";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";

export default function CalendarScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader title="Calendar" subtitle="Schedule & Events" />
      <EmptyState
        title="Calendar Coming Soon"
        description="Calendar features will be available in the next phase"
      />
    </Screen>
  );
}
