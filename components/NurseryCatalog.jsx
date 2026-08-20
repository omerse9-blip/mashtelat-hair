"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import DeliveryPicker from "./DeliveryPicker";
import ParallaxHero from "./ParallaxHero";
import { getDeliveryNotices } from "../lib/siteData";

export default function NurseryCatalog({ categories, productsByCat }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [focusId, setFocusId] = useState(null);
  const [notices, setNotices] = useState([]);

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
    }, 150);
    const clearT = setTimeout(() => setFocusId(null), 2200);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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

      <ParallaxHero>
        <Image
          src="/logo-mashtela.png"
          alt="משתלת העיר"
          width={108}
          height={108}
          priority
          style={{ width: 108, height: 108, objectFit: "contain", margin: "0 auto" }}
        />
      </ParallaxHero>

      <section style={{ textAlign: "center", marginBottom: 32, marginTop: 28 }}>
        <p style={{ color: "var(--muted)", fontSize: 19, maxWidth: 560, margin: "0 auto", borderBottom: "1px solid var(--line)", paddingBottom: 32 }}>
          עצים, שיחים, צמחי נוי, כדים וכלי גינון — גללו וגלו את כל המחלקות.
        </p>
      </section>

      <div style={{ maxWidth: 420, margin: "0 auto 44px" }}>
        <DeliveryPicker scrollTargetId="categories-start" />
      </div>

      <div id="categories-start" />

      {categories.map((c) => {
        const products = productsByCat[c.id] || productsByCat[String(c.id)] || [];
        return (
          <section key={c.id} id={`cat-${c.id}`} style={{ marginBottom: 52, scrollMarginTop: 90 }}>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 30, fontWeight: 700, color: "var(--ink)", borderTop: "1px solid var(--line)", maxWidth: 280, margin: "0 auto 24px", paddingTop: 22, textAlign: "center" }}>
              {c.name}
            </h2>

            {products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", border: "1px dashed var(--line)", borderRadius: 16, color: "var(--muted)" }}>
                אין מוצרים במחלקה זו עדיין.
              </div>
            ) : (
              <div className="catalog-grid">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} activeId={c.id} highlight={String(p.id) === focusId} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <style>{`
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
  const inStock = product.in_stock;

  const productHref = `/product/${product.id}?from=${encodeURIComponent(String(activeId))}`;

  return (
    <Link
      id={`product-${product.id}`}
      href={productHref}
      className="product-card"
      style={{
        border: highlight ? "1px solid var(--green)" : "1px solid var(--line)",
        borderRadius: 14, overflow: "hidden", background: "var(--card)", display: "flex", flexDirection: "column",
        boxShadow: highlight ? "0 0 0 3px rgba(47,93,66,0.35)" : "none",
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
      </div>

      <div className="product-body" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <p className="product-name" style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--ink)" }}>{product.name}</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: "auto" }}>
          {multi ? <span style={{ color: "var(--muted)", fontSize: 13 }}>החל מ־</span> : null}
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
