import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { Text } from "@/src/components/ui/Text";
import { MoreScreenHeader } from "@/src/features/more/components";
import { useOnboarding } from "@/src/features/onboarding/hooks/useOnboarding";
import { Colors, Spacing } from "@/src/theme/tokens";
import { router } from "expo-router";
import {
    Bell,
    ChevronRight,
    Moon,
    RefreshCw,
    Shield,
    User,
} from "lucide-react-native";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";

type SettingsItem = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  hasToggle?: boolean;
};

type SettingsSection = {
  title: string;
  items: SettingsItem[];
};

const settingsSections: SettingsSection[] = [
  {
    title: "Account",
    items: [
      {
        icon: <User size={20} color={Colors.primary} />,
        label: "Profile",
        value: "Edit",
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      {
        icon: <Bell size={20} color={Colors.warning} />,
        label: "Notifications",
        hasToggle: true,
      },
      {
        icon: <Moon size={20} color={Colors.purple} />,
        label: "Dark Mode",
        hasToggle: true,
      },
    ],
  },
  {
    title: "Privacy",
    items: [
      {
        icon: <Shield size={20} color={Colors.success} />,
        label: "Privacy Settings",
        value: "",
      },
    ],
  },
  {
    title: "Testing",
    items: [
      {
        icon: <RefreshCw size={20} color={Colors.warning} />,
        label: "Reset Onboarding",
        value: "",
      },
    ],
  },
];

export default function SettingsScreen() {
  const { resetOnboarding } = useOnboarding();

  const handleResetOnboarding = () => {
    Alert.alert(
      "Reset Onboarding",
      "This will reset your onboarding preferences and show the onboarding flow again. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetOnboarding();
            router.replace("/onboarding");
          },
        },
      ],
    );
  };

  const handleSettingPress = (label: string) => {
    if (label === "Reset Onboarding") {
      handleResetOnboarding();
    }
  };

  return (
    <Screen scrollable padded>
      <MoreScreenHeader title="Settings" subtitle="App Preferences" />

      {/* Settings Sections */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text
              variant="caption"
              color={Colors.textSecondary}
              style={styles.sectionTitle}
            >
              {section.title}
            </Text>
            <Card variant="elevated" style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 &&
                      styles.settingItemBorder,
                  ]}
                  activeOpacity={item.hasToggle ? 1 : 0.7}
                  onPress={() => handleSettingPress(item.label)}
                >
                  <View style={styles.settingIcon}>{item.icon}</View>
                  <Text variant="body" style={styles.settingLabel}>
                    {item.label}
                  </Text>
                  {item.hasToggle ? (
                    <Switch value={true} onValueChange={() => {}} />
                  ) : (
                    <View style={styles.settingValue}>
                      <Text variant="caption" color={Colors.textSecondary}>
                        {item.value}
                      </Text>
                      <ChevronRight size={18} color={Colors.textTertiary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCard: {
    padding: 0,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: {
    marginRight: Spacing.md,
  },
  settingLabel: {
    flex: 1,
    fontWeight: "500",
  },
  settingValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
});
