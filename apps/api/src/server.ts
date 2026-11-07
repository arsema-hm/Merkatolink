import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";
import { registerHealthRoutes } from "./health.js";
import { catalogRoutes } from "./catalog.js";
import { Pool } from "pg";

const env = z
  .object({
    PORT: z.coerce.number().default(4000),
    HOST: z.string().default("0.0.0.0"),
    WEB_ORIGIN: z.string().default("http://localhost:5173"),
    DATABASE_URL: z.string().optional(),
    NODE_ENV: z.string().default("development"),
  })
  .parse(process.env);
const app = Fastify({ logger: true, genReqId: () => crypto.randomUUID() });
const pool = env.DATABASE_URL
  ? new Pool({ connectionString: env.DATABASE_URL })
  : null;
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, {
  origin: env.WEB_ORIGIN.split(",").map((x) => x.trim()),
  credentials: true,
});
await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
await registerHealthRoutes(app, async () => {
  if (!pool) return false;
  await pool.query("select 1");
  return true;
});
await app.register(catalogRoutes, {
  query: async (sql, values) => {
    if (!pool) throw new Error("Database is not configured.");
    return pool.query(sql, values ? [...values] : []);
  },
});
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
