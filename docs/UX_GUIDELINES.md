# UX Guidelines

Neurodivergent-first UX principles and standards for the Lumo mobile app.

---

## Core Philosophy

The Lumo app prioritizes cognitive clarity over visual novelty. Our UX design is built for users who benefit from:

- Low cognitive load
- Predictable interactions
- Calm spacing
- Visible actions
- Focused interfaces
- Progressive disclosure
- Minimal hierarchy depth
- Accessibility-first interactions

### Priority Order

**P0 - Cognitive Clarity**
- Clear, unambiguous interfaces
- Predictable behavior
- Consistent patterns
- Reduced decision fatigue

**P1 - Aesthetics**
- Calm, premium visual design
- Breathable layouts
- Soft, subtle motion
- Cohesive design language

---

## Spacing Rules

### Rhythm

Use token-backed spacing values from `src/constants/ux.ts`:

- **Comfortable**: 16px (Spacing.md) - Standard spacing between related elements
- **Relaxed**: 24px (Spacing.lg) - Spacing between sections
- **Large**: 32px (Spacing.xl) - Major section breaks
- **Extra Large**: 48px (Spacing.2xl) - Screen-level spacing

### Content Constraints

- **Max Content Width**: 800px - Prevents horizontal overflow on large screens
- **Max Primary Actions**: 3 - Limits decision complexity
- **Max Visible Sections**: 5 - Prevents cognitive overload
- **Max Items Per Group**: 7 - Maintains scannability

### Card Spacing

- **Min Padding**: 24px - Breathable card interiors
- **Preferred Padding**: 32px - Comfortable reading experience
- **Min Touch Height**: 48px - Ensures accessible touch targets

---

## Interaction Rules

### Touch Targets

- **Minimum Size**: 44x44px (WCAG 2.5.5 compliant)
- **Large Touch Targets**: 48x48px for primary actions
- **Spacing Between Targets**: Minimum 8px to prevent accidental touches

### Press States

- **Default Opacity**: 1.0
- **Pressed Opacity**: 0.7 (standard), 0.9 (reduced motion)
- **Scale**: 0.96 for press feedback (disabled in reduced motion)
- **Duration**: 150ms for press feedback

### Keyboard Behavior

- **keyboardShouldPersistTaps**: "handled" on scrollable content
- **Keyboard Avoidance**: Enabled for forms
- **Focus Order**: Logical, predictable tab navigation

### Haptic Feedback

- **Enabled by default**: For primary interactions
- **Medium impact**: Standard button presses
- **Respect preferences**: Honor reduced motion settings

---

## Accessibility Standards

### Screen Reader Support

- **Semantic Roles**: Use appropriate accessibilityRole values
- **Labels**: Clear, descriptive accessibilityLabel for all interactive elements
- **Hints**: Optional accessibilityHint for additional context
- **States**: Proper accessibilityState for disabled, busy, checked states

### Focus Management

- **Focus Ring**: 2px width, 2px offset
- **Focus Color**: #89FFFD (brand primary)
- **Predictable Order**: Logical tab navigation
- **Visible Indicators**: Clear focus states for keyboard users

### Dynamic Type

- **Min Body Size**: 16px
- **Scaled Fonts**: Support system font scaling up to 1.3x
- **Line Height**: 1.5 for readability
- **Max Line Length**: 75 characters for optimal reading

### Reduced Motion

- **Detect Preference**: Use useReducedMotion hook
- **Disable Non-Essential Animation**: Preserve only state clarity animations
- **Reduce Duration**: Set animation duration to 0 when reduced motion is enabled
- **Maintain Orientation**: Keep orientation cues without motion

---

## Motion Rules

### Duration

Use values from `src/theme/motion.ts`:

- **Instant**: 0ms - For reduced motion
- **Fast**: 120ms - Micro-interactions
- **Normal**: 180ms - Standard transitions
- **Slow**: 260ms - Major state changes
- **Slower**: 340ms - Deliberate animations

### Easing

- **Linear**: For state changes (predictable)
- **Ease-Out**: For entrance animations (gentle)
- **Ease-In**: For exit animations (natural)
- **Ease-In-Out**: For transitions (smooth)
- **Spring**: For touch feedback (responsive but gentle)

### Priority

**P0 - Essential (Preserve in reduced motion)**
- Focus guidance
- Orientation cues
- State clarity

**P1 - Optional (Disable in reduced motion)**
- Delight animations
- Decorative motion
- Particle effects

### Scale Values

- **Press**: 0.96 - Subtle press feedback
- **Hover**: 0.98 - Gentle hover state
- **Focus**: 1.0 - No scale on focus
- **Default**: 1.0 - Resting state

---

## Hierarchy Rules

### Nesting Depth

- **Max Nesting Depth**: 3 levels
- **Max Breadcrumbs**: 3 levels
- **Max Tabs**: 5 primary navigation items

### Navigation

- **Primary Tabs Only**: Dashboard, Tasks, Calendar, Health, More
- **Avoid Deep Nesting**: Prefer flat navigation structure
- **Clear Back Navigation**: Always provide clear back paths
- **Predictable Patterns**: Consistent navigation across app

### Visual Hierarchy

