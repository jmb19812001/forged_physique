import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { db } from "./db";
import { users, exercises } from "./schema";

async function main() {
  console.log("Seeding database from data/exerciseLibrary.json...");

  // Seed a demo user
  const demoUserId = `user_${Math.random().toString(36).slice(2, 10)}`;
  await db.insert(users).values({
    user_id: demoUserId,
    email: "demo@forgedphysique.app",
    password_hash: "demo-password",
    user_name: "Demo User",
    unit_preference: "lbs",
  }).onConflictDoNothing?.();

  // Load exercise library from JSON
  const jsonPath = path.resolve(process.cwd(), "data", "exerciseLibrary.json");
  const library = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as Array<any>;
  for (const ex of library) {
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

  console.log(`Seeded ${library.length} exercises and demo user ${demoUserId}`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
