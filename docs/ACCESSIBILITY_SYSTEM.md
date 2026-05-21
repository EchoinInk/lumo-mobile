# Accessibility System Documentation

## Overview

Lumo's accessibility system is first-class and architectural, not bolt on. It provides dynamic font scaling, reduced motion, haptic controls, color contrast validation, and simplified mode for neurodivergent users.

## Architecture

```
UI
↓
Accessibility Components (DynamicText, ReducedMotionView, AccessibleButton)
↓
Accessibility Hooks (useReducedMotion, useDynamicType, useFocusMode, useSimplifiedMode)
↓
Accessibility Infrastructure (accessibilityManager, accessibilityConfig, colorContrast, reducedMotion, focusModeManager, simplifiedMode)
↓
Accessibility Stores (useAccessibilityStore, useFocusModeStore)
↓
MMKV Persistence
```

## Accessibility Infrastructure

### accessibilityManager

Central accessibility manager coordinating all accessibility systems:
- Preference management
- Haptic feedback coordination
- Focus mode management
- Simplified mode management

### accessibilityConfig

Centralized accessibility configuration and defaults:
- Font scale multipliers
- Minimum touch targets
- Contrast ratio thresholds
- Motion duration limits
- Haptic intensity levels

### colorContrast

Color contrast validation for WCAG compliance:
- Relative luminance calculation
- Contrast ratio calculation
- WCAG AA/AAA validation
- Recommended text color selection

### reducedMotion

Reduced motion management and animation scaling:
- Animation priority classification
- Duration scaling based on preferences
- Behavior configuration (skip, simplify, preserve)

### focusModeManager

Focus mode state management and transitions:
- Single task mode
- Distraction-free mode
- Today-only mode
- Calm mode

### simplifiedMode

Simplified mode management for reduced UI density:
- Dynamic complexity reduction
- Cognitive load adaptation
- Element visibility filtering

## Accessibility Components

### DynamicText

Text component respecting system font scaling and accessibility preferences:
- Dynamic font scaling
- Adaptive spacing
- Layout preservation
- No clipped text

### ReducedMotionView

View component respecting reduced motion preferences:
- Optional animation disabling
- Intensity scaling
- Reduced transitions

### AccessibleButton

Button component with accessibility features:
- Minimum touch targets (44px)
- Haptic feedback
- Reduced motion support
- Accessibility labels

### FocusContainer

Container component respecting focus mode:
- Priority-based visibility
- Focus mode filtering
- Distraction reduction

### SimplifiedCard

Card component respecting simplified mode:
- Reduced visual complexity
- Fewer visible actions
- Calmer layouts

### CalmToggle

Toggle switch with calm, accessible design:
- Haptic feedback
- Reduced motion support
- Accessibility labels

## Accessibility Hooks

### useReducedMotion

Hook for detecting and responding to reduced motion preferences:
- System preference detection
- Change listening
- Accessibility-first animation control

### useDynamicType

Hook for dynamic font scaling:
- System font scaling
- Accessibility preferences
- Scale multiplier calculation

### useFocusMode

Hook for focus mode state and management:
- Current mode status
- Mode transition functions
- Active task management

### useSimplifiedMode

Hook for simplified mode state and management:
- Mode toggle
- Cognitive load updates
- Element visibility helpers

## Accessibility Stores

### useAccessibilityStore

Zustand store for accessibility preferences:
- Motion preferences
- Haptic preferences
- Visual preferences
- Animation priorities
- Simplified mode
- Adaptive complexity

### useFocusModeStore

Zustand store for focus mode state:
- Current mode
- Active task
- Session duration
- Auto-exit settings

## Focus Services

### focusModeService

Service for focus mode logic and transitions:
- Mode entry/exit
- Active task management
- Session tracking

### dashboardFiltering

Service for filtering dashboard content:
- Task filtering by mode
- Habit filtering by mode
- Cognitive load filtering
- Count-based filtering

### cognitiveLoadManager

Service for cognitive load estimation and adaptive UI:
- Interaction tracking
- Load estimation
- Recommended action limits
- Dynamic complexity adjustment

## Dynamic Font Scaling

### Supported Scales

- **small**: 0.875x
- **medium**: 1x (default)
- **large**: 1.125x
- **extra-large**: 1.25x
- **extra-extra-large**: 1.5x

### Adaptive Spacing

- Line height scales with font
- Letter spacing increases at larger scales
- Layout preservation prevents clipping

## Reduced Motion

### Animation Priorities

- **essential**: Always runs, simplified with reduced motion
- **optional**: Skipped with reduced motion

### Motion Intensity

- **none**: No animations
- **reduced**: Slower, simpler animations
- **normal**: Full animations

## Color Contrast Validation

### WCAG Standards

- **AA**: 4.5:1 minimum contrast ratio
- **AAA**: 7:0 minimum contrast ratio
- **Large text AA**: 3:1 minimum contrast ratio
- **Large text AAA**: 4.5:1 minimum contrast ratio

### Sensory-Safe Colors

- No harsh neon contrasts
- No low-legibility overlays
- No visual noise
- No overstimulating saturation

## Simplified Mode

### Density Reduction

- Max visible cards: 3 (vs 6 normal)
- Max visible actions: 2 (vs 3 normal)
- Reduced spacing: 0.8x
- Hide secondary elements
- Minimize actions

### Cognitive Load Adaptation

- **low**: 8 max actions
- **medium**: 5 max actions
- **high**: 3 max actions
- **overwhelmed**: 1 max action

## Focus Modes

### Single Task Mode

- Isolates one task
- Removes surrounding distractions
- Simplifies visible actions

### Distraction-Free Mode

- Reduces dashboard density
- Minimizes secondary UI
- Suppresses non-essential actions

### Today Only Dashboard

- Shows only today's priorities
- Suppresses future planning overload
- Reduces long-term cognitive pressure

### Calm Mode

- Softer visuals
- Reduced motion
- Reduced notifications
- Simplified interaction density

## Haptic Controls

### Intensity Levels

- **light**: 10
- **normal**: 20
- **strong**: 40

### Centralized Control

- Enable/disable haptics globally
- Set intensity preference
- Accessibility-aware defaults

## Best Practices

### Do

- Use accessibility components
- Respect reduced motion
- Validate color contrast
- Provide alternative text
- Support dynamic font scaling
- Implement simplified mode

### Don't

- Force animations
- Use fixed font sizes
- Ignore system preferences
- Create visual noise
- Overload dashboards
- Ignore cognitive load

## Performance

Accessibility systems remain lightweight:
- Memoized selectors
- Efficient state management
- No layout thrashing
- Minimal recalculations
