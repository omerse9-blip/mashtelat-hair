import "./globals.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { CartProvider } from "../components/CartProvider";
import { getCategories, getProducts, getGardenWorks, cardImage, cardPrice } from "../lib/siteData";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "משתלת העיר",
  description: "משתלה איכותית באילת — עצים, שיחים, צמחי נוי, כדים וכלי גינון.",
};

// בניית אינדקס חיפוש בצד השרת (אותן פונקציות שמפעילות את הקטלוג)
async function buildSearchIndex() {
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

  return { nursery, garden };
}

export default async function RootLayout({ children }) {
  const searchIndex = await buildSearchIndex();
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          <SiteHeader searchIndex={searchIndex} />
          <div style={{ minHeight: "60vh" }}>{children}</div>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
