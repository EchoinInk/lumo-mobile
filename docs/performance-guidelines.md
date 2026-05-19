# Performance Guidelines

This document outlines the performance architecture and rendering optimization patterns for the Lumo app.

## Rendering Rules

### Avoid Inline Callbacks in Lists
Inline anonymous functions in list renderItem cause unnecessary re-renders.

**BAD:**
```tsx
renderItem={({ item }) => (
  <TaskItem onPress={() => completeTask(item.id)} />
)}
```

**GOOD:**
```tsx
const handlePress = useStableCallback((id: string) => completeTask(id));

renderItem={({ item }) => (
  <TaskItem onPress={() => handlePress(item.id)} />
)}
```

### Avoid Giant Render Trees
Split large components into smaller, focused pieces. Each component should have a single responsibility.

**BAD:**
```tsx
// 800+ lines in one file
export function TasksScreen() {
  // ... hundreds of lines of JSX
}
```

**GOOD:**
```tsx
export function TasksScreen() {
  return (
    <Screen>
      <TaskHeader />
      <TaskFilters />
      <TaskList />
    </Screen>
  );
}
```

### Split Components Aggressively
Isolate domain rendering into separate components. This improves memoization effectiveness and reduces re-render scope.

### Memoize Expensive Children
Use React.memo for list items and expensive components. Add custom comparison functions only when necessary.

### Isolate Domain Rendering
Keep domain-specific rendering isolated. Don't mix concerns across components.

## List Rules

### FlashList Only for Scalable Domains
Use FlashList (@shopify/flash-list) for lists that may grow beyond 50 items. For small, static lists, standard ScrollView or FlatList may suffice.

### estimatedItemSize Required
Always provide an accurate estimatedItemSize for FlashList. This is critical for performance.

```tsx
<AppFlashList
  estimatedItemSize={96}
  data={tasks}
  renderItem={renderTask}
/>
```

### Stable Keys Required
Keys must be stable and unique. Use IDs from your data, not array indices.

**BAD:**
```tsx
keyExtractor={(item, index) => index.toString()}
```

**GOOD:**
```tsx
keyExtractor={(item) => item.id}
```

### Avoid Nested Virtualization
Never nest virtualized lists (FlashList/FlatList inside FlashList/FlatList). This causes severe performance issues.

## Screen Rules

### Screens Orchestrate Only
Screens should be thin orchestration layers. They compose components but don't contain business logic.

**GOOD:**
```tsx
export function TasksScreen() {
  const { tasks, isLoading } = useTasks();
  const { toggleTask, selectTask } = useTaskActions();

  return (
    <Screen>
      <TaskHeader />
      <TaskFilters />
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        onToggleTask={toggleTask}
        onPressTask={selectTask}
      />
    </Screen>
  );
}
```

### No Business Logic Inside UI Trees
Move business logic into hooks, services, or separate components. Keep UI trees pure.

### Move Logic Into Hooks/Services/Components
Extract logic from render methods into custom hooks or service functions.

## State Rules

### Avoid Giant Global Subscriptions
Don't subscribe to entire state trees when you only need a slice of data.

**BAD:**
```tsx
const state = useStore(); // Subscribes to everything
```

**GOOD:**
```tsx
const tasks = useStore(state => state.tasks); // Subscribes only to tasks
```

### Subscribe Narrowly
Use selectors to subscribe only to the data you need. This minimizes re-renders.

### Split Zustand Domains
Organize state into separate domains/slices rather than one giant store.

## Component Patterns

### Memoized List Items
Use React.memo for list items with custom comparison:

```tsx
export const TaskItem = React.memo<TaskItemProps>(({ task, onPress }) => {
  const handlePress = React.useCallback(() => {
    onPress(task.id);
  }, [onPress, task.id]);

  return <TouchableOpacity onPress={handlePress}>...</TouchableOpacity>;
}, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.completed === nextProps.task.completed
  );
});
```

### Stable Callbacks
Use useStableCallback hook to avoid inline functions:

```tsx
import { useStableCallback } from '@/hooks/useStableCallback';

const handlePress = useStableCallback((id: string) => {
  // stable reference
}, []);
```

### List Optimization Hook
Use useListOptimization for consistent list behavior:

```tsx
import { useListOptimization } from '@/hooks/useListOptimization';

const listProps = useListOptimization(
  (item: Task) => item.id,
  { estimatedItemSize: 96 }
);
```

## CHANGELOG Rules

Every architectural phase MUST:

- Add CHANGELOG entry
- Include added/improved/fixed sections
- Document architectural decisions
- Maintain chronological consistency
- Avoid vague entries like "misc fixes"

Format:

```md
## Phase X — Title

### Added
- Specific feature or component added

### Improved
- Specific improvement made

### Fixed
- Specific issue resolved
```

Ensure newest entries appear at top and maintain semantic formatting consistency.
