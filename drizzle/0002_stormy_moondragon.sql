CREATE TABLE `meso_drafts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`draft` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mesocycles` (
	`meso_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`meso_name` text NOT NULL,
	`start_date` text NOT NULL,
	`duration_weeks` integer NOT NULL,
	`is_active` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workout_days` (
	`day_id` text PRIMARY KEY NOT NULL,
	`meso_id` text NOT NULL,
	`day_name` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`exercise_ids` text
);
