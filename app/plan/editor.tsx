import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import {
  Button,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { usePlanSelection } from "../../context/PlanSelectionContext";
import { useWorkout } from "../../context/WorkoutContext";
import { Plan, PlanExercise } from "../../types";

export default function PlanEditorScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const { plans, addPlan, updatePlan, exercises } = useWorkout();
  const { pendingExerciseId, setPendingExerciseId } = usePlanSelection();

  const isEditing = !!id;
  const existingPlan = isEditing ? plans.find((p) => p.id === id) : undefined;

  const [name, setName] = useState(existingPlan?.name || "");
  const [planExercises, setPlanExercises] = useState<PlanExercise[]>(
    existingPlan?.exercises || [],
  );

  // Use a ref to store the latest exercises to avoid race conditions when saving immediately after reordering
  const planExercisesRef = useRef(planExercises);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    planExercisesRef.current = planExercises;
  }, [planExercises]);

  useEffect(() => {
    if (isEditing && !existingPlan) {
      Alert.alert("Error", "Plan not found");
      router.back();
    }
  }, [isEditing, existingPlan, router]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a plan name");
      return;
    }

    // Use the ref to get the most up-to-date exercises
    const currentExercises = planExercisesRef.current;

    // Filter out exercises with 0 sets
    const validExercises = currentExercises.filter((e) => e.targetSets > 0);

    const planData: Plan = {
      id: existingPlan?.id || Date.now().toString(),
      name: name.trim(),
      exercises: validExercises,
    };

    if (isEditing) {
      updatePlan(planData);
    } else {
      addPlan(planData);
    }
    router.back();
  };

  useFocusEffect(
    useCallback(() => {
      if (!pendingExerciseId) return;
      setPlanExercises((current) => {
        const updatedExercises = [
          ...current,
          { exerciseId: pendingExerciseId, targetSets: 3 },
        ];
        planExercisesRef.current = updatedExercises;
        return updatedExercises;
      });
      setPendingExerciseId(undefined);
    }, [pendingExerciseId, setPendingExerciseId]),
  );

  const openExerciseSelection = () => {
    router.push("/plan/select-exercise");
  };

  const updateSets = (index: number, sets: string) => {
    const newExercises = [...planExercises];
    // If empty string, set to 0, but we will handle the display to show empty string
    newExercises[index].targetSets = sets === "" ? 0 : parseInt(sets) || 0;
    setPlanExercises(newExercises);
  };

  const removeExercise = (index: number) => {
    const newExercises = [...planExercises];
    newExercises.splice(index, 1);
    setPlanExercises(newExercises);
  };

  const getExerciseName = (id: string) => {
    return exercises.find((e) => e.id === id)?.name || "Unknown Exercise";
  };

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<PlanExercise>) => {
    const index = getIndex();
    if (index === undefined) return null;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.exerciseRow,
            {
              backgroundColor: isActive
                ? theme.colors.elevation.level3
                : theme.colors.surface,
            },
          ]}
        >
          <IconButton icon="drag" />
          <View style={styles.exerciseInfo}>
            <Text variant="bodyLarge">{getExerciseName(item.exerciseId)}</Text>
            <View style={styles.setsContainer}>
              <Text>Sets: </Text>
              <TextInput
                value={item.targetSets === 0 ? "" : item.targetSets.toString()}
                onChangeText={(text) => updateSets(index, text)}
                keyboardType="numeric"
                mode="outlined"
                dense
                style={styles.setsInput}
              />
            </View>
          </View>
          <IconButton icon="delete" onPress={() => removeExercise(index)} />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen
        options={{ title: isEditing ? "Edit Plan" : "Create Plan" }}
      />

      <DraggableFlatList
        data={planExercises}
        onDragBegin={() => setIsDragging(true)}
        onDragEnd={({ data }) => {
          setPlanExercises(data);
          planExercisesRef.current = data;
          setIsDragging(false);
        }}
        keyExtractor={(item, index) => `${item.exerciseId}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View>
            <TextInput
              label="Plan Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Exercises (Long press to reorder)
            </Text>
          </View>
        }
        ListFooterComponent={
          <Button
            mode="outlined"
            onPress={openExerciseSelection}
            style={styles.addButton}
          >
            Add Exercise
          </Button>
        }
      />

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          disabled={isDragging}
        >
          Save Plan
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  input: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  setsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  setsInput: {
    width: 60,
    height: 40,
  },
  addButton: {
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "transparent", // Or theme surface
  },
  saveButton: {
    width: "100%",
  },
});
