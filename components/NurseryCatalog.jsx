"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import DeliveryPicker from "./DeliveryPicker";
import ParallaxHero from "./ParallaxHero";
import { getDeliveryNotices } from "../lib/siteData";
import ProductCard from "./ProductCard";
import FocusParam from "./FocusParam";

const SORT_OPTIONS = [
  { key: "best", label: "הנמכרים ביותר" },
  { key: "price_desc", label: "מהיקר לזול" },
  { key: "price_asc", label: "מהזול ליקר" },
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

  const [focusParam, setFocusParam] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const [notices, setNotices] = useState([]);
  const [sortByCat, setSortByCat] = useState({});

  useEffect(() => {
    let alive = true;
    getDeliveryNotices(14).then((n) => { if (alive) setNotices(n || []); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const f = focusParam;
    if (!f) return;
    setFocusId(String(f));
    const scrollT = setTimeout(() => {
      const el = document.getElementById(`product-${f}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      const params = new URLSearchParams(window.location.search);
      params.delete("focus");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 150);
    setTimeout(() => setFocusId(null), 2200);
    return () => clearTimeout(scrollT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusParam]);

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
      <Suspense fallback={null}>
        <FocusParam onChange={setFocusParam} />
      </Suspense>
      {notices.length > 0 ? (
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          לתשומת לבכם, {notices.join(", ")}.
        </p>
      ) : null}

      <ParallaxHero imageUrl={heroImageUrl} mediaType={heroMediaType} />

      <section style={{ textAlign: "center", marginBottom: 26, marginTop: 28 }}>
        <h1 style={{ color: "var(--muted)", fontSize: 19, fontWeight: 400, maxWidth: 560, margin: "0 auto", borderBottom: "1px solid var(--line)", paddingBottom: 16 }}>
          משתלת העיר באילת - עציצים, זרי פרחים וצמחי נוי, הזמינו אונליין עם משלוח או איסוף עצמי.
        </h1>
      </section>

      <div style={{ maxWidth: 420, margin: "0 auto 26px" }}>
        <DeliveryPicker scrollTargetId="categories-start" />
      </div>

      <div id="categories-start" />

      {categories.map((c) => {
        const products = productsByCat[c.id] || productsByCat[String(c.id)] || [];
        const sort = sortByCat[c.id] || "best";
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
                <div className="sort-bar" role="group" aria-label={`מיון המוצרים במחלקה ${c.name}`}>
                  {SORT_OPTIONS.map((o) => {
                    const active = sort === o.key;
                    return (
                      <button
                        key={o.key}
                        type="button"
                        aria-pressed={active}
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
                    <ProductCard key={p.id} product={p} highlight={String(p.id) === focusId} />
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
