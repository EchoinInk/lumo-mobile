import React from 'react';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default function PaymentsScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader title="Payments" subtitle="Financial Management" />
      <EmptyState 
        title="Payments Coming Soon"
        description="Payment tracking features will be available in the next phase"
      />
    </Screen>
  );
}
