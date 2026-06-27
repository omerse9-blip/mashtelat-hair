import { supabase } from "./supabaseClient";

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
    product_sizes: (data.product_sizes || []).sort((a, b) => (a.position || 0) - (b.position || 0)),
  };
}

export async function getAllProductIds() {
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("is_active", true);
  if (error) throw new Error(error.message);
  return (data || []).map((p) => p.id);
}

export async function getGardenWorks(categoryId) {
  const { data, error } = await supabase
    .from("garden_works")
    .select("*")
    .eq("category_id", categoryId)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

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
