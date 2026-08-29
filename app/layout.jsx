import "./globals.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { CartProvider } from "../components/CartProvider";
import { DeliveryProvider } from "../components/DeliveryProvider";
import { getCategories, getProducts, getGardenWorks, cardImage, cardPrice } from "../lib/siteData";
export const metadata = {
  metadataBase: new URL("https://mashtelathair.co.il"),
  title: "משתלה באילת - זרי פרחים, עציצים וצמחי נוי | משתלת העיר",
  description: "משתלה באילת עם עציצים, זרי פרחים, עצי נוי וכלי גינון. איסוף עצמי ומשלוח עד הבית.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "משתלה באילת - זרי פרחים, עציצים וצמחי נוי | משתלת העיר",
    description: "משתלה באילת עם עציצים, זרי פרחים, עצי נוי וכלי גינון. איסוף עצמי ומשלוח עד הבית.",
    url: "https://mashtelathair.co.il",
    siteName: "משתלת העיר",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "https://mashtelathair.co.il/mashtela-og.png",
        alt: "משתלת העיר",
      },
    ],
  },
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": "GardenStore",
  name: "משתלת העיר",
  image: "https://mashtelathair.co.il/mashtela-og.png",
  telephone: "+972533669089",
  address: {
    "@type": "PostalAddress",
    streetAddress: "יוזמה 6, אזור התעשייה",
    addressLocality: "אילת",
    addressCountry: "IL",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "09:00",
      closes: "15:00",
    },
  ],
  url: "https://mashtelathair.co.il",
};
async function buildSearchIndex(nurseryCats, gardenCats) {
  const nursery = [];
  try {
    for (const c of nurseryCats) {
      const products = await getProducts(c.id);
      for (const p of products) {
        const image = cardImage(p);
        if (!image) continue;
        nursery.push({
          id: p.id,
          name: p.name || "",
          desc: p.description || "",
          image,
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
    for (const c of gardenCats) {
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
  return { nursery, garden };
}
export default async function RootLayout({ children }) {
  let nurseryCategories = [];
  let gardenCategories = [];
  try {
    nurseryCategories = await getCategories("nursery");
  } catch (e) { /* התעלמות */ }
  try {
    gardenCategories = await getCategories("garden");
  } catch (e) { /* התעלמות */ }
  const searchIndex = await buildSearchIndex(nurseryCategories, gardenCategories);
  const nurseryCatIdsWithProducts = new Set(searchIndex.nursery.map((p) => String(p.categoryId)));
  const visibleNurseryCategories = nurseryCategories.filter((c) => nurseryCatIdsWithProducts.has(String(c.id)));
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Gveret+Levin&family=Rubik:wght@500;600;700;800&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
      </head>
      <body>
        <CartProvider>
          <DeliveryProvider>
            <SiteHeader searchIndex={searchIndex} nurseryCategories={visibleNurseryCategories} gardenCategories={gardenCategories} />
            <div style={{ minHeight: "60vh" }}>{children}</div>
            <SiteFooter />
          </DeliveryProvider>
        </CartProvider>
      </body>
    </html>
  );
}
