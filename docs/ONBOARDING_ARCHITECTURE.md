# Onboarding Architecture

## Overview

Lumo's onboarding system is designed to be emotionally intelligent, calm, and personalized. It focuses on understanding the user's needs rather than overwhelming them with features.

## Philosophy

- **Emotional Safety**: Onboarding should feel supportive, not corporate
- **Reduced Overwhelm**: Ask only essential questions, provide clear options
- **Personalization**: Use onboarding choices to simplify the first-run experience
- **Calm Pacing**: No urgency, no pressure, no gamification

## Architecture

### Directory Structure

```
src/
├── animations/              # Motion primitives
│   ├── transitions.ts      # Reusable transitions
│   ├── presets.ts          # Animation worklets
│   ├── haptics.ts          # Haptic feedback utilities
│   ├── motion.ts           # Motion configuration
│   └── reducedMotion.ts    # Reduced motion utilities
├── components/
│   ├── animated/           # Animated components
│   │   ├── FadeIn.tsx
│   │   ├── ScalePress.tsx
│   │   ├── AnimatedCard.tsx
│   │   ├── SharedTransitionCard.tsx
│   │   └── CelebrationPulse.tsx
│   └── onboarding/         # Onboarding components
│       ├── OnboardingContainer.tsx
│       ├── OnboardingProgress.tsx
│       ├── FocusSelectionCard.tsx
│       ├── PreferenceSelector.tsx
│       └── WelcomeHero.tsx
├── features/
│   └── onboarding/         # Onboarding feature
│       ├── hooks/
│       │   ├── useOnboardingFlow.ts
│       │   └── useOnboardingValidation.ts
│       ├── screens/
│       │   └── OnboardingScreen.tsx
│       └── utils/
│           └── onboardingHelpers.ts
├── services/
│   └── onboarding/         # Onboarding services
│       ├── onboardingService.ts
│       └── dashboardPersonalization.ts
├── store/
│   ├── useOnboardingStore.ts
│   └── useAccessibilityStore.ts
├── types/
│   ├── onboarding.ts
│   └── accessibility.ts
└── constants/
    └── onboarding.ts
```

## Onboarding Flow

### Step 1: Emotional Friction

**Question**: "What do you struggle with most?"

**Options** (multi-select):
- Remembering tasks
- Routines
- Meal planning
- Overwhelm
- Budgeting
- Consistency

**Purpose**: Understand user's primary challenges without judgment

### Step 2: Planning Preference

**Question**: "How do you prefer planning?"

**Options** (single-select):
- Minimal: Simple, focused lists
- Visual: Cards and visual cues
- Structured: Organized categories
- Flexible: Adaptable and freeform

**Purpose**: Personalize dashboard density and card style

### Step 3: Focus Areas

**Question**: "Choose your focus areas"

**Options** (multi-select, minimum 1):
- Habits
- Tasks
- Meals
- Wellness
- Fitness

**Purpose**: Customize visible dashboard features to reduce initial cognitive load

## Dashboard Personalization

Onboarding choices drive dashboard configuration:

### Feature Visibility
- Focus areas determine which dashboard sections are visible
- Reduces overwhelm by hiding unused features initially

### Dashboard Density
- **Minimal**: For users who prefer simple, focused lists
- **Standard**: Balanced layout for most users
- **Detailed**: For users who prefer structured, organized categories

### Card Style
- **Compact**: Dense information display
- **Comfortable**: Balanced spacing (default)
- **Spacious**: More breathing room for visual preference

## State Management

### useOnboardingStore

Persists onboarding progress and choices via MMKV:

```typescript
interface OnboardingData {
  struggleAreas: StruggleArea[];
  planningPreference: PlanningPreference;
  focusAreas: FocusArea[];
  completedAt: string | null;
  currentStep: number;
}

interface DashboardPersonalization {
  showHabits: boolean;
  showTasks: boolean;
  showMeals: boolean;
  showWellness: boolean;
  showFitness: boolean;
  dashboardDensity: 'minimal' | 'standard' | 'detailed';
  cardStyle: 'compact' | 'comfortable' | 'spacious';
}
```

