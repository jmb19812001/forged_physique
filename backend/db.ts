import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users, exercises, workouts, mesocycles, workout_days, meso_drafts } from "./schema";

// Ensure env vars are available even if dotenv/config didn't load under tsx
if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const text = fs.readFileSync(envPath, "utf-8");
      for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const idx = line.indexOf("=");
        if (idx === -1) continue;
        const key = line.slice(0, idx);
        const val = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
        if (key === "TURSO_URL" && !process.env.TURSO_URL) process.env.TURSO_URL = val;
        if (key === "TURSO_AUTH_TOKEN" && !process.env.TURSO_AUTH_TOKEN) process.env.TURSO_AUTH_TOKEN = val;
      }
    }
  } catch {}
}

export const client = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema: { users, exercises, workouts, mesocycles, workout_days, meso_drafts } });

export type DB = typeof db;
