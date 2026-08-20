const BASE_URL = "https://mashtelathair.co.il";

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
