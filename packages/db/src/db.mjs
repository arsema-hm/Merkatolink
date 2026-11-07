import pg from "pg";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const command = process.argv[2];
const migrationName = "0001_initial";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
async function migrate() {
  const sql = await readFile(
    resolve(root, `migrations/${migrationName}.sql`),
    "utf8",
  );
  await pool.query(
    "create table if not exists _merkatolink_migrations(name text primary key, applied_at timestamptz not null default now())",
  );
  const exists = await pool.query(
    "select 1 from _merkatolink_migrations where name=$1",
    [migrationName],
  );
  if (exists.rowCount)
    return console.log(`Migration ${migrationName} already applied.`);
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("insert into _merkatolink_migrations(name) values($1)", [
      migrationName,
    ]);
    await client.query("commit");
    console.log(`Applied ${migrationName}.`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
try {
  if (command === "migrate") await migrate();
  else if (command === "seed") {
    await pool.query(
      await readFile(resolve(root, "supabase/seed.sql"), "utf8"),
    );
    console.log("Loaded fictional demo seed.");
  } else if (command === "reset") {
    if (process.env.ALLOW_DEMO_RESET !== "yes")
      throw new Error("Set ALLOW_DEMO_RESET=yes to confirm destructive reset.");
    await pool.query("drop schema public cascade; create schema public;");
    await migrate();
    await pool.query(
      await readFile(resolve(root, "supabase/seed.sql"), "utf8"),
    );
    console.log("Database reset with fictional demo seed.");
  } else throw new Error("Usage: db.mjs migrate|seed|reset");
} finally {
  await pool.end();
}
