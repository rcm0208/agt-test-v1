import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Divider, List, Text, TextInput, useTheme } from "react-native-paper";
import { Stack, useRouter } from "expo-router";

import { usePlanSelection } from "../../context/PlanSelectionContext";
import { useWorkout } from "../../context/WorkoutContext";

export default function PlanExerciseSelectScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { exercises } = useWorkout();
  const { setPendingExerciseId } = usePlanSelection();
  const [query, setQuery] = useState("");

  const filteredExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return exercises;
    return exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(normalizedQuery),
    );
  }, [exercises, query]);

  const handleSelect = (exerciseId: string) => {
    setPendingExerciseId(exerciseId);
    router.back();
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "Select Exercise" }} />
      <TextInput
        label="Search exercises"
        value={query}
        onChangeText={setQuery}
        mode="outlined"
        style={styles.searchInput}
        autoFocus
      />

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            onPress={() => handleSelect(item.id)}
            right={(props) => <List.Icon {...props} icon="plus" />}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              No exercises found
            </Text>
          </View>
        }
        ItemSeparatorComponent={Divider}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    marginBottom: 12,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
});
