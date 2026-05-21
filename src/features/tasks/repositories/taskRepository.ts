/**
 * Task Repository
 *
 * Repository pattern for tasks data access.
 * Separates data access from business logic.
 */

import { supabase } from "@/services/api/supabase";
import type { Task } from "../types/task";

/**
 * Fetch all tasks for user
 */
export const fetchTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch task by ID
 */
export const fetchTaskById = async (id: string): Promise<Task | null> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create task
 */
export const createTask = async (task: Partial<Task>): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update task
 */
export const updateTask = async (
  id: string,
  updates: Partial<Task>,
): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete task
 */
export const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) throw error;
};
