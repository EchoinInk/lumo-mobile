import { Colors, Spacing } from "@/theme/tokens";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { Button } from "./Button";
import { Text } from "./Text";

interface SectionHeaderProps extends ViewProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  rightElement?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  rightElement,
  className = "",
  style,
  ...props
}: SectionHeaderProps) {
  return (
    <View className={className} style={[styles.container, style]} {...props}>
      <View style={styles.leftContent}>
        <Text variant="subheading" style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="caption"
            color={Colors.textSecondary}
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {actionLabel && onAction ? (
        <Button variant="ghost" size="sm" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : (
        rightElement
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  leftContent: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  subtitle: {
    marginTop: 0,
    lineHeight: 20,
  },
});
