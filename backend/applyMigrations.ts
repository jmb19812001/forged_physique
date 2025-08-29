import "dotenv/config";
import fs from "fs";
import path from "path";
import { client } from "./db";

async function run() {
  const dir = path.resolve(process.cwd(), "drizzle");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log("Applying migrations:", files.join(", "));

  for (const file of files) {
    const full = path.join(dir, file);
    const sqlRaw = fs.readFileSync(full, "utf-8");
    const sql = sqlRaw
      .split("\n")
      .filter((line) => !line.startsWith("-->"))
      .join("\n");

    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      // LibSQL requires statements to end with ; in some clients; adding if missing
      const text = stmt.endsWith(";") ? stmt : `${stmt};`;
      await client.execute(text);
    }

    console.log(`Applied ${file}`);
  }

  console.log("Migrations complete");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

