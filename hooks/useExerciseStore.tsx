import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { Exercise } from "@/types/workout";
import { trpc } from "@/lib/trpc";
import { generateId } from "@/utils/helpers";

interface ExerciseContextType {
  exercises: Exercise[];
  customExercises: Exercise[];
  isLoading: boolean;
  getExerciseById: (id: string) => Exercise | undefined;
  getMuscleGroups: () => string[];
  getExercisesByMuscleGroup: (muscleGroup: string) => Exercise[];
  addCustomExercise: (exercise: Omit<Exercise, "exercise_id">) => void;
  editCustomExercise: (exercise: Exercise) => void;
  deleteCustomExercise: (id: string) => void;
}

export const [ExerciseProvider, useExerciseStore] = createContextHook<ExerciseContextType>(() => {
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [remoteExercises, setRemoteExercises] = useState<Exercise[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const customExercisesJson = await AsyncStorage.getItem("custom_exercises");
        if (customExercisesJson) {
          setCustomExercises(JSON.parse(customExercisesJson));
        }
      } catch (error) {
        console.error("Failed to load custom exercises:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExercises();
  }, []);

  // Fetch exercise library from API (Turso) with JSON fallback
  const { data: dbExercises, isLoading: dbLoading } = trpc.exercises.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (dbExercises) setRemoteExercises(dbExercises as Exercise[]);
  }, [dbExercises]);

  const jsonFallback = require("@/data/exerciseLibrary.json") as Exercise[];
  const builtInExercises = (remoteExercises ?? dbExercises ?? jsonFallback) as Exercise[];

  const exercises = [...builtInExercises, ...customExercises];

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

  const addCustomExercise = async (exercise: Omit<Exercise, "exercise_id">) => {
    const newExercise = { ...exercise, exercise_id: generateId() };
    const newCustomExercises = [...customExercises, newExercise];
    setCustomExercises(newCustomExercises);
    await AsyncStorage.setItem("custom_exercises", JSON.stringify(newCustomExercises));
  };

  const editCustomExercise = async (exerciseToUpdate: Exercise) => {
    const newCustomExercises = customExercises.map(ex =>
      ex.exercise_id === exerciseToUpdate.exercise_id ? exerciseToUpdate : ex
    );
    setCustomExercises(newCustomExercises);
    await AsyncStorage.setItem("custom_exercises", JSON.stringify(newCustomExercises));
  };

  const deleteCustomExercise = async (id: string) => {
    const newCustomExercises = customExercises.filter(ex => ex.exercise_id !== id);
    setCustomExercises(newCustomExercises);
    await AsyncStorage.setItem("custom_exercises", JSON.stringify(newCustomExercises));
  };

  return {
    exercises,
    customExercises,
    isLoading: isLoading || dbLoading,
    getExerciseById,
    getMuscleGroups,
    getExercisesByMuscleGroup,
    addCustomExercise,
    editCustomExercise,
    deleteCustomExercise,
  };
});
