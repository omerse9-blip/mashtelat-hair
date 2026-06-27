"use client";

import { useState } from "react";

export default function NurseryCatalog({ categories, productsByCat }) {
  const [activeId, setActiveId] = useState(categories[0]?.id || null);
  const products = activeId ? (productsByCat[activeId] || []) : [];

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
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
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
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  const img = product._image;
  const price = product._price;
  const sizeText = product._sizeText;
  const multi = product._multi;
  const inStock = product.in_stock;

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ aspectRatio: "1 / 1", background: "#f4f6f4", position: "relative" }}>
        {img ? (
          <img src={img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 28 }}>🪴</div>
        )}
        {!inStock && (
          <span style={{ position: "absolute", top: 10, insetInlineStart: 10, background: "rgba(31,42,36,0.82)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>
            אזל מהמלאי
          </span>
        )}
      </div>

      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: 16 }}>{product.name}</p>
        {sizeText && <p style={{ color: "var(--muted)", fontSize: 13 }}>{sizeText}</p>}
        <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", alignItems: "baseline", gap: 6 }}>
          {multi && <span style={{ color: "var(--muted)", fontSize: 13 }}>החל מ־</span>}
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--green)" }}>
            {price != null ? `₪${price}` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
