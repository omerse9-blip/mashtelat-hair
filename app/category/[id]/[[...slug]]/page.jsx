import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getCategories, getProducts, getSubscriptionMinPrice } from "../../../../lib/siteData";
import { slugify, categoryPath, productPath } from "../../../../lib/slug";
import { toCard } from "../../../../lib/cards";
import ProductCard from "../../../../components/ProductCard";

export const revalidate = 60;

const BASE_URL = "https://mashtelathair.co.il";

async function loadCategory(id) {
  const categories = await getCategories("nursery");
  const category = categories.find((c) => String(c.id) === String(id));
  if (!category || category.is_featured) return null;
  const subscriptionMinPrice = await getSubscriptionMinPrice();
  const products = (await getProducts(category.id))
    .map((p) => toCard(p, subscriptionMinPrice))
    .filter((p) => !!p._image);
  if (!products.length) return null;
  return { category, products, categories };
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories("nursery");
    return categories
      .filter((c) => !c.is_featured)
      .map((c) => {
        const slug = slugify(c.name);
        return { id: String(c.id), slug: slug ? [slug] : [] };
      });
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const data = await loadCategory(params.id);
  if (!data) return { title: "מחלקה לא נמצאה — משתלת העיר" };
  const { category, products } = data;
  const prices = products.map((p) => p._price).filter((n) => Number.isFinite(n) && n > 0);
  const fromPrice = prices.length ? ` החל מ-₪${Math.min(...prices)}.` : "";
  const title = `${category.name} באילת | משתלת העיר`;
  const description = `${category.name} במשתלת העיר באילת: ${products.length} מוצרים להזמנה אונליין.${fromPrice} משלוח באילת או איסוף עצמי מיוזמה 6, אזור התעשייה.`;
  const path = categoryPath(category.id, category.name);
  const image = products[0]?._image;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${path}`,
      siteName: "משתלת העיר",
      locale: "he_IL",
      type: "website",
      images: image ? [{ url: image, alt: category.name }] : undefined,
    },
  };
}

export default async function CategoryPage({ params }) {
  const data = await loadCategory(params.id);
  if (!data) notFound();
  const { category, products, categories } = data;

  const canonicalPath = categoryPath(category.id, category.name);
  let requestedSlug = "";
  try {
    requestedSlug = params.slug?.[0] ? decodeURIComponent(params.slug[0]).normalize("NFC") : "";
  } catch {
    requestedSlug = "";
  }
  if (requestedSlug !== slugify(category.name) || (params.slug || []).length > 1) {
    permanentRedirect(canonicalPath);
  }

  const others = categories.filter((c) => !c.is_featured && String(c.id) !== String(category.id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${category.name} באילת`,
        url: `${BASE_URL}${canonicalPath}`,
        isPartOf: { "@type": "WebSite", name: "משתלת העיר", url: BASE_URL },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${BASE_URL}${productPath(p.id, p.name)}`,
            name: p.name,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "משתלת העיר", item: `${BASE_URL}/` },
          { "@type": "ListItem", position: 2, name: category.name, item: `${BASE_URL}${canonicalPath}` },
        ],
      },
    ],
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 20px 56px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="פירורי לחם" style={{ fontSize: 14, marginBottom: 22, color: "var(--muted)", display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Link href="/" style={{ color: "var(--muted)" }}>דף הבית</Link>
        <span>/</span>
        <span style={{ color: "var(--ink)", fontWeight: 700 }}>{category.name}</span>
      </nav>

      <header style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 34, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
          {category.name} באילת
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.7, maxWidth: 620, margin: "0 auto" }}>
          {category.name} ממשתלת העיר באילת, להזמנה אונליין עם משלוח באילת או איסוף עצמי מהמשתלה ביוזמה 6, אזור התעשייה.
        </p>
      </header>

      <div className="catalog-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} highlight={false} />
        ))}
      </div>

      {others.length > 0 ? (
        <nav aria-label="מחלקות נוספות" style={{ marginTop: 48, textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 14 }}>עוד מהמשתלה</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {others.map((c) => (
              <Link
                key={c.id}
                href={categoryPath(c.id, c.name)}
                style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "7px 16px", fontWeight: 600, color: "var(--ink)", background: "var(--card)" }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}

      <style>{`
        .catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 18px; }
        @media (max-width: 640px) { .catalog-grid { grid-template-columns: 1fr 1fr; gap: 10px; } }
      `}</style>
    </main>
  );
}
