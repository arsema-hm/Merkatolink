import type { FastifyInstance } from "fastify";
export async function registerHealthRoutes(
  app: FastifyInstance,
  ready: () => Promise<boolean>,
): Promise<void> {
  app.get("/healthz", async () => ({
    status: "ok",
    service: "merkatolink-api",
  }));
  app.get("/readyz", async (_request, reply) => {
    try {
      if (await ready()) return { status: "ready" };
    } catch (error) {
      app.log.error(error);
    }
    return reply.code(503).send({ status: "not_ready" });
  });
}
