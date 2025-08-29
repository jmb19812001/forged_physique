import "dotenv/config";
import { db } from "./db";
import { users, exercises } from "./schema";
import { defaultExercises } from "../data/exercises";

async function main() {
  console.log("Seeding database...");

  // Seed a demo user
  const demoUserId = `user_${Math.random().toString(36).slice(2, 10)}`;
  await db.insert(users).values({
    user_id: demoUserId,
    email: "demo@forgedphysique.app",
    password_hash: "demo-password",
    user_name: "Demo User",
    unit_preference: "lbs",
  }).onConflictDoNothing?.();

  // Seed a subset of exercises to keep it light
  const seedList = defaultExercises.slice(0, 25);
  for (const ex of seedList) {
    await db.insert(exercises).values({
      exercise_id: ex.exercise_id,
      name: ex.name,
      primary_muscle_group: ex.primary_muscle_group,
      equipment: ex.equipment,
      instructions: ex.instructions,
      video_url: ex.video_url,
      target_sets: ex.target_sets as any,
    }).onConflictDoNothing?.();
  }

  console.log(`Seeded ${seedList.length} exercises and demo user ${demoUserId}`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

