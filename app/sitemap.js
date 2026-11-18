import { getAllProductIds, getCategories } from "../lib/siteData";
import { productPath, categoryPath } from "../lib/slug";

const BASE_URL = "https://mashtelathair.co.il";

export default async function sitemap() {
  const staticRoutes = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/garden`, changeFrequency: "weekly", priority: 0.8 },
  ];

  let categoryRoutes = [];
  try {
    const categories = await getCategories("nursery");
    categoryRoutes = categories
      .filter((c) => !c.is_featured)
      .map((c) => ({
        url: `${BASE_URL}${categoryPath(c.id, c.name)}`,
        changeFrequency: "weekly",
        priority: 0.9,
      }));
  } catch (e) {
    categoryRoutes = [];
  }

  let productRoutes = [];
  try {
    const products = await getAllProductIds();
    productRoutes = products.map((p) => ({
      url: `${BASE_URL}${productPath(p.id, p.name)}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (e) {
    productRoutes = [];
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
