import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  IconButton,
  ProgressBar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
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

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Discard workout?",
        "Are you sure you want to leave? Your progress will be lost.",
        [
          { text: "Don't leave", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setHasUnsavedChanges(false);
              // Small delay to ensure state update propagates before navigation
              setTimeout(() => router.back(), 0);
            },
          },
        ],
      );
    } else {
      router.back();
    }
  };
  const { id } = useLocalSearchParams();
  const { plans, exercises, saveWorkoutSession } = useWorkout();

  const plan = plans.find((p) => p.id === id);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionData, setSessionData] = useState<SetData[][]>([]);
  const [timerVisible, setTimerVisible] = useState(false);

  const [containerLayout, setContainerLayout] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [footerHeight, setFooterHeight] = useState(0);

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

  if (plan.exercises.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          },
        ]}
      >
        <Stack.Screen
          options={{
            title: "",
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
            gestureEnabled: false,
            headerBackButtonMenuEnabled: false,
            headerLeft: () => (
              <IconButton
                icon="arrow-left"
                size={24}
                iconColor={theme.colors.onSurface}
                onPress={() => {
                  setHasUnsavedChanges(false);
                  router.back();
                }}
                style={{
                  margin: 0,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.colors.elevation.level2,
                }}
              />
            ),
          }}
        />
        <Text
          variant="headlineMedium"
          style={{
            color: theme.colors.onSurface,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          No Exercises Found
        </Text>
        <Text
          variant="bodyLarge"
          style={{
            color: theme.colors.onSurfaceVariant,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          This plan doesn&apos;t have any exercises yet.
        </Text>
        <SolidButton
          onPress={() => {
            setHasUnsavedChanges(false);
            router.back();
          }}
        >
          Go Back
        </SolidButton>
      </View>
    );
  }

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
      onLayout={(e) =>
        setContainerLayout({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })
      }
    >
      <Stack.Screen
        options={{
          title: "",
          headerStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
          gestureEnabled: false,
          headerBackButtonMenuEnabled: false,
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor={theme.colors.onSurface}
              onPress={handleBack}
              style={{
                margin: 0,
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          ),
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
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <Timer
            initialDuration={60}
            onFinish={() => {
              setTimerVisible(false);
              player.seekTo(0);
              player.play();
            }}
            boundaries={
              containerLayout
                ? {
                    width: containerLayout.width,
                    height: containerLayout.height,
                    top: 0,
                    bottom: footerHeight, // Stop above the footer
                  }
                : undefined
            }
          />
        </View>
      )}

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
            paddingBottom: Math.max(insets.bottom, 16),
            height: undefined, // ensure height is auto
          },
        ]}
        onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
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
    paddingHorizontal: 16, // Increased from 8
    paddingVertical: 12, // Increased from 8
    justifyContent: "space-between",
  },
  setInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: 80, // Fixed width to align SET labels consistently
    marginRight: 8,
    flexShrink: 0,
  },
  setLabel: {
    fontWeight: "900",
    fontSize: 16,
  },
  inputs: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8, // Increased gap for better separation
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 22, // Slightly larger
    fontWeight: "900",
    textAlign: "center", // Center text in input
    padding: 0,
    height: 40,
  },
  x: {
    fontSize: 20,
    fontWeight: "bold",
    opacity: 0.3, // Subtle X
    marginHorizontal: 4,
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
