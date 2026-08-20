import { unstable_cache } from "next/cache";
import { supabase } from "./supabaseClient";

const CACHE_SECONDS = 60;

function byPrice(list) {
  return [...(list || [])].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
}

// יצירת הזמנה דרך פונקציית RPC מאובטחת. מחזיר את מספר ההזמנה הרץ.
export async function createOrder(details, items) {
  const payload = items.map((it) => ({
    name: it.name,
    sizeLabel: it.sizeLabel || "",
    price: Number(it.price),
    quantity: it.quantity,
  }));
  const { data, error } = await supabase.rpc("create_public_order", {
    p_customer_name: details.customer_name,
    p_customer_phone: details.customer_phone,
    p_customer_address: details.customer_address || "",
    p_is_gift: details.is_gift,
    p_recipient_name: details.recipient_name || "",
    p_recipient_phone: details.recipient_phone || "",
    p_recipient_address: details.recipient_address || "",
    p_notes: details.notes || "",
    p_items: payload,
    p_fulfillment_type: details.fulfillment_type || "delivery",
    p_delivery_date: details.delivery_date || null,
    p_delivery_window: details.delivery_window || "",
    p_greeting: details.greeting || "",
  });
  if (error) throw new Error(error.message);
  return data;
}

// מחלקות לפי סוג (nursery / garden), ממוינות לפי position — עם מטמון
export const getCategories = unstable_cache(
  async (kind) => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("kind", kind)
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },
  ["categories"],
  { revalidate: CACHE_SECONDS, tags: ["categories"] }
);

// תמונת הרקע הראשית הפעילה (Hero) — עם מטמון
export const getActiveHeroImage = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("hero_images")
      .select("image_url")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.image_url || "/hero-nursery.jpg";
  },
  ["hero-image"],
  { revalidate: CACHE_SECONDS, tags: ["hero-image"] }
);

// מוצרים לפי מחלקה — עם מטמון
export const getProducts = unstable_cache(
  async (categoryId) => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_sizes(*), categories(size_type)")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map((p) => ({
      ...p,
      product_sizes: byPrice(p.product_sizes),
    }));
  },
  ["products"],
  { revalidate: CACHE_SECONDS, tags: ["products"] }
);

export async function getProductById(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_sizes(*), categories(name, kind, disclaimer, size_type)")
    .eq("id", id)
    .eq("is_active", true)
    .single();
  if (error) return null;
  return {
    ...data,
    product_sizes: byPrice(data.product_sizes),
  };
}

export const getAllProductIds = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .eq("is_active", true);
    if (error) throw new Error(error.message);
    return (data || []).map((p) => p.id);
  },
  ["product-ids"],
  { revalidate: CACHE_SECONDS, tags: ["products"] }
);

// הכוכבים שלנו — מוצרים מקודמים, נשלפים לפי טבלת featured_products בסדר שנקבע
export const getFeaturedProducts = unstable_cache(
  async () => {
    const { data: links, error: e1 } = await supabase
      .from("featured_products")
      .select("product_id, position")
      .order("position", { ascending: true });
    if (e1 || !links || !links.length) return [];

    const ids = links.map((l) => l.product_id);
    const { data: products, error: e2 } = await supabase
      .from("products")
      .select("*, product_sizes(*), categories(size_type)")
      .in("id", ids)
      .eq("is_active", true);
    if (e2 || !products) return [];

    // שמירה על סדר הכוכבים לפי position
    const map = {};
    for (const p of products) map[p.id] = { ...p, product_sizes: byPrice(p.product_sizes) };
    return links.map((l) => map[l.product_id]).filter(Boolean);
  },
  ["featured"],
  { revalidate: CACHE_SECONDS, tags: ["featured", "products"] }
);

// תוספות של מוצר: לפי המחלקה שלו, מקובצות לפי מחלקת מקור וממוינות לפי מחיר עולה
export async function getAddonsForCategory(categoryId) {
  const { data, error } = await supabase
    .from("category_addons")
    .select("product:products(*, product_sizes(*), categories(name, position, size_type))")
    .eq("category_id", categoryId);
  if (error) return [];

  // שליפת המוצרים, סינון פעילים ובמלאי בלבד (אזל לא מופיע)
  const products = (data || [])
    .map((r) => r.product)
    .filter((p) => p && p.is_active && p.in_stock)
    .map((p) => ({ ...p, product_sizes: byPrice(p.product_sizes) }));

  // חישוב מחיר התחלתי לכל מוצר
  const withStart = products.map((p) => {
    const start = p.has_sizes && p.product_sizes?.length
      ? Number(p.product_sizes[0].price)
      : (p.single_price != null ? Number(p.single_price) : 0);
    return { ...p, _start: start };
  });

  // קיבוץ לפי מחלקת מקור
  const groupsMap = {};
  for (const p of withStart) {
    const gid = p.category_id;
    if (!groupsMap[gid]) {
      groupsMap[gid] = {
        category_id: gid,
        category_name: p.categories?.name || "",
        category_position: p.categories?.position ?? 999,
        items: [],
      };
    }
    groupsMap[gid].items.push(p);
  }

  // מיון פריטים בכל קבוצה לפי מחיר עולה
  const groups = Object.values(groupsMap).map((g) => ({
    ...g,
    items: g.items.sort((a, b) => a._start - b._start),
    min_price: Math.min(...g.items.map((i) => i._start)),
  }));

  // מיון הקבוצות לפי המחיר ההתחלתי הזול ביותר, שובר שוויון לפי סדר המחלקות
  groups.sort((a, b) => {
    if (a.min_price !== b.min_price) return a.min_price - b.min_price;
    return a.category_position - b.category_position;
  });

  return groups;
}

