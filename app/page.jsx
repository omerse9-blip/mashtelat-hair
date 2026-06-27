import { Suspense } from "react";
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
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 20px 56px" }}>
      <Suspense fallback={null}>
        <NurseryCatalog categories={categories} productsByCat={productsByCat} />
      </Suspense>
    </main>
  );
}
