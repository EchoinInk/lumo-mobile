export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus = "todo" | "completed";

export type TaskFilter =
  | "all"
  | "active"
  | "completed"
  | "high"
  | "medium"
  | "low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  /** @deprecated Sync metadata - unused in local-only mode */
  version?: number;
  /** @deprecated Sync metadata - unused in local-only mode */
  lastSyncedAt?: string;
  /** @deprecated Sync metadata - unused in local-only mode */
  pendingSync?: boolean;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: TaskPriority;
  dueDate?: string;
}
