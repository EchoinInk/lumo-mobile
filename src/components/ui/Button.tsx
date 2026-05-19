import { Colors, Radius, Shadows, Spacing, Typography } from '@/theme/tokens';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  haptic?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  haptic = true,
  className = '',
  onPress,
  ...props 
}: ButtonProps) {
  const handlePress = (event: any) => {
    if (haptic && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.(event);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          minHeight: 36,
        };
      case 'lg':
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
          minHeight: 52,
        };
      default:
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          minHeight: 44,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Colors.primary,
          borderRadius: Radius.lg,
          ...Shadows.md,
        };
      case 'secondary':
        return {
          backgroundColor: Colors.secondary,
          borderRadius: Radius.lg,
          ...Shadows.md,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderRadius: Radius.lg,
        };
      case 'danger':
        return {
          backgroundColor: Colors.danger,
          borderRadius: Radius.lg,
          ...Shadows.md,
        };
      default:
        return {
          backgroundColor: Colors.primary,
          borderRadius: Radius.lg,
          ...Shadows.md,
        };
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      ...Typography.body,
      fontWeight: '600' as const,
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return { ...baseStyle, color: Colors.textInverse };
      case 'ghost':
        return { ...baseStyle, color: Colors.primary };
      default:
        return { ...baseStyle, color: Colors.textInverse };
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={className}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={{
        ...getSizeStyles(),
        ...getVariantStyles(),
        opacity: isDisabled ? 0.5 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={Colors.textInverse} />
      ) : (
        <>
          {leftIcon}
          {typeof children === 'string' ? (
            <Text style={getTextStyle()}>
              {children}
            </Text>
          ) : (
            children
          )}
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}
