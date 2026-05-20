# Motion System Documentation

## Overview

Lumo's motion system is designed to be calm, subtle, and accessibility-first. Motion supports cognition rather than competing for attention.

## Philosophy

- **Motion reduces friction**: Animations should make interactions clearer
- **Calm over flashy**: Subtle, gentle animations only
- **Accessibility mandatory**: All animations respect reduced motion preferences
- **Emotionally warm**: Motion should feel supportive, not aggressive
- **Never overwhelm**: No constant motion, no attention hijacking

## Architecture

### Directory Structure

```
src/animations/
├── transitions.ts      # Reusable transition animations
├── presets.ts          # Animation worklet presets
├── haptics.ts          # Haptic feedback utilities
├── motion.ts           # Central motion configuration
└── reducedMotion.ts    # Reduced motion utilities
```

## Transitions (transitions.ts)

Reusable transition animations using react-native-reanimated.

### Available Transitions

```typescript
// Soft fade in with delay
softFadeIn(delay?: number)

// Soft fade out with delay
softFadeOut(delay?: number)

// Gentle slide up fade in
slideUpFadeIn(delay?: number)

// Gentle slide down fade in
slideDownFadeIn(delay?: number)

// Gentle slide right fade in
slideRightFadeIn(delay?: number)

// Gentle slide left fade in
slideLeftFadeIn(delay?: number)

// Staggered fade in for lists
staggeredFadeIn(index: number, baseDelay?: number)

// No-op animation for reduced motion
noAnimation()

// Conditional animation based on reduced motion
conditionalAnimation(animation: any)
```

### Usage Example

```typescript
import { softFadeIn } from '@/animations/transitions';

<Animated.View entering={softFadeIn(100)}>
  <Text>Hello</Text>
</Animated.View>
```

## Presets (presets.ts)

Pre-configured animation worklets for common interactions.

### Available Presets

```typescript
// Press scale animation
usePressScale(pressed: SharedValue<boolean>)

// Hover scale animation
useHoverScale(hovered: SharedValue<boolean>)

// Opacity animation
useOpacityAnimation(visible: SharedValue<boolean>)

// Gentle spring animation
useGentleSpring(toValue: number, fromValue?: number)

// Soft timing animation
useSoftTiming(toValue: number, fromValue?: number)

// Card elevation animation
useCardElevation(elevated: SharedValue<boolean>)
```

### Usage Example

```typescript
import { usePressScale } from '@/animations/presets';

const pressed = useSharedValue(false);
const animatedStyle = usePressScale(pressed);

<AnimatedPressable
  onPressIn={() => pressed.value = true}
  onPressOut={() => pressed.value = false}
  style={animatedStyle}
>
  <Text>Press me</Text>
</AnimatedPressable>
```

## Haptics (haptics.ts)

Centralized haptic feedback using expo-haptics.

### Available Haptics

```typescript
// Soft impact - gentle confirmations
softImpact()

// Medium impact - standard confirmations
mediumImpact()

// Strong impact - important completions
strongImpact()

// Selection feedback
selectionHaptic()

// Success notification
successHaptic()

// Warning notification
warningHaptic()

// Error notification
errorHaptic()

// Onboarding progression
onboardingProgressHaptic()

// Onboarding completion
onboardingCompleteHaptic()

// Task completion
taskCompleteHaptic()

// Generic pattern-based haptic
triggerHaptic(pattern: HapticPattern)
```

### Usage Example

```typescript
import { selectionHaptic, taskCompleteHaptic } from '@/animations/haptics';

const handleSelect = () => {
  selectionHaptic();
  // ... selection logic
};

const handleComplete = () => {
  taskCompleteHaptic();
  // ... completion logic
};
```

### Haptic Philosophy

- **Use sparingly**: Only for meaningful interactions
- **Light intensity**: Default to light/medium, rarely strong
- **Contextual**: Match haptic to interaction importance
- **Respect preferences**: Check accessibility store before triggering

## Motion Configuration (motion.ts)

Central motion configuration and utilities.

### Configuration

```typescript
motionConfig = {
  durations: {
    instant: 0,
    fast: 120,
    normal: 180,
    slow: 260,
    slower: 340,
  },
  scale: {
    press: 0.96,
    hover: 0.98,
    focus: 1,
    default: 1,
  },
  opacity: {
    press: 0.8,
    hover: 0.9,
    focus: 1,
    default: 1,
    disabled: 0.5,
  },
}
```

### Utilities

```typescript
// Get adjusted duration based on accessibility
getAdjustedDuration(baseDuration: number): number

// Check if animation should run based on priority
shouldAnimate(priority: 'essential' | 'optional' | 'delight'): boolean

// Get spring config based on preferences
getSpringConfig(): object

// Get easing based on preferences
getEasing(easing: string): EasingFunction
```

## Reduced Motion (reducedMotion.ts)

Utilities for handling reduced motion preferences.

### Hooks

