import { ReactNode, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { SetLog } from "@/types/workout";
import { useAuth } from "@/hooks/useAuth";

interface ProgressContextType {
  isLoading: boolean;
  getEstimated1RM: (exerciseId: string) => number[];
  getPersonalRecords: () => any[];
  getAverageSetsByMuscleGroup: () => any[];
}

export const [ProgressProvider, useProgressStore] = createContextHook<ProgressContextType>(() => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setIsLoading(false);
  }, [user]);

  const getEstimated1RM = (exerciseId: string) => {
    // Calculate estimated 1RM using Brzycki formula: weight * (36 / (37 - reps))
    // This is a simplified version - in a real app, we would get actual set logs
    
    // Group by week
    const weeklyData: number[] = [];
    
    // This is a simplified version - in a real app, we would group by actual weeks
    for (let i = 0; i < 5; i++) {
      const weekMax = 100 + Math.floor(Math.random() * 100); // Mock data
      weeklyData.push(weekMax);
    }
    
    return weeklyData;
  };

  const getPersonalRecords = () => {
    // Get personal records for each exercise
    // This would be calculated from actual data in a real app
    // For now, return mock data
    return [
      {
        exercise: "Barbell Bench Press",
        weight: 225,
        reps: 5,
        date: "July 5, 2025"
      },
      {
        exercise: "Barbell Squat",
        weight: 315,
        reps: 3,
        date: "July 8, 2025"
      },
      {
        exercise: "Deadlift",
        weight: 365,
        reps: 1,
        date: "July 10, 2025"
      }
    ];
  };

  const getAverageSetsByMuscleGroup = () => {
    // Calculate average sets per muscle group
    // This would use actual set logs in a real app
    // For now, return mock data
    return [
      { muscleGroup: "Chest", sets: 12 },
      { muscleGroup: "Back", sets: 15 },
      { muscleGroup: "Legs", sets: 18 },
      { muscleGroup: "Shoulders", sets: 9 },
      { muscleGroup: "Arms", sets: 8 }
    ];
  };

  return {
    isLoading,
    getEstimated1RM,
    getPersonalRecords,
    getAverageSetsByMuscleGroup,
  };
});