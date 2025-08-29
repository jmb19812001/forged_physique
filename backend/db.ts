import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users, exercises, workouts } from "./schema";

export const client = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema: { users, exercises, workouts } });

export type DB = typeof db;
