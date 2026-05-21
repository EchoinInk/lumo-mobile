# State Architecture Documentation

## Overview

This document outlines the state management architecture for Lumo Mobile, focusing on scalable, domain-driven state ownership using Zustand and MMKV persistence.

## Core Principles

### 1. Domain-Driven State Ownership

State is organized by domain, not by feature screens. Each domain owns its state and exposes typed actions.

**Domains:**

- Tasks
- Habits
- Meals
- Budget
- Settings

### 2. No Monolithic Global Store

**❌ Anti-Pattern:**

```ts
// DO NOT create a giant global store
const useAppStore = create((set) => ({
  tasks: [],
  habits: [],
  meals: [],
  budgets: [],
  settings: {},
  modalStates: {},
  // ... hundreds of lines
}));
```

**✅ Correct Pattern:**

```ts
// Create isolated domain stores
const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  addTask: (task) => set((state) => ({ ... })),
  // ... task-specific actions
}));

const useHabitStore = create<HabitStore>((set) => ({
  habits: [],
  addHabit: (habit) => set((state) => ({ ... })),
  // ... habit-specific actions
}));
```

### 3. Store Pattern

Each store follows this strict pattern:

```ts
type State = {
  // Domain state only
};

type Actions = {
  // Typed actions only
};

type Store = State & Actions;

export const useXStore = create<Store>((set) => ({
  // Implementation
}));
```

**Example:**

```ts
type TaskState = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
};

type TaskActions = {
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  // ...
};

type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,
  addTask: (task) => set((state) => ({ ... })),
  // ...
}));
```

## Global vs Local State Rules

### Global State (Zustand Stores)

**Use global state for:**

- Domain data that needs to be shared across screens
- User preferences and settings
- Cached entities that need persistence
- Business logic state

**Examples:**

```ts
// ✅ Correct: Domain data
useTaskStore: {
  (tasks, addTask, updateTask, deleteTask);
}
useHabitStore: {
  (habits, addHabit, toggleHabitCompletion);
}
useSettingsStore: {
  (settings, updateSettings);
}

// ❌ Incorrect: UI state
useTaskStore: {
  (isModalOpen, isFilterExpanded, selectedTab);
}
```

### Local State (React useState)

**Use local state for:**

- Modal visibility
- Form input values
- Filter selections
- UI toggles
- Temporary loading states
- Screen-specific UI state

**Examples:**

```ts
// ✅ Correct: UI state in components
const [isModalOpen, setIsModalOpen] = useState(false);
const [filterValue, setFilterValue] = useState("");
const [isExpanded, setIsExpanded] = useState(true);

// ❌ Incorrect: UI state in global store
useTaskStore: {
  (isModalOpen, filterValue, isExpanded);
}
```

## Persistence Rules

### What to Persist (✅)

**Persist these using MMKV:**

