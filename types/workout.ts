export interface User {
  user_id: string;
  email: string;
  password_hash?: string;
  user_name: string;
  unit_preference: "kg" | "lbs";
}

export interface Exercise {
  exercise_id: string;
  name: string;
  primary_muscle_group: string;
  equipment: string;
  instructions: string;
  video_url?: string;
  target_sets?: number;
  // Optional list of target muscles (secondary or specific heads)
  target_muscles?: string[];
}

export interface MesoCycle {
  meso_id: string;
  user_id: string;
  meso_name: string;
  start_date: string;
  duration_weeks: number;
  is_active: boolean;
}

export interface WorkoutDay {
  day_id: string;
  meso_id: string;
  day_name: string;
  day_of_week: number;
  exercise_ids?: string[];
  session_id?: string;
}

export interface WorkoutSession {
  session_id: string;
  user_id: string;
  day_id: string;
  session_date: string;
}

export interface SetLog {
  log_id: string;
  session_id?: string;
  exercise_id: string;
  weight: number;
  reps: number;
  rir: number;
  completed?: boolean;
}

export interface MuscleGroupFeedback {
  feedback_id: string;
  session_id: string;
  muscle_group: string;
  joint_pain: number;
  pump: number;
  difficulty: number;
}

export interface MesocycleCreateParams {
  meso_name: string;
  duration_weeks: number;
  days_per_week: number;
  start_day: string;
  preset?: string;
}

export interface WorkoutTemplate {
  name: string;
  days: {
    name: string;
    muscleGroups: string[];
  }[];
}

export interface WorkoutDayData {
  dayName: string;
  enabled: boolean;
  muscleGroups: {
    name: string;
    enabled: boolean;
  }[];
  exercise_ids: string[];
}
