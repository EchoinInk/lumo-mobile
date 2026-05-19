import { Colors, Radius, Shadows, Spacing } from '@/theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View, ViewProps } from 'react-native';

type CardVariant = 'default' | 'elevated' | 'gradient' | 'outlined' | 'glass' | 'interactive' | 'compact';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: CardVariant;
  pressable?: boolean;
  onPress?: TouchableOpacityProps['onPress'];
  padding?: keyof typeof Spacing;
  accessibilityLabel?: string;
  reducedMotion?: boolean;
}

export function Card({ 
  children, 
  variant = 'default', 
  pressable = false,
  onPress,
  padding = 'lg',
  accessibilityLabel,
  reducedMotion = false,
  className = '',
  ...props 
}: CardProps) {
  const paddingValue = variant === 'compact' ? Spacing.md : Spacing[padding];

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: Colors.card,
          borderRadius: Radius.lg,
          ...Shadows.lg,
        };
      case 'gradient':
        return {
          borderRadius: Radius.lg,
          ...Shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: Colors.card,
          borderRadius: Radius.lg,
          borderWidth: 1,
          borderColor: Colors.border,
        };
      case 'glass':
        return {
          backgroundColor: Colors.cardGlass,
          borderRadius: Radius.lg,
          ...Shadows.soft,
        };
      case 'interactive':
        return {
          backgroundColor: Colors.card,
          borderRadius: Radius.lg,
          ...Shadows.md,
        };
      case 'compact':
        return {
          backgroundColor: Colors.card,
          borderRadius: Radius.md,
          ...Shadows.sm,
        };
      default:
        return {
          backgroundColor: Colors.card,
          borderRadius: Radius.lg,
          ...Shadows.soft,
        };
    }
  };

  const cardContent = (
    <View 
      className={className}
      style={{
        ...getVariantStyles(),
        padding: paddingValue,
      }}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      {...props}
    >
      {variant === 'gradient' ? (
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: Radius.lg, padding: paddingValue }}
        >
          {children}
        </LinearGradient>
      ) : (
        children
      )}
    </View>
  );

  if (pressable) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={reducedMotion ? 0.9 : 0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={{ ...getVariantStyles() }}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}
