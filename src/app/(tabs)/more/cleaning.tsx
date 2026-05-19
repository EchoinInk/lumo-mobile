import React from 'react';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CleaningScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader title="Cleaning" subtitle="Home Management" />
      <EmptyState 
        title="Cleaning Coming Soon"
        description="Cleaning schedule features will be available in the next phase"
      />
    </Screen>
  );
}
