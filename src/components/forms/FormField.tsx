/**
 * FormField
 * 
 * Accessible form field wrapper with clear labels and calm spacing.
 * Supports inline validation and predictable keyboard behavior.
 */

import { UX } from '@/constants/ux';
import { Colors, Spacing } from '@/theme/tokens';
import React from 'react';
import { Text, TextInput, TextInputProps, View, ViewProps } from 'react-native';

interface FormFieldProps extends ViewProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function FormField({
  label,
  children,
  error,
  hint,
  required = false,
  className = '',
  ...props
}: FormFieldProps) {
  return (
    <View
      className={className}
      style={{
        marginBottom: Spacing.md,
      }}
      {...props}
    >
      <View style={{ marginBottom: Spacing.xs }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: Colors.textPrimary,
          }}
          accessible
          accessibilityRole="text"
        >
          {label}
          {required && (
            <Text style={{ color: Colors.danger }}> *</Text>
          )}
        </Text>
      </View>
      
      {children}
      
      {(error || hint) && (
        <View style={{ marginTop: Spacing.xs }}>
          <Text
            style={{
              fontSize: 12,
              color: error ? Colors.danger : Colors.textSecondary,
            }}
            accessible
            accessibilityRole={error ? 'alert' : 'text'}
          >
            {error || hint}
          </Text>
        </View>
      )}
    </View>
  );
}

interface AccessibleTextInputProps extends TextInputProps {
  label: string;
  error?: boolean;
}

export function AccessibleTextInput({
  label,
  error = false,
  style,
  ...props
}: AccessibleTextInputProps) {
  return (
    <TextInput
      style={{
        height: UX.form.preferredInputHeight,
        borderWidth: 1,
        borderColor: error ? Colors.danger : Colors.border,
        borderRadius: 8,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
        color: Colors.textPrimary,
        backgroundColor: Colors.card,
        ...style,
      }}
      placeholderTextColor={Colors.textTertiary}
      accessible
      accessibilityLabel={label}
      accessibilityHint={error ? 'Contains error' : undefined}
      {...props}
    />
  );
}
