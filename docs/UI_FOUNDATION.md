# UI Foundation Documentation

## Overview

The Lumo UI foundation is built on a token-based design system with calm, premium cinematic aesthetics optimized for neurodivergent users. All components are composable, accessible, and visually consistent.

---

## Theme Architecture

### Color System

**Base Colors**
- `background`, `backgroundAlt` - Soft backgrounds for depth
- `card`, `cardGlass` - Surface colors with transparency
- `textPrimary`, `textSecondary`, `textTertiary`, `textInverse` - Typography hierarchy

**Brand Colors**
- `primary`, `primarySoft` - Soft cyan accent
- `secondary`, `secondarySoft` - Soft pink accent
- `accent` - Purple accent for highlights

**Semantic Colors**
- `success`, `successSoft` - Positive states
- `warning`, `warningSoft` - Caution states
- `danger`, `dangerSoft` - Error states
- `info`, `infoSoft` - Informational states

**Gradient Colors**
- `gradientStart`, `gradientEnd` - Primary brand gradient
- `gradientBlue`, `gradientPurple`, `gradientWarm` - Additional gradients

**Dark Mode**
- Full dark mode support via `DarkColors` token set
- Maintains calm aesthetics in both light and dark modes

### Spacing System

**Spacing Scale**
- `xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `2xl: 48`, `3xl: 64`, `4xl: 96`, `5xl: 128`, `6xl: 160`

**Padding Presets**
- `none`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl` - Consistent padding values

### Typography System

**Variants**
- `display` - 32px, bold, tight tracking
- `title` - 28px, bold, tight tracking
- `heading` - 24px, semibold, normal tracking
- `subheading` - 20px, semibold, normal tracking
- `body` - 16px, regular, normal tracking
- `bodyLarge` - 18px, regular, normal tracking
- `caption` - 14px, regular, loose tracking
- `small` - 12px, regular, loose tracking
- `label` - 13px, medium, loose tracking

### Radius System

- `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `2xl: 24`, `3xl: 32`, `full: 9999`

### Shadow System

**Variants**
- `none` - No shadow
- `sm` - Subtle elevation
- `md` - Medium elevation
- `lg` - High elevation
- `xl` - Very high elevation
- `2xl` - Maximum elevation
- `soft` - Cinematic soft shadow
- `glow` - Colored glow effect

---

## Primitive Architecture

### Screen Component

Main screen wrapper with:
- SafeArea support
- Optional scrolling
- Background token support
- Padding presets
- Keyboard avoidance option

```tsx
<Screen scrollable padded keyboardAvoiding>
  {children}
</Screen>
```

### Card Component

Reusable elevated container with variants:
- `default` - Standard card with soft shadow
- `elevated` - Higher elevation
- `gradient` - Gradient background
- `outlined` - Border-only
- `glass` - Glass morphism effect

```tsx
<Card variant="elevated" padding="lg" pressable onPress={handlePress}>
  {children}
</Card>
```

### Button Component

Interactive button with:
- Variants: primary, secondary, ghost, danger
- Sizes: sm, md, lg
- Loading and disabled states
- Icon support (left/right)
- Haptic feedback

```tsx
<Button variant="primary" size="md" loading={isLoading}>
  Submit
</Button>
```

### IconButton Component

Icon-only button with:
- Shapes: circular, square
- Sizes: sm, md, lg
- Variants: primary, secondary, ghost, danger
- Haptic feedback

```tsx
<IconButton shape="circular" size="md" variant="ghost">
  <Icon />
</IconButton>
```

### Text Component

Typography abstraction with:
- All typography variants
- Custom color support
- Text alignment options
- Full token consumption

```tsx
<Text variant="heading" color={Colors.textPrimary} textAlign="center">
  Title
</Text>
```

### Input Component

Form input with:
- Label support
- Error and helper text
- Left/right icons
- Focus states
- Accessibility-first spacing

```tsx
<Input 
  label="Email" 
  error={errorMessage}
  helperText="Enter your email address"
  leftIcon={<MailIcon />}