- **Clear Primary Actions**: Limit to 3 per screen
- **Distinct Sections**: Use spacing and grouping
- **Scannable Layouts**: Use clear headings and structure
- **Progressive Disclosure**: Hide complexity behind clear actions

---

## Form Design Standards

### Layout

- **Single Column**: Avoid multi-column forms
- **Max Fields Per Section**: 5 fields
- **Max Sections**: 3 sections per form
- **Preferred Input Height**: 48px

### Labels

- **Clear Labels**: Descriptive, concise labels above inputs
- **Required Indicators**: Visual asterisk (*) for required fields
- **Label Spacing**: 8px minimum between label and input
- **Error Placement**: Inline error messages below inputs

### Validation

- **Inline Validation**: Real-time feedback when possible
- **Clear Error Messages**: Specific, actionable error text
- **Error Color**: Use danger color (#EF4444) for errors
- **Success Indicators**: Clear success state for valid inputs

### Input Behavior

- **Predictable Keyboard**: Appropriate keyboard types for inputs
- **Auto-focus**: Logical focus order
- **Placeholder Text**: Use sparingly, prefer clear labels
- **Accessible Labels**: accessibilityLabel on all inputs

---

## Dashboard Density Rules

### Content Grouping

- **Max Visible Sections**: 5 sections per dashboard
- **Breathable Spacing**: 24px between sections
- **Clear Separation**: Use cards or visual grouping
- **Progressive Disclosure**: Hide secondary content behind actions

### Card Density

- **Min Padding**: 24px within cards
- **Max Content Lines**: 4 lines per card preview
- **Soft Shadows**: Use soft shadows for depth
- **Large Radius**: 16px border radius for cards

### Visual Clutter

- **Avoid Overloading**: Limit information per card
- **Use Whitespace**: Generous spacing between elements
- **Clear Typography**: Hierarchy through size and weight
- **Minimal Icons**: Use icons sparingly for key actions only

---

## Navigation Simplicity Rules

### Tab Navigation

- **Max 5 Tabs**: Primary navigation limit
- **Clear Icons**: Use recognizable icons with labels
- **Active States**: Clear indication of current tab
- **Predictable Order**: Consistent tab arrangement

### Screen Transitions

- **Predictable Transitions**: Use standard navigation patterns
- **Clear Back Paths**: Always provide clear back navigation
- **Avoid Modal Overload**: Limit modal depth to 2 levels
- **Gesture Support**: Standard gestures for navigation

### Deep Linking

- **Deep Link Support**: Support deep links to key screens
- **State Restoration**: Restore state on navigation return
- **Clear Context**: Maintain context across navigation
- **Predictable Behavior**: Consistent navigation patterns

---

## Component Usage

### Screen Component

Use `src/components/ui/Screen.tsx` for all screen layouts:

- **Safe Area Support**: Built-in safe area handling
- **Keyboard Avoidance**: Optional keyboard-aware mode
- **Scrollable**: Optional scroll behavior
- **Padded**: Configurable padding using tokens
- **Centered**: Optional content centering with max width
- **Accessibility**: Support for accessibility labels

### Button Component

Use `src/components/ui/Button.tsx` for all buttons:

- **Variants**: primary, secondary, ghost, danger
- **Sizes**: sm, md, lg (all meet 44px minimum)
- **Accessibility**: Built-in accessibilityRole and labels
- **Reduced Motion**: Support for reduced motion prop
- **Loading State**: Built-in loading indicator
- **Haptic Feedback**: Optional haptic feedback

### Card Component

Use `src/components/ui/Card.tsx` for content grouping:

- **Variants**: default, elevated, gradient, outlined, glass, interactive, compact
- **Pressable**: Optional TouchableOpacity wrapper
- **Accessibility**: Support for accessibility labels
- **Reduced Motion**: Support for reduced motion prop
- **Token-Based**: All values use design tokens

### Form Components

Use `src/components/forms/` for form elements:

- **FormSection**: Section wrapper with title/description support
- **FormField**: Field wrapper with label, error, hint support
- **AccessibleTextInput**: Accessible text input with error states

---

## Implementation Checklist

When implementing new features:

- [ ] Use UX constraint values from `src/constants/ux.ts`
- [ ] Apply accessibility helpers from `src/utils/accessibility.ts`
- [ ] Use motion tokens from `src/theme/motion.ts`
- [ ] Respect reduced motion preference with `useReducedMotion` hook
- [ ] Ensure minimum 44x44 touch targets
- [ ] Provide accessibility labels for interactive elements
- [ ] Use semantic accessibility roles
- [ ] Maintain calm spacing rhythm
- [ ] Limit content width to 800px on large screens
- [ ] Follow form design standards
- [ ] Test with screen reader
- [ ] Test with reduced motion enabled

---

## Resources

- **UX Constraints**: `src/constants/ux.ts`
- **Accessibility Helpers**: `src/utils/accessibility.ts`
- **Motion System**: `src/theme/motion.ts`
- **Reduced Motion Hook**: `src/hooks/useReducedMotion.ts`
- **Design Tokens**: `src/theme/tokens.ts`
- **Component Guidelines**: `docs/COMPONENT_GUIDELINES.md`
