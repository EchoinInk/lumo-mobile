import { Colors, Radius, Shadows, Spacing } from '@/theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View, ViewProps } from 'react-native';

type CardVariant = 'default' | 'elevated' | 'gradient' | 'outlined' | 'glass';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: CardVariant;
  pressable?: boolean;
  onPress?: TouchableOpacityProps['onPress'];
  padding?: keyof typeof Spacing;
}

export function Card({ 
  children, 
  variant = 'default', 
  pressable = false,
  onPress,
  padding = 'lg',
  className = '',
  ...props 
}: CardProps) {
  const paddingValue = Spacing[padding];

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
        activeOpacity={0.7}
        style={{ ...getVariantStyles() }}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}
