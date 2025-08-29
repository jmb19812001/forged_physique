import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  user_id: text("user_id").primaryKey(),
  email: text("email").notNull(),
  password_hash: text("password_hash"),
  user_name: text("user_name").notNull(),
  unit_preference: text("unit_preference").notNull(),
});

export const exercises = sqliteTable("exercises", {
  exercise_id: text("exercise_id").primaryKey(),
  name: text("name").notNull(),
  primary_muscle_group: text("primary_muscle_group").notNull(),
  equipment: text("equipment").notNull(),
  instructions: text("instructions").notNull(),
  video_url: text("video_url"),
  target_sets: integer("target_sets"),
  // JSON string array of target muscles (optional)
  target_muscles: text("target_muscles"),
});

export const workouts = sqliteTable("workouts", {
  workout_id: text("workout_id").primaryKey(),
  user_id: text("user_id").notNull(),
  session_date: text("session_date").notNull(),
});

// Mesocycle planning tables
export const mesocycles = sqliteTable("mesocycles", {
  meso_id: text("meso_id").primaryKey(),
  user_id: text("user_id").notNull(),
  meso_name: text("meso_name").notNull(),
  start_date: text("start_date").notNull(),
  duration_weeks: integer("duration_weeks").notNull(),
  is_active: integer("is_active").notNull(), // 0/1 boolean
});

export const workout_days = sqliteTable("workout_days", {
  day_id: text("day_id").primaryKey(),
  meso_id: text("meso_id").notNull(),
  day_name: text("day_name").notNull(),
  day_of_week: integer("day_of_week").notNull(),
  exercise_ids: text("exercise_ids"), // JSON array
});

export const meso_drafts = sqliteTable("meso_drafts", {
  user_id: text("user_id").primaryKey(),
  draft: text("draft").notNull(),
  updated_at: text("updated_at").notNull(),
});
