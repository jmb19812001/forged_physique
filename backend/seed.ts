import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { db } from "./db";
import { users, exercises } from "./schema";
import crypto from "crypto";

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
    const exId: string = ex.exercise_id || `ex_${crypto.createHash('md5').update(ex.name).digest('hex').slice(0, 10)}`;
    // Normalize target muscles if present (string | string[])
    const tm = ((): string | undefined => {
      const val = (ex as any).target_muscles ?? (ex as any).target_muscle;
      if (!val) return undefined;
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === "string") return JSON.stringify([val]);
      return undefined;
    })();
    const derived = tm ? undefined : JSON.stringify(deriveColloquialTargets(ex));
    await db
      .insert(exercises)
      .values({
        exercise_id: exId,
        name: ex.name,
        primary_muscle_group: ex.primary_muscle_group,
        equipment: ex.equipment,
        instructions: ex.instructions,
        video_url: ex.video_url,
        target_sets: ex.target_sets as any,
        target_muscles: tm ?? derived,
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
          target_muscles: tm ?? derived,
        },
      });
  }

  function deriveColloquialTargets(ex: any): string[] {
    const name: string = String(ex.name || "").toLowerCase();
    const group: string = String(ex.primary_muscle_group || "").toLowerCase();

    if (group === "chest") {
      if (name.includes("incline")) return ["upper chest", "front delts"];
      if (name.includes("decline")) return ["lower chest", "triceps"];
      if (name.includes("fly")) return ["inner chest"];
      if (name.includes("push-up") || name.includes("push up")) return ["chest", "triceps"];
      return ["chest", "triceps"];
    }
    if (group === "back") {
      if (name.includes("lat pull") || name.includes("pulldown")) return ["lats"];
      if (name.includes("pull-up") || name.includes("pull up")) return ["lats", "biceps"];
      if (name.includes("chin-up") || name.includes("chin up")) return ["lats", "biceps"];
      if (name.includes("row") || name.includes("pendlay")) return ["mid-back", "lats"];
      if (name.includes("face pull")) return ["rear delts", "upper back"];
      if (name.includes("shrug")) return ["traps"];
      return ["lats", "mid-back"];
    }
    if (group === "shoulders" || group === "shoulder") {
      if (name.includes("lateral")) return ["side delts"];
      if (name.includes("rear") || name.includes("reverse fly") || name.includes("rear delt")) return ["rear delts"];
      if (name.includes("front raise")) return ["front delts"];
      if (name.includes("press")) return ["front delts", "triceps"];
      return ["delts"];
    }
    if (group === "arms" || group === "arm") {
      if (name.includes("curl")) return ["biceps"];
      if (name.includes("hammer")) return ["biceps", "forearms"];
      if (name.includes("pushdown") || name.includes("pressdown")) return ["triceps"];
      if (name.includes("skull") || name.includes("overhead")) return ["triceps"];
      return ["biceps", "triceps"];
    }
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
      return ["quads", "glutes"];
    }
    if (group) return [group];
    return [];
  }

  console.log(`Seeded ${library.length} exercises and demo user ${demoUserId}`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
