# Accessibility Documentation

## Overview

Lumo is designed with accessibility as a first-class concern. The app supports users with diverse needs through reduced motion, haptic customization, visual accessibility options, and semantic UI components.

## Philosophy

- **Accessibility mandatory**: All features must be accessible
- **Neurodivergent-first**: Design for cognitive diversity
- **Respect preferences**: Honor system and app-level settings
- **No barriers**: Accessibility should never be an afterthought
- **Test thoroughly**: Verify with real users and assistive technologies

## Accessibility Preferences

### Motion Preferences

#### Reduced Motion

Users can enable reduced motion to minimize animations:

- **System preference**: Respects OS-level reduced motion setting
- **App-level override**: Can be enabled in app settings
- **Animation intensity**: None, reduced, or normal
- **Priority control**: Choose which animation types to preserve

#### Motion Intensity Levels

- **None**: All animations disabled
- **Reduced**: Faster, simpler animations (50% duration)
- **Normal**: Full animation experience

#### Animation Priorities

Users can choose which animation types to preserve:

- **Focus animations**: Visual feedback for focus states
- **Orientation animations**: Navigation and layout transitions
- **State animations**: State change feedback
- **Delight animations**: Optional decorative animations

### Haptic Preferences

#### Haptic Feedback Control

- **Enable/disable**: Complete haptic on/off
- **Intensity adjustment**: Light, normal, or strong
- **Contextual usage**: Haptics used sparingly for meaningful interactions

### Visual Preferences

#### High Contrast Mode

- Increased contrast ratios for better readability
- Enhanced border and outline visibility
- Improved text legibility

#### Large Text Mode

- Respects system text size preferences
- Scales typography appropriately
- Maintains layout integrity

## Implementation

### Accessibility Store

Central accessibility preferences management:

```typescript
interface AccessibilityPreferences {
  reducedMotion: boolean;
  motionIntensity: 'none' | 'reduced' | 'normal';
  hapticFeedbackEnabled: boolean;
  hapticIntensity: 'light' | 'normal' | 'strong';
  highContrast: boolean;
  largeText: boolean;
  preserveFocusAnimations: boolean;
  preserveOrientationAnimations: boolean;
  preserveStateAnimations: boolean;
  preserveDelightAnimations: boolean;
}
```

### Reduced Motion Hook

Detect and respond to reduced motion preferences:

```typescript
import { useReducedMotion } from '@/hooks/useReducedMotion';

const reducedMotion = useReducedMotion();

if (reducedMotion) {
  // Use no animation or simplified animation
}
```

### Accessibility Utilities

Helper functions for accessible components:

```typescript
import {
  getTouchTargetSize,
  createAccessibleLabel,
  getSemanticRole,
  shouldReduceMotion,
  getAnimationDuration,
} from '@/utils/accessibility';
```

## Component Accessibility

### Touch Targets

All interactive elements must meet minimum touch target size:

- **Minimum**: 44x44 points (WCAG 2.5.5)
- **Preferred**: 48x48 points
- **Implementation**: Use padding or minimum height/width

### Semantic Roles

Use appropriate semantic roles for screen readers:

```typescript
<Button
  accessibilityRole="button"
  accessibilityLabel="Submit form"
  accessibilityHint="Submits your changes"
>
  Submit
</Button>
```

### Accessibility Labels

Provide clear, concise labels:

- **Descriptive**: Describe the element's purpose
- **Concise**: Keep labels short and focused
- **Context-aware**: Include relevant context
- **Action-oriented**: Use action verbs for buttons

### Accessibility Hints

Provide additional context when needed:

```typescript
<TouchableOpacity
  accessibilityLabel="Delete task"
  accessibilityHint="Removes this task permanently"
>
  Delete
</TouchableOpacity>
```

### Accessibility States

Communicate element states:

```typescript
<Checkbox
  accessibilityState={{ selected: isChecked }}
  accessibilityLabel="Mark as complete"
/>
```

### Focus Management

Ensure logical focus order and clear focus indicators:

- **Keyboard navigation**: Support tab order
- **Focus indicators**: Visible focus rings
- **Focus restoration**: Return focus after modal close
- **Skip links**: Provide skip to content option

## Animation Accessibility

### Reduced Motion Support

All animations must respect reduced motion:

```typescript
import { useReducedMotion } from '@/animations/reducedMotion';
import { softFadeIn, noAnimation } from '@/animations/transitions';

const reducedMotion = useReducedMotion();
const entering = reducedMotion ? noAnimation() : softFadeIn();
```

### Animation Duration Adjustment

Scale animation duration based on preferences:

```typescript
import { getAdjustedDuration } from '@/animations/motion';

const duration = getAdjustedDuration(180); // Returns 0, 90, or 180
```

### Animation Priority

Check if animation should run based on priority:

```typescript
import { shouldAnimate } from '@/animations/motion';

if (shouldAnimate('essential')) {
  // Run essential animation
}
```

## Haptic Accessibility

### Haptic Intensity Control

Respect user's haptic intensity preference:

```typescript
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

const { preferences } = useAccessibilityStore();

if (preferences.hapticFeedbackEnabled) {
  // Trigger haptic with appropriate intensity
}
```

