import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./backend/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.TURSO_URL!,
  },
} satisfies Config;
