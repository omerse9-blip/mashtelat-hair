const BASE_URL = "https://mashtelat-hair.vercel.app";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
