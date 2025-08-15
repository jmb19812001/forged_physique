import { ReactNode, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { Exercise } from "@/types/workout";
import { defaultExercises } from "@/data/exercises";

interface ExerciseContextType {
  exercises: Exercise[];
  isLoading: boolean;
  getExerciseById: (id: string) => Exercise | undefined;
  getMuscleGroups: () => string[];
  getExercisesByMuscleGroup: (muscleGroup: string) => Exercise[];
}

export const [ExerciseProvider, useExerciseStore] = createContextHook<ExerciseContextType>(() => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load exercises from AsyncStorage or initialize with defaults
    const loadExercises = async () => {
      try {
        const exercisesJson = await AsyncStorage.getItem("exercises");
        
        if (exercisesJson) {
          setExercises(JSON.parse(exercisesJson));
        } else {
          // Initialize with default exercises
          setExercises(defaultExercises);
          await AsyncStorage.setItem("exercises", JSON.stringify(defaultExercises));
        }
      } catch (error) {
        console.error("Failed to load exercises:", error);
        // Fall back to defaults
        setExercises(defaultExercises);
      } finally {
        setIsLoading(false);
      }
    };

    loadExercises();
  }, []);

  const getExerciseById = (id: string) => {
    return exercises.find(exercise => exercise.exercise_id === id);
  };

  const getMuscleGroups = () => {
    const muscleGroups = new Set<string>();
    exercises.forEach(exercise => {
      muscleGroups.add(exercise.primary_muscle_group);
    });
    return Array.from(muscleGroups);
  };

  const getExercisesByMuscleGroup = (muscleGroup: string) => {
    return exercises.filter(exercise => exercise.primary_muscle_group === muscleGroup);
  };

  return {
    exercises,
    isLoading,
    getExerciseById,
    getMuscleGroups,
    getExercisesByMuscleGroup,
  };
});