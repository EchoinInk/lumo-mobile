# Component Guidelines

## Component Philosophy

Lumo components are built on the principle of composition over configuration. Each component should be:
- **Composable**: Can be combined to create complex UIs
- **Token-backed**: Uses theme tokens for consistency
- **Accessible**: Meets WCAG AA standards
- **Performant**: Optimized for React Native rendering
- **Scalable**: Easy to extend and maintain

---

## Composition Rules

### 1. Prefer Composition Over Configuration

**Good:**
```tsx
<Card>
  <SectionHeader title="Title" />
  <ProgressBar progress={75} />
</Card>
```

**Avoid:**
```tsx
<Card title="Title" progress={75} />
```

### 2. Keep Components Focused

Each component should have a single responsibility:
- Screen components handle layout and navigation
- UI primitives handle specific UI patterns
- Card components compose primitives for specific use cases

### 3. Use Props for Configuration

Configure components through props, not internal state:
- Pass data down through props
- Use callbacks for events
- Keep components stateless when possible

---

## Token Usage Rules

### 1. Always Use Theme Tokens

**Good:**
```tsx
style={{ backgroundColor: Colors.card, padding: Spacing.lg }}
```

**Avoid:**
```tsx
style={{ backgroundColor: '#FFFFFF', padding: 16 }}
```

### 2. Use Typography Variants

**Good:**
```tsx
<Text variant="heading">Title</Text>
```

**Avoid:**
```tsx
<Text style={{ fontSize: 24, fontWeight: '600' }}>Title</Text>
```

### 3. Use Shadow Variants

**Good:**
```tsx
<View style={Shadows.md} />
```

**Avoid:**
```tsx
<View style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, ... }} />
```

---

## Spacing Consistency Rules

### 1. Use Spacing Tokens for All Dimensions

**Good:**
```tsx
<View style={{ margin: Spacing.md, padding: Spacing.lg }} />
```

**Avoid:**
```tsx
<View style={{ margin: 16, padding: 24 }} />
```

### 2. Use Padding Presets for Internal Spacing

**Good:**
```tsx
<Card padding="lg">{children}</Card>
```

**Avoid:**
```tsx
<Card style={{ padding: 24 }}>{children}</Card>
```

### 3. Maintain Consistent Gap Sizes

**Good:**
```tsx
<View style={{ gap: Spacing.md }}>
  {items.map(item => <Item key={item.id} />)}
</View>
```

**Avoid:**
```tsx
<View>
  {items.map((item, index) => (
    <Item key={item.id} style={{ marginBottom: index < items.length - 1 ? 16 : 0 }} />
  ))}
</View>
```

---

## Accessibility Requirements

### 1. Large Tap Targets

- Minimum 44x44px for interactive elements
- 48x48px recommended for primary actions
- Generous padding for touch accuracy

### 2. Readable Typography

- Minimum 16px for body text
- High contrast ratios (4.5:1 for normal text)
- Clear visual hierarchy
- Appropriate line heights (1.5 for body text)

### 3. Predictable Spacing

- Consistent spacing patterns
- Clear visual grouping
- Adequate whitespace
- Logical information hierarchy

### 4. Visible Actions

- Clear action indicators
- Visible button states
- Obvious interactive elements
- Feedback for all interactions

### 5. Low Cognitive Load

- Simple, clear layouts
- Minimal visual noise
- Predictable behavior
- Clear error messages

---

## When to Create New Primitives

### Create a New UI Primitive When:

1. **Reusability**: Component is used in 3+ different contexts
2. **Complexity**: Requires complex state or logic
3. **Token Consumption**: Needs specific token integration
4. **Variant System**: Benefits from multiple variants
5. **Accessibility**: Has specific accessibility requirements
6. **Performance**: Needs optimization (memoization, etc.)

### Examples:

**Create a primitive for:**
- Custom form inputs with validation
- Complex data visualizations
- Interactive charts
- Custom pickers/selectors
- Complex navigation patterns

**Use composition for:**
- Simple layouts
- One-off UI patterns
- Static content display
- Simple data presentation

---

## Component Structure Guidelines

### 1. Import Order

```tsx
// 1. React and core libraries
import React from 'react';
import { View } from 'react-native';

// 2. Third-party libraries
import { LinearGradient } from 'expo-linear-gradient';

// 3. Internal imports
import { Colors } from '@/theme/tokens';
import { Button } from '@/components/ui/Button';
```

### 2. Component Definition

```tsx
interface ComponentProps {
  // Props interface
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return <View>{children}</View>;
}
```

### 3. Styles Definition

