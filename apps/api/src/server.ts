import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";
import { registerHealthRoutes } from "./health.js";
import { catalogRoutes } from "./catalog.js";
import { Pool } from "pg";
import { DemoCatalogStore } from "./demo-catalog.js";
import { PostgresCatalogStore } from "./postgres-catalog.js";

const env = z
  .object({
    PORT: z.coerce.number().default(4000),
    HOST: z.string().default("0.0.0.0"),
    WEB_ORIGIN: z.string().default("http://localhost:5173"),
    DATABASE_URL: z.string().optional(),
    NODE_ENV: z.string().default("development"),
    DEMO_MODE: z.enum(["true", "false"]).optional(),
  })
  .parse(process.env);
const app = Fastify({ logger: true, genReqId: () => crypto.randomUUID() });
const pool = env.DATABASE_URL
  ? new Pool({ connectionString: env.DATABASE_URL })
  : null;
const demoMode =
  env.DEMO_MODE === "true" || (!pool && env.NODE_ENV !== "production");
const store = pool
  ? new PostgresCatalogStore(pool)
  : demoMode
    ? new DemoCatalogStore()
    : null;
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, {
  origin: (origin, callback) => {
    const allowed = env.WEB_ORIGIN.split(",").map((x) => x.trim());
    const localDevOrigin =
      env.NODE_ENV !== "production" &&
      /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin ?? "");
    if (!origin || allowed.includes(origin) || localDevOrigin) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin not allowed."), false);
  },
  credentials: true,
});
await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
await registerHealthRoutes(app, async () => {
  if (demoMode) return true;
  if (!pool || !store) return false;
  await pool.query("select 1");
  return true;
});
app.get("/v1/meta", async () => ({ mode: demoMode ? "demo" : "database" }));
if (store) await app.register(catalogRoutes, { store });
if (store instanceof DemoCatalogStore) {
  app.get("/v1/orders/demo", async () => ({
    data: await store.listDemoOrders(),
    mode: "demo-file",
  }));
  app.patch("/v1/orders/demo/:invoiceNo", async (request, reply) => {
    const params = z
      .object({ invoiceNo: z.string().regex(/^DEMO-[0-9]{8}-[0-9]{4}$/) })
      .parse(request.params);
    const body = z
      .object({
        status: z.enum(["new", "confirmed", "delivered", "cancelled"]),
      })
      .parse(request.body);
    const order = await store.updateDemoOrder(params.invoiceNo, body.status);
    if (!order) return reply.code(404).send({ error: "Demo order not found." });
    return { data: order, mode: "demo-file" };
  });
  app.post("/v1/orders", async (request, reply) => {
    const body = z
      .object({
        trader_id: z.string().uuid(),
        buyer_name: z.string().trim().min(2).max(120),
        buyer_phone: z.string().regex(/^(?:\+251|0)?[79]\d{8}$/),
        payment_terms: z.enum(["cash", "transfer", "mobile_money", "credit"]),
        delivery_type: z.enum(["pickup", "porter", "truck"]),
        items: z
          .array(
            z.object({
              id: z.string().uuid(),
              quantity: z.number().int().positive().max(10000),
            }),
          )
          .min(1)
          .max(50),
      })
      .parse(request.body);
    const order = await store.placeDemoOrder({
      traderId: body.trader_id,
      buyerName: body.buyer_name,
      buyerPhone: body.buyer_phone,
      paymentTerms: body.payment_terms,
      deliveryType: body.delivery_type,
      items: body.items,
    });
    return reply.code(201).send({ data: order, mode: "demo-file" });
  });
}
if (store instanceof PostgresCatalogStore) {
  app.post("/v1/orders", async (request, reply) => {
    const body = z
      .object({
        trader_id: z.string().uuid(),
        buyer_name: z.string().trim().min(2).max(120),
        buyer_phone: z.string().regex(/^(?:\+251|0)?[79]\d{8}$/),
        delivery_address: z.string().trim().max(240).nullable().optional(),
        payment_terms: z.enum(["cash", "transfer", "mobile_money", "credit"]),
        delivery_type: z.enum(["pickup", "porter", "truck"]),
        items: z
          .array(
            z.object({
              id: z.string().uuid(),
              quantity: z.number().int().positive().max(10000),
            }),
          )
          .min(1)
          .max(50),
      })
      .parse(request.body);
    const order = await store.placeOrder({
      traderId: body.trader_id,
      buyerName: body.buyer_name,
      buyerPhone: body.buyer_phone,
      paymentTerms: body.payment_terms,
      deliveryType: body.delivery_type,
      deliveryAddress: body.delivery_address ?? null,
      items: body.items,
    });
    return reply.code(201).send({ data: order, mode: "database" });
  });
}
app.get("/v1/auth/session", async () => ({
  authenticated: false,
  mode: "skeleton",
  message:
    "Phone OTP/email login will be enabled after auth provider configuration.",
}));
app.setErrorHandler((error: unknown, _req, reply) => {
  app.log.error(error);
  const code =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
      ? error.statusCode
      : 500;
  const message =
    code < 500 && error instanceof Error
      ? error.message
      : "Internal server error";
  reply.code(code).send({ error: message });
});
try {
  await app.listen({ port: env.PORT, host: env.HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    await app.close();
    await pool?.end();
    process.exit(0);
  });
}
