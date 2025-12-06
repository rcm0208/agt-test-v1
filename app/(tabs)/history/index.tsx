import React, { useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import {
  Card,
  Divider,
  IconButton,
  SegmentedButtons,
  Text,
  useTheme,
} from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";

import { useWorkout } from "../../../context/WorkoutContext";
import { WorkoutSession } from "../../../types";

export default function HistoryScreen() {
  const theme = useTheme();
  const { workoutSessions, deleteWorkoutSession } = useWorkout();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState("plan"); // 'plan' | 'exercise'

  // Sort sessions by date (newest first)
  const sortedSessions = useMemo(
    () => [...workoutSessions].sort((a, b) => b.date - a.date),
    [workoutSessions],
  );

  // Derive exercise history
  const exerciseHistory = useMemo(() => {
    const history: Record<
      string,
      { name: string; sets: { date: number; weight: number; reps: number }[] }
    > = {};

    workoutSessions.forEach((session) => {
      session.exercises.forEach((ex) => {
        if (!history[ex.exerciseId]) {
          history[ex.exerciseId] = { name: ex.exerciseName, sets: [] };
        }
        ex.sets.forEach((set) => {
          history[ex.exerciseId].sets.push({
            date: session.date,
            weight: set.weight,
            reps: set.reps,
          });
        });
      });
    });

    // Sort sets by date (newest first) for each exercise
    Object.values(history).forEach((ex) => {
      ex.sets.sort((a, b) => b.date - a.date);
    });

    // Convert to array and sort by name
    return Object.entries(history)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [workoutSessions]);

  const toggleExpand = (id: string) => {
    const newExpandedIds = new Set(expandedIds);
    if (newExpandedIds.has(id)) {
      newExpandedIds.delete(id);
    } else {
      newExpandedIds.add(id);
    }
    setExpandedIds(newExpandedIds);
  };

  const handleDelete = (sessionId: string) => {
    Alert.alert(
      "Delete History",
      "Are you sure you want to delete this workout history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteWorkoutSession(sessionId),
        },
      ],
    );
  };

  const renderPlanItem = ({ item }: { item: WorkoutSession }) => {
    const date = new Date(item.date);
    const formattedDate =
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const isExpanded = expandedIds.has(item.id);

    return (
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        mode="outlined"
        onLongPress={() => handleDelete(item.id)}
        onPress={() => toggleExpand(item.id)}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "bold", color: theme.colors.onSurface }}
              >
                {item.planName}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {formattedDate}
              </Text>
            </View>
            <IconButton
              icon={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              onPress={() => toggleExpand(item.id)}
            />
          </View>

          {!isExpanded && (
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
            >
              {item.exercises.length} Exercises
            </Text>
          )}

          {isExpanded && (
            <Animated.View entering={FadeIn.duration(200)}>
              <Divider style={{ marginVertical: 12 }} />
              {item.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseContainer}>
                  <Text
                    variant="titleSmall"
                    style={{
                      color: theme.colors.primary,
                      fontWeight: "bold",
                      marginBottom: 4,
                    }}
                  >
                    {exercise.exerciseName}
                  </Text>
                  {exercise.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.setRow}>
                      <Text
                        style={{
                          color: theme.colors.onSurfaceVariant,
                          width: 50,
                          fontSize: 12,
                        }}
                      >
                        SET {setIndex + 1}
                      </Text>
                      <Text
                        style={{
                          color: theme.colors.onSurface,
                          fontWeight: "bold",
                          fontSize: 14,
                        }}
                      >
                        {set.weight} KG x {set.reps} REPS
                      </Text>
                    </View>
                  ))}
                  {index < item.exercises.length - 1 && (
                    <View style={{ height: 8 }} />
                  )}
                </View>
              ))}
            </Animated.View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderExerciseItem = ({
    item,
  }: {
    item: {
      id: string;
      name: string;
      sets: { date: number; weight: number; reps: number }[];
    };
  }) => {
    const isExpanded = expandedIds.has(item.id);

    return (
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        mode="outlined"
        onPress={() => toggleExpand(item.id)}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "bold", color: theme.colors.onSurface }}
            >
              {item.name}
            </Text>
            <IconButton
              icon={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              onPress={() => toggleExpand(item.id)}
            />
          </View>

          {!isExpanded && (
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
            >
              {item.sets.length} Sets Recorded
            </Text>
          )}

          {isExpanded && (
            <Animated.View entering={FadeIn.duration(200)}>
              <Divider style={{ marginVertical: 12 }} />
              {item.sets.map((set, index) => {
                const date = new Date(set.date);
                const formattedDate = date.toLocaleDateString();
                return (
                  <View
                    key={index}
                    style={[
                      styles.setRow,
                      { justifyContent: "space-between", marginBottom: 8 },
                    ]}
                  >
                    <Text
                      style={{
                        color: theme.colors.onSurfaceVariant,
                        fontSize: 12,
                      }}
                    >
                      {formattedDate}
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.onSurface,
                        fontWeight: "bold",
                        fontSize: 14,
                      }}
                    >
                      {set.weight} KG x {set.reps} REPS
                    </Text>
                  </View>
                );
              })}
            </Animated.View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.toggleContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            {
              value: "plan",
              label: "Plan",
            },
            {
              value: "exercise",
              label: "Exercises",
            },
          ]}
        />
      </View>

      {viewMode === "plan" ? (
        <FlatList
          data={sortedSessions}
          renderItem={renderPlanItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text
                variant="bodyLarge"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                No workout history yet.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={exerciseHistory}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text
                variant="bodyLarge"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                No exercise history yet.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 48,
  },
  exerciseContainer: {
    marginBottom: 8,
  },
  setRow: {
    flexDirection: "row",
    marginBottom: 2,
    alignItems: "center",
  },
});
