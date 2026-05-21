# Feature Modularization Documentation

## Overview

Lumo's features are fully modularized for independent evolution, testability, and scalability. Each feature owns its logic, hooks, queries, selectors, repositories, and types.

## Feature Structure

Each feature follows a consistent structure:

```txt
features/
├── tasks/
│   ├── components/       # Feature-specific UI components
│   ├── hooks/            # Feature-specific React hooks
│   ├── screens/          # Feature-specific screens
│   ├── services/         # Feature-specific business logic
│   ├── store/            # Feature-specific Zustand stores
│   ├── types/            # Feature-specific TypeScript types
│   ├── utils/            # Feature-specific utility functions
│   ├── constants/        # Feature-specific constants
│   ├── repositories/     # Feature-specific data access layer
│   ├── queries/          # Feature-specific React Query hooks
│   ├── selectors/        # Feature-specific derived state selectors
│   └── index.ts          # Central export
```

## Feature Ownership

### What Each Feature Owns

- **Logic**: Business logic specific to the feature
- **Hooks**: Custom React hooks for feature operations
- **Queries**: React Query hooks for remote data
- **Selectors**: Derived state selectors
- **Repositories**: Data access layer for Supabase
- **Types**: TypeScript types for feature data
- **Constants**: Feature-specific constants
- **Components**: UI components for the feature

### Cross-Feature Imports

Avoid cross-feature imports whenever possible. If necessary:

- Use shared types from `src/types/`
- Use shared utilities from `src/utils/`
- Keep dependencies minimal and explicit

## Feature Index

Each feature exports from a central `index.ts`:

```typescript
// Export new modular architecture
export * from './constants/taskConstants';
export * from './queries/useTasksQuery';
export * from './queries/taskQueryKeys';
export * from './selectors/taskSelectors';
export * from './repositories/taskRepository';

// Re-export existing items
export * from './components';
export * from './hooks';
export * from './screens';
export * from './services';
export * from './store';
export * from './types';
export * from './utils';
```

## Repository Pattern

Each feature uses the repository pattern for data access:

```typescript
// features/tasks/repositories/taskRepository.ts
import { supabase } from '@/services/api/supabase';
import type { Task } from '../types/task';

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data || [];
};
```

## Query Hooks

Each feature owns its React Query hooks:

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
```

## Selector Functions

Each feature owns its selectors for derived state:

```typescript
// features/tasks/selectors/taskSelectors.ts
export const selectCompletedTasks = (tasks: any[]) => {
  return tasks.filter((task) => task.status === 'completed');
};

export const selectTasksByCategory = (tasks: any[], category: string) => {
  return tasks.filter((task) => task.category === category);
};
```

## Constants

Each feature owns its constants:

```typescript
// features/tasks/constants/taskConstants.ts
export const TASK_CATEGORIES = {
  PERSONAL: 'personal',
  WORK: 'work',
  HEALTH: 'health',
  FINANCE: 'finance',
  OTHER: 'other',
} as const;

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;
```

## Benefits

### Independent Evolution
- Features can evolve independently
- No tight coupling between features
- Easy to add or remove features

### Testability
- Feature-level testing
- Repository mocking
- Query testing
- Independent iteration

### Scalability
- Feature-level scalability
- Future team growth
- Isolated refactors
- Clear ownership boundaries

### Maintainability
- Clear code organization
- Predictable structure
- Easy navigation
- Reduced cognitive load

## Best Practices

### Do
- Keep features self-contained
- Use consistent structure
- Export from central index
- Own your types and constants
- Use repository pattern for data access

### Don't
- Create cross-feature imports
- Share business logic across features
- Use giant shared systems
- Mix concerns across features
- Create feature bleed

## Future Considerations

- Feature-level routing
- Feature-level state machines
- Feature-level error boundaries
- Feature-level analytics
- Feature-level testing suites
