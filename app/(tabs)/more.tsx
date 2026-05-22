import { MoreMenuCard } from "@/src/components/navigation";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { Colors, Spacing } from "@/src/theme/tokens";
import { router } from "expo-router";
import {
  CreditCard,
  Dumbbell,
  Home,
  Info,
  Scale,
  Settings,
  Utensils,
  Wallet,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

export default function MoreScreen() {
  const menuSections = [
    {
      title: "Finance",
      items: [
        {
          title: "Budget",
          icon: (Wallet as any)({ size: 20, color: Colors.textPrimary }),
          route: "/more/budget",
        },
        {
          title: "Payments",
          icon: (CreditCard as any)({ size: 20, color: Colors.textPrimary }),
          route: "/more/payments",
        },
      ],
    },
    {
      title: "Lifestyle",
      items: [
        {
          title: "Meals",
          icon: (Utensils as any)({ size: 20, color: Colors.textPrimary }),
          route: "/more/meals",
        },
        {
          title: "Cleaning",
          icon: (Home as any)({ size: 20, color: Colors.textPrimary }),
          route: "/more/cleaning",
        },
      ],
    },
    {
      title: "Health",
      items: [
        {
          title: "Habits",
          icon: (Dumbbell as any)({ size: 20, color: Colors.textPrimary }),
          route: "/more/habits",
        },
        {
          title: "Weight",
          icon: (Scale as any)({ size: 20, color: Colors.textPrimary }),
          route: "/more/weight",
        },
      ],
    },
    {
      title: "General",
      items: [
        {
          title: "Settings",
          icon: (Settings as any)({ size: 20, color: Colors.textPrimary }),
          route: "/more/settings",
        },
        {
          title: "About",
          icon: (Info as any)({ size: 20, color: Colors.textPrimary }),
          route: "/more/about",
        },
      ],
    },
  ];

  return (
    <Screen scrollable padded>
      <SectionHeader title="More" subtitle="Additional Features" />

      {menuSections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text
            variant="label"
            color={Colors.textSecondary}
            style={styles.sectionTitle}
          >
            {section.title}
          </Text>
          <View style={styles.sectionItems}>
            {section.items.map((item, itemIndex) => (
              <MoreMenuCard
                key={itemIndex}
                title={item.title}
                icon={item.icon}
                onPress={() => router.push(item.route as any)}
              />
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionItems: {
    gap: Spacing.sm,
  },
});
