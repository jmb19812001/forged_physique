import { ReactNode, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { MesoCycle, MesocycleCreateParams, SetLog, WorkoutDay, WorkoutSession, WorkoutTemplate, Exercise, WorkoutDayData } from "@/types/workout";
import { useAuth } from "@/hooks/useAuth";
import { generateId } from "@/utils/helpers";
import { defaultWorkoutTemplates } from "@/data/workoutTemplates";

interface WorkoutContextType {
  workoutDays: WorkoutDay[];
  sessions: WorkoutSession[];
  setLogs: SetLog[];
  isLoading: boolean;
  createWorkoutDaysForMesocycle: (mesocycle: MesoCycle, workoutDays: WorkoutDayData[], params: MesocycleCreateParams) => Promise<void>;
  getWorkoutDaysForMesocycle: (mesoId: string) => WorkoutDay[];
  getWorkoutDay: (dayId: string) => WorkoutDay | undefined;
  getWorkoutForToday: (mesoId: string) => WorkoutDay | null;
  startWorkoutSession: (dayId: string) => Promise<string>;
  logSet: (setLog: SetLog) => Promise<void>;
  completeWorkout: (dayId: string) => Promise<void>;
}

export const [WorkoutProvider, useWorkoutStore] = createContextHook<WorkoutContextType>(() => {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [setLogs, setSetLogs] = useState<SetLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Load workout data from AsyncStorage
    const loadWorkoutData = async () => {
      if (!user) {
        setWorkoutDays([]);
        setSessions([]);
        setSetLogs([]);
        setIsLoading(false);
        return;
      }
      
      try {
        const workoutDaysJson = await AsyncStorage.getItem(`workoutDays_${user.user_id}`);
        if (workoutDaysJson) {
          setWorkoutDays(JSON.parse(workoutDaysJson));
        }
        
        const sessionsJson = await AsyncStorage.getItem(`sessions_${user.user_id}`);
        if (sessionsJson) {
          setSessions(JSON.parse(sessionsJson));
        }
        
        const setLogsJson = await AsyncStorage.getItem(`setLogs_${user.user_id}`);
        if (setLogsJson) {
          setSetLogs(JSON.parse(setLogsJson));
        }
      } catch (error) {
        console.error("Failed to load workout data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkoutData();
  }, [user]);

  const saveWorkoutDays = async (updatedWorkoutDays: WorkoutDay[]) => {
    if (!user) return;
    
    try {
      await AsyncStorage.setItem(`workoutDays_${user.user_id}`, JSON.stringify(updatedWorkoutDays));
      setWorkoutDays(updatedWorkoutDays);
    } catch (error) {
      console.error("Failed to save workout days:", error);
      throw error;
    }
  };

  const saveSessions = async (updatedSessions: WorkoutSession[]) => {
    if (!user) return;
    
    try {
      await AsyncStorage.setItem(`sessions_${user.user_id}`, JSON.stringify(updatedSessions));
      setSessions(updatedSessions);
    } catch (error) {
      console.error("Failed to save sessions:", error);
      throw error;
    }
  };

  const saveSetLogs = async (updatedSetLogs: SetLog[]) => {
    if (!user) return;
    
    try {
      await AsyncStorage.setItem(`setLogs_${user.user_id}`, JSON.stringify(updatedSetLogs));
      setSetLogs(updatedSetLogs);
    } catch (error) {
      console.error("Failed to save set logs:", error);
      throw error;
    }
  };

  const getExercisesByMuscleGroup = (muscleGroup: string) => {
    // Import exercises dynamically to avoid circular dependency
    const { defaultExercises } = require("@/data/exercises");
    return defaultExercises.filter((exercise: any) => exercise.primary_muscle_group === muscleGroup);
  };

  const createWorkoutDaysForMesocycle = async (mesocycle: MesoCycle, customWorkoutDays: WorkoutDayData[], params: MesocycleCreateParams) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      let newWorkoutDays: WorkoutDay[] = [];
      const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      
      if (params.preset) {
        // Use a preset template
        const template = defaultWorkoutTemplates.find((t: WorkoutTemplate) => t.name === params.preset);
        
        if (template) {
          const startDayIndex = daysOfWeek.indexOf(params.start_day);
          
          template.days.forEach((day: { name: string; muscleGroups: string[] }, index: number) => {
            const dayOfWeek = (startDayIndex + index) % 7 + 1;
            
            const workoutExercises = day.muscleGroups.flatMap((group: string) => {
              const groupExercises = getExercisesByMuscleGroup(group);
              // Take 2-3 exercises per muscle group
              return groupExercises.slice(0, Math.floor(Math.random() * 2) + 2).map((exercise: Exercise) => (exercise.exercise_id));
            });
            
            newWorkoutDays.push({
              day_id: generateId(),
              meso_id: mesocycle.meso_id,
              day_name: day.name,
              day_of_week: dayOfWeek,
              exercise_ids: workoutExercises,
            });
          });
        }
      } else {
        // Custom mesocycle
        newWorkoutDays = customWorkoutDays.map(day => ({
          day_id: generateId(),
          meso_id: mesocycle.meso_id,
          day_name: day.dayName,
          day_of_week: daysOfWeek.indexOf(day.dayName) + 1,
          exercise_ids: day.exercise_ids,
        }));
      }
      
      const updatedWorkoutDays = [...workoutDays, ...newWorkoutDays];
      await saveWorkoutDays(updatedWorkoutDays);
    } catch (error) {
      console.error("Failed to create workout days:", error);
      throw error;
    }
  };

  const getWorkoutDaysForMesocycle = (mesoId: string) => {
    return workoutDays.filter(day => day.meso_id === mesoId);
  };

  const getWorkoutDay = (dayId: string) => {
    return workoutDays.find(day => day.day_id === dayId);
  };

  const getWorkoutForToday = (mesoId: string) => {
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday (0) to 7
    
    const todayWorkout = workoutDays.find(day => 
      day.meso_id === mesoId && day.day_of_week === dayOfWeek
    );
    
    return todayWorkout || null;
  };

  const startWorkoutSession = async (dayId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const workoutDay = getWorkoutDay(dayId);
      if (!workoutDay) throw new Error("Workout day not found");
      
      const sessionId = generateId();
      const newSession: WorkoutSession = {
        session_id: sessionId,
        user_id: user.user_id,
        day_id: dayId,
        session_date: new Date().toISOString(),
      };
      
      const updatedSessions = [...sessions, newSession];
      await saveSessions(updatedSessions);
      
      // Update workout day with session ID
      const updatedWorkoutDays = workoutDays.map(day => 
        day.day_id === dayId ? { ...day, session_id: sessionId } : day
      );
      await saveWorkoutDays(updatedWorkoutDays);
      
      return sessionId;
    } catch (error) {
      console.error("Failed to start workout session:", error);
      throw error;
    }
  };

  const logSet = async (setLog: SetLog) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const newSetLog: SetLog = {
        ...setLog,
        log_id: generateId(),
      };
      
      const updatedSetLogs = [...setLogs, newSetLog];
      await saveSetLogs(updatedSetLogs);
    } catch (error) {
      console.error("Failed to log set:", error);
      throw error;
    }
  };

  const completeWorkout = async (dayId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // Mark the session as completed
      // In a real app, we might update more data here
      
      // Clear the session ID from the workout day
      const updatedWorkoutDays = workoutDays.map(day => 
        day.day_id === dayId ? { ...day, session_id: undefined } : day
      );
      await saveWorkoutDays(updatedWorkoutDays);
    } catch (error) {
      console.error("Failed to complete workout:", error);
      throw error;
    }
  };

  return {
    workoutDays,
    sessions,
    setLogs,
    isLoading,
    createWorkoutDaysForMesocycle,
    getWorkoutDaysForMesocycle,
    getWorkoutDay,
    getWorkoutForToday,
    startWorkoutSession,
    logSet,
    completeWorkout,
  };
});