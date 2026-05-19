import React from 'react';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SettingsScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader title="Settings" subtitle="App Preferences" />
      <EmptyState 
        title="Settings Coming Soon"
        description="Settings features will be available in the next phase"
      />
    </Screen>
  );
}
