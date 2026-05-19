import { UX } from '@/constants/ux';
import { Colors, Padding } from '@/theme/tokens';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, ScrollViewProps, View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean | keyof typeof Padding;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
  scrollViewProps?: ScrollViewProps;
  centered?: boolean;
  accessibilityLabel?: string;
}

export function Screen({
  children,
  scrollable = false,
  padded = true,
  keyboardAvoiding = false,
  backgroundColor = Colors.background,
  className = '',
  scrollViewProps,
  centered = false,
  accessibilityLabel,
  ...props
}: ScreenProps) {
  const paddingValue = typeof padded === 'boolean' 
    ? (padded ? Padding.lg : Padding.none)
    : Padding[padded];

  const content = (
    <View 
      className={`flex-1 ${className}`}
      style={{
        backgroundColor,
        paddingHorizontal: paddingValue,
        paddingVertical: paddingValue,
        maxWidth: UX.content.maxWidth,
        alignSelf: centered ? 'center' : 'stretch',
        width: centered ? '100%' : undefined,
      }}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="adjustable"
      {...props}
    >
      {children}
    </View>
  );

  if (keyboardAvoiding) {
    return (
      <SafeAreaView 
        style={{ flex: 1, backgroundColor }} 
        edges={['top', 'left', 'right']}
        accessible={false}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {scrollable ? (
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              accessible={false}
              {...scrollViewProps}
            >
              {content}
            </ScrollView>
          ) : (
            content
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor }} 
      edges={['top', 'left', 'right']}
      accessible={false}
    >
      {scrollable ? (
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          accessible={false}
          {...scrollViewProps}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
