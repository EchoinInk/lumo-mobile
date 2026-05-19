import { Colors, Radius, Shadows, Spacing } from '@/theme/tokens';
import React, { useEffect } from 'react';
import { Animated, PanResponder, StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomSheetProps extends ViewProps {
  children: React.ReactNode;
  visible: boolean;
  onClose?: () => void;
  snapPoint?: number;
}

export function BottomSheet({ 
  children, 
  visible, 
  onClose,
  snapPoint = 0.5,
  className = '',
  style,
  ...props 
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = React.useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 1000,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setIsVisible(false));
    }
  }, [visible]);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 200) {
          onClose?.();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!isVisible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} {...panResponder.panHandlers}>
      <TouchableOpacity 
        style={StyleSheet.absoluteFill} 
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        className={className}
        style={[
          styles.container,
          {
            transform: [{ translateY }],
            paddingBottom: insets.bottom || Spacing.lg,
          },
          style,
        ]}
      >
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    ...Shadows.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
});
