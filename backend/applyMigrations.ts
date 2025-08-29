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

  // Ensure migrations tracking table
  await client.execute(
    "CREATE TABLE IF NOT EXISTS __migrations(name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)"
  );

  // Fetch already applied migration filenames
  const applied = new Set<string>();
  try {
    const res = await client.execute("SELECT name FROM __migrations");
    for (const row of res.rows as any[]) {
      applied.add(String(row.name));
    }
  } catch {}

  let toApply = files.filter((f) => !applied.has(f));

  // If this DB was initialized manually before tracking existed, assume the first
  // baseline migration is already applied and skip it.
  if (applied.size === 0 && toApply.length > 1) {
    const baseline = files[0];
    try {
      await client.execute(
        "INSERT OR IGNORE INTO __migrations(name, applied_at) VALUES(?, datetime('now'))",
        [baseline]
      );
      applied.add(baseline);
      toApply = files.filter((f) => !applied.has(f));
    } catch {}
  }
  if (toApply.length === 0) {
    console.log("No new migrations to apply.");
    return;
  }

  console.log("Applying migrations:", toApply.join(", "));

  for (const file of toApply) {
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

    await client.execute(
      "INSERT OR IGNORE INTO __migrations(name, applied_at) VALUES(?, datetime('now'))",
      [file]
    );
    console.log(`Applied ${file}`);
  }

  console.log("Migrations complete");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