```tsx
const styles = StyleSheet.create({
  container: {
    // Style properties using tokens
  },
});
```

---

## Performance Guidelines

### 1. Memoize Expensive Components

```tsx
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // Component logic
});
```

### 2. Avoid Anonymous Render Functions

**Good:**
```tsx
const renderItem = useCallback(({ item }) => {
  return <Item data={item} />;
}, []);
```

**Avoid:**
```tsx
<FlatList
  renderItem={({ item }) => <Item data={item} />}
/>
```

### 3. Keep Screens Thin

- Aim for < 300 lines per screen
- Split into smaller components
- Extract reusable logic into hooks
- Use composition for complex layouts

### 4. Split Components Aggressively

- Extract repeated patterns into components
- Create components for logical sections
- Use component composition for complex UIs
- Keep component files focused

---

## TypeScript Guidelines

### 1. Define Clear Interfaces

```tsx
interface ComponentProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}
```

### 2. Use Proper Types

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';
```

### 3. Extend Native Props

```tsx
interface ComponentProps extends ViewProps {
  // Custom props
}
```

---

## Styling Guidelines

### 1. Prefer StyleSheet Over Inline Styles

**Good:**
```tsx
const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
});
```

**Avoid:**
```tsx
<View style={{ padding: Spacing.lg }} />
```

### 2. Use NativeWind for Simple Styles

```tsx
<View className="flex-1 p-4 bg-card">
  {children}
</View>
```

### 3. Combine StyleSheet and NativeWind

```tsx
<View className="flex-1" style={styles.container}>
  {children}
</View>
```

---

## Error Handling Guidelines

### 1. Provide Clear Error Messages

```tsx
<Input 
  error={errorMessage}
  helperText="Enter a valid email address"
/>
```

### 2. Use Semantic Colors for Errors

```tsx
<Text color={Colors.danger}>{error}</Text>
```

### 3. Provide Recovery Actions

```tsx
<EmptyState 
  title="Error loading data"
  description="Something went wrong"
  actionLabel="Retry"
  onAction={handleRetry}
/>
```

---

## Testing Guidelines

### 1. Test Component Variants

- Test all variants of a component
- Test different prop combinations
- Test edge cases

### 2. Test Accessibility

- Test with screen readers
- Test keyboard navigation
- Test with different screen sizes

### 3. Test Performance

- Measure render times
- Test with large datasets
- Test on low-end devices

---

## Documentation Guidelines

### 1. Document Complex Components

```tsx
/**
 * Complex component description
 * 
 * @param prop1 - Description
 * @param prop2 - Description
 */
```

### 2. Provide Usage Examples

```tsx
// Example usage:
// <Component variant="primary" onPress={handlePress}>
//   Click me
// </Component>
```

### 3. Document Variant Behavior

- Explain when to use each variant
- Document visual differences
- Provide accessibility considerations

---

## Migration Guidelines

### 1. Migrate Gradually

- Start with new components
- Migrate existing screens incrementally
- Test thoroughly before deploying

### 2. Maintain Backward Compatibility

- Keep old components during migration
- Provide migration paths
- Document breaking changes

### 3. Update Documentation

- Update CHANGELOG.md
- Document breaking changes
- Provide migration guides

---

## Review Checklist

Before committing a new component, verify:

- [ ] Uses theme tokens for all styling
- [ ] Follows spacing consistency rules
- [ ] Has proper TypeScript types
- [ ] Is accessible (tap targets, contrast, labels)
- [ ] Is performant (memoized if needed)
- [ ] Has proper error handling
- [ ] Is documented with examples
- [ ] Follows component structure guidelines
- [ ] Has been tested on multiple screen sizes
- [ ] Works in both light and dark modes

---

## Common Patterns

### Pattern 1: Card with Header

```tsx
<Card variant="elevated" padding="lg">
  <SectionHeader title="Title" />
  {content}
</Card>
```

### Pattern 2: List with Empty State

```tsx
{items.length > 0 ? (
  items.map(item => <Item key={item.id} data={item} />)
) : (
  <EmptyState title="No items" />
)}
```

### Pattern 3: Form with Validation

```tsx
<Input 
  label="Email"
  error={errors.email}
  helperText="Enter your email"
  value={values.email}
  onChangeText={handleChange('email')}
/>
```

### Pattern 4: Loading State

```tsx
{isLoading ? (
  <ActivityIndicator />
) : (
  <Content data={data} />
)}
```

---

## Resources

- [Theme Tokens](../src/theme/tokens.ts)
- [UI Primitives](../src/components/ui/)
- [Mock Components](../src/components/cards/)
- [Shell Screens](../src/features/)
