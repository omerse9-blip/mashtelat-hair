import { getCategories, getProducts, cardPrice, cardImage, cardSizeText } from "../lib/siteData";
import NurseryCatalog from "../components/NurseryCatalog";

export const revalidate = 0;
export const metadata = { title: "משתלת העיר — משתלה" };

export default async function NurseryPage() {
  let categories = [];
  const productsByCat = {};

  try {
    categories = await getCategories("nursery");
    for (const c of categories) {
      const products = await getProducts(c.id);
      productsByCat[c.id] = products.map((p) => ({
        id: p.id,
        name: p.name,
        in_stock: p.in_stock,
        _image: cardImage(p),
        _price: cardPrice(p),
        _sizeText: cardSizeText(p),
        _hasSizes: !!(p.has_sizes && p.product_sizes?.length),
        _multi: !!(p.has_sizes && p.product_sizes?.length > 1),
      }));
    }
  } catch (e) {
    categories = [];
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 20px" }}>
      <section style={{ textAlign: "center", marginBottom: 44 }}>
        <p style={{ color: "var(--green)", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>משתלת העיר · אילת</p>
        <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.12, marginBottom: 14 }}>
          כל הצמחים, במקום אחד.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 19, maxWidth: 560, margin: "0 auto" }}>
          עצים, שיחים, צמחי נוי, כדים וכלי גינון — בחרו מחלקה והתחילו.
        </p>
      </section>

      <NurseryCatalog categories={categories} productsByCat={productsByCat} />
    </main>
  );
}
