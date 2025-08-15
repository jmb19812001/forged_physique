import { ReactNode } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { AuthProvider } from "@/hooks/useAuth";
import { ExerciseProvider } from "@/hooks/useExerciseStore";
import { WorkoutProvider } from "@/hooks/useWorkoutStore";
import { MesocycleProvider } from "@/hooks/useMesocycleStore";
import { ProgressProvider } from "@/hooks/useProgressStore";

interface AppProviderProps {
  children: ReactNode;
}

export const [AppContext, useAppContext] = createContextHook(() => {
  return {
    initialized: true,
  };
});

export function AppProvider({ children }: AppProviderProps) {
  return (
    <AppContext>
      <AuthProvider>
        <ExerciseProvider>
          <WorkoutProvider>
            <MesocycleProvider>
              <ProgressProvider>
                {children}
              </ProgressProvider>
            </MesocycleProvider>
          </WorkoutProvider>
        </ExerciseProvider>
      </AuthProvider>
    </AppContext>
  );
}