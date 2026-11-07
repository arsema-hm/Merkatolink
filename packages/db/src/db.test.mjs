import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
test("initial migration has core rate and tenant constraints", async () => {
  const sql = await readFile(
    new URL("../migrations/0001_initial.sql", import.meta.url),
    "utf8",
  );
  assert.match(sql, /check\s*\(\s*usd_etb\s*>\s*0\s*\)/i);
  assert.match(sql, /create table products/i);
  assert.match(sql, /create or replace function calc_landed_cost/i);
});
