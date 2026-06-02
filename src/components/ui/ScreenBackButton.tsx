import { Colors, Spacing } from "@/src/theme/tokens";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "./Text";

interface ScreenBackButtonProps {
  fallbackPath: string;
}

export function ScreenBackButton({ fallbackPath }: ScreenBackButtonProps) {
  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace({ pathname: fallbackPath as never });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityHint="Returns to the previous screen"
        activeOpacity={0.7}
      >
        <ChevronLeft size={18} color={Colors.primary} />
        <Text variant="body" color={Colors.primary} style={styles.label}>
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  button: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  label: {
    fontWeight: "600",
  },
});
