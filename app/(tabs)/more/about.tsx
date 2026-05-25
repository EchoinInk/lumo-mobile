import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { Colors, Spacing } from "@/src/theme/tokens";
import { router } from "expo-router";
import { ArrowLeft, Heart, Sparkles } from "lucide-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const appInfo = [
  { label: "Version", value: "1.0.0" },
  { label: "Build", value: "2024.5.26" },
  { label: "Platform", value: "React Native / Expo" },
];

export default function AboutScreen() {
  return (
    <Screen scrollable padded>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <SectionHeader title="About Lumo" subtitle="App Information" />
      </View>

      {/* App Info Cards */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <Card variant="gradient" style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Sparkles size={32} color={Colors.textInverse} />
            <Text
              variant="title"
              color={Colors.textInverse}
              style={styles.welcomeTitle}
            >
              Welcome to Lumo
            </Text>
            <Text
              variant="body"
              color={Colors.textInverse}
              style={styles.welcomeText}
            >
              Your gentle companion for a calmer, more organized life. Built
              with love for the neurodivergent community.
            </Text>
          </View>
        </Card>

        {/* Info List */}
        <Card variant="elevated" style={styles.infoCard}>
          {appInfo.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.infoRow,
                index < appInfo.length - 1 && styles.infoRowBorder,
              ]}
            >
              <Text variant="body" color={Colors.textSecondary}>
                {item.label}
              </Text>
              <Text variant="body" style={styles.infoValue}>
                {item.value}
              </Text>
            </View>
          ))}
        </Card>

        {/* Made with Love */}
        <View style={styles.madeWithLove}>
          <Heart size={16} color={Colors.pink} />
          <Text variant="caption" color={Colors.textSecondary}>
            Made with care for you
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  welcomeCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  welcomeContent: {
    alignItems: "center",
  },
  welcomeTitle: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    textAlign: "center",
  },
  infoCard: {
    padding: 0,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoValue: {
    fontWeight: "500",
  },
  madeWithLove: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
});
