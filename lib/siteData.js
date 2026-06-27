import { supabase } from "./supabaseClient";

// יצירת הזמנה + פריטים. מחזיר את מספר ההזמנה הרץ.
export async function createOrder(details, items) {
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_name: details.customer_name,
      customer_phone: details.customer_phone,
      customer_address: details.customer_address || null,
      is_gift: details.is_gift,
      recipient_name: details.is_gift ? details.recipient_name : null,
      recipient_phone: details.is_gift ? details.recipient_phone : null,
      recipient_address: details.is_gift ? (details.recipient_address || null) : null,
      notes: details.notes || null,
    })
    .select("id, order_number")
    .single();
  if (error) throw new Error(error.message);

  const rows = items.map((it) => ({
    order_id: order.id,
    product_name: it.name,
    size_label: it.sizeLabel || null,
    price: Number(it.price),
    quantity: it.quantity,
  }));
  const { error: itErr } = await supabase.from("order_items").insert(rows);
  if (itErr) throw new Error(itErr.message);

  return order.order_number;
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
