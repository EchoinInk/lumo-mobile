/**
 * FormSection
 * 
 * Reusable form section wrapper with calm spacing and clear hierarchy.
 * Supports progressive disclosure and accessible grouping.
 */

import { Padding, Spacing } from '@/theme/tokens';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface FormSectionProps extends ViewProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  padded?: boolean;
  collapsible?: boolean;
}

export function FormSection({
  children,
  title,
  description,
  padded = true,
  className = '',
  ...props
}: FormSectionProps) {
  const paddingValue = padded ? Padding.lg : 0;

  return (
    <View
      className={className}
      style={{
        padding: paddingValue,
        marginBottom: Spacing.lg,
      }}
      {...props}
    >
      {(title || description) && (
        <View style={{ marginBottom: Spacing.md }}>
          {title && (
            <View
              style={{
                marginBottom: description ? Spacing.xs : 0,
              }}
              accessible
              accessibilityRole="header"
            >
              {/* Title would be rendered by Text component */}
            </View>
          )}
          {description && (
            <View
              accessible
              accessibilityRole="text"
            >
              {/* Description would be rendered by Text component */}
            </View>
          )}
        </View>
      )}
      <View style={{ gap: Spacing.md }}>
        {children}
      </View>
    </View>
  );
}
