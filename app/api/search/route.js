import { getCategories, getProducts, getGardenWorks, cardImage, cardPrice } from "../../../lib/siteData";

export const revalidate = 0;

export async function GET() {
  const nursery = [];
  try {
    const cats = await getCategories("nursery");
    for (const c of cats) {
      const products = await getProducts(c.id);
      for (const p of products) {
        nursery.push({
          id: p.id,
          name: p.name || "",
          desc: p.description || "",
          image: cardImage(p),
          price: cardPrice(p),
          multi: !!(p.has_sizes && p.product_sizes && p.product_sizes.length > 1),
          categoryId: c.id,
          categoryName: c.name,
        });
      }
    }
  } catch (e) { /* התעלמות */ }

  const garden = [];
  try {
    const cats = await getCategories("garden");
    for (const c of cats) {
      const works = await getGardenWorks(c.id);
      for (const w of works) {
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
  } catch (e) { /* התעלמות */ }

  return Response.json({ nursery, garden });
}
