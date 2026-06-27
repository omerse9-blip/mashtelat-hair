import { Suspense } from "react";
import Image from "next/image";
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 18 }}>
          <Image
            src="/logo-mashtela.png"
            alt="משתלת העיר"
            width={96}
            height={96}
            priority
            style={{ width: 96, height: 96, objectFit: "contain" }}
          />
          <p style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600, marginTop: 8, letterSpacing: 0.5 }}>מבית גינון העיר</p>
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.12, marginBottom: 14 }}>
          כל הצמחים, במקום אחד.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 19, maxWidth: 560, margin: "0 auto" }}>
          עצים, שיחים, צמחי נוי, כדים וכלי גינון — בחרו מחלקה והתחילו.
        </p>
      </section>
      <Suspense fallback={null}>
        <NurseryCatalog categories={categories} productsByCat={productsByCat} />
      </Suspense>
    </main>
  );
}
