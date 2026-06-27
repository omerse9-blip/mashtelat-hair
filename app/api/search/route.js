import { getCategories, getProducts, getGardenWorks, cardImage, cardPrice } from "../../../lib/siteData";

export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (q.length < 2) {
    return Response.json({ nursery: [], garden: [] });
  }

  const nursery = [];
  try {
    const cats = await getCategories("nursery");
    for (const c of cats) {
      const products = await getProducts(c.id);
      for (const p of products) {
        const hay = `${p.name || ""} ${p.description || ""}`.toLowerCase();
        if (hay.includes(q)) {
          nursery.push({
            id: p.id,
            name: p.name,
            image: cardImage(p),
            price: cardPrice(p),
            multi: !!(p.has_sizes && p.product_sizes && p.product_sizes.length > 1),
            categoryId: c.id,
            categoryName: c.name,
          });
        }
      }
    }
  } catch (e) { /* התעלמות */ }

  const garden = [];
  try {
    const cats = await getCategories("garden");
    for (const c of cats) {
      const works = await getGardenWorks(c.id);
      for (const w of works) {
        if ((w.caption || "").toLowerCase().includes(q)) {
          garden.push({
            id: w.id,
            caption: w.caption || "",
            mediaType: w.media_type,
            image: w.media_type === "image" ? w.media_url : null,
            categoryId: c.id,
            categoryName: c.name,
          });
        }
      }
    }
  } catch (e) { /* התעלמות */ }

  return Response.json({ nursery, garden });
}
