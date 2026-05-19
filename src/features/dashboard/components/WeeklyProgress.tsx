import React from 'react';
import { StyleSheet } from 'react-native';
import { ProgressCard } from '@/components/cards/ProgressCard';

interface WeeklyProgressProps {
  title?: string;
  progress?: number;
  subtitle?: string;
  variant?: 'default' | 'gradient';
}

export function WeeklyProgress({ 
  title = "Weekly Goals",
  progress = 65,
  subtitle = "5 of 8 goals completed",
  variant = "gradient"
}: WeeklyProgressProps) {
  return (
    <ProgressCard 
      title={title}
      progress={progress}
      subtitle={subtitle}
      variant={variant}
    />
  );
}
