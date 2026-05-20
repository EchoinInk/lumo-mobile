/**
 * ErrorState Component
 * 
 * Calm, reassuring error state component.
 * No technical jargon, no alarming language.
 */

import { getErrorMessage } from '@/constants/feedbackMessages';
import { useTheme } from '@/hooks/use-theme';
import { Colors } from '@/theme/colors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorStateProps {
  errorKey?: string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  actionLabel?: string;
  testID?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  errorKey = 'unknown',
  title,
  description,
  onRetry,
  actionLabel,
  testID,
}) => {
  const { isDark } = useTheme();
  const message = getErrorMessage(errorKey);

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: isDark ? Colors.textPrimary : Colors.textPrimary },
          ]}
        >
          {title || message.title}
        </Text>
        <Text
          style={[
            styles.description,
            { color: isDark ? Colors.textSecondary : Colors.textSecondary },
          ]}
        >
          {description || message.description}
        </Text>
        {onRetry && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors.primary }]}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel={actionLabel || message.actionLabel}
          >
            <Text style={styles.buttonText}>
              {actionLabel || message.actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