// עבודות גינון לפי מחלקה — עם מטמון
export const getGardenWorks = unstable_cache(
  async (categoryId) => {
    const { data, error } = await supabase
      .from("garden_works")
      .select("*")
      .eq("category_id", categoryId)
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },
  ["garden-works"],
  { revalidate: CACHE_SECONDS, tags: ["garden-works"] }
);

// =====================================================================
// הגדרות מסירה — קריאה בצד האתר, וחישוב חלונות זמינים לתאריך
// =====================================================================
const WINDOWS_KEY = -1;
const DEFAULT_WINDOWS = ["10-12", "12-14", "14-16", "16-18", "18-20"];

// קריאת ההגדרות הגולמיות מהטבלה
async function readDeliveryRows() {
  const { data, error } = await supabase.from("delivery_settings").select("*");
  if (error) return { windows: DEFAULT_WINDOWS, base: {}, overrides: {} };
  const rows = data || [];

  const winRow = rows.find((r) => r.day_of_week === WINDOWS_KEY);
  const windows = winRow && Array.isArray(winRow.windows) && winRow.windows.length
    ? winRow.windows : DEFAULT_WINDOWS;

  const base = {};
  for (let d = 0; d <= 6; d++) base[d] = { open: "09:00", close: "18:00", state: "open" };
  for (const r of rows) {
    if (r.day_of_week != null && r.day_of_week >= 0 && r.day_of_week <= 6 && !r.the_date) {
      base[r.day_of_week] = { open: r.open_time || "09:00", close: r.close_time || "18:00", state: r.state || "open" };
    }
  }

  const overrides = {};
  for (const r of rows) {
    if (r.the_date) {
      overrides[r.the_date] = { open: r.open_time || "09:00", close: r.close_time || "18:00", state: r.state || "open" };
    }
  }
  return { windows, base, overrides };
}

// המצב האפקטיבי ליום מסוים (חריג לתאריך גובר על הבסיס)
function effectiveDay(dateObj, settings) {
  const iso = dateObj.toISOString().slice(0, 10);
  if (settings.overrides[iso]) return settings.overrides[iso];
  return settings.base[dateObj.getDay()] || { open: "09:00", close: "18:00", state: "open" };
}

// המרת "HH:MM" לדקות
function toMinutes(hhmm) {
  const [h, m] = (hhmm || "0:0").split(":").map((x) => parseInt(x));
  return h * 60 + (m || 0);
}

// חלון "10-12" -> {startH,endH,start,end}
function parseWindow(w) {
  const [s, e] = w.split("-").map((x) => parseInt(x));
  return { startH: s, endH: e, start: s * 60, end: e * 60 };
}

// חישוב חלונות ליום נתון
function computeWindows(day, allWindows, nowMinutesIfToday) {
  const openM = toMinutes(day.open);
  const closeM = toMinutes(day.close);
  const result = [];
  for (const w of allWindows) {
    const pw = parseWindow(w);
    if (pw.start < openM) continue;
    if (pw.start >= closeM) continue;
    const endM = Math.min(pw.end, closeM);
    if (nowMinutesIfToday != null && pw.end <= nowMinutesIfToday) continue;
    if (nowMinutesIfToday != null && pw.start <= nowMinutesIfToday && nowMinutesIfToday < pw.end) continue;
    const label = endM === pw.end ? w : `${pw.startH}-${Math.floor(endM / 60)}`;
    result.push(label);
  }
  return result;
}

// מחזיר רשימת ימים זמינים קדימה (בלי ימים סגורים), עם החלונות של כל יום
export async function getDeliveryOptions(daysAhead = 7) {
  const settings = await readDeliveryRows();
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const out = [];

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const day = effectiveDay(d, settings);
    if (day.state === "closed") continue;

    const isToday = i === 0;
    const windows = computeWindows(day, settings.windows, isToday ? nowMinutes : null);
    if (windows.length === 0) continue;

    out.push({
      date: d.toISOString().slice(0, 10),
      label: hebDayLabel(d, i),
      windows,
    });
  }
  return out;
}

