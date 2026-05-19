import React from 'react';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default function WorkoutsScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader title="Workouts" subtitle="Fitness Tracking" />
      <EmptyState 
        title="Workouts Coming Soon"
        description="Workout tracking features will be available in the next phase"
      />
    </Screen>
  );
}
