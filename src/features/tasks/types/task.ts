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
  dueTime?: string;
  createdAt: string;
  updatedAt: string;
  /** Soft delete timestamp for sync — null if not deleted */
  deletedAt?: string | null;
  /** Sync status: pending = local changes not synced, synced = confirmed on server, failed = sync failed */
  syncStatus?: "pending" | "synced" | "failed";
  /** Monotonically increasing version for conflict detection */
  version?: number;
  /** ISO timestamp of last successful sync for this entity */
  lastSyncedAt?: string;
  /** True when entity has unsynced local changes */
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