```typescript
// Check if reduced motion is enabled
useReducedMotion(): boolean

// Check if animations should be simplified
useSimplifiedMotion(): boolean

// Get motion intensity level
useMotionIntensity(): 'none' | 'reduced' | 'normal'

// Check if haptics are enabled
useHapticsEnabled(): boolean

// Check if specific animation type should run
useAnimationEnabled(type: 'focus' | 'orientation' | 'state' | 'delight'): boolean

// Get animation duration multiplier
useDurationMultiplier(): number
```

### Usage Example

```typescript
import { useReducedMotion, useAnimationEnabled } from '@/animations/reducedMotion';

const reducedMotion = useReducedMotion();
const canAnimate = useAnimationEnabled('delight');

if (!reducedMotion && canAnimate) {
  // Run animation
}
```

## Animated Components

Reusable animated components in `src/components/animated/`.

### FadeIn

Simple fade-in animation.

```typescript
<FadeIn delay={0} style={styles.container}>
  <Text>Content</Text>
</FadeIn>
```

### ScalePress

Pressable with subtle scale animation.

```typescript
<ScalePress onPress={handlePress} hapticFeedback={true}>
  <Text>Press me</Text>
</ScalePress>
```

### AnimatedCard

Card with gentle elevation animation.

```typescript
<AnimatedCard elevated={true} onPress={handlePress}>
  <Text>Card content</Text>
</AnimatedCard>
```

### SharedTransitionCard

Card with shared element transition support.

```typescript
<SharedTransitionCard sharedTransitionTag="card-1">
  <Text>Card content</Text>
</SharedTransitionCard>
```

### CelebrationPulse

Subtle pulse for completion moments.

```typescript
<CelebrationPulse trigger={isComplete}>
  <Text>Completed!</Text>
</CelebrationPulse>
```

## Best Practices

### When to Use Animation

**Good uses**:
- State transitions (modal open/close, screen navigation)
- Focus indication (input focus, card selection)
- Completion feedback (task done, form submitted)
- Orientation (list item enter/exit)
- Gentle delight (celebration pulse)

**Bad uses**:
- Constant motion (always animating elements)
- Attention hijacking (flashy notifications)
- Gamification (streak celebrations, achievement popups)
- Exaggerated springs (bouncing cards)
- Animation-heavy dashboards (everything moving)

### Animation Duration Guidelines

- **Instant (0ms)**: State changes in reduced motion mode
- **Fast (120ms)**: Press feedback, hover states
- **Normal (180ms)**: Standard transitions, fades
- **Slow (260ms)**: Slide transitions, layout changes
- **Slower (340ms)**: Complex sequences, modal transitions

### Reduced Motion Handling

Always check reduced motion before animating:

```typescript
import { useReducedMotion } from '@/animations/reducedMotion';

const reducedMotion = useReducedMotion();

const animation = reducedMotion ? noAnimation() : softFadeIn();
```

Or use the built-in conditional animation:

```typescript
import { conditionalAnimation, softFadeIn } from '@/animations/transitions';

const animation = conditionalAnimation(softFadeIn());
```

### Haptic Usage Guidelines

**Good haptic uses**:
- Task completion
- Onboarding progression
- Form submission
- Selection confirmation
- Error indication

**Bad haptic uses**:
- Every button tap
- Scrolling
- Navigation
- Background events
- Excessive feedback

### Performance Considerations

- Use Reanimated's native driver when possible
- Avoid animating layout properties frequently
- Memoize animated components
- Use `useAnimatedStyle` for worklet animations
- Avoid chaining excessive animations
- Test on lower-end devices

## Accessibility

### Reduced Motion Support

All animations must respect reduced motion:

1. Check system preference via `useReducedMotion()`
2. Check app-level preference via `useAccessibilityStore()`
3. Skip or simplify animations when enabled
4. Use duration multipliers for intensity scaling

### Motion Priorities

- **Essential**: Focus, orientation, state clarity (always preserve if possible)
- **Optional**: Delight, decorative (can skip in reduced motion)

### Haptic Accessibility

- Provide option to disable haptics
- Respect system haptic preferences
- Allow intensity adjustment
- Never require haptics for core functionality

## Testing

### Test Cases

1. All animations respect reduced motion
2. Haptics can be disabled
3. Animation intensity scales correctly
4. No layout thrashing from animations
5. Animations don't block interactions
6. Performance acceptable on low-end devices
7. Animations work with dark mode
8. Shared transitions work correctly

### Manual Testing Checklist

- [ ] Reduced motion disables/simplifies animations
- [ ] Haptics fire appropriately
- [ ] Haptics can be disabled
- [ ] No janky animations
- [ ] Animations don't block UI
- [ ] Performance is smooth
- [ ] Animations respect dark mode
- [ ] Shared transitions work

## Troubleshooting

### Animation Not Running

1. Check if reduced motion is enabled
2. Check animation priority setting
3. Verify component is mounted
4. Check for JavaScript errors in worklets

### Haptics Not Firing

1. Check if haptic feedback is enabled in settings
2. Check device supports haptics
3. Verify expo-haptics is properly installed
4. Check for platform-specific limitations

### Performance Issues

1. Reduce animation complexity
2. Use native driver where possible
3. Avoid animating layout properties
4. Memoize animated components
5. Check for unnecessary re-renders
