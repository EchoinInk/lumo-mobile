// Tasks Feature
// Local-first task management with calm UX

// Components
export { AddTaskButton } from './components/AddTaskButton';
export { AddTaskModal } from './components/AddTaskModal';
export { EmptyTasks } from './components/EmptyTasks';
export { TaskFilterPills } from './components/TaskFilterPills';
export { TaskList } from './components/TaskList';
export { TaskRow } from './components/TaskRow';
export { TaskSection } from './components/TaskSection';

// Hooks
export { useTasks } from './hooks/useTasks';

// Types
export type {
  Task,
  TaskPriority,
  TaskStatus,
  TaskFilter,
  CreateTaskInput,
  UpdateTaskInput,
} from './types/task';

// Store (for advanced use cases)
export { useTaskStore } from './store/useTaskStore';
