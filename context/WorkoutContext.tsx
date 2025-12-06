import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { INITIAL_EXERCISES } from "../data/exercises";
import { Exercise, Plan, Set, WorkoutSession } from "../types";

interface WorkoutContextType {
  history: Record<string, Set[]>; // exerciseId -> sets
  workoutSessions: WorkoutSession[];
  exercises: Exercise[];
  plans: Plan[];
  addSet: (exerciseId: string, set: Set) => void;
  getSets: (exerciseId: string) => Set[];
  addExercise: (name: string) => void;
  addPlan: (plan: Plan) => void;
  updatePlan: (plan: Plan) => void;
  deletePlan: (planId: string) => void;
  addHistory: (set: Set & { exerciseId: string }) => void;
  saveWorkoutSession: (session: WorkoutSession) => void;
  deleteWorkoutSession: (sessionId: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [history, setHistory] = useState<Record<string, Set[]>>({});
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const historyJson = await AsyncStorage.getItem("@workout_history");
      if (historyJson != null) {
        setHistory(JSON.parse(historyJson));
      }

      const sessionsJson = await AsyncStorage.getItem("@workout_sessions");
      if (sessionsJson != null) {
        setWorkoutSessions(JSON.parse(sessionsJson));
      }

      const exercisesJson = await AsyncStorage.getItem("@exercises");
      if (exercisesJson != null) {
        setExercises(JSON.parse(exercisesJson));
      }

      const plansJson = await AsyncStorage.getItem("@plans");
      if (plansJson != null) {
        setPlans(JSON.parse(plansJson));
      }
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  const saveHistory = async (newHistory: Record<string, Set[]>) => {
    try {
      const jsonValue = JSON.stringify(newHistory);
      await AsyncStorage.setItem("@workout_history", jsonValue);
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const persistWorkoutSessions = async (newSessions: WorkoutSession[]) => {
    try {
      const jsonValue = JSON.stringify(newSessions);
      await AsyncStorage.setItem("@workout_sessions", jsonValue);
    } catch (e) {
      console.error("Failed to save workout sessions", e);
    }
  };

  const saveExercises = async (newExercises: Exercise[]) => {
    try {
      const jsonValue = JSON.stringify(newExercises);
      await AsyncStorage.setItem("@exercises", jsonValue);
    } catch (e) {
      console.error("Failed to save exercises", e);
    }
  };

  const savePlans = async (newPlans: Plan[]) => {
    try {
      const jsonValue = JSON.stringify(newPlans);
      await AsyncStorage.setItem("@plans", jsonValue);
    } catch (e) {
      console.error("Failed to save plans", e);
    }
  };

  const addSet = (exerciseId: string, set: Set) => {
    const newHistory = { ...history };
    if (!newHistory[exerciseId]) {
      newHistory[exerciseId] = [];
    }
    newHistory[exerciseId] = [...newHistory[exerciseId], set];
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const getSets = (exerciseId: string) => {
    return history[exerciseId] || [];
  };

  const addExercise = (name: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name,
    };
    const newExercises = [...exercises, newExercise];
    setExercises(newExercises);
    saveExercises(newExercises);
  };

  const addPlan = (plan: Plan) => {
    const newPlans = [...plans, plan];
    setPlans(newPlans);
    savePlans(newPlans);
  };

  const updatePlan = (updatedPlan: Plan) => {
    const newPlans = plans.map((p) =>
      p.id === updatedPlan.id ? updatedPlan : p,
    );
    setPlans(newPlans);
    savePlans(newPlans);
  };

  const deletePlan = (planId: string) => {
    const newPlans = plans.filter((p) => p.id !== planId);
    setPlans(newPlans);
    savePlans(newPlans);
  };

  const addHistory = (data: Set & { exerciseId: string }) => {
    const { exerciseId, ...set } = data;
    addSet(exerciseId, set);
  };

  const saveWorkoutSession = (session: WorkoutSession) => {
    const newSessions = [session, ...workoutSessions];
    setWorkoutSessions(newSessions);
    persistWorkoutSessions(newSessions);
  };

  const deleteWorkoutSession = (sessionId: string) => {
    const newSessions = workoutSessions.filter((s) => s.id !== sessionId);
    setWorkoutSessions(newSessions);
    persistWorkoutSessions(newSessions);
  };

  return (
    <WorkoutContext.Provider
      value={{
        history,
        workoutSessions,
        exercises,
        plans,
        addSet,
        getSets,
        addExercise,
        addPlan,
        updatePlan,
        deletePlan,
        addHistory,
        saveWorkoutSession,
        deleteWorkoutSession,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
