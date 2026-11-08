import type {
  CatalogItem,
  CatalogStore,
  Terra,
  Trader,
} from "./catalog-store.js";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const terras: Terra[] = [
  {
    id: 1,
    name: "Kimem",
    name_am: "ቅመም",
    description: "Spices and pantry staples",
    icon: "✳",
    trader_count: 2,
  },
  {
    id: 2,
    name: "Minalesh",
    name_am: "ምን አለሽ",
    description: "Mixed goods and useful finds",
    icon: "✦",
    trader_count: 1,
  },
  {
    id: 3,
    name: "Shema",
    name_am: "ሸማ",
    description: "Traditional cloth and textiles",
    icon: "▧",
    trader_count: 2,
  },
  {
    id: 4,
    name: "Somali",
    name_am: "ሶማሌ",
    description: "Vehicle and machine parts",
    icon: "⚙",
    trader_count: 2,
  },
  {
    id: 5,
    name: "Termus",
    name_am: "ቴርሙስ",
    description: "Bottles and household goods",
    icon: "◉",
    trader_count: 1,
  },
];
const traders: Trader[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    terra_id: 3,
    name: "Lomi Textiles (demo)",
    shop_no: "S-14",
    landmark: "North gate, blue awning",
    verified: true,
    vat_registered: true,
    primary_color: "#526747",
    tagline: "Woven with care, sold by the roll.",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    terra_id: 3,
    name: "Aster Loom House (demo)",
    shop_no: "S-22",
    landmark: "Near the fabric lane",
    verified: true,
    vat_registered: false,
    primary_color: "#9b6247",
    tagline: "Cloth for every day.",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    terra_id: 1,
    name: "Buna & Berbere (demo)",
    shop_no: "K-08",
    landmark: "Spice row, corner stall",
    verified: true,
    vat_registered: true,
    primary_color: "#876448",
    tagline: "Ground fresh, shared generously.",
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    terra_id: 1,
    name: "Mekdes Pantry (demo)",
    shop_no: "K-17",
    landmark: "Beside the grain scale",
    verified: true,
    vat_registered: false,
    primary_color: "#67754e",
    tagline: "Staples from familiar hands.",
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    terra_id: 4,
    name: "Abay Auto Supply (demo)",
    shop_no: "SO-31",
    landmark: "East entry, second aisle",
    verified: true,
    vat_registered: true,
    primary_color: "#4f6570",
    tagline: "Parts that keep you moving.",
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    terra_id: 4,
    name: "Blue Nile Bearings (demo)",
    shop_no: "SO-44",
    landmark: "Across the porter crossing",
    verified: true,
    vat_registered: false,
    primary_color: "#526b76",
    tagline: "Reliable parts, fair terms.",
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    terra_id: 5,
    name: "Saba Housewares (demo)",
    shop_no: "T-12",
    landmark: "Central lane, green sign",
    verified: true,
    vat_registered: true,
    primary_color: "#687653",
    tagline: "Useful things for the home.",
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    terra_id: 2,
    name: "Enat Mixed Goods (demo)",
    shop_no: "M-06",
    landmark: "Old stone marker, row three",
    verified: true,
    vat_registered: false,
    primary_color: "#8d7057",
    tagline: "What might you find today?",
  },
];
const items: CatalogItem[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    name: "Berbere Spice Sack",
    name_am: "በርበሬ",
    category: "Spices & staples",
    product_unit_id: "30000000-0000-4000-8000-000000000001",
    unit_name: "sack",
    base_qty: 50,
    min_order_qty: 1,
    retail_price: 4600,
    in_stock: true,
    price_tiers: [{ min_qty: 5, price: 4324 }],
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    name: "Red Lentils",
    name_am: "ምስር",
    category: "Grains",
    product_unit_id: "30000000-0000-4000-8000-000000000002",
    unit_name: "quintal",
    base_qty: 100,
    min_order_qty: 1,
    retail_price: 6100,
    in_stock: true,
    price_tiers: [{ min_qty: 5, price: 5734 }],
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    name: "Brake Pad Set",
    name_am: null,
    category: "Spare parts",
    product_unit_id: "30000000-0000-4000-8000-000000000003",
    unit_name: "piece",
    base_qty: 1,
    min_order_qty: 1,
    retail_price: 1450,
    in_stock: true,
    price_tiers: [{ min_qty: 5, price: 1363 }],
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    name: "Wheel Bearing",
    name_am: null,
    category: "Spare parts",
    product_unit_id: "30000000-0000-4000-8000-000000000004",
    unit_name: "piece",
    base_qty: 1,
    min_order_qty: 1,
    retail_price: 950,
    in_stock: false,
    price_tiers: [],
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    name: "Vacuum Flask Carton",
    name_am: null,
    category: "Bottles & containers",
    product_unit_id: "30000000-0000-4000-8000-000000000005",
    unit_name: "carton",
    base_qty: 12,
    min_order_qty: 1,
    retail_price: 2300,
    in_stock: true,
    price_tiers: [{ min_qty: 5, price: 2162 }],
  },
  {
    id: "20000000-0000-4000-8000-000000000006",
    name: "Cotton Shema Roll",
    name_am: "ሸማ",
    category: "Textiles",
    product_unit_id: "30000000-0000-4000-8000-000000000006",
    unit_name: "roll",
    base_qty: 1,
    min_order_qty: 1,
    retail_price: 3800,
    in_stock: true,
    price_tiers: [{ min_qty: 3, price: 3572 }],
  },
];
export class DemoCatalogStore implements CatalogStore {
  private orders: {
    invoice_no: string;
    trader_id: string;
    buyer_name: string;
    buyer_phone: string;
    payment_terms: string;
    delivery_type: string;
    total: number;
    items: { id: string; quantity: number }[];
    created_at: string;
    status: "new" | "confirmed" | "delivered" | "cancelled";
  }[] = [];
  private readonly ordersPath = resolve(
    process.cwd(),
    ".demo-data",
    "orders.json",
  );
  private readonly stockPath = resolve(
    process.cwd(),
    ".demo-data",
    "stock.json",
  );
  private stock: Record<string, number> = {};
  private async loadStock() {
    try {
      this.stock = JSON.parse(await readFile(this.stockPath, "utf8")) as Record<
        string,
        number
      >;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      this.stock = Object.fromEntries(
        items.map((item) => [item.id, item.in_stock ? 60 : 0]),
      );
    }
  }
  private async saveStock() {
    await mkdir(dirname(this.stockPath), { recursive: true });
    await writeFile(
      this.stockPath,
      JSON.stringify(this.stock, null, 2),
      "utf8",
    );
  }
  private async loadOrders() {
    try {
      this.orders = JSON.parse(
        await readFile(this.ordersPath, "utf8"),
      ) as typeof this.orders;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      this.orders = [];
    }
  }
  async listTerras() {
    return terras.map((terra) => ({
      ...terra,
      trader_count: traders.filter(
        (trader) => trader.terra_id === terra.id && trader.verified,
      ).length,
    }));
  }
  async listTraders(terraId: number) {
    return traders.filter(
      (trader) => trader.terra_id === terraId && trader.verified,
    );
  }
  async listCatalog(traderId: string) {
    await this.loadStock();
    const trader = traders.find(
      (entry) => entry.id === traderId && entry.verified,
    );
    if (!trader) return [];
    return items
      .filter((item) =>
        item.category === "Spare parts"
          ? trader.terra_id === 4
          : item.category === "Textiles"
            ? trader.terra_id === 3
            : item.category === "Bottles & containers"
              ? trader.terra_id === 5
              : trader.terra_id === 1 || trader.terra_id === 2,
      )
      .map((item) => ({
        ...item,
        in_stock: (this.stock[item.id] ?? (item.in_stock ? 60 : 0)) > 0,
      }));
  }
  async placeDemoOrder(input: {
    traderId: string;
    buyerName: string;
    buyerPhone: string;
    paymentTerms: string;
    deliveryType: string;
    items: { id: string; quantity: number }[];
  }) {
    await this.loadOrders();
    await this.loadStock();
    const catalog = await this.listCatalog(input.traderId);
    if (!catalog.length)
      throw Object.assign(new Error("Shop not found."), { statusCode: 404 });
    const lines = input.items.map((line) => {
      const product = catalog.find((item) => item.id === line.id);
      if (
        !product ||
        (this.stock[line.id] ?? (product.in_stock ? 60 : 0)) <
          line.quantity * product.base_qty ||
        line.quantity < product.min_order_qty
      )
        throw Object.assign(
          new Error(
            "One or more items are unavailable or below the minimum order.",
          ),
          { statusCode: 400 },
        );
      return {
        ...line,
        price:
          line.quantity >= 5 && product.price_tiers.length
            ? product.price_tiers[0]!.price
            : product.retail_price,
      };
    });
    const total = lines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0,
    );
    const invoice_no = `DEMO-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(this.orders.length + 1).padStart(4, "0")}`;
    this.orders.push({
      trader_id: input.traderId,
      buyer_name: input.buyerName,
      buyer_phone: input.buyerPhone,
      payment_terms: input.paymentTerms,
      delivery_type: input.deliveryType,
      items: input.items,
      invoice_no,
      total,
      created_at: new Date().toISOString(),
      status: "new",
    });
    await mkdir(dirname(this.ordersPath), { recursive: true });
    await writeFile(
      this.ordersPath,
      JSON.stringify(this.orders, null, 2),
      "utf8",
    );
    return { invoice_no };
  }
  async listDemoOrders() {
    await this.loadOrders();
    return this.orders.map((order) => ({ ...order, items: [...order.items] }));
  }
  async updateDemoOrder(
    invoiceNo: string,
    status: "new" | "confirmed" | "delivered" | "cancelled",
  ) {
    await this.loadOrders();
    const order = this.orders.find((entry) => entry.invoice_no === invoiceNo);
    if (!order) return null;
    const allowed: Record<string, string[]> = {
      new: ["confirmed", "cancelled"],
      confirmed: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };
    if (order.status !== status && !allowed[order.status]?.includes(status))
      throw Object.assign(
        new Error(`Cannot move an order from ${order.status} to ${status}.`),
        { statusCode: 409 },
      );
    if (
      order.status !== status &&
      (status === "confirmed" || order.status === "confirmed")
    ) {
      await this.loadStock();
      for (const line of order.items) {
        const product = items.find((entry) => entry.id === line.id);
        const units = line.quantity * (product?.base_qty ?? 1);
        if (status === "confirmed" && (this.stock[line.id] ?? 60) < units)
          throw Object.assign(
            new Error("Not enough stock to confirm this order."),
            { statusCode: 409 },
          );
      }
      for (const line of order.items) {
        const product = items.find((entry) => entry.id === line.id);
        const units = line.quantity * (product?.base_qty ?? 1);
        this.stock[line.id] =
          (this.stock[line.id] ?? 60) +
          (status === "confirmed" ? -units : units);
      }
      await this.saveStock();
    }
    order.status = status;
    await mkdir(dirname(this.ordersPath), { recursive: true });
    await writeFile(
      this.ordersPath,
      JSON.stringify(this.orders, null, 2),
      "utf8",
    );
    return { invoice_no: order.invoice_no, status: order.status };
  }
}
