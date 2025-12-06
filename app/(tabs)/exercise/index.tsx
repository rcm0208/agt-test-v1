import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { List, Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";

import { SolidButton } from "../../../components/ui/SolidButton";
import { StructuralCard } from "../../../components/ui/StructuralCard";
import { useWorkout } from "../../../context/WorkoutContext";

export default function ExerciseListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { plans } = useWorkout();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <StructuralCard
            style={styles.card}
            onPress={() => router.push(("/workout/" + item.id) as any)}
            active // Use active style for plans to make them pop
          >
            <List.Item
              title={item.name}
              titleStyle={{
                fontWeight: "900",
                fontSize: 20,
                textTransform: "uppercase",
                color: theme.colors.onPrimary,
              }}
              description={item.exercises.length + " EXERCISES"}
              descriptionStyle={{
                opacity: 0.8,
                color: theme.colors.onPrimary,
                fontWeight: "bold",
              }}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon="arrow-right"
                  color={theme.colors.onPrimary}
                />
              )}
            />
          </StructuralCard>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text
              variant="bodyLarge"
              style={{ marginBottom: 16, fontWeight: "bold" }}
            >
              NO PLANS CREATED YET.
            </Text>
            <SolidButton onPress={() => router.push("/(tabs)/plan" as any)}>
              CREATE A PLAN
            </SolidButton>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    marginTop: 40,
  },
});
