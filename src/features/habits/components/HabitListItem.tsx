import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import { CheckCircle2, Circle, Flame, Pencil, Trash2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Habit, HabitColor } from "../types/habit";

interface HabitListItemProps {
    habit: Habit;
    isCompleted: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const colorMap: Record<HabitColor, string> = {
    blue: Colors.blue,
    green: Colors.success,
    yellow: Colors.warning,
    orange: "#F97316",
    pink: Colors.pink,
    purple: Colors.purple,
    teal: "#14B8A6",
};

export function HabitListItem({
    habit,
    isCompleted,
    onToggle,
    onEdit,
    onDelete,
}: HabitListItemProps) {
    const habitColor = colorMap[habit.color || "blue"];

    return (
        <Card
            variant={isCompleted ? "outlined" : "elevated"}
            style={[
                styles.habitCard,
                !isCompleted && { borderLeftWidth: 3, borderLeftColor: habitColor },
            ]}
        >
            <View style={styles.habitRow}>
                <TouchableOpacity
                    onPress={onToggle}
                    style={styles.habitContent}
                    activeOpacity={0.7}
                    accessibilityLabel={`${isCompleted ? "Completed" : "Pending"} habit: ${habit.title}`}
                    accessibilityRole="button"
                >
                    <View
                        style={[
                            styles.checkbox,
                            isCompleted && styles.checkboxChecked,
                            !isCompleted && { borderColor: habitColor },
                        ]}
                    >
                        {isCompleted ? (
                            <CheckCircle2 size={20} color={Colors.textInverse} />
                        ) : (
                            <Circle size={20} color={habitColor} />
                        )}
                    </View>

                    <View style={styles.habitInfo}>
                        <Text
                            variant="body"
                            style={[
                                styles.habitTitle,
                                isCompleted && styles.habitTitleCompleted,
                            ]}
                        >
                            {habit.title}
                        </Text>

                        {habit.description && (
                            <Text
                                variant="caption"
                                color={Colors.textTertiary}
                                style={styles.habitDescription}
                                numberOfLines={1}
                            >
                                {habit.description}
                            </Text>
                        )}

                        <View style={styles.habitMeta}>
                            {/* Frequency */}
                            <View style={[styles.badge, { backgroundColor: habitColor + "15" }]}>
                                <Text variant="small" color={habitColor}>
                                    {habit.frequency === "daily"
                                        ? "Daily"
                                        : habit.targetDays?.join(", ") || "Weekly"}
                                </Text>
                            </View>

                            {/* Streak */}
                            {habit.streakCount > 0 && (
                                <View style={[styles.streakBadge, { backgroundColor: Colors.warning + "15" }]}>
                                    <Flame size={12} color={Colors.warning} />
                                    <Text variant="small" color={Colors.warning}>
                                        {habit.streakCount} {habit.streakCount === 1 ? "day" : "days"}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.habitActions}>
                    <TouchableOpacity
                        onPress={onEdit}
                        style={styles.actionButton}
                        activeOpacity={0.6}
                        accessibilityLabel={`Edit habit: ${habit.title}`}
                        accessibilityRole="button"
                    >
                        <Pencil size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onDelete}
                        style={styles.actionButton}
                        activeOpacity={0.6}
                        accessibilityLabel={`Delete habit: ${habit.title}`}
                        accessibilityRole="button"
                    >
                        <Trash2 size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    habitCard: {
        padding: Spacing.md,
    },
    habitRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    habitContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        flex: 1,
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
    habitInfo: {
        flex: 1,
    },
    habitTitle: {
        fontWeight: "500",
        marginBottom: Spacing.xs,
    },
    habitTitleCompleted: {
        textDecorationLine: "line-through",
        color: Colors.textTertiary,
    },
    habitDescription: {
        marginBottom: Spacing.xs,
    },
    habitMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Radius.sm,
    },
    streakBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Radius.sm,
    },
    habitActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },
    actionButton: {
        padding: Spacing.sm,
    },
});
