export interface Exercise {
  id: string;
  name: string;
}

export interface Set {
  id: string;
  weight: number;
  reps: number;
  completedAt: number;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  planName: string;
  date: number;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: Set[];
  }[];
}

export interface PlanExercise {
  exerciseId: string;
  targetSets: number;
}

export interface Plan {
  id: string;
  name: string;
  exercises: PlanExercise[];
}
