/**
 * Today Only Dashboard Component
 * 
 * Dashboard component for today-only focus mode.
 * Shows only today's priorities and suppresses future planning.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusMode } from '@/hooks/useFocusMode';

interface TodayOnlyDashboardProps {
  tasks: any[];
  habits: any[];
}

export const TodayOnlyDashboard: React.FC<TodayOnlyDashboardProps> = ({
  tasks,
  habits,
}) => {
  const { exitFocusMode } = useFocusMode();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.modeLabel}>Today Only</Text>
        <Text style={styles.subtitle}>Focus on today's priorities</Text>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <Text style={styles.taskTitle}>{task.title}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          {habits.map((habit) => (
            <View key={habit.id} style={styles.habitItem}>
              <Text style={styles.habitTitle}>{habit.title}</Text>
            </View>
          ))}
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
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  modeLabel: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 12,
    color: '#000',
  },
  taskItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    color: '#000',
  },
  habitItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  habitTitle: {
    fontSize: 16,
    color: '#000',
  },
});
