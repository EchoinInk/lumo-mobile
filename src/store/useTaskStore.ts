import { create } from 'zustand';

interface TaskState {
  tasks: [];
  // Add task-related state and actions here
}

export const useTaskStore = create<TaskState>(() => ({
  tasks: [],
}));
