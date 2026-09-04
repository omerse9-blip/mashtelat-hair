import { Suspense } from "react";
import { getCategories, getProducts, getFeaturedProducts, getActiveHeroImage, getSubscriptionMinPrice, cardPrice, cardImage, cardSizeText, availableFromShort } from "../lib/siteData";
import NurseryCatalog from "../components/NurseryCatalog";
export const metadata = {
  title: "משתלה באילת - זרי פרחים, עציצים וצמחי נוי | משתלת העיר",
  description: "משתלה באילת עם עציצים, זרי פרחים, צמחי נוי וכלי גינון. איסוף עצמי ומשלוח עד הבית. הזמינו אונליין עכשיו.",
};
function toCard(p, subscriptionMinPrice) {
  const isSubscription = !!p.is_subscription;
  return {
    id: p.id,
    name: p.name,
    in_stock: p.in_stock,
    _image: cardImage(p),
    _price: isSubscription ? subscriptionMinPrice : cardPrice(p),
    _sizeText: cardSizeText(p),
    _hasSizes: !!(p.has_sizes && p.product_sizes?.length),
    _multi: !!(p.has_sizes && p.product_sizes?.length > 1),
    _isSubscription: isSubscription,
    _availableFrom: availableFromShort(p),
  };
}
export default async function NurseryPage() {
  let categories = [];
  const productsByCat = {};
  let heroImageUrl = "/hero-nursery.jpg";
  let heroMediaType = "image";
  try {
    const subscriptionMinPrice = await getSubscriptionMinPrice();
    categories = await getCategories("nursery");
    for (const c of categories) {
      const products = c.is_featured
        ? await getFeaturedProducts()
        : await getProducts(c.id);
      productsByCat[c.id] = products.map((p) => toCard(p, subscriptionMinPrice)).filter((p) => !!p._image);
    }
    categories = categories.filter((c) => (productsByCat[c.id] || []).length > 0);
  } catch (e) {
    categories = [];
  }
  try {
    const hero = await getActiveHeroImage();
    heroImageUrl = hero.url;
    heroMediaType = hero.mediaType;
  } catch (e) {
    // נשאר עם ברירת המחדל
  }
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 20px 56px" }}>
      <Suspense fallback={null}>
        <NurseryCatalog categories={categories} productsByCat={productsByCat} heroImageUrl={heroImageUrl} heroMediaType={heroMediaType} />
      </Suspense>
    </main>
  );
}
