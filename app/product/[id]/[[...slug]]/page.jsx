import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getProductById, getAllProductIds, getAddonsForCategory, cardPrice, cardImage,
  getSubscriptionDiscounts, getSubscriptionWindowOptions, getSubscriptionFlowerPool, getDeliveryFees,
} from "../../../../lib/siteData";
import { slugify, productPath } from "../../../../lib/slug";
import ProductView from "../../../../components/ProductView";
import SubscriptionProductView from "../../../../components/SubscriptionProductView";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await getAllProductIds();
    return products.map((p) => {
      const slug = slugify(p.name);
      return { id: p.id, slug: slug ? [slug] : [] };
    });
  } catch {
    return [];
  }
}


function buildJsonLd(product, catName, path) {
  const url = `https://mashtelathair.co.il${path}`;
  const image = cardImage(product);
  const sizes = product.has_sizes && product.product_sizes?.length ? product.product_sizes : null;
  const prices = sizes
    ? sizes.map((x) => Number(x.price)).filter((n) => Number.isFinite(n) && n > 0)
    : product.single_price != null && Number(product.single_price) > 0 ? [Number(product.single_price)] : [];
  const availability = product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        ...(image ? { image: [image] } : {}),
        ...(product.description ? { description: product.description } : {}),
        ...(catName ? { category: catName } : {}),
        sku: product.id,
        url,
        ...(prices.length
          ? {
              offers:
                prices.length > 1 && Math.min(...prices) !== Math.max(...prices)
                  ? {
                      "@type": "AggregateOffer",
                      priceCurrency: "ILS",
                      lowPrice: Math.min(...prices),
                      highPrice: Math.max(...prices),
                      offerCount: prices.length,
                      availability,
                      url,
                    }
                  : {
                      "@type": "Offer",
                      priceCurrency: "ILS",
                      price: Math.min(...prices),
                      availability,
                      url,
                    },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "משתלת העיר", item: "https://mashtelathair.co.il/" },
          ...(catName ? [{ "@type": "ListItem", position: 2, name: catName }] : []),
          { "@type": "ListItem", position: catName ? 3 : 2, name: product.name, item: url },
        ],
      },
    ],
  };
  return data;
}

export async function generateMetadata({ params }) {
  const product = await getProductById(params.id);
  if (!product) return { title: "מוצר לא נמצא — משתלת העיר" };
  const cat = product.categories?.name || "";
  const price = cardPrice(product);
  const title = `${product.name}${cat ? ` — ${cat}` : ""} | משתלת העיר אילת`;
  const description = product.description
    ? product.description.slice(0, 150)
    : `${product.name} במשתלת העיר אילת, להזמנה אונליין עם משלוח באילת או איסוף עצמי${price != null && price > 0 ? `. החל מ-₪${price}` : ""}.`;
  const image = cardImage(product);
  return {
    title,
    description,
    alternates: { canonical: productPath(product.id, product.name) },
    openGraph: {
      title,
      description,
      url: `https://mashtelathair.co.il${productPath(product.id, product.name)}`,
      siteName: "משתלת העיר",
      locale: "he_IL",
      type: "website",
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  // כתובת ישנה או שם שהשתנה - הפניה קבועה לכתובת הנכונה
  const canonicalPath = productPath(product.id, product.name);
  let requestedSlug = "";
  try {
    requestedSlug = params.slug?.[0] ? decodeURIComponent(params.slug[0]).normalize("NFC") : "";
  } catch {
    requestedSlug = "";
  }
  if (requestedSlug !== slugify(product.name) || (params.slug || []).length > 1) {
    permanentRedirect(canonicalPath);
  }

  const catName = product.categories?.name || "";
  const jsonLd = buildJsonLd(product, catName, canonicalPath);
  const jsonLdScript = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );

  if (product.is_subscription) {
    let discounts = [];
    let windowOptions = {};
    let pool = [];
    let deliveryFees = { city: 30, hotel: 50 };
    try {
      const [d, windows, flowerPool, fees] = await Promise.all([
        getSubscriptionDiscounts(),
        getSubscriptionWindowOptions(),
        getSubscriptionFlowerPool(),
        getDeliveryFees(),
      ]);
      discounts = d;
      windowOptions = windows;
      pool = flowerPool;
      deliveryFees = fees;
    } catch (e) {
      // נשארים עם ברירות המחדל הריקות
    }

    return (
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
        {jsonLdScript}
        <nav style={{ fontSize: 14, marginBottom: 24, color: "var(--muted)", display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Link href="/" style={{ color: "var(--muted)" }}>דף הבית</Link>
          {catName ? (
            <>
              <span>/</span>
              <Link href={`/?focus=${encodeURIComponent(product.id)}`} style={{ color: "var(--green)", fontWeight: 600 }}>
                {catName}
              </Link>
            </>
          ) : null}
          <span>/</span>
          <span style={{ color: "var(--ink)" }}>{product.name}</span>
        </nav>
        <SubscriptionProductView
          product={product}
          discounts={discounts}
          windowOptions={windowOptions}
          pool={pool}
          deliveryFees={deliveryFees}
        />
      </main>
    );
  }

  const addonGroups = await getAddonsForCategory(product.category_id);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      {jsonLdScript}
      <Link
        href={catName ? `/?focus=${encodeURIComponent(product.id)}` : "/"}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 17, fontWeight: 700, color: "var(--green)", marginBottom: 14 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
        {catName ? `חזרה ל${catName}` : "חזרה לקטלוג"}
      </Link>
      <nav style={{ fontSize: 14, marginBottom: 24, color: "var(--muted)", display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Link href="/" style={{ color: "var(--muted)" }}>דף הבית</Link>
        {catName ? (
          <>
            <span>/</span>
            <Link href={`/?focus=${encodeURIComponent(product.id)}`} style={{ color: "var(--muted)" }}>
              {catName}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span style={{ color: "var(--ink)", fontWeight: 700 }}>{product.name}</span>
      </nav>
      <ProductView product={product} addonGroups={addonGroups} />
    </main>
  );
}
