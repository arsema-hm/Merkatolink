import { describe, expect, it } from "vitest";
import Fastify from "fastify";
import { catalogRoutes } from "./catalog.js";
import { DemoCatalogStore } from "./demo-catalog.js";

describe("public demo catalog API", () => {
  it("returns the seeded terra directory", async () => {
    const app = Fastify();
    await app.register(catalogRoutes, { store: new DemoCatalogStore() });
    const response = await app.inject("/v1/terras");
    expect(response.statusCode).toBe(200);
    expect(response.json().data).toHaveLength(5);
    expect(response.json().data[0].trader_count).toBeGreaterThan(0);
    await app.close();
  });

  it("rejects an invalid terra id", async () => {
    const app = Fastify();
    await app.register(catalogRoutes, { store: new DemoCatalogStore() });
    const response = await app.inject("/v1/terras/not-a-number/traders");
    expect(response.statusCode).toBe(400);
    await app.close();
  });

  it("returns catalog entries for a valid trader id", async () => {
    const app = Fastify();
    await app.register(catalogRoutes, { store: new DemoCatalogStore() });
    const response = await app.inject(
      "/v1/traders/10000000-0000-4000-8000-000000000001/catalog",
    );
    expect(response.statusCode).toBe(200);
    expect(response.json().data.length).toBeGreaterThan(0);
    await app.close();
  });

  it("creates a clearly labeled local demo order for valid catalog items", async () => {
    const app = Fastify();
    const store = new DemoCatalogStore();
    app.post("/v1/orders", async (request, reply) => {
      const body = request.body as {
        trader_id: string;
        buyer_name: string;
        buyer_phone: string;
        payment_terms: string;
        delivery_type: string;
        items: { id: string; quantity: number }[];
      };
      try {
        return reply.code(201).send({
          data: await store.placeDemoOrder({
            traderId: body.trader_id,
            buyerName: body.buyer_name,
            buyerPhone: body.buyer_phone,
            paymentTerms: body.payment_terms,
            deliveryType: body.delivery_type,
            items: body.items,
          }),
          mode: "demo-file",
        });
      } catch (error) {
        return reply.code(400).send({
          error: error instanceof Error ? error.message : "Invalid order",
        });
      }
    });
    const response = await app.inject({
      method: "POST",
      url: "/v1/orders",
      payload: {
        trader_id: "10000000-0000-4000-8000-000000000003",
        buyer_name: "Demo Buyer",
        buyer_phone: "09123456789",
        payment_terms: "cash",
        delivery_type: "pickup",
        items: [{ id: "20000000-0000-4000-8000-000000000001", quantity: 1 }],
      },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json().data.invoice_no).toMatch(/^DEMO-/);
    expect(response.json().mode).toBe("demo-file");
    await app.close();
  });
});
