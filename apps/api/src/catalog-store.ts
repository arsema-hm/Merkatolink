export type Terra = {
  id: number;
  name: string;
  name_am: string | null;
  description: string;
  icon: string;
  trader_count: number;
};
export type Trader = {
  id: string;
  terra_id: number;
  name: string;
  shop_no: string;
  landmark: string;
  verified: boolean;
  vat_registered: boolean;
  primary_color: string;
  tagline: string;
};
export type CatalogItem = {
  id: string;
  name: string;
  name_am: string | null;
  category: string;
  product_unit_id: string;
  unit_name: string;
  base_qty: number;
  min_order_qty: number;
  retail_price: number;
  in_stock: boolean;
  price_tiers: { min_qty: number; price: number }[];
};
export interface CatalogStore {
  listTerras(): Promise<Terra[]>;
  listTraders(terraId: number): Promise<Trader[]>;
  listCatalog(traderId: string): Promise<CatalogItem[]>;
  placeOrder?(input: {
    traderId: string;
    buyerName: string;
    buyerPhone: string;
    paymentTerms: string;
    deliveryType: string;
    deliveryAddress?: string | null;
    items: { id: string; quantity: number }[];
  }): Promise<{ invoice_no: string }>;
  listOrders?(traderId?: string): Promise<unknown[]>;
  updateOrderStatus?(
    invoiceNo: string,
    status: "new" | "confirmed" | "delivered" | "cancelled",
  ): Promise<unknown | null>;
  placeDemoOrder?(input: {
    traderId: string;
    buyerName: string;
    buyerPhone: string;
    paymentTerms: string;
    deliveryType: string;
    deliveryAddress?: string | null;
    items: { id: string; quantity: number }[];
  }): Promise<{ invoice_no: string }>;
}
