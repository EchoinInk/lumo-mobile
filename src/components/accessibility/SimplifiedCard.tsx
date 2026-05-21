/**
 * Simplified Card Component
 * 
 * Card component that respects simplified mode.
 * Reduces visual complexity and shows fewer actions.
 */

import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { simplifiedModeManager } from '@/accessibility';
import type { SimplifiedModeConfig } from '@/accessibility/simplifiedMode';

interface SimplifiedCardProps extends ViewProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  priority?: 'primary' | 'secondary' | 'tertiary';
}

export const SimplifiedCard: React.FC<SimplifiedCardProps> = ({
  title,
  description,
  actions,
  priority = 'secondary',
  style,
  ...props
}) => {
  const { preferences } = useAccessibilityStore();
  const simplifiedConfig = simplifiedModeManager.getConfig();
  
  // Determine if actions should be shown
  const showActions = () => {
    if (!simplifiedConfig.enabled) return true;
    if (priority === 'primary') return true;
    return simplifiedConfig.minimizeActions ? false : true;
  };

  // Determine if description should be shown
  const showDescription = () => {
    if (!simplifiedConfig.enabled) return true;
    if (priority === 'primary') return true;
    return !simplifiedConfig.hideSecondaryElements;
  };

  return (
    <View style={[styles.card, simplifiedConfig.enabled && styles.simplified, style]} {...props}>
      <Text style={styles.title}>{title}</Text>
      {description && showDescription() && (
        <Text style={styles.description}>{description}</Text>
      )}
      {actions && showActions() && (
        <View style={styles.actions}>{actions}</View>
      )}
    </View>
  );
};

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simplified: {
    padding: 12,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  actions: {
    marginTop: 8,
  },
};