// עוזר: איחוד רשימת תאריכים לטקסט "1.8, 2.8 ו-5.8"
function joinDates(list) {
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} ו-${list[1]}`;
  return `${list.slice(0, -1).join(", ")} ו-${list[list.length - 1]}`;
}

// חריגים עתידיים בשעות הפעילות — קטעי טקסט מקובצים לפי שעת סגירה זהה
// מחזיר מערך קטעים; הבאנר מחבר אותם למשפט אחד עם "לתשומת לבכם"
export async function getDeliveryNotices(daysAhead = 14) {
  const settings = await readDeliveryRows();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const byHour = {}; // שעת סגירה -> [תאריכים]
  const closedDates = [];

  const dates = Object.keys(settings.overrides).sort();
  for (const iso of dates) {
    const d = new Date(iso + "T00:00:00");
    if (d < today) continue;
    const diffDays = Math.round((d - today) / (1000 * 60 * 60 * 24));
    if (diffDays > daysAhead) continue;

    const ov = settings.overrides[iso];
    const base = settings.base[d.getDay()] || { open: "09:00", close: "18:00", state: "open" };

    // האם החריג באמת שונה מהבסיס?
    const sameState = (ov.state === "closed") === (base.state === "closed");
    const sameHours = ov.close === base.close && ov.open === base.open;
    if (sameState && (ov.state === "closed" || sameHours)) continue;

    const [y, m, day] = iso.split("-");
    const dateText = `${parseInt(day)}.${parseInt(m)}`;

    if (ov.state === "closed") {
      closedDates.push(dateText);
    } else {
      const closeHHMM = (ov.close || "").slice(0, 5);
      if (!byHour[closeHHMM]) byHour[closeHHMM] = [];
      byHour[closeHHMM].push(dateText);
    }
  }

  const parts = [];

  // שעות שונות, מקובצות לפי שעה
  const hours = Object.keys(byHour).sort();
  for (const hh of hours) {
    const ds = byHour[hh];
    const prefix = ds.length > 1 ? "בתאריכים" : "בתאריך";
    parts.push(`${prefix} ${joinDates(ds)} נהיה פתוחים עד השעה ${hh}`);
  }

  // ימים סגורים
  if (closedDates.length) {
    const prefix = closedDates.length > 1 ? "בתאריכים" : "בתאריך";
    parts.push(`${prefix} ${joinDates(closedDates)} המשתלה תהיה סגורה`);
  }

  return parts;
}

function hebDayLabel(dateObj, index) {
  const names = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const dd = dateObj.getDate();
  const mm = dateObj.getMonth() + 1;
  const dayName = names[dateObj.getDay()];
  if (index === 0) return `היום · ${dayName} ${dd}.${mm}`;
  if (index === 1) return `מחר · ${dayName} ${dd}.${mm}`;
  return `${dayName} ${dd}.${mm}`;
}

// טקסט מידה לגודל מתוך product_sizes (מצב "יש גדלים שונים")
export function sizeLabel(s) {
  if (!s) return "";
  if (s.size_label) return s.size_label;
  const parts = [];
  if (s.liters != null) parts.push(`${s.liters} ליטר`);
  if (s.milliliters != null) parts.push(`${s.milliliters} מ"ל`);
  const cm = [];
  if (s.height_cm != null) cm.push(`גובה ${s.height_cm}`);
  if (s.length_cm != null) cm.push(`אורך ${s.length_cm}`);
  if (s.width_cm != null) cm.push(`רוחב ${s.width_cm}`);
  if (s.diameter_cm != null) cm.push(`קוטר ${s.diameter_cm}`);
  if (cm.length) parts.push(cm.join(", ") + ' ס"מ');
  return parts.join(" · ");
}

// הוספת יחידה אוטומטית לגודל יחיד לפי סוג המידה של המחלקה
function unitForSingle(rawSize, sizeType) {
  const val = (rawSize == null ? "" : String(rawSize)).trim();
  if (!val) return "";
  // אם כבר יש אות עברית (המשתמש כתב יחידה בעצמו), משאירים כמו שהוא
  if (/[א-ת]/.test(val)) return val;
  if (sizeType === "milliliters") return `${val} מ"ל`;
  if (sizeType === "liters") return `${val} ליטר`;
  return val;
}

export function defaultSize(product) {
  if (!product.has_sizes || !product.product_sizes?.length) return null;
  return product.product_sizes[0];
}
export function cardPrice(product) {
  if (product.has_sizes && product.product_sizes?.length) {
    return Number(product.product_sizes[0].price);
  }
  return product.single_price != null ? Number(product.single_price) : null;
}
export function cardImage(product) {
  if (product.has_sizes && product.product_sizes?.length) {
    const withImg = product.product_sizes.find((s) => s.image_url);
    return product.product_sizes[0].image_url || withImg?.image_url || null;
  }
  return product.image_url || null;
}
export function cardSizeText(product) {
  if (product.has_sizes && product.product_sizes?.length) {
    return sizeLabel(product.product_sizes[0]);
  }
  return unitForSingle(product.single_size, product.categories?.size_type);
}

// טקסט הגודל היחיד עם יחידה — לשימוש בעמוד המוצר
export function singleSizeText(product) {
  return unitForSingle(product.single_size, product.categories?.size_type);
}
