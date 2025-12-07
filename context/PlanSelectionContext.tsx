import React, { createContext, useContext, useState } from "react";

interface PlanSelectionContextValue {
  pendingExerciseId?: string;
  setPendingExerciseId: (exerciseId?: string) => void;
}

const PlanSelectionContext = createContext<
  PlanSelectionContextValue | undefined
>(undefined);

export const PlanSelectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pendingExerciseId, setPendingExerciseId] = useState<
    string | undefined
  >();

  return (
    <PlanSelectionContext.Provider
      value={{ pendingExerciseId, setPendingExerciseId }}
    >
      {children}
    </PlanSelectionContext.Provider>
  );
};

export const usePlanSelection = () => {
  const context = useContext(PlanSelectionContext);
  if (context === undefined) {
    throw new Error(
      "usePlanSelection must be used within a PlanSelectionProvider",
    );
  }
  return context;
};
