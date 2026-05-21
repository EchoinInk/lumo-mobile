# Local vs Remote State Documentation

## Overview

Lumo separates local state from remote state for optimal performance and offline-first architecture. Zustand manages local state, React Query manages remote cache.

## Data Ownership

### Zustand (Local State)

Use for:

- **UI state**: Modal visibility, drawer state, tab selection
- **Preferences**: Theme, language, notifications, sound, haptic feedback
- **Local entities**: Optimistic task updates, local habit completions
- **Accessibility settings**: Reduced motion, font scaling, color preferences
- **Onboarding state**: Current step, completed steps, focus areas
- **Notification preferences**: Notification types, timing, permissions

### React Query (Remote State)

Use for:

- **Remote cache**: Supabase data, server state
- **Background synchronization**: Sync queue, conflict resolution
- **Server hydration**: Initial data load, rehydration
- **Stale invalidation**: Cache invalidation on mutations
- **Remote reconciliation**: Conflict resolution, data merging

## Architecture

### Correct Architecture

```
UI
↓
Zustand Local State (instant, optimistic)
↓
Repository (data access layer)
↓
Sync Queue (offline-safe)
↓
React Query Remote Cache (server state)
↓
Supabase (source of truth)
```

### Incorrect Architecture

```
UI
↓
Direct React Query everywhere (slow, network-dependent)
```

## Example: Task Creation

### Local First with Zustand

```typescript
// features/tasks/store/useTaskStore.ts
import { create } from 'zustand';

interface TaskState {
  tasks: Task[];
  addTask: (task: Task) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
}));
```

### Remote Sync with React Query

```typescript
// features/tasks/queries/useTasksQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/query';
import { createTask } from '../repositories/taskRepository';

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  const addTask = useTaskStore((state) => state.addTask);

  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      return await createTask(task);
    },
    onSuccess: (data) => {
      // Update local state instantly
      addTask(data);
      // Invalidate remote cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.lists(),
      });
    },
  });
};
```

## Example: Task List

### Local State (Optimistic)

```typescript
const { tasks } = useTaskStore();
// Instant, no network dependency
```

### Remote State (Server)

```typescript
const { data: remoteTasks } = useTasksQuery();
// Synced with server, background refresh
```

## Mutation Strategy

### Instant Local Updates

```typescript
const addTask = useTaskStore((state) => state.addTask);

const { mutate: createTask } = useCreateTaskMutation();

const handleCreateTask = (task: Task) => {
  // Instant local update
  addTask(task);
  // Sync to server in background
  createTask(task);
};
```

### Sync Queue

```typescript
// Enqueue for offline sync
syncQueue.add({
  type: 'create',
  entity: 'task',
  data: task,
});
```

## Offline Behavior

### Local State

- Always available
- Instant updates
- No network dependency
- MMKV persistence

### Remote State

- Queue changes offline
- Sync when online
- Background refresh
- Cache invalidation

## Best Practices

### Do

- Use Zustand for instant local updates
- Use React Query for server data
- Sync local changes to server
- Queue changes for offline
- Respect stale times

### Don't

- Use React Query for UI state
- Use Zustand for server data
- Block UI on network requests
- Lose data offline
- Invalidate aggressively

## Performance

### Local State

- **Instant**: No network dependency
- **Optimistic**: Updates immediately
- **Persistent**: MMKV storage
- **Resilient**: Works offline

### Remote State

- **Cached**: 5-10 minute stale time
- **Background**: Sync on reconnect
- **Efficient**: Conservative invalidation
- **Battery-conscious**: No aggressive polling

## Testing

### Local State Testing

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';

describe('useTaskStore', () => {
  it('adds task instantly', () => {
    const { result } = renderHook(() => useTaskStore());

    act(() => {
      result.current.addTask({ id: '1', title: 'Test Task' });
    });

    expect(result.current.tasks).toHaveLength(1);
  });
});
```

### Remote State Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasksQuery } from '@/features/tasks/queries/useTasksQuery';

describe('useTasksQuery', () => {
  it('fetches tasks from server', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useTasksQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```
