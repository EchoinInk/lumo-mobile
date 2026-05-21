/**
 * Single Task View Component
 * 
 * View component for single task focus mode.
 * Isolates one task and removes surrounding distractions.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusMode } from '@/hooks/useFocusMode';

interface SingleTaskViewProps {
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
  };
  onTaskComplete: () => void;
  onTaskUpdate: (updates: any) => void;
}

export const SingleTaskView: React.FC<SingleTaskViewProps> = ({
  task,
  onTaskComplete,
  onTaskUpdate,
}) => {
  const { exitFocusMode } = useFocusMode();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.modeLabel}>Single Task Mode</Text>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          {task.description && (
            <Text style={styles.taskDescription}>{task.description}</Text>
          )}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{task.status}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {/* Task actions would go here */}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  modeLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '600' as const,
    marginBottom: 12,
    color: '#000',
  },
  taskDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#4CAF50',
  },
  actions: {
    marginTop: 20,
  },
});