/>
```

### EmptyState Component

Empty state display with:
- Icon support
- Title and description
- Optional action button

```tsx
<EmptyState 
  icon={<Icon />}
  title="No items"
  description="Add your first item to get started"
  actionLabel="Add Item"
  onAction={handleAdd}
/>
```

### SectionHeader Component

Section header with:
- Title and subtitle
- Optional action button
- Reusable spacing system

```tsx
<SectionHeader 
  title="Section Title"
  subtitle="Optional description"
  actionLabel="View All"
  onAction={handleViewAll}
/>
```

### ProgressBar Component

Progress indicator with:
- Animated width
- Gradient variant
- Label support
- Percentage display

```tsx
<ProgressBar 
  progress={75} 
  showLabel 
  label="Completion"
  variant="gradient"
/>
```

### Avatar Component

User avatar with:
- Size variants (xs, sm, md, lg, xl, 2xl)
- Image support
- Initials fallback
- Accessibility labels

```tsx
<Avatar 
  size="lg" 
  source={{ uri: avatarUrl }}
  initials="JD"
  alt="John Doe"
/>
```

### FloatingActionButton Component

Floating action button with:
- Safe area awareness
- Position variants (bottom-right, bottom-left, top-right, top-left)
- Size variants (sm, md, lg)
- Haptic feedback

```tsx
<FloatingActionButton position="bottom-right" size="md">
  <AddIcon />
</FloatingActionButton>
```

### BottomSheet Component

Modal bottom sheet with:
- Gesture-ready structure
- Swipe to dismiss
- Animation support
- Backdrop overlay
- Safe area awareness

```tsx
<BottomSheet visible={isVisible} onClose={handleClose}>
  {children}
</BottomSheet>
```

---

## Layout Philosophy

### Spacing Rhythm

- Use spacing tokens consistently
- Maintain 4px base unit
- Prefer generous spacing for calm aesthetics
- Use padding presets for consistency

### Visual Hierarchy

- Soft gradients for emphasis
- Subtle shadows for depth
- Gentle color transitions
- Breathing room between elements

### Gradient Usage

- Primary gradient: cyan to pink
- Use gradients sparingly for focus
- Gradient variants available for progress and cards
- Soft gradients over harsh contrasts

### Motion Philosophy

- Gentle animations (250-300ms)
- Spring physics for natural feel
- Haptic feedback for interactions
- Smooth transitions between states

---

## Accessibility Requirements

### Tap Targets
- Minimum 44x44px for interactive elements
- Larger targets for primary actions
- Generous padding for touch accuracy

### Typography
- Minimum 16px for body text
- High contrast ratios
- Clear visual hierarchy
- Readable font weights

### Cognitive Load
- Low visual noise
- Clear information architecture
- Predictable interactions
- Calm color palette

### Navigation
- Clear back navigation
- Consistent tab placement
- Visible action indicators
- Safe area awareness

---

## Component Guidelines

### When to Create New Primitives

Create a new UI primitive when:
- The component is used in 3+ different contexts
- It requires complex state management
- It needs specific token consumption
- It benefits from variant systems
- It has accessibility requirements

### When to Use Compositions

Use composition patterns when:
- Combining existing primitives
- Layout-specific arrangements
- One-off use cases
- Simple state requirements

### Token Usage Rules

- Always use theme tokens for colors
- Use spacing tokens for all margins/padding
- Use radius tokens for border radius
- Use shadow tokens for elevation
- Use typography tokens for text styles

### Spacing Consistency

- Use padding presets for consistent internal spacing
- Use spacing tokens for margins between elements
- Maintain consistent gap sizes in grids
- Use spacing scale for all dimensional values

---

## Performance Rules

- Memoize expensive reusable components
- Avoid anonymous render functions
- Keep screens thin (< 300 lines)
- Split components aggressively
- Use React.memo for pure components
- Optimize re-renders with useCallback/useMemo

---

## Dark Mode Architecture

- All colors have dark mode variants
- Use conditional color selection
- Test contrast in both modes
- Maintain calm aesthetics in dark mode
- Use DarkColors token set for dark mode

---

## Implementation Notes

- No business logic in UI primitives
- All components are production-ready
- TypeScript strict mode enabled
- NativeWind for styling
- Expo Router for navigation
- All components support className extension
