import React from 'react';
import { StyleSheet } from 'react-native';
import { FocusCard } from '@/components/cards/FocusCard';

interface TodayFocusCardProps {
  title?: string;
  description?: string;
  initials?: string;
}

export function TodayFocusCard({ 
  title = "Complete Project Proposal",
  description = "Finish the draft and send to team for review",
  initials = "PP"
}: TodayFocusCardProps) {
  return (
    <FocusCard 
      title={title}
      description={description}
      initials={initials}
    />
  );
}