### Haptic Disable Option

Always check before triggering haptics:

```typescript
import { softImpact } from '@/animations/haptics';

if (preferences.hapticFeedbackEnabled) {
  softImpact();
}
```

## Visual Accessibility

### High Contrast Mode

Enhance visibility in high contrast mode:

```typescript
const { isDark } = useTheme();
const { highContrast } = useAccessibilityStore();

const borderColor = highContrast 
  ? Colors.borderDark 
  : Colors.border;
```

### Large Text Support

Respect system text size preferences:

```typescript
import { useWindowDimensions } from 'react-native';
import { PixelRatio } from 'react-native';

const fontScale = PixelRatio.getFontScale();
const fontSize = 16 * fontScale;
```

### Color Contrast

Ensure sufficient color contrast:

- **Text**: Minimum 4.5:1 contrast ratio (WCAG AA)
- **Large text**: Minimum 3:1 contrast ratio (WCAG AA)
- **UI components**: Minimum 3:1 contrast ratio
- **Focus indicators**: Minimum 3:1 contrast ratio

## Screen Reader Support

### Semantic HTML

Use semantic components and roles:

```typescript
<View accessibilityRole="header">
  <Text>Header</Text>
</View>
```

### Live Regions

Announce dynamic content changes:

```typescript
<Text accessibilityLiveRegion="polite">
  {statusMessage}
</Text>
```

### Accessibility Actions

Provide custom actions when needed:

```typescript
<AccessibleView
  accessibilityActions={[
    { name: 'activate', label: 'Activate' },
    { name: 'delete', label: 'Delete' },
  ]}
  onAccessibilityAction={handleAction}
>
  Content
</AccessibleView>
```

## Testing Accessibility

### Automated Testing

Use accessibility testing tools:

- React Native Accessibility Inspector
- Accessibility Scanner (Android)
- Accessibility Inspector (iOS)

### Manual Testing Checklist

#### Screen Reader
- [ ] All elements are announced correctly
- [ ] Labels are descriptive and concise
- [ ] Focus order is logical
- [ ] Dynamic content is announced
- [ ] Custom actions are discoverable

#### Reduced Motion
- [ ] Animations respect system preference
- [ ] App-level preference works
- [ ] No essential functionality lost
- [ ] Transitions are smooth when enabled

#### Haptics
- [ ] Haptics can be disabled
- [ ] Intensity adjustment works
- [ ] Haptics fire at appropriate times
- [ ] No excessive haptic feedback

#### Visual
- [ ] High contrast mode works
- [ ] Large text is supported
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators are visible

#### Keyboard
- [ ] All elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Escape closes modals

### User Testing

Test with real users who use assistive technologies:

- Screen reader users (VoiceOver, TalkBack)
- Keyboard-only users
- Users with reduced motion preferences
- Users with color vision deficiencies
- Users with low vision

## Best Practices

### General

1. **Design for everyone**: Consider diverse needs from the start
2. **Test early and often**: Don't leave accessibility to the end
3. **Use semantic HTML**: Leverage built-in accessibility
4. **Provide alternatives**: Multiple ways to interact
5. **Keep it simple**: Complex UI is hard to make accessible

### Motion

1. **Respect preferences**: Always check reduced motion
2. **Keep it subtle**: Avoid flashy, overwhelming animations
3. **Provide alternatives**: Don't rely on motion for meaning
4. **Test with users**: Verify with motion-sensitive users
5. **Document decisions**: Explain motion choices

### Haptics

1. **Use sparingly**: Only for meaningful interactions
2. **Make optional**: Allow users to disable
3. **Provide feedback**: Visual feedback should always accompany haptics
4. **Respect intensity**: Allow adjustment
5. **Test on devices**: Verify across different devices

### Visual

1. **Ensure contrast**: Meet WCAG AA standards
2. **Support scaling**: Respect text size preferences
3. **Use color carefully**: Don't rely on color alone
4. **Provide focus indicators**: Make focus visible
5. **Test in different modes**: Dark mode, high contrast, etc.

## Resources

### Standards

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Apple Accessibility Guidelines](https://developer.apple.com/accessibility/)
- [Android Accessibility Guidelines](https://developer.android.com/guide/topics/ui/accessibility/)

### Tools

- React Native Accessibility Inspector
- Accessibility Scanner (Android)
- Accessibility Inspector (iOS)
- axe DevTools (web)

### Libraries

- expo-haptics
- react-native-reanimated (with reduced motion support)
- react-native-accessibility (if needed)

## Troubleshooting

### Screen Reader Not Announcing

1. Check accessibilityLabel is present
2. Verify element is not hidden
3. Check if element is in focus
4. Verify accessibilityRole is correct

### Reduced Motion Not Working

1. Check system preference is enabled
2. Check app-level preference is enabled
3. Verify animation checks reduced motion
4. Test with different animation priorities

### Haptics Not Firing

1. Check if haptic feedback is enabled
2. Verify device supports haptics
3. Check expo-haptics installation
4. Verify haptic intensity setting

### Focus Issues

1. Check focusable elements have focusable prop
2. Verify tab order is logical
3. Check focus indicators are visible
4. Test with keyboard navigation
