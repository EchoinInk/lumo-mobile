import React from 'react';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AboutScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader title="About" subtitle="App Information" />
      <EmptyState 
        title="About Coming Soon"
        description="About information will be available in the next phase"
      />
    </Screen>
  );
}
