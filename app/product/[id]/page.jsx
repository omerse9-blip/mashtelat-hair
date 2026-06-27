import Link from "next/link";
import { getProductById, getAllProductIds, cardPrice } from "../../../lib/siteData";
import ProductView from "../../../components/ProductView";

export const revalidate = 0;

export async function generateStaticParams() {
  try {
    const ids = await getAllProductIds();
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const product = await getProductById(params.id);
  if (!product) return { title: "מוצר לא נמצא — משתלת העיר" };
  const cat = product.categories?.name || "";
  const price = cardPrice(product);
  return {
    title: `${product.name}${cat ? ` — ${cat}` : ""} | משתלת העיר אילת`,
    description: product.description
      ? product.description.slice(0, 150)
      : `${product.name} למכירה במשתלת העיר אילת${price != null ? `. החל מ-₪${price}` : ""}.`,
  };
}

export default async function ProductPage({ params }) {
  const product = await getProductById(params.id);

  if (!product) {
    return (
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 20, marginBottom: 16 }}>המוצר לא נמצא.</p>
        <Link href="/" style={{ color: "var(--green)", fontWeight: 600 }}>חזרה למשתלה</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <Link href="/" style={{ color: "var(--muted)", fontSize: 14, display: "inline-block", marginBottom: 24 }}>
        › חזרה לקטלוג
      </Link>
      <ProductView product={product} />
    </main>
  );
}
