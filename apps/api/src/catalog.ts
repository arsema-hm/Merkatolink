import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

type QueryResult = { rows: Record<string, unknown>[] };
type Query = (sql: string, values?: readonly unknown[]) => Promise<QueryResult>;
const idSchema = z.coerce.number().int().positive();
const uuidSchema = z.string().uuid();

export const catalogRoutes: FastifyPluginAsync<{ query: Query }> = async (
  app,
  options,
) => {
  app.get("/v1/terras", async (_request, reply) => {
    try {
      const result = await options.query(
        `select t.id,t.name,t.name_am,t.description,t.icon,count(distinct tr.id)::int as trader_count from terras t left join traders tr on tr.terra_id=t.id and tr.verified=true group by t.id order by t.name`,
      );
      return { data: result.rows };
    } catch (error) {
      app.log.error(error);
      return reply
        .code(503)
        .send({ error: "Marketplace data is temporarily unavailable." });
    }
  });

  app.get<{ Params: { terraId: string } }>(
    "/v1/terras/:terraId/traders",
    async (request, reply) => {
      const parsed = idSchema.safeParse(request.params.terraId);
      if (!parsed.success)
        return reply.code(400).send({ error: "Invalid terra id." });
      try {
        const result = await options.query(
          `select id,terra_id,name,shop_no,landmark,verified,vat_registered,primary_color,tagline from traders where terra_id=$1 and verified=true order by name`,
          [parsed.data],
        );
        return { data: result.rows };
      } catch (error) {
        app.log.error(error);
        return reply
          .code(503)
          .send({ error: "Trader directory is temporarily unavailable." });
      }
    },
  );

  app.get<{ Params: { traderId: string } }>(
    "/v1/traders/:traderId/catalog",
    async (request, reply) => {
      const parsed = uuidSchema.safeParse(request.params.traderId);
      if (!parsed.success)
        return reply.code(400).send({ error: "Invalid trader id." });
      try {
        const result = await options.query(
          `select p.id,p.name,p.name_am,p.category,u.id as product_unit_id,u.unit_name,u.base_qty,u.min_order_qty,u.retail_price,exists(select 1 from stock s where s.product_id=p.id and s.qty>0) as in_stock,coalesce((select json_agg(json_build_object('min_qty',pt.min_qty,'price',pt.price) order by pt.min_qty) from price_tiers pt where pt.product_unit_id=u.id),'[]'::json) as price_tiers from products p join traders tr on tr.id=p.trader_id join product_units u on u.product_id=p.id where tr.id=$1 and tr.verified=true and p.is_active order by p.category,p.name limit 100`,
          [parsed.data],
        );
        return { data: result.rows };
      } catch (error) {
        app.log.error(error);
        return reply
          .code(503)
          .send({ error: "Product catalog is temporarily unavailable." });
      }
    },
  );
};
