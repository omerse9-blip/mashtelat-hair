"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import DeliveryPicker from "./DeliveryPicker";
import ParallaxHero from "./ParallaxHero";
import { getDeliveryNotices } from "../lib/siteData";

const SORT_OPTIONS = [
  { key: "price_desc", label: "מהיקר לזול" },
  { key: "price_asc", label: "מהזול ליקר" },
  { key: "best", label: "הנמכרים ביותר" },
];

function sortProducts(products, sort) {
  if (sort === "best") return products;
  const withIndex = products.map((p, i) => ({ p, i }));
  withIndex.sort((a, b) => {
    const pa = a.p._price;
    const pb = b.p._price;
    if (pa == null && pb == null) return a.i - b.i;
    if (pa == null) return 1;
    if (pb == null) return -1;
    if (pa === pb) return a.i - b.i;
    return sort === "price_asc" ? pa - pb : pb - pa;
  });
  return withIndex.map((x) => x.p);
}

export default function NurseryCatalog({ categories, productsByCat, heroImageUrl, heroMediaType }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [focusId, setFocusId] = useState(null);
  const [notices, setNotices] = useState([]);
  const [sortByCat, setSortByCat] = useState({});

  useEffect(() => {
    let alive = true;
    getDeliveryNotices(14).then((n) => { if (alive) setNotices(n || []); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const f = searchParams.get("focus");
    if (!f) return;
    setFocusId(String(f));
    const scrollT = setTimeout(() => {
      const el = document.getElementById(`product-${f}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      const params = new URLSearchParams(window.location.search);
      params.delete("focus");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 150);
    const clearT = setTimeout(() => setFocusId(null), 2200);
    return () => { clearTimeout(scrollT); clearTimeout(clearT); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const t = setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => clearTimeout(t);
  }, []);

  if (!categories.length) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--line)", borderRadius: 16, color: "var(--muted)" }}>
        הקטלוג בהקמה — בקרוב יתווספו מוצרים.
      </div>
    );
  }

  return (
    <div>
      {notices.length > 0 ? (
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          לתשומת לבכם, {notices.join(", ")}.
        </p>
      ) : null}

      <ParallaxHero imageUrl={heroImageUrl} mediaType={heroMediaType} />

      <section style={{ textAlign: "center", marginBottom: 32, marginTop: 28 }}>
        <p style={{ color: "var(--muted)", fontSize: 19, maxWidth: 560, margin: "0 auto", borderBottom: "1px solid var(--line)", paddingBottom: 32 }}>
          משתלת העיר באילת - עציצים, זרי פרחים וצמחי נוי, הזמינו אונליין עם משלוח או איסוף עצמי.
        </p>
      </section>

      <div style={{ maxWidth: 420, margin: "0 auto 44px" }}>
        <DeliveryPicker scrollTargetId="categories-start" />
      </div>

      <div id="categories-start" />

      {categories.map((c) => {
        const products = productsByCat[c.id] || productsByCat[String(c.id)] || [];
        const sort = sortByCat[c.id] || "price_desc";
        const sorted = sortProducts(products, sort);
        return (
          <section key={c.id} id={`cat-${c.id}`} style={{ marginBottom: 52, scrollMarginTop: 90 }}>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 30, fontWeight: 700, color: "var(--ink)", borderTop: "1px solid var(--line)", maxWidth: 280, margin: "0 auto 18px", paddingTop: 22, textAlign: "center" }}>
              {c.name}
            </h2>

            {products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", border: "1px dashed var(--line)", borderRadius: 16, color: "var(--muted)" }}>
                אין מוצרים במחלקה זו עדיין.
              </div>
            ) : (
              <>
                <div className="sort-bar">
                  {SORT_OPTIONS.map((o) => {
                    const active = sort === o.key;
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setSortByCat((prev) => ({ ...prev, [c.id]: o.key }))}
                        className="sort-btn"
                        style={{
                          background: active ? "var(--green)" : "var(--card)",
                          color: active ? "#fff" : "var(--ink)",
                          border: `1px solid ${active ? "var(--green)" : "var(--line)"}`,
                        }}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>

                <div className="catalog-grid">
                  {sorted.map((p) => (
                    <ProductCard key={p.id} product={p} activeId={c.id} highlight={String(p.id) === focusId} />
                  ))}
                </div>
              </>
            )}
          </section>
        );
      })}

      <style>{`
        .sort-bar {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 22px;
        }
        .sort-btn {
          font-family: 'Rubik', sans-serif;
          font-size: 14px;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        @media (max-width: 640px) {
          .sort-bar { gap: 6px; margin-bottom: 16px; }
          .sort-btn { font-size: 13px; padding: 6px 12px; }
        }
        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 18px;
        }
        @media (max-width: 640px) {
          .catalog-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}

function ProductCard({ product, activeId, highlight }) {
  const img = product._image;
  const price = product._price;
  const multi = product._multi;
  const isSubscription = product._isSubscription;
  const inStock = product.in_stock;

  const productHref = `/product/${product.id}?from=${encodeURIComponent(String(activeId))}`;

  return (
    <Link
      id={`product-${product.id}`}
      href={productHref}
      className="product-card"
      style={{
        border: highlight ? "2px solid var(--green)" : "1px solid var(--line)",
        borderRadius: 14, overflow: "hidden", background: "var(--card)", display: "flex", flexDirection: "column",
        boxShadow: highlight ? "0 0 0 4px rgba(47,93,66,0.45)" : "none",
        transition: "box-shadow 0.4s ease, border-color 0.4s ease",
      }}
    >
      <div
        style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", background: "var(--green-soft)", overflow: "hidden" }}
      >
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 220px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 28 }}>🪴</div>
        )}
        {!inStock ? (
          <span style={{ position: "absolute", top: 10, insetInlineStart: 10, background: "rgba(44,58,48,0.82)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, zIndex: 1 }}>
            אזל מהמלאי
          </span>
        ) : null}
        {isSubscription ? (
          <span style={{ position: "absolute", top: 10, insetInlineEnd: 10, background: "rgba(63,122,82,0.92)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, zIndex: 1 }}>
            🌸 מנוי
          </span>
        ) : null}
      </div>

      <div className="product-body" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <p className="product-name" style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--ink)" }}>{product.name}</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: "auto" }}>
          {(multi || isSubscription) ? <span style={{ color: "var(--muted)", fontSize: 13 }}>החל מ־</span> : null}
          <span className="product-price" style={{ fontWeight: 700, fontSize: 18, color: "var(--green)" }}>
            {price != null ? `₪${price}` : "—"}
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .product-card .product-body { padding: 9px 10px !important; gap: 3px !important; }
          .product-card .product-name { font-size: 17px !important; }
          .product-card .product-price { font-size: 16px !important; }
        }
      `}</style>
    </Link>
  );
}
