import { getAllProductIds } from "../lib/siteData";

const BASE_URL = "https://mashtelat-hair.vercel.app";

export default async function sitemap() {
  const staticRoutes = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/garden`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  let productRoutes = [];
  try {
    const ids = await getAllProductIds();
    productRoutes = ids.map((id) => ({
      url: `${BASE_URL}/product/${id}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (e) {
    productRoutes = [];
  }

  return [...staticRoutes, ...productRoutes];
}
