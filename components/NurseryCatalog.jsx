"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

export default function NurseryCatalog({ categories, productsByCat }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function findCat(idStr) {
    return categories.find((c) => String(c.id) === String(idStr)) || null;
  }

  const catFromUrl = searchParams.get("cat");
  const initialCat = findCat(catFromUrl) || categories[0] || null;
  const [activeId, setActiveId] = useState(initialCat ? initialCat.id : null);

  const [zoomImg, setZoomImg] = useState(null);
  const [focusId, setFocusId] = useState(null);

  useEffect(() => {
    const fromUrl = searchParams.get("cat");
    const match = findCat(fromUrl);
    if (match) {
      setActiveId(match.id);
    } else if (categories[0]) {
      setActiveId(categories[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // הגעה ממסך החיפוש: גלילה אל המוצר במחלקה והדגשה קצרה
  useEffect(() => {
    const f = searchParams.get("focus");
    if (!f) return;
    setFocusId(String(f));
    const scrollT = setTimeout(() => {
      const el = document.getElementById(`product-${f}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    const clearT = setTimeout(() => setFocusId(null), 2200);
    // הסרת focus מהכתובת כדי שרענון לא יפעיל שוב
    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    return () => { clearTimeout(scrollT); clearTimeout(clearT); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function selectCategory(id) {
    setActiveId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("cat", String(id));
    params.delete("focus");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const products = activeId != null ? (productsByCat[activeId] || productsByCat[String(activeId)] || []) : [];

  useEffect(() => {
    if (!zoomImg) return;
    window.history.pushState({ zoom: true }, "");
    const onPop = () => setZoomImg(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [zoomImg]);

  function closeZoom() {
    if (window.history.state && window.history.state.zoom) {
      window.history.back();
    } else {
      setZoomImg(null);
    }
  }

  if (!categories.length) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--line)", borderRadius: 16, color: "var(--muted)" }}>
        הקטלוג בהקמה — בקרוב יתווספו מוצרים.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 36 }}>
        {categories.map((c) => {
          const active = String(c.id) === String(activeId);
          return (
            <button
              key={c.id}
              onClick={() => selectCategory(c.id)}
              style={{
                fontSize: 15, fontWeight: 600, padding: "9px 20px", borderRadius: 999, cursor: "pointer",
                background: active ? "var(--green)" : "#fff",
                color: active ? "#fff" : "var(--ink)",
                border: active ? "1px solid var(--green)" : "1px solid var(--line)",
              }}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--line)", borderRadius: 16, color: "var(--muted)" }}>
          אין מוצרים במחלקה זו עדיין.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 18 }}>
          {products.map((p) => <ProductCard key={p.id} product={p} activeId={activeId} onZoom={setZoomImg} highlight={String(p.id) === focusId} />)}
        </div>
      )}

      {zoomImg ? (
        <div
          onClick={closeZoom}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20, cursor: "zoom-out" }}
        >
          <img
            src={zoomImg}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "92vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          />
          <button
            onClick={closeZoom}
            style={{ position: "fixed", top: 18, insetInlineEnd: 18, width: 40, height: 40, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.9)", fontSize: 20, cursor: "pointer" }}
            aria-label="סגירה"
          >
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ProductCard({ product, activeId, onZoom, highlight }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const img = product._image;
  const price = product._price;
  const sizeText = product._sizeText;
  const multi = product._multi;
  const hasSizes = product._hasSizes;
  const inStock = product.in_stock;

  const productHref = `/product/${product.id}?from=${encodeURIComponent(String(activeId))}`;

  function handleAdd() {
    addItem({
      key: product.id,
      productId: product.id,
      name: product.name,
      sizeLabel: sizeText || "",
      price: price,
      image: img,
    }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div
      id={`product-${product.id}`}
      style={{
        border: highlight ? "1px solid var(--green)" : "1px solid var(--line)",
        borderRadius: 14, overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column",
        boxShadow: highlight ? "0 0 0 3px rgba(63,122,82,0.35)" : "none",
        transition: "box-shadow 0.4s ease, border-color 0.4s ease",
      }}
    >
      <div
        onClick={() => img && onZoom(img)}
        style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", background: "#f4f6f4", overflow: "hidden", cursor: img ? "zoom-in" : "default" }}
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
          <span style={{ position: "absolute", top: 10, insetInlineStart: 10, background: "rgba(31,42,36,0.82)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, zIndex: 1 }}>
            אזל מהמלאי
          </span>
        ) : null}
      </div>

      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <Link href={productHref} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{product.name}</p>
          {sizeText ? <p style={{ color: "var(--muted)", fontSize: 13 }}>{sizeText}</p> : null}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            {multi ? <span style={{ color: "var(--muted)", fontSize: 13 }}>החל מ־</span> : null}
            <span style={{ fontWeight: 700, fontSize: 18, color: "var(--green)" }}>
              {price != null ? `₪${price}` : "—"}
            </span>
          </div>
        </Link>

        <div style={{ marginTop: "auto" }}>
          {!inStock ? (
            <div style={{ textAlign: "center", padding: "8px", borderRadius: 10, background: "#f4f4f4", color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>אזל מהמלאי</div>
          ) : hasSizes ? (
            <Link href={productHref} style={{ display: "block", textAlign: "center", padding: "9px", borderRadius: 10, border: "1px solid var(--green)", color: "var(--green)", fontSize: 14, fontWeight: 700 }}>
              בחירת מידה
            </Link>
          ) : (
            <button onClick={handleAdd} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", background: added ? "#2f6b43" : "var(--green)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {added ? "✓ נוסף לסל" : "הוספה לסל"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
