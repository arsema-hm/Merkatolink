import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import type { CatalogStore } from "./catalog-store.js";

const idSchema = z.coerce.number().int().positive();
const uuidSchema = z.string().uuid();

export const catalogRoutes: FastifyPluginAsync<{
  store: CatalogStore;
}> = async (app, { store }) => {
  app.get("/v1/terras", async () => ({ data: await store.listTerras() }));

  app.get<{ Params: { terraId: string } }>(
    "/v1/terras/:terraId/traders",
    async (request, reply) => {
      const parsed = idSchema.safeParse(request.params.terraId);
      if (!parsed.success)
        return reply.code(400).send({ error: "Invalid terra id." });
      return { data: await store.listTraders(parsed.data) };
    },
  );

  app.get<{ Params: { traderId: string } }>(
    "/v1/traders/:traderId/catalog",
    async (request, reply) => {
      const parsed = uuidSchema.safeParse(request.params.traderId);
      if (!parsed.success)
        return reply.code(400).send({ error: "Invalid trader id." });
      return { data: await store.listCatalog(parsed.data) };
    },
  );
};
