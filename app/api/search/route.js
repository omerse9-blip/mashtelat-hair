import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get("q") || "").trim();
  // הסרת תווים שמפרים את תחביר הסינון של PostgREST
  const q = raw.replace(/[,()*]/g, " ").trim();

  if (q.length < 2) {
    return Response.json({ nursery: [], garden: [] });
  }

  const nursery = [];
  try {
    const { data: products } = await supabase
      .from("products")
      .select("id, name, description, image_url, single_price, has_sizes, is_active, category_id, categories(id, name, kind), product_sizes(price, image_url)")
      .eq("is_active", true)
      .or(`name.ilike.*${q}*,description.ilike.*${q}*`)
      .limit(20);

    (products || []).forEach((p) => {
      if (!p.categories || p.categories.kind !== "nursery") return;
      const sizes = p.product_sizes || [];
      const image = p.image_url || sizes.find((s) => s.image_url)?.image_url || null;
      let price = p.single_price != null ? Number(p.single_price) : null;
      if (price == null && sizes.length) {
        const nums = sizes.map((s) => Number(s.price)).filter((n) => !isNaN(n));
        if (nums.length) price = Math.min(...nums);
      }
      nursery.push({
        id: p.id,
        name: p.name,
        image,
        price,
        multi: !!(p.has_sizes && sizes.length > 1),
        categoryId: p.category_id,
        categoryName: p.categories.name,
      });
    });
  } catch (e) { /* התעלמות */ }

  const garden = [];
  try {
    const { data: works } = await supabase
      .from("garden_works")
      .select("id, caption, media_type, media_url, category_id, categories(id, name, kind)")
      .ilike("caption", `%${q}%`)
      .limit(20);

    (works || []).forEach((w) => {
      garden.push({
        id: w.id,
        caption: w.caption || "",
        mediaType: w.media_type,
        image: w.media_type === "image" ? w.media_url : null,
        categoryId: w.category_id,
        categoryName: w.categories?.name || "",
      });
    });
  } catch (e) { /* התעלמות */ }

  return Response.json({ nursery, garden });
}
