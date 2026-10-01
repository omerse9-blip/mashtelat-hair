import { sizeLabel } from "./siteData";

// חישוב מחירים בצד השרת. המחירים, השמות ודמי המשלוח נקבעים כאן מהטבלאות,
// ומה שהדפדפן שלח משמש רק לזיהוי המוצר והגודל ולבדיקה שהלקוח ראה את המחיר הנכון.

const WINDOWS_KEY = -1;
const DEFAULT_CITY_FEE = 30;
const DEFAULT_HOTEL_FEE = 50;
const MAX_GROUPS = 10;
const MAX_ITEMS_PER_GROUP = 100;
const MAX_QUANTITY = 100;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STALE_MESSAGE = "המחירים או המוצרים בעגלה התעדכנו. יש לחזור לעגלה ולהוסיף את המוצרים מחדש.";

export class PricingError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "PricingError";
    this.status = status;
  }
}

function cents(n) {
  return Math.round(Number(n) * 100);
}

async function loadFees(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from("delivery_settings")
    .select("city_fee, hotel_fee")
    .eq("day_of_week", WINDOWS_KEY)
    .maybeSingle();
  if (error) throw new Error("delivery fee lookup failed: " + error.message);
  return {
    city: data && data.city_fee != null ? Number(data.city_fee) : DEFAULT_CITY_FEE,
    hotel: data && data.hotel_fee != null ? Number(data.hotel_fee) : DEFAULT_HOTEL_FEE,
  };
}

async function loadProducts(supabaseAdmin, ids) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, name, has_sizes, single_price, is_active, categories(online_payment_enabled), product_sizes(*)")
    .in("id", ids);
  if (error) throw new Error("product lookup failed: " + error.message);
  const byId = {};
  for (const p of data || []) byId[p.id] = p;
  return byId;
}

function priceItem(product, item) {
  if (!product || !product.is_active) throw new PricingError(STALE_MESSAGE, 409);

  const clientPrice = Number(item.price);
  let dbPrice;
  let label;

  if (product.has_sizes) {
    const sizes = product.product_sizes || [];
    const wanted = String(item.sizeLabel || "");
    const candidates = sizes.filter((s) => sizeLabel(s) === wanted);
    if (candidates.length === 0) throw new PricingError(STALE_MESSAGE, 409);
    const exact = candidates.find((s) => cents(s.price) === cents(clientPrice));
    const chosen = exact || candidates[0];
    dbPrice = Number(chosen.price);
    label = sizeLabel(chosen);
  } else {
    if (product.single_price == null) throw new PricingError(STALE_MESSAGE, 409);
    dbPrice = Number(product.single_price);
    label = String(item.sizeLabel || "").slice(0, 120);
  }

  if (!Number.isFinite(dbPrice) || dbPrice < 0) throw new PricingError(STALE_MESSAGE, 409);
  if (!Number.isFinite(clientPrice) || cents(dbPrice) !== cents(clientPrice)) {
    throw new PricingError(STALE_MESSAGE, 409);
  }

  return { name: product.name, sizeLabel: label, price: dbPrice };
}

// groups: [{ details, items:[{productId, sizeLabel, price, quantity}] }]
// מחזיר groups חדשים עם מחירים ודמי משלוח מהמסד, או זורק PricingError
export async function priceGroups(supabaseAdmin, groups, { requireOnline = false } = {}) {
  if (!Array.isArray(groups) || groups.length === 0 || groups.length > MAX_GROUPS) {
    throw new PricingError("נתוני ההזמנה חסרים", 400);
  }

  const ids = new Set();
  for (const g of groups) {
    if (!g || !Array.isArray(g.items) || g.items.length === 0 || g.items.length > MAX_ITEMS_PER_GROUP) {
      throw new PricingError("העגלה ריקה", 400);
    }
    for (const it of g.items) {
      if (!it || typeof it.productId !== "string" || !UUID_RE.test(it.productId)) {
        throw new PricingError(STALE_MESSAGE, 409);
      }
      ids.add(it.productId);
    }
  }

  const [products, fees] = await Promise.all([
    loadProducts(supabaseAdmin, [...ids]),
    loadFees(supabaseAdmin),
  ]);

  // אם בעגלה יש פריט שאין לו תשלום מקוון, מחיר המשלוח מתואם עם הלקוח ולא נקבע כאן
  let coordinated = false;
  for (const g of groups) {
    for (const it of g.items) {
      const pr = products[it.productId];
      if (!(pr && pr.categories && pr.categories.online_payment_enabled)) coordinated = true;
    }
  }

  const priced = [];
  for (const g of groups) {
    const details = { ...(g.details || {}) };

    const items = g.items.map((it) => {
      const qty = Number(it.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
        throw new PricingError("כמות לא תקינה בעגלה", 400);
      }
      const product = products[it.productId];
      if (requireOnline && !(product && product.categories && product.categories.online_payment_enabled)) {
        throw new PricingError("חלק מהמוצרים בעגלה אינם זמינים לתשלום באשראי", 400);
      }
      const p = priceItem(product, it);
      return { productId: it.productId, name: p.name, sizeLabel: p.sizeLabel, price: p.price, quantity: qty };
    });

    let fee = 0;
    let feeLabel = "דמי משלוח";
    if (details.fulfillment_type === "pickup") {
      fee = 0;
      details.delivery_sub_type = null;
    } else {
      const sub = details.delivery_sub_type;
      if (sub !== "city" && sub !== "hotel") {
        throw new PricingError("יש לבחור משלוח בעיר או למלון", 400);
      }
      fee = coordinated ? 0 : fees[sub];
      feeLabel = sub === "hotel" ? "דמי משלוח למלון" : "דמי משלוח בעיר";
    }
    details.delivery_fee = fee;

    priced.push({ details, items, deliveryFee: fee, feeLabel, coordinated });
  }

  return priced;
}
