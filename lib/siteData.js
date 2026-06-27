import { supabase } from "./supabaseClient";

// מחלקות לפי סוג (nursery / garden), ממוינות לפי position
export async function getCategories(kind) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("kind", kind)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

// מוצרים פעילים של מחלקה, עם הגדלים שלהם, ממוינים לפי position
export async function getProducts(categoryId) {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_sizes(*)")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map((p) => ({
    ...p,
    product_sizes: (p.product_sizes || []).sort((a, b) => (a.position || 0) - (b.position || 0)),
  }));
}

// תיאור גודל קריא משורת product_sizes
export function sizeLabel(s) {
  if (!s) return "";
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

// הגודל הקטן ביותר (הראשון לפי position) — לתצוגת ברירת מחדל בכרטיס
export function defaultSize(product) {
  if (!product.has_sizes || !product.product_sizes?.length) return null;
  return product.product_sizes[0];
}

// המחיר להצגה בכרטיס: או מחיר יחיד, או של הגודל הקטן ביותר
export function cardPrice(product) {
  if (product.has_sizes && product.product_sizes?.length) {
    return Number(product.product_sizes[0].price);
  }
  return product.single_price != null ? Number(product.single_price) : null;
}

// התמונה להצגה בכרטיס: תמונת הגודל הראשון, אחרת תמונת המוצר, אחרת כל תמונת גודל קיימת
export function cardImage(product) {
  if (product.has_sizes && product.product_sizes?.length) {
    const withImg = product.product_sizes.find((s) => s.image_url);
    return product.product_sizes[0].image_url || withImg?.image_url || null;
  }
  return product.image_url || null;
}

// תיאור הגודל בכרטיס
export function cardSizeText(product) {
  if (product.has_sizes && product.product_sizes?.length) {
    return sizeLabel(product.product_sizes[0]);
  }
  return product.single_size || "";
}
