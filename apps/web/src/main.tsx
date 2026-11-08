import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Minus,
  X,
  Menu,
  Store,
  Boxes,
  Wallet,
  Truck,
  RefreshCw,
} from "lucide-react";
import "./style.css";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Product = {
  id: string;
  name: string;
  amharic: string;
  category: string;
  price: number;
  inStock: boolean;
  minQty: number;
  unit: string;
  emoji: string;
  bg: string;
  note: string;
};

type Terra = {
  id: number;
  name: string;
  name_am: string | null;
  description: string;
  icon: string;
  trader_count: number;
};

type Trader = {
  id: string;
  terra_id: number;
  name: string;
  shop_no: string;
  landmark: string;
  verified: boolean;
  vat_registered: boolean;
  primary_color: string | null;
  tagline: string | null;
};

type CatalogRow = {
  id: string;
  name: string;
  name_am: string | null;
  category: string;
  unit_name: string;
  base_qty: number;
  min_order_qty: number;
  retail_price: number | string;
  in_stock: boolean;
};

type CartLine = { product: Product; qty: number };
type Cart = { trader: Trader | null; lines: Record<string, CartLine> };

type DeliveryType = "pickup" | "porter" | "truck";
type PaymentTerms = "cash" | "transfer" | "mobile_money" | "credit";
type LoadState = "idle" | "loading" | "ready" | "error";
type Placed = { reference: string; saved: boolean; total: number };
type DemoOrder = {
  invoice_no: string;
  buyer_name: string;
  total: number;
  status: "new" | "confirmed" | "delivered" | "cancelled";
  items: { id: string; quantity: number }[];
};

/* ------------------------------------------------------------------ */
/* Constants and helpers                                               */
/* ------------------------------------------------------------------ */

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:4000";

const VAT_RATE = 0.15;
// Demo delivery fees. They match the fees used in seed.sql.
const DELIVERY_FEES: Record<DeliveryType, number> = {
  pickup: 0,
  porter: 45,
  truck: 180,
};
const DELIVERY_LABELS: Record<DeliveryType, string> = {
  pickup: "Pick up at the shop",
  porter: "Porter (inside Merkato)",
  truck: "Truck delivery",
};
const PAYMENT_LABELS: Record<PaymentTerms, string> = {
  cash: "Cash on delivery or pickup",
  transfer: "Bank transfer",
  mobile_money: "Mobile money",
  credit: "Credit (the trader approves)",
};

const TERRA_TONE: Record<string, string> = {
  Shema: "t-shema",
  Kimem: "t-kimem",
  Somali: "t-somali",
  Termus: "t-termus",
  Minalesh: "t-mina",
};

const TILE_BACKGROUNDS = ["sand", "rose", "sage", "clay", "cream", "gold"];

// Rate Shock demo: the latest rate in seed.sql is about 147.6.
const BASE_RATE = 147.6;
const RATE_SHOCK_ITEMS = [
  { name: "Brake Pad Set", baseMargin: 30, target: 25 },
  { name: "Wheel Bearing", baseMargin: 33, target: 28 },
  { name: "Vacuum Flask", baseMargin: 29, target: 24 },
];

const SAMPLE_STATS = [
  ["Sales this month", "ETB 284,650", "Up 12.8%"],
  ["Orders", "1,284", "Up 8.2%"],
  ["Average order", "ETB 2,218", "Up 2.4%"],
  ["Needs a restock", "6", "Check stock"],
] as const;
const SAMPLE_ORDERS = [
  ["#2481", "Abebe B.", "4 items", "ETB 4,520", "New"],
  ["#2480", "Sara T.", "2 items", "ETB 1,780", "Confirmed"],
  ["#2479", "Dawit A.", "7 items", "ETB 12,340", "Delivered"],
  ["#2478", "Mimi G.", "3 items", "ETB 2,890", "Delivered"],
] as const;
const SAMPLE_RESTOCK = [
  ["⚙️", "Wheel Bearing", "6 left"],
  ["🫙", "Vacuum Flask", "9 left"],
  ["🧵", "Cotton Shema Roll", "11 left"],
  ["🌶️", "Berbere Spice Sack", "14 left"],
] as const;

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
const birr = (n: number) => "ETB " + numberFormat.format(n);
const round2 = (n: number) => Math.round(n * 100) / 100;

function emojiFor(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("spare")) return "⚙️";
  if (c.includes("textile")) return "🧵";
  if (c.includes("bottle") || c.includes("container")) return "🫙";
  if (c.includes("spice")) return "🌶️";
  if (c.includes("grain") || c.includes("staple")) return "🌾";
  if (c.includes("house")) return "🏠";
  return "📦";
}

