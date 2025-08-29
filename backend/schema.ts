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
});

export const workouts = sqliteTable("workouts", {
  workout_id: text("workout_id").primaryKey(),
  user_id: text("user_id").notNull(),
  session_date: text("session_date").notNull(),
});

