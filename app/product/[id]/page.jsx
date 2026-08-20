import Link from "next/link";
import { getProductById, getAllProductIds, getAddonsForCategory, cardPrice, cardImage } from "../../../lib/siteData";
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
  const title = `${product.name}${cat ? ` — ${cat}` : ""} | משתלת העיר אילת`;
  const description = product.description
    ? product.description.slice(0, 150)
    : `${product.name} למכירה במשתלת העיר אילת${price != null ? `. החל מ-₪${price}` : ""}.`;
  const image = cardImage(product);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mashtelathair.co.il/product/${params.id}`,
      siteName: "משתלת העיר",
      locale: "he_IL",
      type: "website",
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
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
  const addonGroups = await getAddonsForCategory(product.category_id);
  const catName = product.categories?.name || "";

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <nav style={{ fontSize: 14, marginBottom: 24, color: "var(--muted)", display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Link href="/" style={{ color: "var(--muted)" }}>דף הבית</Link>
        {catName ? (
          <>
            <span>/</span>
            <Link href={`/?cat=${encodeURIComponent(product.category_id)}`} style={{ color: "var(--green)", fontWeight: 600 }}>
              {catName}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span style={{ color: "var(--ink)" }}>{product.name}</span>
      </nav>
      <ProductView product={product} addonGroups={addonGroups} />
    </main>
  );
}
