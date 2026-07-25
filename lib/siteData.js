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

// מוצרים לפי מחלקה — עם מטמון
export const getProducts = unstable_cache(
  async (categoryId) => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_sizes(*)")
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
    .select("*, product_sizes(*), categories(name, kind)")
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

// תוספות של מוצר: לפי המחלקה שלו, מקובצות לפי מחלקת מקור וממוינות לפי מחיר עולה
export async function getAddonsForCategory(categoryId) {
  const { data, error } = await supabase
    .from("category_addons")
    .select("product:products(*, product_sizes(*), categories(name, position))")
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

export function sizeLabel(s) {
  if (!s) return "";
  if (s.size_label) return s.size_label;
  const parts = [];
  if (s.liters != null) parts.push(`${s.liters} ליטר`);
  const cm = [];
  if (s.height_cm != null) cm.push(`גובה ${s.height_cm}`);
  if (s.length_cm != null) cm.push(`אורך ${s.length_cm}`);
  if (s.width_cm != null) cm.push(`רוחב ${s.width_cm}`);
  if (s.diameter_cm != null) cm.push(`קוטר ${s.diameter_cm}`);
  if (cm.length) parts.push(cm.join(", ") + ' ס"מ');
  return parts.join(" · ");
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
  return product.single_size || "";
}
