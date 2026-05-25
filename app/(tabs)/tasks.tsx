import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { TaskFormModal } from "@/src/features/tasks/components/TaskFormModal";
import { useTasks } from "@/src/features/tasks/hooks/useTasks";
import {
  CreateTaskInput,
  Task,
  TaskPriority,
} from "@/src/features/tasks/types/task";
import { Colors, Radius, Shadows, Spacing } from "@/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle2,
  Circle,
  Clock,
  Lightbulb,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

type FilterType = "all" | "today" | "upcoming" | "done";

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "done", label: "Done" },
];

// Priority to filter mapping
const getPriorityFromKey = (key: string): TaskPriority | null => {
  switch (key) {
    case "high":
      return "high";
    case "medium":
      return "medium";
    case "low":
      return "low";
    default:
      return null;
  }
};

export default function TasksScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("today");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const {
    tasks,
    toggleTask,
    deleteTask,
    updateTask,
    createTask,
    completedCount,
    totalCount,
    error,
    isLoading,
  } = useTasks();

  // Date helpers
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "done") return task.completed;
    if (activeFilter === "today") {
      // Show incomplete tasks due today or without a due date
      if (task.completed) return false;
      return !task.dueDate || task.dueDate === today;
    }
    if (activeFilter === "upcoming") {
      // Show incomplete tasks due tomorrow or later
      if (task.completed) return false;
      return task.dueDate && task.dueDate > today;
    }
    return true;
  });

  const handleAddPress = () => {
    setModalMode("create");
    setSelectedTask(undefined);
    setIsModalVisible(true);
  };

  const handleEditPress = (task: Task) => {
    setModalMode("edit");
    setSelectedTask(task);
    setIsModalVisible(true);
  };

  const handleModalSubmit = (data: CreateTaskInput) => {
    if (modalMode === "edit" && selectedTask) {
      updateTask(selectedTask.id, data);
    } else {
      createTask(data);
    }
    setIsModalVisible(false);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedTask(undefined);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return Colors.pink;
      case "medium":
        return Colors.warning;
      case "low":
        return Colors.blue;
      default:
        return Colors.textSecondary;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Screen scrollable padded>
        <LoadingState message="Loading your tasks..." />
      </Screen>
    );
  }

  // Error state
  if (error) {
    return (
      <Screen scrollable padded>
        <RetryView
          title="Something didn't load gently"
          message="Your tasks are still safe. Try again when you're ready."
          onRetry={() => window.location.reload()}
        />
      </Screen>
    );
  }

  return (
    <Screen scrollable padded>
      {/* Header */}
      <SectionHeader
        title="Your Tasks"
        subtitle={`${completedCount} of ${totalCount} completed`}
      />

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setActiveFilter(filter.key)}
            style={[
              styles.filterPill,
              activeFilter === filter.key && styles.filterPillActive,
            ]}
          >
            <Text
              variant="body"
              color={
                activeFilter === filter.key
                  ? Colors.textInverse
                  : Colors.textPrimary
              }
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Error State */}
      {error && (
        <Card variant="outlined" style={styles.errorCard}>
          <Text variant="body" color={Colors.textSecondary}>
            {error}
          </Text>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card variant="outlined" style={styles.emptyCard}>
          <Text variant="body" color={Colors.textSecondary}>
            Loading your tasks...
          </Text>
        </Card>
      )}

      {/* Empty States */}
      {!isLoading && filteredTasks.length === 0 && (
        <Card variant="outlined" style={styles.emptyCard}>
          <Text
            variant="body"
            color={Colors.textSecondary}
            style={styles.emptyTitle}
          >
            {activeFilter === "done"
              ? "No completed tasks yet"
              : activeFilter === "upcoming"
                ? "No upcoming tasks"
                : "No tasks for today"}
          </Text>
          <Text variant="caption" color={Colors.textTertiary}>
            {activeFilter === "done"
              ? "Complete a task and it will appear here"
              : "Add a task to get started — small steps count"}
          </Text>
        </Card>
      )}

      {/* Task List */}
      <View style={styles.taskList}>
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            variant={task.completed ? "outlined" : "elevated"}
            style={[
              styles.taskCard,
              task.priority === "high" &&
                !task.completed &&
                styles.taskCardHigh,
            ]}
          >
            <View style={styles.taskRow}>
              <TouchableOpacity
                onPress={() => toggleTask(task.id)}
                style={styles.taskContent}
                activeOpacity={0.7}
                accessibilityLabel={`${task.completed ? "Completed" : "Pending"} task: ${task.title}`}
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.checkbox,
                    task.completed && styles.checkboxChecked,
                    task.priority === "high" &&
                      !task.completed &&
                      styles.checkboxHigh,
                  ]}
                >
                  {task.completed ? (
                    <CheckCircle2 size={20} color={Colors.textInverse} />
                  ) : (
                    <Circle size={20} color={Colors.border} />
                  )}
                </View>

                <View style={styles.taskInfo}>
                  <Text
                    variant="body"
                    style={[
                      styles.taskTitle,
                      task.completed && styles.taskTitleCompleted,
                    ]}
                  >
                    {task.title}
                  </Text>

                  {task.description && (
                    <Text
                      variant="caption"
                      color={Colors.textTertiary}
                      style={styles.taskNotes}
                      numberOfLines={1}
                    >
                      {task.description}
                    </Text>
                  )}

                  <View style={styles.taskMeta}>
                    {(task.dueDate || task.dueTime) && (
                      <View style={styles.timeBadge}>
                        <Clock size={12} color={Colors.textTertiary} />
                        <Text variant="small" color={Colors.textTertiary}>
                          {task.dueDate === today
                            ? "Today"
                            : task.dueDate === tomorrow
                              ? "Tomorrow"
                              : task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString(
                                    undefined,
                                    { month: "short", day: "numeric" },
                                  )
                                : ""}
                          {task.dueTime
                            ? (task.dueDate ? " at " : "") + task.dueTime
                            : ""}
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor:
                            getPriorityColor(task.priority) + "15",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: getPriorityColor(task.priority) },
                        ]}
                      />
                      <Text
                        variant="small"
                        color={getPriorityColor(task.priority)}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.taskActions}>
                {/* Edit Button */}
                <TouchableOpacity
                  onPress={() => handleEditPress(task)}
                  style={styles.actionButton}
                  activeOpacity={0.6}
                  accessibilityLabel={`Edit task: ${task.title}`}
                  accessibilityRole="button"
                >
                  <Pencil size={16} color={Colors.textTertiary} />
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => deleteTask(task.id)}
                  style={styles.actionButton}
                  activeOpacity={0.6}
                  accessibilityLabel={`Delete task: ${task.title}`}
                  accessibilityRole="button"
                >
                  <Trash2 size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Break Tasks Down Support Card */}
      <Card variant="elevated" style={styles.supportCard}>
        <View style={styles.supportContent}>
          <View
            style={[
              styles.supportIcon,
              { backgroundColor: Colors.purple + "15" },
            ]}
          >
            <Lightbulb size={20} color={Colors.purple} />
          </View>
          <View style={styles.supportText}>
            <Text variant="body" style={styles.supportTitle}>
              Break tasks down
            </Text>
            <Text variant="caption" color={Colors.textSecondary}>
              Big tasks feel smaller when split into steps
            </Text>
          </View>
        </View>
      </Card>

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={handleAddPress}
        accessibilityLabel="Add new task"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[Colors.pink, Colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <Plus size={24} color={Colors.textInverse} />
          <Text
            variant="subheading"
            color={Colors.textInverse}
            style={styles.addButtonText}
          >
            Add Task
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Task Form Modal */}
      <TaskFormModal
        visible={isModalVisible}
        mode={modalMode}
        initialTask={selectedTask}
        onSubmit={handleModalSubmit}
        onClose={handleModalClose}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingRight: Spacing.lg,
  },
  filterPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  taskList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  taskCard: {
    padding: Spacing.md,
  },
  taskCardHigh: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.pink,
  },
  taskContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkboxHigh: {
    borderColor: Colors.pink,
    backgroundColor: Colors.pink + "10",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  recurringBadge: {
    backgroundColor: Colors.purple + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  supportCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.md,
  },
  supportContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  addButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: Radius["2xl"],
    ...Shadows.glow,
  },
  addButtonText: {
    fontWeight: "600",
  },
  errorCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.warning + "10",
    borderColor: Colors.warning + "30",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.sm,
  },
  taskNotes: {
    marginBottom: Spacing.xs,
  },
  emptyCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    alignItems: "center",
  },
  emptyTitle: {
    marginBottom: Spacing.xs,
  },
});
