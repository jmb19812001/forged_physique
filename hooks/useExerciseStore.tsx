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
    if (dbExercises) {
      // Normalize target_muscles to string[] if it is stored as JSON string
      const normalized = (dbExercises as any[]).map((e) => {
        const tm = (e as any).target_muscles;
        let tms: string[] | undefined = undefined;
        if (Array.isArray(tm)) tms = tm;
        else if (typeof tm === "string") {
          try { tms = JSON.parse(tm); } catch {}
        }
        // derive colloquial targets if missing
        const derived = tms && tms.length > 0 ? tms : deriveColloquialTargets(e as Exercise);
        return { ...(e as Exercise), target_muscles: derived } as Exercise;
      });
      setRemoteExercises(normalized);
    }
  }, [dbExercises]);

  // Build from DB when available; otherwise show none (rely on custom exercises)
  const builtInExercises = (remoteExercises ?? ([] as Exercise[]));

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

  function deriveColloquialTargets(ex: Exercise): string[] {
    const name = (ex.name || "").toLowerCase();
    const group = (ex.primary_muscle_group || "").toLowerCase();

    // Chest variants
    if (group === "chest") {
      if (name.includes("incline")) return ["upper chest", "front delts"];
      if (name.includes("decline")) return ["lower chest", "triceps"];
      if (name.includes("fly")) return ["inner chest"];
      if (name.includes("push-up") || name.includes("push up")) return ["chest", "triceps"];
      return ["chest", "triceps"]; // bench, machine press, etc.
    }

    // Back variants
    if (group === "back") {
      if (name.includes("lat pull") || name.includes("pulldown")) return ["lats"];
      if (name.includes("pull-up") || name.includes("pull up")) return ["lats", "biceps"];
      if (name.includes("chin-up") || name.includes("chin up")) return ["lats", "biceps"];
      if (name.includes("row") || name.includes("pendlay")) return ["mid-back", "lats"];
      if (name.includes("face pull")) return ["rear delts", "upper back"];
      if (name.includes("shrug")) return ["traps"];
      return ["lats", "mid-back"];
    }

    // Shoulders
    if (group === "shoulders" || group === "shoulder") {
      if (name.includes("lateral")) return ["side delts"];
      if (name.includes("rear") || name.includes("reverse fly") || name.includes("rear delt")) return ["rear delts"];
      if (name.includes("front raise")) return ["front delts"];
      if (name.includes("press")) return ["front delts", "triceps"];
      return ["delts"]; // generic
    }

    // Arms
    if (group === "arms" || group === "arm") {
      if (name.includes("curl")) return ["biceps"];
      if (name.includes("hammer")) return ["biceps", "forearms"];
      if (name.includes("pushdown") || name.includes("pressdown")) return ["triceps"];
      if (name.includes("skull") || name.includes("overhead")) return ["triceps"];
      return ["biceps", "triceps"]; // generic arms
    }

    // Legs
    if (group === "legs" || group === "leg") {
      if (name.includes("romanian") || name.includes("rdl")) return ["hamstrings", "glutes"];
      if (name.includes("deadlift")) return ["hamstrings", "glutes", "lower back"];
      if (name.includes("squat")) return ["quads", "glutes"];
      if (name.includes("hack squat")) return ["quads"];
      if (name.includes("goblet")) return ["quads"];
      if (name.includes("leg press")) return ["quads", "glutes"];
      if (name.includes("extension")) return ["quads"];
      if (name.includes("curl")) return ["hamstrings"];
      if (name.includes("calf")) return ["calves"];
      if (name.includes("lunge")) return ["quads", "glutes"];
      return ["quads", "glutes"]; // generic legs
    }

    // Default: fall back to primary group
    if (group) return [group];
    return [];
  }
});
