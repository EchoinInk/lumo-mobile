/**
 * FocusSelectionCard Component
 *
 * Card for selecting focus areas during onboarding.
 * Calm, spacious selection interface with soft feedback.
 */

import { selectionHaptic } from "@/animations/haptics";
import { ScalePress } from "@/components/animated/ScalePress";
import { Colors } from "@/theme/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface FocusSelectionCardProps {
  id: string;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: (id: string) => void;
  multiSelect?: boolean;
}

export const FocusSelectionCard: React.FC<FocusSelectionCardProps> = ({
  id,
  label,
  description,
  selected,
  onSelect,
  multiSelect = false,
}) => {
  const handlePress = () => {
    selectionHaptic();
    onSelect(id);
  };

  return (
    <ScalePress onPress={handlePress} hapticFeedback={false}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: selected ? Colors.primarySoft : Colors.card,
            borderColor: selected ? Colors.primary : Colors.border,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: Colors.textPrimary,
                  fontWeight: selected ? "600" : "400",
                },
              ]}
            >
              {label}
            </Text>
            {description && (
              <Text
                style={[
                  styles.description,
                  {
                    color: Colors.textSecondary,
                  },
                ]}
              >
                {description}
              </Text>
            )}
          </View>
          {selected && (
            <View
              style={[
                styles.checkmark,
                {
                  backgroundColor: Colors.primary,
                  borderColor: Colors.primary,
                },
              ]}
            >
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </View>
      </View>
    </ScalePress>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    minHeight: 72,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
