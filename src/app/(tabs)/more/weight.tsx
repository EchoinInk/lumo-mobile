import React from 'react';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default function WeightScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader title="Weight" subtitle="Health Metrics" />
      <EmptyState 
        title="Weight Coming Soon"
        description="Weight tracking features will be available in the next phase"
      />
    </Screen>
  );
}
