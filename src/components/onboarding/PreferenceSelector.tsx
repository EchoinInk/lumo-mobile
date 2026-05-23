/**
 * PreferenceSelector Component
 *
 * Selector for planning preferences during onboarding.
 * Single-select interface with clear visual feedback.
 */

import { selectionHaptic } from "@/animations/haptics";
import { ScalePress } from "@/components/animated/ScalePress";
import { Colors } from "@/theme/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface PreferenceOption {
  id: string;
  label: string;
  description?: string;
}

interface PreferenceSelectorProps {
  options: PreferenceOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const PreferenceSelector: React.FC<PreferenceSelectorProps> = ({
  options,
  selectedId,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.id === selectedId;

        return (
          <ScalePress
            key={option.id}
            onPress={() => {
              selectionHaptic();
              onSelect(option.id);
            }}
            hapticFeedback={false}
          >
            <View
              style={[
                styles.option,
                {
                  backgroundColor: isSelected
                    ? Colors.primarySoft
                    : Colors.card,
                  borderColor: isSelected ? Colors.primary : Colors.border,
                },
              ]}
            >
              <View style={styles.content}>
                <View
                  style={[
                    styles.radioButton,
                    {
                      borderColor: isSelected ? Colors.primary : Colors.border,
                      backgroundColor: isSelected
                        ? Colors.primary
                        : "transparent",
                    },
                  ]}
                >
                  {isSelected && <View style={styles.radioButtonInner} />}
                </View>
                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.label,
                      {
                        color: Colors.textPrimary,
                        fontWeight: isSelected ? "600" : "400",
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.description && (
                    <Text
                      style={[
                        styles.description,
                        {
                          color: Colors.textSecondary,
                        },
                      ]}
                    >
                      {option.description}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </ScalePress>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  option: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    minHeight: 72,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
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
});
