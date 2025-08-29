CREATE TABLE `exercises` (
	`exercise_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`primary_muscle_group` text NOT NULL,
	`equipment` text NOT NULL,
	`instructions` text NOT NULL,
	`video_url` text,
	`target_sets` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`user_name` text NOT NULL,
	`unit_preference` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`workout_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_date` text NOT NULL
);