- Habits (user's habit tracking data)
- Onboarding state (whether user completed onboarding)
- User preferences (theme, language, notifications)
- Settings (app configuration)
- Lightweight cached entities (domain data that should survive app restart)

**Example:**

```ts
export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      addHabit: (habit) => set((state) => ({ ... })),
      // ...
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => createPersistStorage('habits')),
    }
  )
);
```

### What NOT to Persist (❌)

**Do NOT persist:**

- Modal visibility
- Filter states
- Temporary form input
- UI toggles
- Transient loading states
- Screen-specific UI state

**Example:**

```ts
// ❌ Incorrect: Persisting UI state
export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      isModalOpen: false, // Don't persist this
      filterValue: "", // Don't persist this
      // ...
    }),
    { name: "task-storage" },
  ),
);

// ✅ Correct: UI state in component
function TaskScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  // ...
}
```

## Repository Architecture

### Purpose

Repositories abstract storage ownership and provide a clean separation between UI components and data storage. This makes the app backend-ready without requiring UI changes.

### Pattern

```ts
export class TaskRepository {
  async getAll(): Promise<Task[]> {
    // Future: Fetch from backend API
    // Current: Return from store or local storage
  }

  async create(
    task: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ): Promise<Task> {
    // Future: POST to backend API
    // Current: Create locally
  }

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    // Future: PUT/PATCH to backend API
    // Current: Update locally
  }

  async delete(id: string): Promise<boolean> {
    // Future: DELETE to backend API
    // Current: Delete locally
  }
}

export const taskRepository = new TaskRepository();
```

### Usage

```ts
// In UI components or services
import { taskRepository } from "@/services/taskRepository";

async function handleAddTask(taskData) {
  const newTask = await taskRepository.create(taskData);
  useTaskStore.getState().addTask(newTask);
}
```

### Benefits

- **Backend-ready**: Switch to API calls without UI changes
- **Testable**: Easy to mock repositories in tests
- **Separation of concerns**: UI doesn't know about storage implementation
- **Local-first**: Works offline, syncs when online (future)

## Domain Isolation Principles

### 1. No Cross-Domain Dependencies

**❌ Anti-Pattern:**

```ts
// Task store depending on habit store
const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  addTask: (task) => {
    const habit = useHabitStore.getState().habits[0]; // Cross-domain dependency
    // ...
  },
}));
```

**✅ Correct Pattern:**

```ts
// Each store is isolated
const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  addTask: (task) => set((state) => ({ ... })),
}));

const useHabitStore = create<HabitStore>((set) => ({
  habits: [],
  addHabit: (habit) => set((state) => ({ ... })),
}));
```

### 2. Thin Stores

Stores should be thin and focused on state management, not business logic.

**❌ Anti-Pattern:**

```ts
// Store with complex business logic
const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  addTask: (task) => {
    // Complex validation logic
    // API calls
    // Data transformation
    // Error handling
    // ... 50 lines of logic
  },
}));
```

**✅ Correct Pattern:**

```ts
// Store focuses on state, repository handles logic
const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
}));

// Repository handles business logic
export class TaskRepository {
  async create(
    task: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ): Promise<Task> {
    // Validation
    // API calls
    // Data transformation
    // Error handling
  }
}
```

### 3. Composable State

State should be composable and granular.

**❌ Anti-Pattern:**

```ts
// Giant nested state
const useTaskStore = create<TaskStore>((set) => ({
  ui: {
    modals: {
      taskModal: { isOpen: false, task: null },
      filterModal: { isOpen: false, filters: {} },
    },
    filters: {
      priority: "all",
      status: "all",
      dateRange: { start: null, end: null },
    },
  },
  data: {
    tasks: [],
    metadata: { total: 0, filtered: 0 },
  },
}));
```

**✅ Correct Pattern:**

```ts
// Flat, granular state
const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
}));

// UI state in components
const [isModalOpen, setIsModalOpen] = useState(false);
const [filters, setFilters] = useState({ priority: "all", status: "all" });
```

## Performance Constraints

### Avoid Excessive Subscriptions

**❌ Anti-Pattern:**

```ts
// Subscribes to entire store, causes unnecessary rerenders
function TaskList() {
  const { tasks, addTask, updateTask, deleteTask, isLoading, error } =
    useTaskStore();
  // Rerenders on any state change
}
```

**✅ Correct Pattern:**

```ts
// Use selectors for granular subscriptions
function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  // Only rerenders when tasks or addTask changes
}
```

### Avoid Giant Selectors

**❌ Anti-Pattern:**

```ts
// Complex selector that runs on every render
const filteredTasks = useTaskStore((state) =>
  state.tasks
    .filter((task) => task.priority === "high")
    .filter((task) => !task.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map((task) => ({ ...task, formattedDate: formatDate(task.dueDate) })),
);
```

**✅ Correct Pattern:**

```ts
// Use useMemo for complex derived state
const tasks = useTaskStore((state) => state.tasks);
const filteredTasks = useMemo(
  () =>
    tasks
      .filter((task) => task.priority === "high")
      .filter((task) => !task.completed)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
  [tasks],
);
```

### Avoid Deeply Nested State

**❌ Anti-Pattern:**

```ts
type State = {
  data: {
    tasks: {
      byId: Record<string, Task>;
      allIds: string[];
      filtered: {
        byPriority: Record<string, string[]>;
        byStatus: Record<string, string[]>;
      };
    };
  };
};
```

**✅ Correct Pattern:**

```ts
type State = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
};
```

## Anti-Patterns to Avoid

### 1. Screen-Owned Persistence

**❌ Anti-Pattern:**

```ts
// Screen decides what to persist
function TaskScreen() {
  const persistTask = (task) => {
    localStorage.setItem("task", JSON.stringify(task)); // Direct storage access
  };
}
```

**✅ Correct Pattern:**

```ts
// Store handles persistence
const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
    }),
    { name: "task-storage" },
  ),
);
```

### 2. Business Logic in UI Primitives

**❌ Anti-Pattern:**

```ts
// UI component contains business logic
function TaskItem({ task }) {
  const handleComplete = () => {
    if (task.priority === "high" && !task.completed) {
      // Business logic in UI
      sendNotification();
      updateStreak();
      calculatePoints();
    }
    useTaskStore.getState().toggleTaskCompletion(task.id);
  };
}
```

**✅ Correct Pattern:**

```ts
// Business logic in repository or store
const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  toggleTaskCompletion: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id === id && task.priority === "high" && !task.completed) {
          // Business logic here
          sendNotification();
          updateStreak();
          calculatePoints();
        }
        return task.id === id ? { ...task, completed: !task.completed } : task;
      }),
    })),
}));
```

### 3. Giant Shared Stores

**❌ Anti-Pattern:**

```ts
// One store for everything
const useAppStore = create((set) => ({
  // 200+ lines of state and actions
  tasks: [],
  habits: [],
  meals: [],
  budgets: [],
  settings: {},
  modals: {},
  filters: {},
  forms: {},
  // ...
}));
```

**✅ Correct Pattern:**

```ts
// Isolated domain stores
const useTaskStore = create<TaskStore>((set) => ({ ... }));
const useHabitStore = create<HabitStore>((set) => ({ ... }));
const useMealStore = create<MealStore>((set) => ({ ... }));
const useBudgetStore = create<BudgetStore>((set) => ({ ... }));
const useSettingsStore = create<SettingsStore>((set) => ({ ... }));
```

## Storage Architecture

### MMKV Storage Layer

The MMKV storage layer provides a lightweight, fast key-value storage solution.

**Location:** `src/store/storage.ts`

**Key Functions:**

- `getItem<T>(key: string): T | null` - Get typed value
- `setItem<T>(key: string, value: T): void` - Set typed value
- `removeItem(key: string): void` - Remove value
- `hasItem(key: string): boolean` - Check if key exists
- `clearAll(): void` - Clear all storage
- `getAllKeys(): string[]` - Get all keys

### Persist Helper

The persist helper bridges MMKV with Zustand's persist middleware.

**Location:** `src/store/createPersistStorage.ts`

**Usage:**

```ts
import { createPersistStorage } from '@/store/createPersistStorage';

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({ ... }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => createPersistStorage('habits')),
    }
  )
);
```

## Summary

**Key Takeaways:**

1. **Domain isolation**: Each domain owns its state
2. **No monolithic stores**: Split by domain, not by screen
3. **Typed actions**: Use TypeScript for type safety
4. **Persist strategically**: Only persist domain data, not UI state
5. **Repository pattern**: Abstract storage for backend readiness
6. **Thin stores**: Keep stores focused on state, not business logic
7. **Local UI state**: Use React useState for UI-specific state
8. **Granular subscriptions**: Use selectors to avoid unnecessary rerenders

**File Structure:**

```
src/
├── store/
│   ├── storage.ts              # MMKV storage layer
│   ├── createPersistStorage.ts # Persist helper
│   ├── useTaskStore.ts         # Task domain store
│   ├── useHabitStore.ts        # Habit domain store
│   ├── useMealStore.ts         # Meal domain store
│   ├── useBudgetStore.ts       # Budget domain store
│   └── useSettingsStore.ts     # Settings domain store
├── services/
│   ├── taskRepository.ts       # Task repository
│   ├── habitRepository.ts      # Habit repository
│   ├── mealRepository.ts       # Meal repository
│   └── budgetRepository.ts     # Budget repository
└── features/
    ├── tasks/
    │   └── mock/
    │       └── mockTasks.ts    # Mock task data
    └── habits/
        └── mock/
            └── mockHabits.ts   # Mock habit data
```
