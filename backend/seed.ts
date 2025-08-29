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
    // Normalize target muscles if present (string | string[])
    const tm = ((): string | undefined => {
      const val = (ex as any).target_muscles ?? (ex as any).target_muscle;
      if (!val) return undefined;
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === "string") return JSON.stringify([val]);
      return undefined;
    })();
    await db
      .insert(exercises)
      .values({
        exercise_id: ex.exercise_id,
        name: ex.name,
        primary_muscle_group: ex.primary_muscle_group,
        equipment: ex.equipment,
        instructions: ex.instructions,
        video_url: ex.video_url,
        target_sets: ex.target_sets as any,
        target_muscles: tm,
      })
      // Upsert so target_muscles gets updated for existing rows
      // @ts-ignore drizzle onConflictDoUpdate is available for sqlite
      .onConflictDoUpdate({
        target: exercises.exercise_id,
        set: {
          name: ex.name,
          primary_muscle_group: ex.primary_muscle_group,
          equipment: ex.equipment,
          instructions: ex.instructions,
          video_url: ex.video_url,
          target_sets: ex.target_sets as any,
          target_muscles: tm,
        },
      });
  }

  console.log(`Seeded ${library.length} exercises and demo user ${demoUserId}`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
