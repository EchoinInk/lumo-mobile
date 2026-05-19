import React from 'react';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default function MealsScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader title="Meals" subtitle="Nutrition Tracking" />
      <EmptyState 
        title="Meals Coming Soon"
        description="Meal tracking features will be available in the next phase"
      />
    </Screen>
  );
}
