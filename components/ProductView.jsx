"use client";

import { useState } from "react";
import { sizeLabel } from "../lib/siteData";
import { useCart } from "./CartProvider";

export default function ProductView({ product }) {
  const hasSizes = product.has_sizes && product.product_sizes?.length > 0;
  const [sel, setSel] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [zoom, setZoom] = useState(false);
  const { addItem } = useCart();

  const sizes = product.product_sizes || [];
  const current = hasSizes ? sizes[sel] : null;

  const price = hasSizes ? Number(current.price) : (product.single_price != null ? Number(product.single_price) : null);
  const sizeText = hasSizes ? sizeLabel(current) : (product.single_size || "");

  const image = hasSizes
    ? (current.image_url || product.image_url || sizes.find((s) => s.image_url)?.image_url || null)
    : (product.image_url || null);

  function handleAdd() {
    addItem({
      key: hasSizes ? `${product.id}_${current.id || sel}` : product.id,
      productId: product.id,
      name: product.name,
      sizeLabel: sizeText || "",
      price: price,
      image: image,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 36, alignItems: "start" }} className="product-grid">
      <div
        onClick={() => image && setZoom(true)}
        className="product-image"
        style={{ background: "#f4f6f4", borderRadius: 18, overflow: "hidden", cursor: image ? "zoom-in" : "default", position: "relative" }}
      >
        {image ? (
          <img src={image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 48 }}>🪴</div>
        )}
        {!product.in_stock ? (
          <span style={{ position: "absolute", top: 14, insetInlineStart: 14, background: "rgba(31,42,36,0.82)", color: "#fff", fontSize: 13, fontWeight: 600, padding: "5px 12px", borderRadius: 999 }}>
            אזל מהמלאי
          </span>
        ) : null}
      </div>

      <div className="product-info">
        <h1 className="product-title" style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{product.name}</h1>
        {sizeText ? <p className="product-sizetext" style={{ color: "var(--muted)", fontSize: 16, marginBottom: 16 }}>{sizeText}</p> : null}

        <div className="product-price" style={{ fontSize: 30, fontWeight: 700, color: "var(--green)", marginBottom: 24 }}>
          {price != null ? `₪${price}` : "—"}
        </div>

        {hasSizes ? (
          <div className="product-sizes" style={{ marginBottom: 24 }}>
            <p style={{ fontWeight: 600, marginBottom: 10 }}>בחירת גודל</p>
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

        {product.description ? (
          <p style={{ color: "var(--ink)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{product.description}</p>
        ) : null}
      </div>

      {zoom && image ? (
        <div onClick={() => setZoom(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20, cursor: "zoom-out" }}>
          <img src={image} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "92vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 12 }} />
        </div>
      ) : null}

      <style>{`
        .product-image {
          aspect-ratio: 1 / 1;
        }
        @media (max-width: 720px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
          .product-image {
            aspect-ratio: auto;
            height: 34vh;
            max-height: 34vh;
          }
          .product-title { font-size: 24px !important; margin-bottom: 4px !important; }
          .product-sizetext { font-size: 14px !important; margin-bottom: 8px !important; }
          .product-price { font-size: 24px !important; margin-bottom: 14px !important; }
          .product-sizes { margin-bottom: 14px !important; }
          .product-actions { margin-bottom: 12px !important; }
        }
      `}</style>
    </div>
  );
}