### useAccessibilityStore

Persists accessibility preferences:

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

## Services

### onboardingService

Core onboarding logic:

- `setStruggleAreas(areas)`: Save struggle areas
- `setPlanningPreference(preference)`: Save planning preference with haptic feedback
- `setFocusAreas(areas)`: Save focus areas with haptic feedback
- `completeOnboarding()`: Generate personalization and mark complete
- `resetOnboarding()`: Clear onboarding data (for testing)

### dashboardPersonalization

Dashboard configuration utilities:

- `getPersonalizedDashboardConfig()`: Get current personalization
- `isFeatureVisible(feature)`: Check if feature should be shown
- `getDashboardDensity()`: Get density setting
- `getCardStyle()`: Get card style setting
- `getVisibleFeatures()`: Get list of visible features

## Hooks

### useOnboardingFlow

Main onboarding hook for screens:

```typescript
const {
  currentStep,
  struggleAreas,
  planningPreference,
  focusAreas,
  personalization,
  isCompleted,
  setStruggleAreas,
  setPlanningPreference,
  setFocusAreas,
  nextStep,
  previousStep,
  completeOnboarding,
} = useOnboardingFlow();
```

### useOnboardingValidation

Validation logic for onboarding steps:

```typescript
const {
  validateStruggleAreas,
  validatePlanningPreference,
  validateFocusAreas,
  canProceedFromStep,
} = useOnboardingValidation();
```

## Animation Integration

Onboarding uses calm, subtle animations:

- **FadeIn**: Soft entrance for content
- **ScalePress**: Gentle press feedback
- **Selection Haptics**: Light tactile feedback on selection
- **Progression Haptics**: Soft feedback on step completion
- **Completion Haptics**: Warm celebration on onboarding complete

All animations respect reduced motion preferences automatically.

## Accessibility

### Reduced Motion
- All onboarding animations respect system reduced motion preference
- Animation intensity can be adjusted (none, reduced, normal)
- Motion can be disabled entirely via accessibility store

### Haptic Feedback
- Haptics are used sparingly and intentionally
- Can be disabled via accessibility preferences
- Intensity can be adjusted (light, normal, strong)

### Visual Accessibility
- Large touch targets (44x44 minimum)
- Clear visual feedback on selection
- High contrast mode support
- Large text mode support

## Best Practices

### When Adding Onboarding Steps

1. Keep questions emotionally safe and non-judgmental
2. Provide clear, simple options with descriptions
3. Allow multi-select where appropriate
4. Use calm, supportive language
5. Provide gentle haptic feedback
6. Respect reduced motion preferences
7. Keep the flow to 3-4 steps maximum

### When Using Onboarding Data

1. Use personalization to simplify initial experience
2. Allow users to change preferences later
3. Don't gate essential features behind onboarding
4. Provide re-onboarding option in settings
5. Use struggle areas to recommend features
6. Respect accessibility preferences throughout

## Testing

### Test Cases

1. Complete onboarding with all options
2. Complete onboarding with minimal selections
3. Test step navigation (forward/back)
4. Test validation at each step
5. Test reduced motion mode
6. Test haptic feedback disable
7. Test onboarding reset
8. Test personalization application

### Manual Testing Checklist

- [ ] All steps complete successfully
- [ ] Back navigation works correctly
- [ ] Validation prevents invalid progression
- [ ] Haptics fire appropriately
- [ ] Reduced motion disables animations
- [ ] Personalization applies to dashboard
- [ ] Onboarding completion persists across restart
- [ ] Re-onboarding clears previous data

## Future Enhancements

Potential future improvements:

1. Skip onboarding option for returning users
2. A/B testing different onboarding flows
3. Analytics on onboarding completion rates
4. More sophisticated personalization algorithms
5. Contextual onboarding (feature-specific onboarding)
6. Onboarding preview of dashboard
