# React Query Philosophy Documentation

## Overview

Lumo uses React Query for remote data caching with a calm, conservative philosophy. The goal is predictable, battery-conscious, offline-safe behavior.

## Philosophy

- **Predictable**: Consistent behavior, no surprises
- **Calm**: No aggressive polling, conservative refetching
- **Battery-conscious**: Minimal network activity
- **Offline-safe**: Queue changes, sync when online
- **User-first**: Instant local updates, background sync

## What React Query Manages

### Remote Cache

- Supabase data
- Server state
- Background synchronization
- Stale invalidation
- Remote reconciliation

### What React Query Does NOT Manage

- UI state (use Zustand)
- Form state (use React Hook Form)
- Modal visibility (use Zustand)
- Preferences (use Zustand)
- Optimistic local entity ownership (use Zustand)

## Query Configuration

### Conservative Defaults

```typescript
export const queryConfig = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && error !== null && 'status' in error) {
        const status = (error as { status?: number }).status;
        if (typeof status === 'number' && status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    retry: false,
  },
};
```

### Configuration Philosophy

- **No window focus refetch**: Prevents unnecessary network activity
- **No mount refetch**: Prevents redundant fetches
- **Reconnect refetch**: Sync when connection restored
- **Conservative retry**: Retry network errors, not client errors
- **Exponential backoff**: Calm retry progression (1s, 2s, 4s)
- **No mutation retry**: Optimistic updates handle errors

## Stale Times

### Feature-Specific Stale Times

- **Tasks**: 5 minutes
- **Habits**: 5 minutes
- **Meals**: 5 minutes
- **Wellness**: 5 minutes
- **Notifications**: 2 minutes (more time-sensitive)
- **Onboarding**: 5 minutes

### Rationale

- **Long stale times**: Reduces network activity
- **Feature-specific**: Adjusts based on data volatility
- **Predictable**: Users know when data refreshes
- **Battery-conscious**: Minimizes background sync

## Invalidation Strategy

### Conservative Invalidation

Only invalidate what's necessary:

```typescript
// Good: Invalidate specific query
queryClient.invalidateQueries({
  queryKey: queryKeys.tasks.lists(),
});

// Bad: Invalidate all queries
queryClient.invalidateQueries();
```

### Mutation Invalidation

Mutations invalidate related queries:

```typescript
export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      return await updateTask(id, updates);
    },
    onSuccess: (_, { id }) => {
      // Invalidate specific task
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(id),
      });
      // Invalidate tasks list
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.lists(),
      });
    },
  });
};
```

## Offline Integration

### Queue Changes Offline

React Query works with sync queue for offline safety:

```typescript
// Enqueue for offline sync
syncQueue.add({
  type: 'create',
  entity: 'task',
  data: task,
});

// Sync when online
useEffect(() => {
  if (!isOffline) {
    syncQueue.flush();
  }
}, [isOffline]);
```

### Background Sync

React Query syncs in background without blocking UI:

```typescript
// Instant local update
addTask(task);

// Background sync
createTask(task);
```

## Performance

### Avoid

- **Aggressive polling**: No interval-based refetching
- **Excessive invalidation**: Only invalidate what's necessary
- **Network-heavy defaults**: Conservative stale times
- **Blocking mutations**: Optimistic updates

### Ensure

- **Memoization**: Memoize selectors and derived state
- **Lightweight queries**: Fetch only necessary data
- **Efficient invalidation**: Target specific queries
- **Background sync**: Don't block UI

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

### Error Handling

```typescript
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  const addTask = useTaskStore((state) => state.addTask);
  const removeTask = useTaskStore((state) => state.removeTask);

  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      return await createTask(task);
    },
    onSuccess: (data) => {
      addTask(data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.lists(),
      });
    },
    onError: (error) => {
      // Revert local update on error
      removeTask(task.id);
      // Show calm error message
      showError('Something went wrong. Please try again.');
    },
  });
};
```

## Query Provider

### Setup

```typescript
// src/providers/QueryProvider.tsx
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/query';

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

### Integration

```typescript
// App entry point
import { QueryProvider } from '@/providers/QueryProvider';

export default function App() {
  return (
    <QueryProvider>
      <RootLayout />
    </QueryProvider>
  );
}
```

## Best Practices

### Do

- Use conservative stale times
- Invalidate conservatively
- Sync local changes to server
- Queue changes for offline
- Respect battery life

### Don't

- Poll aggressively
- Invalidate everything
- Block UI on network
- Lose data offline
- Overfetch data

## Testing

### Query Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasksQuery } from '@/features/tasks/queries/useTasksQuery';

describe('useTasksQuery', () => {
  it('fetches tasks with conservative configuration', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    });

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
