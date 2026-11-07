import { describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import { catalogRoutes } from "./catalog.js";

describe("public catalog API", () => {
  it("returns terra directory rows from the repository", async () => {
    const query = vi.fn(async () => ({
      rows: [{ id: 1, name: "Kimem", trader_count: 2 }],
    }));
    const app = Fastify();
    await app.register(catalogRoutes, { query });
    const response = await app.inject("/v1/terras");
    expect(response.statusCode).toBe(200);
    expect(response.json().data[0].name).toBe("Kimem");
    await app.close();
  });
  it("rejects an invalid terra id before querying", async () => {
    const query = vi.fn(async (_sql: string, _values?: readonly unknown[]) => ({
      rows: [],
    }));
    const app = Fastify();
    await app.register(catalogRoutes, { query });
    const response = await app.inject("/v1/terras/not-a-number/traders");
    expect(response.statusCode).toBe(400);
    expect(query).not.toHaveBeenCalled();
    await app.close();
  });
  it("uses a parameterized trader id for catalog lookup", async () => {
    const query = vi.fn(async (_sql: string, _values?: readonly unknown[]) => ({
      rows: [],
    }));
    const app = Fastify();
    await app.register(catalogRoutes, { query });
    const traderId = "7c4f5e32-880a-4d6f-947f-b03ff35a1f75";
    const response = await app.inject(`/v1/traders/${traderId}/catalog`);
    expect(response.statusCode).toBe(200);
    expect(query.mock.calls[0]?.[1]).toEqual([traderId]);
    expect(query.mock.calls[0]?.[0]).not.toContain("target_margin");
    await app.close();
  });
});
