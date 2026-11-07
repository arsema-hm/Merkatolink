import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Minus,
  X,
  Menu,
  ChevronRight,
  Package,
  LayoutDashboard,
  Settings,
  ChartNoAxesCombined,
  Camera,
  MessageCircle,
  Leaf,
  Truck,
  Clock,
  Heart,
  ArrowLeft,
} from "lucide-react";
import "./style.css";
type Product = {
  id: number;
  name: string;
  amharic: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  emoji: string;
  bg: string;
  note: string;
};
const products: Product[] = [
  {
    id: 1,
    name: "White Teff",
    amharic: "ጤፍ",
    category: "Grains & staples",
    price: 1350,
    stock: 24,
    unit: "5 kg",
    emoji: "🌾",
    bg: "sand",
    note: "Fresh from Debre Zeit",
  },
  {
    id: 2,
    name: "Yirgacheffe Coffee",
    amharic: "የርጋጨፌ",
    category: "Coffee & tea",
    price: 890,
    stock: 18,
    unit: "500 g",
    emoji: "☕",
    bg: "rose",
    note: "Single-origin · Medium roast",
  },
  {
    id: 3,
    name: "Cold-Pressed Nib Oil",
    amharic: "ዘይት",
    category: "Oils & pantry",
    price: 760,
    stock: 8,
    unit: "1 L",
    emoji: "🫒",
    bg: "sage",
    note: "Small-batch · Local maker",
  },
  {
    id: 4,
    name: "Berbere Spice Blend",
    amharic: "በርበሬ",
    category: "Spices",
    price: 340,
    stock: 32,
    unit: "250 g",
    emoji: "🌶️",
    bg: "clay",
    note: "Stone-ground · Awaze recipe",
  },
  {
    id: 5,
    name: "Red Lentils",
    amharic: "ምስር",
    category: "Grains & staples",
    price: 420,
    stock: 39,
    unit: "1 kg",
    emoji: "🫘",
    bg: "lavender",
    note: "Sorted and ready to cook",
  },
  {
    id: 6,
    name: "Shiro Powder",
    amharic: "ሽሮ",
    category: "Grains & staples",
    price: 295,
    stock: 27,
    unit: "500 g",
    emoji: "🥣",
    bg: "cream",
    note: "Traditional chickpea blend",
  },
  {
    id: 7,
    name: "Raw Sidama Honey",
    amharic: "ማር",
    category: "Oils & pantry",
    price: 980,
    stock: 11,
    unit: "500 g",
    emoji: "🍯",
    bg: "gold",
    note: "Wildflower · Unfiltered",
  },
  {
    id: 8,
    name: "Gomen Greens",
    amharic: "ጎመን",
    category: "Fresh & local",
    price: 115,
    stock: 15,
    unit: "bunch",
    emoji: "🥬",
    bg: "green",
    note: "Picked this morning",
  },
];
const cats = [
  "Everything",
  "Grains & staples",
  "Coffee & tea",
  "Oils & pantry",
  "Spices",
  "Fresh & local",
];
const birr = (n: number) => "ETB " + n.toLocaleString();
function App() {
  const [admin, A] = useState(false),
    [category, C] = useState("Everything"),
    [query, Q] = useState(""),
    [cart, K] = useState<Record<number, number>>({}),
    [drawer, D] = useState(false),
    [mobile, M] = useState(false),
    [toast, T] = useState(""),
    [checkout, O] = useState(false),
    [placed, P] = useState(false),
    [rate, R] = useState(156.4);
  const [terraCounts, setTerraCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    const controller = new AbortController();
    const base = import.meta.env.VITE_API_URL || "http://localhost:4000";
    void fetch(`${base}/v1/terras`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Directory unavailable");
        return response.json() as Promise<{
          data: { name: string; trader_count: number }[];
        }>;
      })
      .then(({ data }) =>
        setTerraCounts(
          Object.fromEntries(
            data.map((terra) => [terra.name, terra.trader_count]),
          ),
        ),
      )
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  const shown = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "Everything" || p.category === category) &&
          p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, query],
  );
  const count = Object.values(cart).reduce((a, b) => a + b, 0),
    total = products.reduce((s, p) => s + p.price * (cart[p.id] || 0), 0);
  function note(s: string) {
    T(s);
    setTimeout(() => T(""), 2500);
  }
  function add(id: number, delta = 1) {
    K((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
    if (delta > 0) D(true);
  }
  return (
    <div className="site">
      <div className="announcement">
        <span>SELAM WHOLESALE · ADDIS ABABA</span>
        <b>Good things, close to home.</b>
        <span>
          Delivery across the city <ArrowRight size={13} />
        </span>
      </div>
      <header className="header">
        <button className="menuicon" onClick={() => M(!mobile)}>
          <Menu />
        </button>
        <a className="wordmark" href="#top">
          <span className="seal">S.</span>
          <span>
            selam<small>WHOLESALE · SINCE 2018</small>
          </span>
        </a>
        <nav className={mobile ? "open" : ""}>
          <a href="#shop">Shop</a>
          <a href="#story">Our story</a>
          <a href="#promise">How it works</a>
        </nav>
        <div className="headeractions">
          <label className="searchfield">
            <Search size={17} />
            <input
              placeholder="Find something good"
              value={query}
              onChange={(e) => Q(e.target.value)}
            />
            <kbd>⌘ K</kbd>
          </label>
          <button className="bagbutton" onClick={() => D(true)}>
            <ShoppingBag size={18} />
            <span>Bag</span>
            <i>{count}</i>
          </button>
        </div>
      </header>
      <main id="top">
        <section className="terra-directory">
          <div className="terra-intro">
            <div className="kicker">THE MARKET, ORGANIZED BY TERRA</div>
            <h2>
              Find your <em>corner</em>
              <br />
              of Merkato.
            </h2>
            <p>
              A market is more than what is on the shelves. Start with the
              place, meet the traders, and find the right wholesale partner.
            </p>
            <span>FICTIONAL MARKETPLACE · DEMO DATA</span>
          </div>
          <div className="terra-tiles">
            {[
              {
                n: "Shema",
                am: "ሸማ",
                desc: "Cloth & textiles",
                count: "12 traders",
                icon: "▧",
                c: "t-shema",
              },
              {
                n: "Kimem",
                am: "ቅመም",
                desc: "Spices & staples",
                count: "18 traders",
                icon: "✳",
                c: "t-kimem",
              },
              {
                n: "Somali",
                am: "ሶማሌ",
                desc: "Auto & machine parts",
                count: "9 traders",
                icon: "⚙",
                c: "t-somali",
              },
              {
                n: "Termus",
                am: "ቴርሙስ",
                desc: "Bottles & household",
                count: "14 traders",
                icon: "◉",
                c: "t-termus",
              },
              {
                n: "Minalesh",
                am: "ምን አለሽ",
                desc: "Mixed goods & finds",
                count: "23 traders",
                icon: "✦",
                c: "t-mina",
              },
            ].map((t) => (
              <button
                className={"terra-tile " + t.c}
                onClick={() => {
                  C(
                    t.n === "Kimem"
                      ? "Grains & staples"
                      : t.n === "Somali"
                        ? "Spices"
                        : t.n === "Termus"
                          ? "Oils & pantry"
                          : "Everything",
                  );
                  document
                    .getElementById("shop")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span className="tile-am">{t.am}</span>
                <span className="tile-icon">{t.icon}</span>
                <b>{t.n}</b>
                <small>{t.desc}</small>
                <i>
                  {terraCounts[t.n] === undefined
                    ? "Demo directory"
                    : terraCounts[t.n] + " verified shops"}
                  　↗
                </i>
              </button>
            ))}
          </div>
        </section>
        <section className="hero">
          <div className="hero-copy">
            <div className="kicker">
              <span /> YOUR NEIGHBORHOOD WHOLESALER
            </div>
            <h1>
              A little closer
              <br />
              to <em>good.</em>
            </h1>
            <p>
              Everyday essentials, Ethiopian favorites, and good things from
              nearby. Thoughtfully picked, fairly priced, ready for your home.
            </p>
            <a className="hero-cta" href="#shop">
              Shop the collection <ArrowRight size={16} />
            </a>
            <div className="hero-note">
              <div className="tinyfaces">
                <i>A</i>
                <i>M</i>
                <i>S</i>
              </div>
              <span>
                Loved by <b>1,200+</b> homes in Addis
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-sun" />
            <div className="art-caption">
              <span>01 / FROM OUR SHELVES</span>
              <b>
                Market mornings,
                <br />
                made simple.
              </b>
            </div>
            <div className="basket">
              <div className="basketcloth" />
              <span className="basket-item one">🌾</span>
              <span className="basket-item two">🍞</span>
              <span className="basket-item three">🍊</span>
              <span className="basket-item four">🌿</span>
              <div className="basket-weave" />
            </div>
            <div className="art-stamp">
              LOCAL
              <br />& GOOD
              <br />
              <span>✳</span>
            </div>
            <div className="hero-image-label">
              THE SELAM EDIT <span>✳</span> ADDIS ABABA
            </div>
          </div>
          <div className="hero-index">
            01 <span /> 03
          </div>
        </section>
        <section className="promise" id="promise">
          <div>
            <span className="promise-icon">
              <Leaf />
            </span>
            <b>Good things, close by</b>
            <small>Picked with care from local makers</small>
          </div>
          <div>
            <span className="promise-icon">
              <Truck />
            </span>
            <b>Easy city delivery</b>
            <small>To your door, across Addis</small>
          </div>
          <div>
            <span className="promise-icon">
              <Heart />
            </span>
            <b>Prices that feel fair</b>
            <small>Everyday value, always</small>
          </div>
          <div className="promise-aside">
            Small business.
            <br />
            <em>Big heart.</em>
          </div>
        </section>
        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div>
              <div className="kicker">
                A GOOD PLACE TO START <span>✳</span>
              </div>
              <h2>
                The everyday <em>edit.</em>
              </h2>
              <p>Useful things, lovely things, and the in-between.</p>
            </div>
            <a href="#shop" className="viewall">
              See all 40 products <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="shop-controls">
            <div className="categories">
              {cats.map((c, i) => (
                <button
                  className={category === c ? "category active" : "category"}
                  onClick={() => C(c)}
                  key={c}
                >
                  {i === 0 && <span>✳</span>}
                  {c}
                </button>
              ))}
            </div>
            <span className="resultcount">SHOWING {shown.length} OF 40</span>
          </div>
          <div className="product-grid">
            {shown.map((p, i) => (
              <article className="product" key={p.id}>
                <button
                  className={"product-visual " + p.bg}
                  onClick={() => note(p.note)}
                >
                  <span className="prod-emoji">{p.emoji}</span>
                  <span className="amharic">{p.amharic}</span>
                  {(i === 0 || p.stock < 10) && (
                    <span className="product-tag">
                      {i === 0 ? "A SELAM FAVORITE" : "ALMOST GONE"}
                    </span>
                  )}
                  <button
                    className="quick-add"
                    onClick={(e) => {
                      e.stopPropagation();
                      add(p.id);
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </button>
                <div className="product-meta">
                  <span>{p.category.toUpperCase()}</span>
                  <span>{p.unit}</span>
                </div>
                <div className="product-title">
                  <h3>{p.name}</h3>
                  <b>{birr(p.price)}</b>
                </div>
                <p className="product-note">{p.note}</p>
                {cart[p.id] > 0 && (
                  <div className="inline-qty">
                    <button onClick={() => add(p.id, -1)}>
                      <Minus size={13} />
                    </button>
                    <b>{cart[p.id]} in your bag</b>
                    <button onClick={() => add(p.id, 1)}>
                      <Plus size={13} />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
          <div className="loadmore">
            <span /> MADE WITH CARE IN ADDIS <span />
          </div>
        </section>
        <section className="story" id="story">
          <div className="story-art">
            <div className="story-circle">
              ከአዲስ
              <br />
              <small>WITH LOVE</small>
            </div>
            <span className="story-scribble">✳</span>
          </div>
          <div className="story-copy">
            <div className="kicker">A NOTE FROM SELAM</div>
            <h2>
              Good food.
              <br />
              Good neighbors.
              <br />
              <em>That's the whole idea.</em>
            </h2>
            <p>
              We started with one small shop and a simple belief: the things we
              use every day should be good for us, good for our community, and
              easy to find.
            </p>
            <a href="#promise">
              A little more about us <ArrowRight size={15} />
            </a>
          </div>
        </section>
      </main>
      <footer>
        <div className="footerbrand">
          <span className="seal">S.</span>
          <div>
            <b>selam wholesale</b>
            <small>EVERYDAY, A LITTLE BETTER.</small>
          </div>
        </div>
        <span>
          Made with care in Addis Ababa, Ethiopia{" "}
          <span className="amharic-foot">አዲስ አበባ</span>
        </span>
        <div className="social">
          <button onClick={() => note("Instagram: @selamwholesale")}>
            <Camera />
          </button>
          <button onClick={() => note("Telegram: @selamwholesale")}>
            <MessageCircle />
          </button>
          <button className="manage" onClick={() => A(!admin)}>
            {admin ? "← Back to shop" : "Manage store"}{" "}
            <ArrowUpRight size={13} />
          </button>
        </div>
      </footer>
      {admin && (
        <div className="admin-overlay">
          <div className="admin-top">
            <button onClick={() => A(false)}>
              <ArrowLeft size={17} /> Back to storefront
            </button>
            <span>
              SELAM WHOLESALE <i /> OWNER VIEW
            </span>
          </div>
          <div className="admin-content">
            <div className="admin-welcome">
              <div className="kicker">FRIDAY · NOVEMBER 6, 2026</div>
              <h1>Your shop, at a glance.</h1>
              <p>Welcome back, Arsema. Here’s how things are moving.</p>
            </div>
            <div className="admin-stats">
              {[
                ["Sales this month", "ETB 284,650", "↑ 12.8%"],
                ["Orders", "1,284", "↑ 8.2%"],
                ["Average basket", "ETB 2,218", "↑ 2.4%"],
                ["Needs a restock", "06", "Check stock"],
              ].map((x) => (
                <div>
                  <small>{x[0]}</small>
                  <b>{x[1]}</b>
                  <span>{x[2]}</span>
                </div>
              ))}
            </div>
            <div className="admin-panels">
              <section>
                <div className="admin-panel-head">
                  <h2>Recent orders</h2>
                  <button>See all orders ↗</button>
                </div>
                {[
                  ["#2481", "Abebe Bekele", "4 items", "ETB 4,520", "New"],
                  [
                    "#2480",
                    "Sara Tesfaye",
                    "2 items",
                    "ETB 1,780",
                    "Confirmed",
                  ],
                  [
                    "#2479",
                    "Dawit Alemu",
                    "7 items",
                    "ETB 12,340",
                    "Delivered",
                  ],
                  [
                    "#2478",
                    "Mimi Grocery",
                    "3 items",
                    "ETB 2,890",
                    "Delivered",
                  ],
                ].map((o) => (
                  <div className="orderrow">
                    <b>{o[0]}</b>
                    <span>{o[1]}</span>
                    <small>{o[2]}</small>
                    <b>{o[3]}</b>
                    <i>{o[4]}</i>
                  </div>
                ))}
              </section>
              <section className="restock">
                <div className="admin-panel-head">
                  <h2>Restock soon</h2>
                  <button>Inventory ↗</button>
                </div>
                {products
                  .filter((p) => p.stock < 20)
                  .slice(0, 4)
                  .map((p) => (
                    <div className="restockrow">
                      <span>{p.emoji}</span>
                      <b>{p.name}</b>
                      <small>{p.stock} left</small>
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
                <span>DEMO RATE</span>
              </div>
              <div className="ratecontrol">
                <label>
                  USD / ETB <b>{rate.toFixed(2)}</b>
                  <input
                    type="range"
                    min="140"
                    max="190"
                    step="0.5"
                    value={rate}
                    onChange={(e) => R(Number(e.target.value))}
                  />
                </label>
                <div className="ratepresets">
                  {[5, 10, 20].map((n) => (
                    <button onClick={() => R(156.4 * (1 + n / 100))}>
                      +{n}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="risk-table">
                <div>
                  <b>Imported product</b>
                  <b>Current margin</b>
                  <b>At {rate.toFixed(1)}</b>
                  <b>Signal</b>
                </div>
                {[
                  [
                    "Brake Pad Set",
                    "28%",
                    Math.max(2, 28 - (rate - 156.4) * 0.55),
                  ],
                  [
                    "Wheel Bearing",
                    "24%",
                    Math.max(1, 24 - (rate - 156.4) * 0.47),
                  ],
                  [
                    "Vacuum Flask",
                    "31%",
                    Math.max(3, 31 - (rate - 156.4) * 0.38),
                  ],
                ].map((x) => (
                  <div>
                    <span>{x[0]}</span>
                    <span>{x[1]}</span>
                    <span>{Number(x[2]).toFixed(1)}%</span>
                    <i className={Number(x[2]) < 20 ? "risk" : "safe"}>
                      {Number(x[2]) < 20 ? "Below target" : "Healthy"}
                    </i>
                  </div>
                ))}
              </div>
              <small className="tax-disclaimer">
                Illustrative demo rates only. Verify applicable import tax bases
                and rates before business use.
              </small>
            </section>
            <div className="admin-note">
              <Package size={17} /> Your demo dashboard is powered by sample
              shop data.{" "}
              <button
                onClick={() =>
                  note("Supabase connection is configured in the project setup")
                }
              >
                Database setup <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
      {drawer && (
        <div className="drawer-scrim" onClick={() => D(false)}>
          <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawerhead">
              <div>
                <small>SELAM WHOLESALE</small>
                <h2>
                  Your bag <span>({count})</span>
                </h2>
              </div>
              <button onClick={() => D(false)}>
                <X />
              </button>
            </div>
            {placed ? (
              <div className="success">
                <span>✓</span>
                <h2>You're all set.</h2>
                <p>
                  Your order is on its way to the Selam team. We'll be in touch
                  to confirm delivery.
                </p>
                <b>Order #ML-2482 · Cash on delivery</b>
                <button
                  onClick={() => {
                    P(false);
                    D(false);
                    O(false);
                    K({});
                  }}
                >
                  Back to the shop <ArrowRight size={15} />
                </button>
              </div>
            ) : checkout ? (
              <div className="checkout">
                <button className="backcart" onClick={() => O(false)}>
                  <ArrowLeft size={14} /> Back to bag
                </button>
                <h3>Where should we bring it?</h3>
                <p>Delivery across Addis Ababa · usually same day</p>
                <label>
                  Your name
                  <input placeholder="Name for the order" />
                </label>
                <label>
                  Phone number
                  <input placeholder="+251 9..." />
                </label>
                <label>
                  Delivery address
                  <input placeholder="Subcity, neighborhood, house or landmark" />
                </label>
                <div className="payment">
                  <b>Payment</b>
                  <span>◉　Cash on delivery</span>
                  <span>○　Bank transfer</span>
                </div>
                <button className="placeorder" onClick={() => P(true)}>
                  Place order · {birr(total)} <ArrowRight size={16} />
                </button>
                <small className="vatnote">
                  Prices include 15% VAT. No payment is taken online.
                </small>
              </div>
            ) : (
              <>
                {count === 0 ? (
                  <div className="emptybag">
                    <ShoppingBag size={30} />
                    <h3>A little room for good things.</h3>
                    <p>Your bag is empty for now.</p>
                    <button onClick={() => D(false)}>
                      Explore the shop <ArrowRight size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bagitems">
                      {products
                        .filter((p) => cart[p.id])
                        .map((p) => (
                          <div className="bagitem">
                            <span className={"bagemoji " + p.bg}>
                              {p.emoji}
                            </span>
                            <div className="bagdesc">
                              <b>{p.name}</b>
                              <small>
                                {p.unit} · {birr(p.price)}
                              </small>
                              <div className="stepper">
                                <button onClick={() => add(p.id, -1)}>
                                  <Minus size={12} />
                                </button>
                                <span>{cart[p.id]}</span>
                                <button onClick={() => add(p.id, 1)}>
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                            <b>{birr(p.price * cart[p.id])}</b>
                          </div>
                        ))}
                    </div>
                    <div className="deliveryhint">
                      <Truck size={16} />
                      <span>
                        <b>Local delivery, made easy</b>
                        <small>
                          Our team will confirm your delivery window by phone.
                        </small>
                      </span>
                    </div>
                    <div className="carttotals">
                      <span>
                        Subtotal <b>{birr(total)}</b>
                      </span>
                      <span>
                        VAT included{" "}
                        <b>{birr(Math.round((total * 15) / 115))}</b>
                      </span>
                      <span className="grand">
                        Total <b>{birr(total)}</b>
                      </span>
                      <button onClick={() => O(true)}>
                        Continue to checkout <ArrowRight size={16} />
                      </button>
                      <small>
                        Cash on delivery or bank transfer · Always secure
                      </small>
                    </div>
                  </>
                )}
              </>
            )}
          </aside>
        </div>
      )}
      {toast && <div className="toast">✳　{toast}</div>}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
