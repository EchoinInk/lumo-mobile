import { Colors, Radius, Shadows } from '@/theme/tokens';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

type IconButtonShape = 'circular' | 'square';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  shape?: IconButtonShape;
  size?: IconButtonSize;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  haptic?: boolean;
}

export function IconButton({ 
  children, 
  shape = 'circular',
  size = 'md',
  variant = 'ghost',
  haptic = true,
  className = '',
  onPress,
  ...props 
}: IconButtonProps) {
  const handlePress = (event: any) => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: 32, height: 32 };
      case 'lg':
        return { width: 48, height: 48 };
      default:
        return { width: 40, height: 40 };
    }
  };

  const getShapeStyles = () => {
    switch (shape) {
      case 'square':
        return { borderRadius: Radius.md };
      default:
        return { borderRadius: Radius.full };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Colors.primary,
          ...Shadows.sm,
        };
      case 'secondary':
        return {
          backgroundColor: Colors.secondary,
          ...Shadows.sm,
        };
      case 'danger':
        return {
          backgroundColor: Colors.danger,
          ...Shadows.sm,
        };
      case 'ghost':
      default:
        return {
          backgroundColor: 'transparent',
        };
    }
  };

  return (
    <TouchableOpacity
      className={className}
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        ...getSizeStyles(),
        ...getShapeStyles(),
        ...getVariantStyles(),
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}
