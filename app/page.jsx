import { getCategories, getProducts, getFeaturedProducts, getActiveHeroImage, getSubscriptionMinPrice } from "../lib/siteData";
import { toCard } from "../lib/cards";
import NurseryCatalog from "../components/NurseryCatalog";
import HomeSeoContent from "../components/HomeSeoContent";
export const revalidate = 60;

export const metadata = {
  title: "משתלה באילת - זרי פרחים, עציצים וצמחי נוי | משתלת העיר",
  description: "משתלה באילת: זרי פרחים, צמחי בית, כדים, בלונים ויין למתנה. משלוח באילת ואיסוף עצמי מיוזמה 6, אזור התעשייה. הזמינו אונליין.",
  alternates: { canonical: "/" },
};
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
      <NurseryCatalog categories={categories} productsByCat={productsByCat} heroImageUrl={heroImageUrl} heroMediaType={heroMediaType} />
      <HomeSeoContent categories={categories.filter((c) => !c.is_featured)} />
    </main>
  );
}
