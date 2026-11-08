import type { Pool } from "pg";
import type {
  CatalogItem,
  CatalogStore,
  Terra,
  Trader,
} from "./catalog-store.js";

export class PostgresCatalogStore implements CatalogStore {
  constructor(private readonly pool: Pool) {}

  async listTerras(): Promise<Terra[]> {
    const { rows } = await this.pool.query<Terra>(
      `select t.id,t.name,t.name_am,t.description,t.icon,count(distinct tr.id)::int as trader_count from terras t left join traders tr on tr.terra_id=t.id and tr.verified=true group by t.id order by t.name`,
    );
    return rows;
  }

  async listTraders(terraId: number): Promise<Trader[]> {
    const { rows } = await this.pool.query<Trader>(
      `select id,terra_id,name,shop_no,landmark,verified,vat_registered,primary_color,tagline from traders where terra_id=$1 and verified=true order by name`,
      [terraId],
    );
    return rows;
  }

  async listCatalog(traderId: string): Promise<CatalogItem[]> {
    const { rows } = await this.pool.query<CatalogItem>(
      `select p.id,p.name,p.name_am,p.category,u.id as product_unit_id,u.unit_name,u.base_qty,u.min_order_qty,u.retail_price,exists(select 1 from stock s where s.product_id=p.id and s.qty>0) as in_stock,coalesce((select json_agg(json_build_object('min_qty',pt.min_qty,'price',pt.price) order by pt.min_qty) from price_tiers pt where pt.product_unit_id=u.id),'[]'::json) as price_tiers from products p join traders tr on tr.id=p.trader_id join product_units u on u.product_id=p.id where tr.id=$1 and tr.verified=true and p.is_active order by p.category,p.name limit 100`,
      [traderId],
    );
    return rows;
  }

  async placeOrder(input: {
    traderId: string;
    buyerName: string;
    buyerPhone: string;
    paymentTerms: string;
    deliveryType: string;
    deliveryAddress?: string | null;
    items: { id: string; quantity: number }[];
  }) {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const trader = await client.query<{ vat_registered: boolean }>(
        "select vat_registered from traders where id=$1 and verified for update",
        [input.traderId],
      );
      if (!trader.rowCount)
        throw Object.assign(new Error("Verified shop not found."), {
          statusCode: 404,
        });
      const buyer = await client.query<{ id: string }>(
        "insert into buyers(name,business_name,phone) values($1,$1,$2) returning id",
        [input.buyerName, input.buyerPhone],
      );
      let subtotal = 0;
      const lines: { unitId: string; quantity: number; price: number }[] = [];
      for (const line of input.items) {
        const result = await client.query<{
          unit_id: string;
          min_order_qty: number;
          retail_price: number;
          tier_price: number | null;
          in_stock: boolean;
        }>(
          `select u.id unit_id,u.min_order_qty,u.retail_price,(select pt.price from price_tiers pt where pt.product_unit_id=u.id and pt.min_qty<= $3 order by pt.min_qty desc limit 1) tier_price,exists(select 1 from stock s where s.product_id=p.id and s.qty >= u.base_qty*$3) in_stock from products p join product_units u on u.product_id=p.id where p.id=$1 and p.trader_id=$2 and p.is_active for update of p`,
          [line.id, input.traderId, line.quantity],
        );
        const unit = result.rows[0];
        if (!unit || !unit.in_stock || line.quantity < unit.min_order_qty)
          throw Object.assign(
            new Error(
              "One or more items are unavailable, out of stock, or below minimum order.",
            ),
            { statusCode: 400 },
          );
        const price = Number(unit.tier_price ?? unit.retail_price);
        subtotal += price * line.quantity;
        lines.push({ unitId: unit.unit_id, quantity: line.quantity, price });
      }
      const deliveryFee =
        input.deliveryType === "porter"
          ? 45
          : input.deliveryType === "truck"
            ? 180
            : 0;
      const vat = trader.rows[0]!.vat_registered
        ? Math.round(subtotal * 15) / 100
        : 0;
      const total = subtotal + vat + deliveryFee;
      const invoice = await client.query<{ id: string; invoice_no: string }>(
        `insert into orders(trader_id,buyer_id,status,payment_terms,delivery_type,delivery_fee,subtotal,vat,total,invoice_no,due_date) values($1,$2,'new',$3,$4,$5,$6,$7,$8,'ML-'||to_char(now(),'YYYYMMDD')||'-'||lpad(nextval('invoice_sequence')::text,5,'0'),case when $3='credit' then current_date+30 else null end) returning id,invoice_no`,
        [
          input.traderId,
          buyer.rows[0]!.id,
          input.paymentTerms,
          input.deliveryType,
          deliveryFee,
          subtotal,
          vat,
          total,
        ],
      );
      for (const line of lines)
        await client.query(
          "insert into order_items(order_id,product_unit_id,quantity,unit_price) values($1,$2,$3,$4)",
          [invoice.rows[0]!.id, line.unitId, line.quantity, line.price],
        );
      if (input.deliveryAddress)
        await client.query(
          "insert into deliveries(order_id,status,delivery_address) values($1,'pending',$2) on conflict(order_id) do update set delivery_address=excluded.delivery_address",
          [invoice.rows[0]!.id, input.deliveryAddress],
        );
      await client.query("commit");
      return { invoice_no: invoice.rows[0]!.invoice_no };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async listOrders(traderId?: string) {
    const result = await this.pool.query(
      `select o.invoice_no,o.status,o.total,o.created_at,b.name buyer_name,count(oi.id)::int item_count from orders o join buyers b on b.id=o.buyer_id left join order_items oi on oi.order_id=o.id where ($1::uuid is null or o.trader_id=$1) group by o.id,b.name order by o.created_at desc limit 100`,
      [traderId ?? null],
    );
    return result.rows;
  }

  async updateOrderStatus(
    invoiceNo: string,
    status: "new" | "confirmed" | "delivered" | "cancelled",
  ) {
    const dbStatus = status === "delivered" ? "fulfilled" : status;
    const result = await this.pool.query(
      `update orders set status=$2 where invoice_no=$1 and (status=$2 or (status='new' and $2 in('confirmed','cancelled')) or (status='confirmed' and $2 in('fulfilled','cancelled'))) returning invoice_no,status`,
      [invoiceNo, dbStatus],
    );
    if (!result.rowCount) return null;
    return {
      invoice_no: result.rows[0].invoice_no,
      status:
        result.rows[0].status === "fulfilled"
          ? "delivered"
          : result.rows[0].status,
    };
  }
}
