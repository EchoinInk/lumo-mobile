import { Colors, Radius, Shadows, Spacing } from "@/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewProps,
} from "react-native";

type CardVariant =
  | "default"
  | "elevated"
  | "gradient"
  | "outlined"
  | "glass"
  | "interactive"
  | "compact";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: CardVariant;
  pressable?: boolean;
  onPress?: TouchableOpacityProps["onPress"];
  padding?: keyof typeof Spacing;
  accessibilityLabel?: string;
  reducedMotion?: boolean;
}

export function Card({
  children,
  variant = "default",
  pressable = false,
  onPress,
  padding = "lg",
  accessibilityLabel,
  reducedMotion = false,
  className = "",
  ...props
}: CardProps) {
  const paddingValue = variant === "compact" ? Spacing.md : Spacing[padding];

  const getVariantStyles = () => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: Colors.card,
          borderRadius: Radius["3xl"],
          ...Shadows.card,
          overflow: "hidden" as const,
        };
      case "gradient":
        return {
          borderRadius: Radius["3xl"],
          ...Shadows.card,
          overflow: "hidden" as const,
        };
      case "outlined":
        return {
          backgroundColor: Colors.card,
          borderRadius: Radius["3xl"],
          borderWidth: 1,
          borderColor: Colors.border,
          overflow: "hidden" as const,
        };
      case "glass":
        return {
          backgroundColor: Colors.cardGlass,
          borderRadius: Radius["3xl"],
          ...Shadows.soft,
          overflow: "hidden" as const,
        };
      case "interactive":
        return {
          backgroundColor: Colors.card,
          borderRadius: Radius["3xl"],
          ...Shadows.card,
          overflow: "hidden" as const,
        };
      case "compact":
        return {
          backgroundColor: Colors.card,
          borderRadius: Radius["2xl"],
          ...Shadows.sm,
          overflow: "hidden" as const,
        };
      default:
        return {
          backgroundColor: Colors.card,
          borderRadius: Radius["3xl"],
          ...Shadows.soft,
          overflow: "hidden" as const,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const cardContent = (
    <View
      className={className}
      style={{
        backgroundColor: variantStyles.backgroundColor,
        borderRadius: variantStyles.borderRadius,
        borderWidth: variantStyles.borderWidth,
        borderColor: variantStyles.borderColor,
        overflow: variantStyles.overflow,
        shadowColor: (variantStyles as any).shadowColor,
        shadowOffset: (variantStyles as any).shadowOffset,
        shadowOpacity: (variantStyles as any).shadowOpacity,
        shadowRadius: (variantStyles as any).shadowRadius,
        elevation: (variantStyles as any).elevation,
        padding: paddingValue,
      }}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={pressable ? "button" : undefined}
      {...props}
    >
      {variant === "gradient" ? (
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            margin: -paddingValue,
            padding: paddingValue,
          }}
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
        activeOpacity={reducedMotion ? 0.95 : 0.85}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={{
          ...getVariantStyles(),
          padding: paddingValue,
        }}
      >
        {variant === "gradient" ? (
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              margin: -paddingValue,
              padding: paddingValue,
            }}
          >
            {children}
          </LinearGradient>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }

  return cardContent;
}
