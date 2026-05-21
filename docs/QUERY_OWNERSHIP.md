# Query Ownership Documentation

## Overview

Lumo uses React Query for remote data caching with clear ownership boundaries. Each feature owns its queries, invalidation, and hydration.

## Query Architecture

```
UI
↓
Feature Query Hooks
↓
Feature Repositories
↓
React Query Remote Cache
↓
Supabase
```

## Centralized Query Keys

Query keys are centralized and typed:

```typescript
// src/services/query/queryKeys.ts
export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    lists: () => ['tasks', 'list'] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
    byCategory: (category: string) => ['tasks', 'category', category] as const,
  },
  habits: {
    all: ['habits'] as const,
    lists: () => ['habits', 'list'] as const,
    detail: (id: string) => ['habits', 'detail', id] as const,
  },
  // ... other features
} as const;
```

## Feature Query Keys

Each feature extends centralized keys with feature-specific helpers:

```typescript
// features/tasks/queries/taskQueryKeys.ts
import { queryKeys } from '@/services/query';

export const taskQueryKeys = {
  ...queryKeys.tasks,
  search: (query: string) => ['tasks', 'search', query] as const,
  filter: (filter: string) => ['tasks', 'filter', filter] as const,
  sort: (sort: string) => ['tasks', 'sort', sort] as const,
} as const;
```

## Feature Query Hooks

Each feature owns its query hooks:

```typescript
// features/tasks/queries/useTasksQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/query';
import { fetchTasks } from '../repositories/taskRepository';

export const useTasksQuery = () => {
  return useQuery({
    queryKey: queryKeys.tasks.lists(),
    queryFn: fetchTasks,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: any) => {
      return await createTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.lists(),
      });
    },
  });
};
```

## Query Configuration

React Query is configured for calm, conservative behavior:

```typescript
// src/services/query/queryConfig.ts
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

## Invalidation Rules

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

## Query Ownership

### What Features Own

- Query hooks for their data
- Invalidations for their mutations
- Query transforms for their data
- Hydration helpers for their data

### What's Centralized

- Query client configuration
- Base query keys
- Query cache configuration
- Mutation cache configuration

## Best Practices

### Do
- Use typed query keys
- Invalidate conservatively
- Own your query hooks
- Use feature-specific repositories
- Respect stale times

### Don't
- Invalidate aggressively
- Use inline query keys
- Share query hooks across features
- Duplicate query keys
- Overfetch data

## Performance

### Stale Times

- **Tasks**: 5 minutes
- **Habits**: 5 minutes
- **Meals**: 5 minutes
- **Wellness**: 5 minutes
- **Notifications**: 2 minutes
- **Onboarding**: 5 minutes

### Cache Time

- **Default**: 10 minutes
- **Notifications**: 5 minutes

### Retry Behavior

- **Network errors**: Retry 2 times with exponential backoff
- **4xx errors**: No retry
- **Mutations**: No retry (optimistic updates handle errors)

## Testing

### Query Testing

Test query hooks in isolation:

```typescript
import { renderHook, waitFor } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasksQuery } from '@/features/tasks/queries/useTasksQuery';

describe('useTasksQuery', () => {
  it('fetches tasks successfully', async () => {
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

### Mutation Testing

Test mutations with invalidation:

```typescript
describe('useCreateTaskMutation', () => {
  it('creates task and invalidates queries', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateTaskMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ title: 'Test Task' });
    });

    expect(queryClient.getQueryData(['tasks', 'list'])).toBeDefined();
  });
});
```
