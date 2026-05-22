import { EmptyState } from "@/src/components/ui/EmptyState";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";

export default function HealthScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader title="Health" subtitle="Wellness Tracking" />
      <EmptyState
        title="Health Coming Soon"
        description="Health tracking features will be available in the next phase"
      />
    </Screen>
  );
}
