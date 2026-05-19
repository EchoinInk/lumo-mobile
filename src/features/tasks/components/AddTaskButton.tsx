import React from 'react';
import { StyleSheet } from 'react-native';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { Plus } from 'lucide-react-native';
import { Colors } from '@/theme/tokens';

interface AddTaskButtonProps {
  onPress?: () => void;
}

export function AddTaskButton({ onPress }: AddTaskButtonProps) {
  return (
    <FloatingActionButton 
      position="bottom-right"
      onPress={onPress}
    >
      <Plus size={24} color={Colors.textPrimary} />
    </FloatingActionButton>
  );
}
