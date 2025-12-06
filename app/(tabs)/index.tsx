import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";

import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { SolidButton } from "../../components/ui/SolidButton";
import { StructuralCard } from "../../components/ui/StructuralCard";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title="Welcome Back"
        subtitle="Ready for your next workout?"
      />

      <View style={styles.content}>
        <StructuralCard
          style={styles.card}
          onPress={() => router.push("/(tabs)/plan")}
          active
        >
          <Text
            variant="displayMedium"
            style={[styles.cardTitle, { color: theme.colors.onPrimary }]}
          >
            START WORKOUT
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.cardSubtitle, { color: theme.colors.onPrimary }]}
          >
            PICK UP WHERE YOU LEFT OFF OR START A NEW PLAN.
          </Text>
          <SolidButton
            mode="secondary"
            onPress={() => router.push("/(tabs)/plan")}
            style={styles.button}
          >
            GO TO PLANS
          </SolidButton>
        </StructuralCard>

        <StructuralCard
          style={styles.card}
          onPress={() => router.push("/(tabs)/history")}
        >
          <Text variant="headlineMedium" style={styles.cardTitle}>
            RECENT ACTIVITY
          </Text>
          <Text variant="bodyLarge" style={styles.cardSubtitle}>
            CHECK YOUR PROGRESS AND HISTORY.
          </Text>
          <SolidButton
            mode="outline"
            onPress={() => router.push("/(tabs)/history")}
            style={styles.button}
          >
            VIEW HISTORY
          </SolidButton>
        </StructuralCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  card: {
    marginBottom: 0,
  },
  cardTitle: {
    fontWeight: "900",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  cardSubtitle: {
    marginBottom: 24,
    opacity: 1,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  button: {
    width: "100%",
  },
});
