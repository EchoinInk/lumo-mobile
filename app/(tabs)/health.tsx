import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import React from 'react';

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
