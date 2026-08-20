import { Suspense } from "react";
import { getCategories, getProducts, getFeaturedProducts, getActiveHeroImage, cardPrice, cardImage, cardSizeText } from "../lib/siteData";
import NurseryCatalog from "../components/NurseryCatalog";

export const metadata = {
  title: "משתלה באילת - זרי פרחים, עציצים וצמחי נוי | משתלת העיר",
  description: "משתלה באילת עם עציצים, זרי פרחים, צמחי נוי וכלי גינון. איסוף עצמי ומשלוח עד הבית. הזמינו אונליין עכשיו.",
};

function toCard(p) {
  return {
    id: p.id,
    name: p.name,
    in_stock: p.in_stock,
    _image: cardImage(p),
    _price: cardPrice(p),
    _sizeText: cardSizeText(p),
    _hasSizes: !!(p.has_sizes && p.product_sizes?.length),
    _multi: !!(p.has_sizes && p.product_sizes?.length > 1),
  };
}

export default async function NurseryPage() {
  let categories = [];
  const productsByCat = {};
  let heroImageUrl = "/hero-nursery.jpg";
  try {
    categories = await getCategories("nursery");
    for (const c of categories) {
      const products = c.is_featured
        ? await getFeaturedProducts()
        : await getProducts(c.id);
      productsByCat[c.id] = products.map(toCard);
    }
  } catch (e) {
    categories = [];
  }
  try {
    heroImageUrl = await getActiveHeroImage();
  } catch (e) {
    // נשאר עם ברירת המחדל
  }
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 20px 56px" }}>
      <Suspense fallback={null}>
        <NurseryCatalog categories={categories} productsByCat={productsByCat} heroImageUrl={heroImageUrl} />
      </Suspense>
    </main>
  );
}
