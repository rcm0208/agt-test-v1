import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  IconButton,
  ProgressBar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import {
  Stack,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { usePreventRemove } from "@react-navigation/native";

import { Timer } from "../../components/Timer";
import { SolidButton } from "../../components/ui/SolidButton";
import { useWorkout } from "../../context/WorkoutContext";

type SetData = {
  weight: string;
  reps: string;
  completed: boolean;
};

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(true);

  usePreventRemove(hasUnsavedChanges, ({ data }) => {
    Alert.alert(
      "Discard workout?",
      "Are you sure you want to leave? Your progress will be lost.",
      [
        { text: "Don't leave", style: "cancel", onPress: () => {} },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => navigation.dispatch(data.action),
        },
      ],
    );
  });
  const { id } = useLocalSearchParams();
  const { plans, exercises, saveWorkoutSession } = useWorkout();

  const plan = plans.find((p) => p.id === id);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionData, setSessionData] = useState<SetData[][]>([]);
  const [timerVisible, setTimerVisible] = useState(false);

  // Setup Audio Player
  const player = useAudioPlayer(
    "https://www.soundjay.com/buttons/sounds/button-3.mp3",
  );

  useEffect(() => {
    // Configure audio mode to play even if silent switch is on (iOS)
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldPlayInBackground: true,
    });
  }, []);

  useEffect(() => {
    if (!plan) {
      Alert.alert("Error", "Plan not found");
      router.back();
      return;
    }

    // Initialize session data
    const initialData = plan.exercises.map((ex) =>
      Array(ex.targetSets).fill({ weight: "", reps: "", completed: false }),
    );
    setSessionData(initialData);
  }, [plan, router]);

  if (!plan) return null;

  const currentExercise = plan.exercises[currentExerciseIndex];
  const currentExerciseName =
    exercises.find((e) => e.id === currentExercise.exerciseId)?.name ||
    "Unknown Exercise";
  const currentSets = sessionData[currentExerciseIndex] || [];

  const updateSet = (
    setIndex: number,
    field: keyof SetData,
    value: string | boolean,
  ) => {
    const newSessionData = [...sessionData];
    newSessionData[currentExerciseIndex][setIndex] = {
      ...newSessionData[currentExerciseIndex][setIndex],
      [field]: value,
    };
    setSessionData(newSessionData);

    if (field === "completed" && value === true) {
      setTimerVisible(true);
    }
  };

  const addSet = () => {
    const newSessionData = [...sessionData];
    newSessionData[currentExerciseIndex].push({
      weight: "",
      reps: "",
      completed: false,
    });
    setSessionData(newSessionData);
  };

  const deleteSet = (setIndex: number) => {
    const newSessionData = [...sessionData];
    newSessionData[currentExerciseIndex].splice(setIndex, 1);
    setSessionData(newSessionData);
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < plan.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      handleFinishWorkout();
    }
  };

  const handleFinishWorkout = () => {
    const completedExercises = sessionData
      .map((exerciseSets, exIndex) => {
        const exerciseId = plan.exercises[exIndex].exerciseId;
        const exerciseName =
          exercises.find((e) => e.id === exerciseId)?.name ||
          "Unknown Exercise";

        const validSets = exerciseSets
          .filter(
            (set) =>
              set.completed &&
              (parseFloat(set.weight) > 0 || parseInt(set.reps) > 0),
          )
          .map((set) => ({
            id: Date.now().toString() + Math.random().toString(),
            weight: parseFloat(set.weight) || 0,
            reps: parseInt(set.reps) || 0,
            completedAt: Date.now(),
          }));

        return {
          exerciseId,
          exerciseName,
          sets: validSets,
        };
      })
      .filter((ex) => ex.sets.length > 0);

    if (completedExercises.length > 0) {
      saveWorkoutSession({
        id: Date.now().toString(),
        planId: plan.id,
        planName: plan.name,
        date: Date.now(),
        exercises: completedExercises,
      });
    }

    Alert.alert("Workout Completed", "Great job!", [
      {
        text: "OK",
        onPress: () => {
          setHasUnsavedChanges(false);
          router.replace("/(tabs)/history");
        },
      },
    ]);
  };

  const progress = (currentExerciseIndex + 1) / plan.exercises.length;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen
        options={{
          title: "",
          headerStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
          gestureEnabled: false,
          headerBackButtonMenuEnabled: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text
            variant="labelLarge"
            style={{
              color: theme.colors.primary,
              fontWeight: "900",
              letterSpacing: 1,
            }}
          >
            {plan.name.toUpperCase()}
          </Text>
          <Text
            variant="labelLarge"
            style={{ color: theme.colors.primary, fontWeight: "900" }}
          >
            {currentExerciseIndex + 1}/{plan.exercises.length}
          </Text>
        </View>
        <ProgressBar
          progress={progress}
          style={styles.progressBar}
          color={theme.colors.primary}
        />

        <Text
          variant="displayMedium"
          style={[styles.exerciseTitle, { color: theme.colors.onSurface }]}
        >
          {currentExerciseName.toUpperCase()}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentSets.map((set, index) => {
          const isSetCompleted = set.completed;
          const canComplete = set.weight.length > 0 && set.reps.length > 0;

          // Determine if this is the "active" set (first incomplete set)
          const isFirstIncomplete =
            !isSetCompleted &&
            currentSets.slice(0, index).every((s) => s.completed);

          // Check if previous set is completed (or if it's the first set)
          const isPreviousSetCompleted =
            index === 0 || currentSets[index - 1].completed;
          const isEditable = !isSetCompleted && isPreviousSetCompleted;

          return (
            <View
              key={index}
              style={[
                styles.setRowContainer,
                {
                  backgroundColor: isFirstIncomplete
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderColor: theme.colors.outline,
                  borderWidth: 2,
                  opacity: isEditable || isSetCompleted ? 1 : 0.5, // Dim disabled sets
                },
              ]}
            >
              <View style={styles.setRowContent}>
                <View style={styles.setInfo}>
                  {!isSetCompleted && (
                    <IconButton
                      icon="trash-can-outline"
                      size={20}
                      iconColor={theme.colors.error}
                      style={{ margin: 0, marginRight: 4 }}
                      onPress={() => {
                        Alert.alert(
                          "Delete Set",
                          "Are you sure you want to delete this set?",
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () => deleteSet(index),
                            },
                          ],
                        );
                      }}
                    />
                  )}
                  <Text
                    style={[
                      styles.setLabel,
                      {
                        color: isFirstIncomplete
                          ? theme.colors.onPrimary
                          : theme.colors.onSurface,
                      },
                    ]}
                  >
                    SET {index + 1}
                  </Text>
                </View>

                <View style={styles.inputs}>
                  <TextInput
                    placeholder="KG"
                    placeholderTextColor={
                      isFirstIncomplete ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)"
                    }
                    value={set.weight}
                    onChangeText={(text) => updateSet(index, "weight", text)}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      {
                        width: 100,
                        fontSize: 18,
                        color: isFirstIncomplete
                          ? theme.colors.onPrimary
                          : theme.colors.onSurface,
                      },
                    ]}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    selectionColor={
                      isFirstIncomplete
                        ? theme.colors.onPrimary
                        : theme.colors.onSurface
                    }
                    cursorColor={
                      isFirstIncomplete
                        ? theme.colors.onPrimary
                        : theme.colors.onSurface
                    }
                    editable={isEditable}
                    maxLength={6}
                  />
                  <Text
                    style={[
                      styles.x,
                      {
                        color: isFirstIncomplete
                          ? theme.colors.onPrimary
                          : theme.colors.onSurface,
                      },
                    ]}
                  >
                    X
                  </Text>
                  <TextInput
                    placeholder="REPS"
                    placeholderTextColor={
                      isFirstIncomplete ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)"
                    }
                    value={set.reps}
                    onChangeText={(text) => updateSet(index, "reps", text)}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      {
                        width: 85,
                        fontSize: 18,
                        color: isFirstIncomplete
                          ? theme.colors.onPrimary
                          : theme.colors.onSurface,
                      },
                    ]}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    selectionColor={
                      isFirstIncomplete
                        ? theme.colors.onPrimary
                        : theme.colors.onSurface
                    }
                    cursorColor={
                      isFirstIncomplete
                        ? theme.colors.onPrimary
                        : theme.colors.onSurface
                    }
                    editable={isEditable}
                    maxLength={3}
                  />
                </View>

                <IconButton
                  icon={isSetCompleted ? "check" : "arrow-right"}
                  iconColor={
                    isFirstIncomplete
                      ? theme.colors.onPrimary
                      : theme.colors.onSurface
                  }
                  size={32}
                  style={{ margin: 0 }}
                  onPress={() => {
                    if (!isSetCompleted && canComplete) {
                      updateSet(index, "completed", true);
                    } else if (isSetCompleted) {
                      updateSet(index, "completed", false);
                    }
                  }}
                  disabled={!isSetCompleted && !canComplete}
                />
              </View>
            </View>
          );
        })}
        <SolidButton
          mode="outline"
          onPress={addSet}
          style={styles.addSetButton}
        >
          ADD SET
        </SolidButton>
      </ScrollView>

      {timerVisible && (
        <Animated.View
          entering={SlideInDown.damping(15)}
          exiting={SlideOutDown}
          style={[
            styles.timerContainer,
            {
              backgroundColor: theme.colors.primary,
              bottom: 80 + insets.bottom,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <Timer
            initialDuration={60}
            onFinish={() => {
              setTimerVisible(false);
              player.seekTo(0);
              player.play();
            }}
          />
        </Animated.View>
      )}

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
          },
        ]}
      >
        {currentExerciseIndex > 0 && (
          <SolidButton
            mode="outline"
            onPress={handlePreviousExercise}
            style={styles.button}
          >
            PREV
          </SolidButton>
        )}
        <View style={{ flex: 1 }}>
          <SolidButton onPress={handleNextExercise}>
            {currentExerciseIndex < plan.exercises.length - 1
              ? "NEXT EXERCISE"
              : "FINISH WORKOUT"}
          </SolidButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    marginBottom: 16,
  },
  exerciseTitle: {
    fontWeight: "900",
    lineHeight: 48,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  setRowContainer: {
    marginBottom: 16,
    borderRadius: 0, // Sharp
  },
  setRowContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8, // Reduced padding
    justifyContent: "space-between",
  },
  setInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8, // Increased spacing between SET label and inputs
    flexShrink: 0,
  },
  setLabel: {
    fontWeight: "900",
    fontSize: 16, // Slightly smaller
  },
  inputs: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 1, // Minimal gap to reduce spacing between KG and X
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "left",
    padding: 0,
    height: 40,
  },
  x: {
    fontSize: 20,
    fontWeight: "bold",
    opacity: 0.5,
  },
  timerContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    padding: 20,
    borderRadius: 0,
    borderWidth: 2,
    elevation: 0,
  },
  footer: {
    padding: 16,
    borderTopWidth: 2,
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
  },
  addSetButton: {
    marginTop: 8,
  },
});
