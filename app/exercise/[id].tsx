import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Divider, List, Text, useTheme } from "react-native-paper";
import { Stack, useLocalSearchParams } from "expo-router";

import { useWorkout } from "../../context/WorkoutContext";

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams();
  const exerciseId = Array.isArray(id) ? id[0] : id;

  const { getSets, exercises } = useWorkout();
  const exercise = exercises.find((e) => e.id === exerciseId);
  const sets = getSets(exerciseId);
  const theme = useTheme();

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text>Exercise not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ title: exercise.name }} />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.historyContainer}>
          <Text variant="titleMedium" style={styles.historyTitle}>
            History
          </Text>
          {sets.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              No sets recorded yet.
            </Text>
          ) : (
            sets
              .slice()
              .reverse()
              .map((set, index) => (
                <View key={set.id}>
                  <List.Item
                    title={`${set.weight} kg x ${set.reps} reps`}
                    description={new Date(set.completedAt).toLocaleTimeString()}
                    left={(props) => <List.Icon {...props} icon="dumbbell" />}
                  />
                  <Divider />
                </View>
              ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    flex: 1,
  },
  button: {
    marginTop: 8,
  },
  historyContainer: {
    marginTop: 16,
  },
  historyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    fontStyle: "italic",
  },
});
