import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("migration defines costing, rate shock and buyer limit logic", async () => {
  const sql = await readFile(
    new URL("../migrations/0001_initial.sql", import.meta.url),
    "utf8",
  );
  assert.match(sql, /check\s*\(\s*usd_etb\s*>\s*0\s*\)/i);
  assert.match(sql, /create table products/i);
  assert.match(sql, /create or replace function calc_landed_cost/i);
  assert.match(sql, /preview_rate_shock/i);
  assert.match(sql, /enforce_buyer_credit_limit/i);
  assert.match(sql, /v_days_of_stock/i);
  assert.doesNotMatch(sql, /auth\.uid\(\)|references auth\.users/i);
});

test("fictional seed provisions the promised core sample sizes", async () => {
  const seed = await readFile(
    new URL("../supabase/seed.sql", import.meta.url),
    "utf8",
  );
  assert.match(seed, /generate_series\(1,\s*20\)/);
  assert.match(seed, /'Broker Hana \(demo\)'/);
  assert.match(seed, /generate_series\(1,\s*150\)/);
  assert.match(seed, /generate_series\(0,\s*59\)/);
  assert.match(seed, /fictional demo rate/);
});
