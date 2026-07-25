"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { sizeLabel, singleSizeText } from "../lib/siteData";
import { useCart } from "./CartProvider";
import AddonsPopup from "./AddonsPopup";

const DEFAULT_DISCLAIMER = "• התמונה להמחשה בלבד.";

export default function ProductView({ product, addonGroups }) {
  const hasSizes = product.has_sizes && product.product_sizes?.length > 0;
  const [sel, setSel] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [addonsOpen, setAddonsOpen] = useState(false);
  const [parentKey, setParentKey] = useState(null);
  const { addItem } = useCart();

  const hasAddons = addonGroups && addonGroups.length > 0;
  const disclaimer = product.categories?.disclaimer || DEFAULT_DISCLAIMER;

  const sizes = product.product_sizes || [];
  const current = hasSizes ? sizes[sel] : null;

  const price = hasSizes ? Number(current.price) : (product.single_price != null ? Number(product.single_price) : null);
  const sizeDesc = hasSizes ? (current.description || "") : "";
  const singleText = hasSizes ? "" : singleSizeText(product);

  const image = hasSizes
    ? (current.image_url || product.image_url || sizes.find((s) => s.image_url)?.image_url || null)
    : (product.image_url || null);

  // סגירת התמונה בלחיצת "חזור" בטלפון במקום יציאה מהדף
  useEffect(() => {
    if (!zoom) return;
    window.history.pushState({ zoom: true }, "");
    const onPop = () => setZoom(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [zoom]);

  function openZoom() {
    if (image) setZoom(true);
  }
  function closeZoom() {
    if (window.history.state && window.history.state.zoom) {
      window.history.back();
    } else {
      setZoom(false);
    }
  }

  function handleAdd() {
    const key = hasSizes ? `${product.id}_${current.id || sel}` : product.id;
    addItem({
      key,
      productId: product.id,
      name: product.name,
      sizeLabel: hasSizes ? sizeLabel(current) : singleText,
      price: price,
      image: image,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    if (hasAddons) {
      setParentKey(key);
      setAddonsOpen(true);
    }
  }

  function openAddons() {
    const key = hasSizes ? `${product.id}_${current.id || sel}` : product.id;
    setParentKey(key);
    setAddonsOpen(true);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 36, alignItems: "start" }} className="product-grid">
      <div className="product-image-col">
        <div
          onClick={openZoom}
          className="product-image"
          style={{ background: "#f4f6f4", borderRadius: 18, overflow: "hidden", cursor: image ? "zoom-in" : "default", position: "relative" }}
        >
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 720px) 100vw, 550px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 48 }}>🪴</div>
          )}
          {!product.in_stock ? (
            <span style={{ position: "absolute", top: 14, insetInlineStart: 14, background: "rgba(31,42,36,0.82)", color: "#fff", fontSize: 13, fontWeight: 600, padding: "5px 12px", borderRadius: 999 }}>
              אזל מהמלאי
            </span>
          ) : null}
        </div>
        {disclaimer ? (
          <p className="product-disclaimer" style={{ color: "var(--muted)", fontSize: 13, marginTop: 10, lineHeight: 1.5 }}>{disclaimer}</p>
        ) : null}
      </div>

      <div className="product-info">
        <h1 className="product-title" style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{product.name}</h1>

        {singleText ? (
          <p className="product-sizetext" style={{ color: "var(--muted)", fontSize: 16, marginBottom: 16 }}>{singleText}</p>
        ) : null}

        <div className="product-price" style={{ fontSize: 30, fontWeight: 700, color: "var(--green)", marginBottom: 24 }}>
          {price != null ? `₪${price}` : "—"}
        </div>

        {hasSizes ? (
          <div className="product-sizes" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {sizes.map((s, i) => {
                const active = i === sel;
                return (
                  <button
                    key={s.id || i}
                    onClick={() => setSel(i)}
                    style={{
                      fontSize: 14, fontWeight: 600, padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                      background: active ? "var(--green)" : "#fff",
                      color: active ? "#fff" : "var(--ink)",
                      border: active ? "1px solid var(--green)" : "1px solid var(--line)",
                    }}
                  >
                    {sizeLabel(s)}
                  </button>
                );
              })}
            </div>
            {sizeDesc ? (
              <p className="product-sizedesc" style={{ color: "var(--muted)", fontSize: 15, marginTop: 12 }}>{sizeDesc}</p>
            ) : null}
          </div>
        ) : null}

        {product.in_stock ? (
          <div className="product-actions" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 40, height: 44, border: "none", background: "#fff", fontSize: 20, cursor: "pointer" }}>−</button>
              <span style={{ minWidth: 36, textAlign: "center", fontWeight: 700 }}>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} style={{ width: 40, height: 44, border: "none", background: "#fff", fontSize: 20, cursor: "pointer" }}>+</button>
            </div>
            <button
              onClick={handleAdd}
              style={{ flex: 1, height: 44, borderRadius: 10, border: "none", background: added ? "#2f6b43" : "var(--green)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
            >
              {added ? "✓ נוסף לסל" : "הוספה לסל"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "12px", borderRadius: 10, background: "#f4f4f4", color: "var(--muted)", fontWeight: 600, marginBottom: 20 }}>
            המוצר אזל מהמלאי
          </div>
        )}

        {product.in_stock && hasAddons ? (
          <button
            onClick={openAddons}
            className="product-addons-btn"
            style={{ width: "100%", height: 44, borderRadius: 10, border: "1px solid var(--green)", background: "#fff", color: "var(--green)", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 20 }}
          >
            תוספות מומלצות
          </button>
        ) : null}

        {product.description ? (
          <p style={{ color: "var(--ink)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{product.description}</p>
        ) : null}
      </div>

      {zoom && image ? (
        <div onClick={closeZoom} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20, cursor: "zoom-out" }}>
          <img src={image} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "92vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 12 }} />
          <button
            onClick={closeZoom}
            style={{ position: "fixed", top: 18, insetInlineEnd: 18, width: 40, height: 40, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.9)", fontSize: 20, cursor: "pointer" }}
            aria-label="סגירה"
          >
            ✕
          </button>
        </div>
      ) : null}

      <AddonsPopup
        open={addonsOpen}
        onClose={() => setAddonsOpen(false)}
        groups={addonGroups}
        parentKey={parentKey}
        parentName={product.name}
      />

      <style>{`
        .product-image {
          aspect-ratio: 1 / 1;
        }
        @media (max-width: 720px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
          .product-image {
            aspect-ratio: auto;
            height: 40vh;
            max-height: 40vh;
          }
          .product-disclaimer { font-size: 12px !important; margin-top: 8px !important; }
          .product-title { font-size: 24px !important; margin-bottom: 4px !important; }
          .product-sizetext { font-size: 14px !important; margin-bottom: 8px !important; }
          .product-price { font-size: 24px !important; margin-bottom: 14px !important; }
          .product-sizes { margin-bottom: 14px !important; }
          .product-sizedesc { font-size: 14px !important; margin-top: 10px !important; }
          .product-actions { margin-bottom: 12px !important; }
        }
      `}</style>
    </div>
  );
}
