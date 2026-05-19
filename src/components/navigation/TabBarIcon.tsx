import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '@/theme/tokens';

interface TabBarIconProps {
  focused: boolean;
  children: React.ReactNode;
}

export function TabBarIcon({ focused, children }: TabBarIconProps) {
  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  containerFocused: {
    opacity: 1,
  },
  iconWrapper: {
    padding: Spacing.sm,
    borderRadius: 12,
  },
  iconWrapperFocused: {
    backgroundColor: Colors.cardGlass,
  },
});
