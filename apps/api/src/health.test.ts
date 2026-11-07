import { describe, expect, it } from "vitest";
import Fastify from "fastify";
import { registerHealthRoutes } from "./health.js";

describe("health endpoints", () => {
  it("reports process health without touching dependencies", async () => {
    const app = Fastify();
    await registerHealthRoutes(app, async () => false);
    const response = await app.inject("/healthz");
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "ok" });
    await app.close();
  });
  it("reports not ready when the database check fails", async () => {
    const app = Fastify();
    await registerHealthRoutes(app, async () => false);
    const response = await app.inject("/readyz");
    expect(response.statusCode).toBe(503);
    await app.close();
  });
  it("reports ready when dependency checks pass", async () => {
    const app = Fastify();
    await registerHealthRoutes(app, async () => true);
    const response = await app.inject("/readyz");
    expect(response.statusCode).toBe(200);
    await app.close();
  });
});
