import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import React from 'react';

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