function mapCatalog(rows: CatalogRow[]): Product[] {
  return rows.map((item, index) => ({
    id: String(item.id),
    name: item.name,
    amharic: item.name_am ?? "",
    category: item.category,
    price: Number(item.retail_price),
    inStock: item.in_stock,
    minQty: Math.max(1, Number(item.min_order_qty) || 1),
    unit:
      item.base_qty > 1
        ? `${item.unit_name} of ${item.base_qty}`
        : item.unit_name,
    emoji: emojiFor(item.category),
    bg: TILE_BACKGROUNDS[index % TILE_BACKGROUNDS.length] ?? "sand",
    note: item.in_stock
      ? `Minimum order: ${Math.max(1, Number(item.min_order_qty) || 1)} ${item.unit_name}`
      : "Currently out of stock",
  }));
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { signal });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  const body = (await response.json()) as { data: T };
  return body.data;
}

function scrollToId(id: string) {
  window.setTimeout(
    () =>
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    30,
  );
}

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

function App() {
  // Page state
  const [admin, setAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [step, setStep] = useState<"bag" | "checkout">("bag");
  const [rate, setRate] = useState(BASE_RATE);

  // Marketplace data
  const [terras, setTerras] = useState<Terra[]>([]);
  const [terraState, setTerraState] = useState<LoadState>("idle");
  const [activeTerra, setActiveTerra] = useState<Terra | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [traderState, setTraderState] = useState<LoadState>("idle");
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [catalogState, setCatalogState] = useState<LoadState>("idle");

  // Shop filters
  const [category, setCategory] = useState("Everything");
  const [query, setQuery] = useState("");

  // Cart and checkout
  const [cart, setCart] = useState<Cart>({ trader: null, lines: {} });
  const [delivery, setDelivery] = useState<DeliveryType>("pickup");
  const [payment, setPayment] = useState<PaymentTerms>("cash");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [demoOrders, setDemoOrders] = useState<DemoOrder[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const tradersAbort = useRef<AbortController | null>(null);
  const catalogAbort = useRef<AbortController | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3000);
  }, []);

  /* ---------- Load terras ---------- */
  const loadTerras = useCallback((signal?: AbortSignal) => {
    setTerraState("loading");
    getJson<Terra[]>("/v1/terras", signal)
      .then((data) => {
        setTerras(data);
        setTerraState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setTerraState("error");
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadTerras(controller.signal);
    return () => controller.abort();
  }, [loadTerras]);

  useEffect(() => {
    if (!admin) return;
    const controller = new AbortController();
    fetch(`${API_BASE}/v1/orders/demo`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((body: { data: DemoOrder[] }) => setDemoOrders(body.data))
      .catch(() => setDemoOrders([]));
    return () => controller.abort();
  }, [admin, placed]);

  async function updateDemoOrder(
    invoiceNo: string,
    status: DemoOrder["status"],
  ) {
    const response = await fetch(`${API_BASE}/v1/orders/demo/${invoiceNo}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      showToast("Could not update this demo order.");
      return;
    }
    setDemoOrders((orders) =>
      orders.map((order) =>
        order.invoice_no === invoiceNo ? { ...order, status } : order,
      ),
    );
    showToast(`Order ${invoiceNo} marked ${status}.`);
  }

  /* ---------- Keyboard shortcuts ---------- */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setDrawerOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- Terra -> traders -> catalog ---------- */
  async function chooseTerra(terra: Terra) {
    tradersAbort.current?.abort();
    catalogAbort.current?.abort();
    const controller = new AbortController();
    tradersAbort.current = controller;

    setActiveTerra(terra);
    setSelectedTrader(null);
    setShopProducts([]);
    setCatalogState("idle");
    setTraders([]);
    setTraderState("loading");
    setCategory("Everything");
    setQuery("");
    scrollToId("trader-directory");

    try {
      const data = await getJson<Trader[]>(
        `/v1/terras/${terra.id}/traders`,
        controller.signal,
      );
      setTraders(data);
      setTraderState("ready");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setTraderState("error");
    }
  }

  async function openTrader(trader: Trader) {
    catalogAbort.current?.abort();
    const controller = new AbortController();
    catalogAbort.current = controller;

    setSelectedTrader(trader);
    setShopProducts([]);
    setCatalogState("loading");
    setCategory("Everything");
    setQuery("");
    scrollToId("shop");

    try {
      const rows = await getJson<CatalogRow[]>(
        `/v1/traders/${trader.id}/catalog`,
        controller.signal,
      );
      setShopProducts(mapCatalog(rows));
      setCatalogState("ready");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setCatalogState("error");
      showToast("The catalog could not load. Check that the API is running.");
    }
  }

  /* ---------- Derived shop data ---------- */
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shopProducts.filter(
      (p) =>
        (category === "Everything" || p.category === category) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.amharic.includes(query.trim()) ||
          p.category.toLowerCase().includes(q)),
    );
  }, [category, query, shopProducts]);

  const categories = useMemo(
    () => [
      "Everything",
      ...new Set(shopProducts.map((product) => product.category)),
    ],
    [shopProducts],
  );

  /* ---------- Cart ---------- */
  const cartLines = Object.values(cart.lines);
  const count = cartLines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = round2(
    cartLines.reduce((sum, line) => sum + line.product.price * line.qty, 0),
  );
  const vat = cart.trader?.vat_registered ? round2(subtotal * VAT_RATE) : 0;
  const deliveryFee = DELIVERY_FEES[delivery];
  const total = round2(subtotal + vat + deliveryFee);

  function changeQty(product: Product, trader: Trader, delta: 1 | -1) {
    const switching =
      cart.trader !== null &&
      cart.trader.id !== trader.id &&
      cartLines.length > 0;
    if (switching && delta > 0) {
      const ok = window.confirm(
        `Your bag has items from ${cart.trader?.name}. Start a new bag with ${trader.name}?`,
      );
      if (!ok) return;
    }
    setCart((prev) => {
      const base: Cart =
        prev.trader && prev.trader.id !== trader.id
          ? { trader, lines: {} }
          : { trader, lines: { ...prev.lines } };
      const current = base.lines[product.id]?.qty ?? 0;
      let next: number;
      if (delta > 0) next = current === 0 ? product.minQty : current + 1;
      else next = current - 1 < product.minQty ? 0 : current - 1;
      const lines = { ...base.lines };
      if (next <= 0) delete lines[product.id];
      else lines[product.id] = { product, qty: next };
      return { trader: Object.keys(lines).length ? trader : null, lines };
    });
    if (delta > 0) setDrawerOpen(true);
  }

  function resetCheckout() {
    setStep("bag");
    setPlaced(null);
    setErrors({});
    setSubmitError("");
  }

  function closeDrawer() {
    setDrawerOpen(false);
    if (placed) resetCheckout();
  }

  /* ---------- Checkout ---------- */
  function validate(): Record<string, string> {
    const found: Record<string, string> = {};
    if (form.name.trim().length < 2) found.name = "Enter the buyer's name.";
    const digits = form.phone.replace(/[\s-]/g, "");
    if (!/^(?:\+251|0)?[79]\d{8}$/.test(digits)) {
      found.phone = "Enter an Ethiopian mobile number, such as 0912 345 678.";
    }
    if (delivery !== "pickup" && form.address.trim().length < 3) {
      found.address = "Add a landmark or shop number for the delivery.";
    }
    return found;
  }

  async function placeOrder() {
    if (!cart.trader || cartLines.length === 0) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch(`${API_BASE}/v1/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trader_id: cart.trader.id,
          buyer_name: form.name.trim(),
          buyer_phone: form.phone.replace(/[\s-]/g, ""),
          delivery_type: delivery,
          delivery_address: delivery === "pickup" ? null : form.address.trim(),
          payment_terms: payment,
          items: cartLines.map((line) => ({
            id: line.product.id,
            quantity: line.qty,
          })),
        }),
      });

      if (response.ok) {
        const body = (await response.json().catch(() => null)) as {
          data?: { invoice_no?: string; id?: string };
          mode?: string;
        } | null;
        const reference = body?.data?.invoice_no ?? body?.data?.id ?? "Saved";
        setPlaced({
          reference,
          saved: body?.mode === "database",
          total,
        });
        setCart({ trader: null, lines: {} });
      } else {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;
        setSubmitError(
          body?.error ??
            body?.message ??
            `The order could not be placed (${response.status}).`,
        );
      }
    } catch {
      setSubmitError(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- Rate Shock (illustrative) ---------- */
  const rateChange = ((rate - BASE_RATE) / BASE_RATE) * 100;
  const rateRows = RATE_SHOCK_ITEMS.map((item) => {
    // Cost scales with the rate, so margin = 1 - (1 - base margin) x rate / base rate.
    const margin = (1 - (1 - item.baseMargin / 100) * (rate / BASE_RATE)) * 100;
    return { ...item, margin, below: margin < item.target };
  });

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div className="site">
      <div className="announcement">
        <span>MERKATOLINK · DIGITAL MERKATO</span>
        <b>Wholesale, connected.</b>
        <span>Fictional demo · ETB pricing</span>
      </div>

      <header className="header">
        <button
          type="button"
          className="menuicon"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu />
        </button>
        <a className="wordmark" href="#top">
          <span className="seal">M</span>
          <span>
            MerkatoLink<small>Wholesale marketplace</small>
          </span>
        </a>
        <nav
          className={mobileOpen ? "open" : ""}
          onClick={() => setMobileOpen(false)}
        >
          <a
            href="#terras"
            onClick={(event) => {
              event.preventDefault();
              setMobileOpen(false);
              scrollToId("terras");
            }}
          >
            Explore markets
          </a>
          <a
            href="#shop"
            onClick={(event) => {
              event.preventDefault();
              setMobileOpen(false);
              scrollToId("shop");
            }}
          >
            Shop
          </a>
          <a
            href="#how-it-works"
            onClick={(event) => {
              event.preventDefault();
              setMobileOpen(false);
              scrollToId("how-it-works");
            }}
          >
            How it works
          </a>
          <a
            href="#story"
            onClick={(event) => {
              event.preventDefault();
              setMobileOpen(false);
              scrollToId("story");
            }}
          >
            About
          </a>
        </nav>
        <div className="headeractions">
          <label className="searchfield">
            <Search size={17} />
            <input
              ref={searchRef}
              aria-label="Search products"
              placeholder={
                selectedTrader
                  ? `Search ${selectedTrader.name}`
                  : "Pick a shop to search"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>{isMac ? "⌘ K" : "Ctrl K"}</kbd>
          </label>
          <button
            type="button"
            className="bagbutton"
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingBag size={18} />
            <span>Bag</span>
            <i>{count}</i>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="kicker">
              <span /> THE WHOLESALE MARKETPLACE FOR ETHIOPIA
            </div>
            <h1>
              Merkato, <em>made</em>
              <br />
              easier to navigate.
            </h1>
            <p>
              Discover Addis Ababa’s wholesale markets, compare independent
              traders and order by the carton, sack or quintal. One clear link
              from buyer to business.
            </p>
            <a className="hero-cta" href="#terras">
              Explore the marketplace <ArrowRight size={16} />
            </a>
            <div className="hero-note">
              <div className="tinyfaces">
                <i>Sh</i>
                <i>Ki</i>
                <i>So</i>
              </div>
              <span>
                <b>{terraState === "ready" ? terras.length : 5}</b> terras to
                explore
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-sun" />
            <div className="art-caption">
              <span>From the terras</span>
              <b>
                Market mornings,
                <br />
                made simple.
              </b>
            </div>
            <div className="basket">
              <div className="basketcloth" />
              <span className="basket-item one">🌾</span>
              <span className="basket-item two">🧵</span>
              <span className="basket-item three">⚙️</span>
              <span className="basket-item four">🌶️</span>
              <div className="basket-weave" />
            </div>
            <div className="art-stamp">
              MADE
              <br />
              IN ADDIS
              <br />
              <span>✳</span>
            </div>
            <div className="hero-image-label">
              Merkato (demo) <span>✳</span> Addis Ababa
            </div>
          </div>
        </section>

        <section className="terra-directory" id="terras">
          <div className="terra-intro">
            <div className="kicker">The market, organized by terra</div>
            <h2>
              Find your <em>corner</em>
              <br />
              of Merkato.
            </h2>
            <p>
              Similar goods are sold together, so start with the place, meet the
              traders, and find the right wholesale partner.
            </p>
            <span>Fictional marketplace · demo data</span>
          </div>

          <div className="terra-tiles">
            {terraState === "loading" &&
              Array.from({ length: 5 }, (_, i) => (
                <div
                  className="terra-tile ml-skeleton"
                  key={i}
                  aria-hidden="true"
                />
              ))}

            {terraState === "error" && (
              <div className="ml-error" role="alert">
                <b>The terra directory could not load.</b>
                <p>
                  Check that the API is running at <code>{API_BASE}</code>, then
                  try again.
                </p>
                <button
                  type="button"
                  className="ml-link-button"
                  onClick={() => loadTerras()}
                >
                  <RefreshCw size={14} /> Try again
                </button>
              </div>
            )}

            {terraState === "ready" &&
              terras.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  aria-pressed={activeTerra?.id === t.id}
                  className={"terra-tile " + (TERRA_TONE[t.name] ?? "t-mina")}
                  onClick={() => void chooseTerra(t)}
                >
                  <span className="tile-am">{t.name_am ?? ""}</span>
                  <span className="tile-icon">{t.icon}</span>
                  <b>{t.name}</b>
                  <small>{t.description}</small>
                  <i>
                    {t.trader_count} {t.trader_count === 1 ? "shop" : "shops"}{" "}
                    <ArrowUpRight size={13} />
                  </i>
                </button>
              ))}
          </div>
        </section>

        {activeTerra && (
          <section className="shop-section" id="trader-directory">
            <div className="section-heading">
              <div>
                <div className="kicker">{activeTerra.name} terra</div>
                <h2>Shops in {activeTerra.name}</h2>
                <p>{activeTerra.description}</p>
              </div>
            </div>

            {traderState === "loading" && (
              <p className="ml-empty">Loading shops…</p>
            )}
            {traderState === "error" && (
              <div className="ml-error" role="alert">
                <b>The shops in this terra could not load.</b>
                <button
                  type="button"
                  className="ml-link-button"
                  onClick={() => void chooseTerra(activeTerra)}
                >
                  <RefreshCw size={14} /> Try again
                </button>
              </div>
            )}
            {traderState === "ready" && traders.length === 0 && (
              <p className="ml-empty">No verified shops in this terra yet.</p>
            )}
            {traderState === "ready" && traders.length > 0 && (
              <div className="ml-trader-grid">
                {traders.map((trader) => (
                  <button
                    type="button"
                    key={trader.id}
                    className={
                      "ml-trader-card" +
                      (selectedTrader?.id === trader.id ? " is-selected" : "")
                    }
                    style={
                      trader.primary_color
                        ? { borderLeftColor: trader.primary_color }
                        : undefined
                    }
                    onClick={() => void openTrader(trader)}
                  >
                    <b>{trader.name}</b>
                    <small>
                      Shop {trader.shop_no} · {trader.landmark}
                    </small>
                    {trader.tagline && <span>{trader.tagline}</span>}
                    <span className="ml-badges">
                      {trader.verified && (
                        <em className="ml-badge">Verified</em>
                      )}
                      <em className="ml-badge">
                        {trader.vat_registered
                          ? "VAT-registered"
                          : "No VAT charged"}
                      </em>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div>
              <div className="kicker">Wholesale listings</div>
              <h2>
                {selectedTrader
                  ? selectedTrader.name
                  : "Choose a shop to begin."}
              </h2>
              <p>
                {selectedTrader
                  ? `${selectedTrader.tagline ?? "Wholesale listings"} · Shop ${selectedTrader.shop_no}, ${selectedTrader.landmark}`
                  : "Pick a terra above, then open one of its shops."}
              </p>
            </div>
            {selectedTrader && (
              <a href="#terras" className="viewall">
                Back to terras <ArrowUpRight size={16} />
              </a>
            )}
          </div>

          {!selectedTrader && (
            <p className="ml-empty">
              Nothing is listed yet. Choose a terra and open a shop to see its
              products.
            </p>
          )}
          {selectedTrader && catalogState === "loading" && (
            <p className="ml-empty">Loading products…</p>
          )}
          {selectedTrader && catalogState === "error" && (
            <div className="ml-error" role="alert">
              <b>This shop's catalog could not load.</b>
              <button
                type="button"
                className="ml-link-button"
                onClick={() => void openTrader(selectedTrader)}
              >
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          )}

          {selectedTrader && catalogState === "ready" && (
            <>
              <div className="shop-controls">
                <div className="categories">
                  {categories.map((c) => (
                    <button
                      type="button"
                      className={
                        category === c ? "category active" : "category"
                      }
                      onClick={() => setCategory(c)}
                      key={c}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <span className="resultcount">
                  Showing {shown.length} of {shopProducts.length}
                </span>
              </div>

              {shown.length === 0 ? (
                <p className="ml-empty">
                  {shopProducts.length === 0
                    ? "This shop has no listings yet."
                    : "No products match your search. Clear the search or pick another category."}
                </p>
              ) : (
                <div className="product-grid">
                  {shown.map((p) => {
                    const qty = cart.lines[p.id]?.qty ?? 0;
                    return (
                      <article className="product" key={p.id}>
                        <div className={"product-visual " + p.bg}>
                          <span className="prod-emoji">{p.emoji}</span>
                          {p.amharic && (
                            <span className="amharic">{p.amharic}</span>
                          )}
                          {!p.inStock && (
                            <span className="product-tag">Out of stock</span>
                          )}
                          <button
                            type="button"
                            className="quick-add"
                            aria-label={`Add ${p.name} to your bag`}
                            disabled={!p.inStock}
                            onClick={() => changeQty(p, selectedTrader, 1)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="product-meta">
                          <span>{p.category}</span>
                          <span>{p.unit}</span>
                        </div>
                        <div className="product-title">
                          <h3>{p.name}</h3>
                          <b>{birr(p.price)}</b>
                        </div>
                        <p className="product-note">{p.note}</p>
                        {qty > 0 && (
                          <div className="inline-qty">
                            <button
                              type="button"
                              aria-label={`Remove one ${p.name}`}
                              onClick={() => changeQty(p, selectedTrader, -1)}
                            >
                              <Minus size={13} />
                            </button>
                            <b>{qty} in your bag</b>
                            <button
                              type="button"
                              aria-label={`Add one more ${p.name}`}
                              onClick={() => changeQty(p, selectedTrader, 1)}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
              <div className="loadmore">
                <span /> Fictional demo data <span />
              </div>
            </>
          )}
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-heading">
            <div className="kicker">A simpler way to source wholesale</div>
            <h2>
              From market discovery
              <br />
              to a ready order.
            </h2>
            <p>
              MerkatoLink helps retailers explore Addis Ababa’s wholesale market
              online, then contact a trader with a clear order request.
            </p>
          </div>
          <div className="how-steps">
            <article>
              <span>01</span>
              <Store />
              <h3>Choose a terra</h3>
              <p>
                Start with a market section such as Kimem, Shema, Somali, Termus
                or Minalesh.
              </p>
            </article>
            <article>
              <span>02</span>
              <Boxes />
              <h3>Find a trader</h3>
              <p>
                Compare shop locations, verification badges and wholesale
                listings. Products show their selling unit and minimum order.
              </p>
            </article>
            <article>
              <span>03</span>
              <Wallet />
              <h3>Send your order</h3>
              <p>
                Add quantities, choose pickup or delivery and select a payment
                method. The trader follows up to confirm the details.
              </p>
            </article>
          </div>
          <a
            className="hero-cta"
            href="#terras"
            onClick={(event) => {
              event.preventDefault();
              scrollToId("terras");
            }}
          >
            Explore the market <ArrowRight size={16} />
          </a>
        </section>

        <section className="story" id="story">
          <div className="story-art">
            <div className="story-circle">
              ከአዲስ
              <br />
              <small>Addis Ababa</small>
            </div>
            <span className="story-scribble">✳</span>
          </div>
          <div className="story-copy">
            <div className="kicker">About our website</div>
            <h2>
              Meet MerkatoLink,
              <br />
              wholesale trade,
              <br />
              <em>connected.</em>
            </h2>
            <p>
              MerkatoLink is an online wholesale marketplace designed around the
              way Addis Ababa’s Merkato is organized. Browse by terra, discover
              independent traders and request products by familiar wholesale
              units such as cartons, sacks and rolls.
            </p>
            <p>
              The website brings market discovery and business tools into one
              place. Buyers can prepare clear order requests, while traders can
              review incoming demo orders and explore tools for inventory and
              pricing. This preview uses fictional shops, people and prices;
              orders are for demonstration only.
            </p>
            <a
              href="#how-it-works"
              onClick={(event) => {
                event.preventDefault();
                scrollToId("how-it-works");
              }}
            >
              See how MerkatoLink works <ArrowRight size={15} />
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="footerbrand">
          <span className="seal">M</span>
          <div>
            <b>MerkatoLink</b>
            <small>Demo marketplace</small>
          </div>
        </div>
        <span>
          Made in Addis Ababa, Ethiopia{" "}
          <span className="amharic-foot">አዲስ አበባ</span>
        </span>
        <div className="social">
          <button
            type="button"
            className="manage"
            onClick={() => setAdmin(!admin)}
          >
            {admin ? "Back to shop" : "Trader workspace (preview)"}{" "}
            <ArrowUpRight size={13} />
          </button>
        </div>
      </footer>

      {admin && (
        <div className="admin-overlay">
          <div className="admin-top">
            <button type="button" onClick={() => setAdmin(false)}>
              <ArrowLeft size={17} /> Back to storefront
            </button>
            <span>
              MerkatoLink <i /> Trader workspace preview
            </span>
          </div>
          <div className="admin-content">
            <div className="admin-welcome">
              <div className="kicker">{todayLabel}</div>
              <h1>Your shop, at a glance.</h1>
              <p>
                Local demo workspace · fictional transactions saved on this
                computer.
              </p>
            </div>

            <div className="admin-stats">
              {SAMPLE_STATS.map(([label, value, hint]) => (
                <div key={label}>
                  <small>{label}</small>
                  <b>{value}</b>
                  <span>{hint}</span>
                </div>
              ))}
            </div>

            <div className="admin-panels">
              <section>
                <div className="admin-panel-head">
                  <h2>Recent orders</h2>
                </div>
                {demoOrders.length ? (
                  demoOrders
                    .slice()
                    .reverse()
                    .slice(0, 8)
                    .map((order) => (
                      <div className="orderrow" key={order.invoice_no}>
                        <b>{order.invoice_no.slice(-5)}</b>
                        <span>{order.buyer_name}</span>
                        <small>{order.items.length} lines</small>
                        <b>{birr(order.total)}</b>
                        <select
                          aria-label={`Status for ${order.invoice_no}`}
                          value={order.status}
                          onChange={(event) =>
                            void updateDemoOrder(
                              order.invoice_no,
                              event.target.value as DemoOrder["status"],
                            )
                          }
                        >
                          <option value="new">New</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    ))
                ) : (
                  <p className="ml-empty">
                    No demo orders yet. Place an order in the storefront and it
                    will appear here.
                  </p>
                )}
              </section>
              <section className="restock">
                <div className="admin-panel-head">
                  <h2>Restock soon</h2>
                </div>
                {SAMPLE_RESTOCK.map(([icon, name, left]) => (
                  <div className="restockrow" key={name}>
                    <span>{icon}</span>
                    <b>{name}</b>
                    <small>{left}</small>
                  </div>
                ))}
              </section>
            </div>

            <section className="rateshock">
              <div className="admin-panel-head">
                <div>
                  <h2>LandedBirr · Rate Shock</h2>
                  <small>
                    See what a dollar-rate change means for your margins.
                  </small>
                </div>
                <span>Illustrative demo</span>
              </div>
              <div className="ratecontrol">
                <label>
                  USD / ETB <b>{rate.toFixed(2)}</b>{" "}
                  <small>
                    ({rateChange >= 0 ? "+" : ""}
                    {rateChange.toFixed(1)}% from {BASE_RATE.toFixed(1)})
                  </small>
                  <input
                    type="range"
                    min="130"
                    max="200"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                  />
                </label>
                <div className="ratepresets">
                  {[5, 10, 20].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setRate(round2(BASE_RATE * (1 + n / 100)))}
                    >
                      +{n}%
                    </button>
                  ))}
                  <button type="button" onClick={() => setRate(BASE_RATE)}>
                    Reset
                  </button>
                </div>
              </div>
              <div className="risk-table">
                <div>
                  <b>Imported product</b>
                  <b>Margin now</b>
                  <b>At {rate.toFixed(1)}</b>
                  <b>Signal</b>
                </div>
                {rateRows.map((row) => (
                  <div key={row.name}>
                    <span>{row.name}</span>
                    <span>{row.baseMargin}%</span>
                    <span>{row.margin.toFixed(1)}%</span>
                    <i className={row.below ? "risk" : "safe"}>
                      {row.below ? `Below ${row.target}% target` : "Healthy"}
                    </i>
                  </div>
                ))}
              </div>
              <small className="tax-disclaimer">
                Illustrative demo rates only. Verify the import tax bases and
                rates with the Ethiopian Customs Commission before any business
                use.
              </small>
            </section>
          </div>
        </div>
      )}

      {drawerOpen && (
        <div className="drawer-scrim" onClick={closeDrawer}>
          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawerhead">
              <div>
                <small>{cart.trader ? cart.trader.name : "MerkatoLink"}</small>
                <h2>
                  Your bag <span>({count})</span>
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close your bag"
                onClick={closeDrawer}
              >
                <X />
              </button>
            </div>

            {placed ? (
              <div className="success">
                <span>✓</span>
                <h2>
                  {placed.saved ? "Order placed." : "Demo order created."}
                </h2>
                <p>
                  {placed.saved
                    ? "The trader has your order and will confirm the delivery or pickup by phone."
                    : "This fictional demo order is saved locally for the trader workspace. It is not sent to a real shop."}
                </p>
                <b>
                  Reference {placed.reference} · {birr(placed.total)}
                </b>
                <button
                  type="button"
                  onClick={() => {
                    resetCheckout();
                    setDrawerOpen(false);
                  }}
                >
                  Back to the shop <ArrowRight size={15} />
                </button>
              </div>
            ) : count === 0 ? (
              <div className="emptybag">
                <ShoppingBag size={30} />
                <h3>Your bag is empty.</h3>
                <p>
                  Open a shop and add products by the unit they are sold in.
                </p>
                <button type="button" onClick={closeDrawer}>
                  Explore the shops <ArrowRight size={15} />
                </button>
              </div>
            ) : step === "checkout" ? (
              <div className="checkout">
                <button
                  type="button"
                  className="backcart"
                  onClick={() => setStep("bag")}
                >
                  <ArrowLeft size={14} /> Back to bag
                </button>
                <h3>How should we complete this order?</h3>
                <p>The trader confirms delivery or pickup by phone.</p>

                <label>
                  Buyer name
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Name for the order"
                    autoComplete="name"
                  />
                  {errors.name && (
                    <span className="ml-field-error">{errors.name}</span>
                  )}
                </label>
                <label>
                  Phone number
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="0912 345 678"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <span className="ml-field-error">{errors.phone}</span>
                  )}
                </label>

                <fieldset className="ml-radio-group">
                  <legend>Delivery</legend>
                  {(Object.keys(DELIVERY_LABELS) as DeliveryType[]).map(
                    (key) => (
                      <label key={key}>
                        <input
                          type="radio"
                          name="delivery"
                          checked={delivery === key}
                          onChange={() => setDelivery(key)}
                        />
                        <span>
                          {DELIVERY_LABELS[key]}
                          <small>
                            {DELIVERY_FEES[key] === 0
                              ? "Free"
                              : birr(DELIVERY_FEES[key])}
                          </small>
                        </span>
                      </label>
                    ),
                  )}
                </fieldset>

                {delivery !== "pickup" && (
                  <label>
                    Delivery location
                    <input
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="Terra, shop number or landmark"
                    />
                    {errors.address && (
                      <span className="ml-field-error">{errors.address}</span>
                    )}
                  </label>
                )}

                <fieldset className="ml-radio-group">
                  <legend>Payment</legend>
                  {(Object.keys(PAYMENT_LABELS) as PaymentTerms[]).map(
                    (key) => (
                      <label key={key}>
                        <input
                          type="radio"
                          name="payment"
                          checked={payment === key}
                          onChange={() => setPayment(key)}
                        />
                        <span>{PAYMENT_LABELS[key]}</span>
                      </label>
                    ),
                  )}
                </fieldset>

                <div className="carttotals">
                  <span>
                    Subtotal <b>{birr(subtotal)}</b>
                  </span>
                  <span>
                    {cart.trader?.vat_registered ? "VAT 15%" : "VAT"}{" "}
                    <b>
                      {cart.trader?.vat_registered ? birr(vat) : "Not charged"}
                    </b>
                  </span>
                  <span>
                    Delivery{" "}
                    <b>{deliveryFee === 0 ? "Free" : birr(deliveryFee)}</b>
                  </span>
                  <span className="grand">
                    Total <b>{birr(total)}</b>
                  </span>
                </div>

                {submitError && (
                  <p className="ml-field-error" role="alert">
                    {submitError}
                  </p>
                )}
                <button
                  type="button"
                  className="placeorder"
                  disabled={submitting}
                  onClick={() => void placeOrder()}
                >
                  {submitting
                    ? "Placing order…"
                    : `Place order · ${birr(total)}`}{" "}
                  <ArrowRight size={16} />
                </button>
                <small className="vatnote">
                  {cart.trader?.vat_registered
                    ? "VAT is added because this trader is VAT-registered."
                    : "This trader is not VAT-registered, so no VAT is charged."}{" "}
                  No payment is taken online.
                </small>
              </div>
            ) : (
              <>
                <div className="bagitems">
                  {cartLines.map(({ product, qty }) => (
                    <div className="bagitem" key={product.id}>
                      <span className={"bagemoji " + product.bg}>
                        {product.emoji}
                      </span>
                      <div className="bagdesc">
                        <b>{product.name}</b>
                        <small>
                          {product.unit} · {birr(product.price)}
                        </small>
                        <div className="stepper">
                          <button
                            type="button"
                            aria-label={`Remove one ${product.name}`}
                            onClick={() =>
                              cart.trader && changeQty(product, cart.trader, -1)
                            }
                          >
                            <Minus size={12} />
                          </button>
                          <span>{qty}</span>
                          <button
                            type="button"
                            aria-label={`Add one more ${product.name}`}
                            onClick={() =>
                              cart.trader && changeQty(product, cart.trader, 1)
                            }
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <b>{birr(product.price * qty)}</b>
                    </div>
                  ))}
                </div>
                <div className="deliveryhint">
                  <Truck size={16} />
                  <span>
                    <b>Pickup, porter or truck</b>
                    <small>
                      You choose how to receive the order at checkout.
                    </small>
                  </span>
                </div>
                <div className="carttotals">
                  <span>
                    Subtotal <b>{birr(subtotal)}</b>
                  </span>
                  <span>
                    {cart.trader?.vat_registered ? "VAT 15%" : "VAT"}{" "}
                    <b>
                      {cart.trader?.vat_registered ? birr(vat) : "Not charged"}
                    </b>
                  </span>
                  <span className="grand">
                    Total before delivery <b>{birr(round2(subtotal + vat))}</b>
                  </span>
                  <button type="button" onClick={() => setStep("checkout")}>
                    Continue to checkout <ArrowRight size={16} />
                  </button>
                  <small>Cash, transfer, mobile money or credit</small>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {toast && <div className="toast">✳ {toast}</div>}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
