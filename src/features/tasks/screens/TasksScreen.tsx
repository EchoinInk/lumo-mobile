import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Screen } from "@/src/components/ui/Screen";
import { Spacing } from "@/src/theme/tokens";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { EmptyTasks } from "../components/EmptyTasks";
import { TaskFilterPills } from "../components/TaskFilterPills";
import { TaskRow } from "../components/TaskRow";
import { TaskSection } from "../components/TaskSection";
import { useTasks } from "../hooks/useTasks";
import { TaskFilter } from "../types/task";
import { filterTasks } from "../utils/taskHelpers";

/**
 * Tasks Screen
 *
 * Fully interactive task management screen.
 * Users can add, toggle, and delete tasks with instant UI updates.
 */
export default function TasksScreen() {
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const {
    tasks,
    activeCount,
    completedCount,
    createTask,
    toggleTask,
    deleteTask,
  } = useTasks();

  const filteredTasks = React.useMemo(() => {
    return filterTasks(tasks, filter);
  }, [tasks, filter]);

  const handleAddTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;

    await createTask({ title, priority: "medium" });
    setNewTaskTitle("");
    setIsAdding(false);
  };

  const handleToggleTask = async (id: string) => {
    await toggleTask(id);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  return (
    <Screen scrollable padded keyboardAvoiding>
      {/* Header Section */}
      <TaskSection
        title="Tasks"
        subtitle={`${activeCount} active, ${completedCount} completed`}
      >
        {/* Add Task Input */}
        {isAdding ? (
          <View style={styles.addTaskContainer}>
            <View style={styles.inputRow}>
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  onSubmitEditing={handleAddTask}
                  returnKeyType="done"
                  autoFocus
                />
              </View>
            </View>
            <View style={styles.addActions}>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => {
                  setIsAdding(false);
                  setNewTaskTitle("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onPress={handleAddTask}
                disabled={!newTaskTitle.trim()}
              >
                Add Task
              </Button>
            </View>
          </View>
        ) : (
          <Button
            variant="secondary"
            size="md"
            onPress={() => setIsAdding(true)}
            accessibilityLabel="Add a new task"
          >
            + Add Task
          </Button>
        )}

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          <TaskFilterPills selectedFilter={filter} onFilterChange={setFilter} />
        </View>

        {/* Task List */}
        {filteredTasks.length > 0 ? (
          <View style={styles.taskList}>
            {filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </View>
        ) : (
          <EmptyTasks filter={filter} />
        )}
      </TaskSection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addTaskContainer: {
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
  },
  addActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  filterContainer: {
    marginTop: Spacing.md,
  },
  taskList: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
