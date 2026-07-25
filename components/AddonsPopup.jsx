"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { sizeLabel } from "../lib/siteData";

export default function AddonsPopup({ open, onClose, groups, parentKey, parentName }) {
  const { addItem } = useCart();
  const [openGroup, setOpenGroup] = useState(null);   // מחלקה שנפתחה (שכבה שנייה)
  const [sizePickFor, setSizePickFor] = useState(null); // מוצר שנבחרת לו מידה

  // איפוס בכל פתיחה מחדש של החלון
  useEffect(() => {
    if (open) { setOpenGroup(null); setSizePickFor(null); }
  }, [open]);

  // "חזור" בטלפון: סוגר לפי סדר — קודם בחירת גודל, אז שכבת פריטים, אז החלון
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ addons: true }, "");
    const onPop = () => {
      if (sizePickFor) { setSizePickFor(null); window.history.pushState({ addons: true }, ""); }
      else if (openGroup) { setOpenGroup(null); window.history.pushState({ addons: true }, ""); }
      else onClose();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open, openGroup, sizePickFor, onClose]);

  if (!open) return null;

  // לחיצה על רקע החלון: בשכבת פריטים חוזרת אחורה, בשכבת מחלקות סוגרת
  function handleOverlayClick() {
    if (openGroup) setOpenGroup(null);
    else onClose();
  }

  function addSimple(product) {
    const price = product.has_sizes && product.product_sizes?.length
      ? Number(product.product_sizes[0].price)
      : Number(product.single_price);
    addItem({
      key: `${product.id}_addon_${parentKey}`,
      productId: product.id,
      name: product.name,
      sizeLabel: product.has_sizes && product.product_sizes?.length ? sizeLabel(product.product_sizes[0]) : (product.single_size || ""),
      price,
      image: cardImageOf(product),
      parentKey,
    }, 1);
  }

  function addWithSize(product, size) {
    addItem({
      key: `${product.id}_${size.id}_addon_${parentKey}`,
      productId: product.id,
      name: product.name,
      sizeLabel: sizeLabel(size),
      price: Number(size.price),
      image: size.image_url || cardImageOf(product),
      parentKey,
    }, 1);
    setSizePickFor(null);
  }

  function handleAdd(product) {
    const multi = product.has_sizes && product.product_sizes?.length > 1;
    if (multi) setSizePickFor(product);
    else addSimple(product);
  }

  const inGroup = !!openGroup;

  return (
    <div style={overlay} onClick={handleOverlayClick}>
      <div style={sheet} onClick={(e) => e.stopPropagation()}>
        <div style={sheetHeader}>
          {inGroup ? (
            <button onClick={() => setOpenGroup(null)} aria-label="חזרה" style={closeBtn}>›</button>
          ) : (
            <button onClick={onClose} aria-label="סגירה" style={closeBtn}>✕</button>
          )}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 18 }}>
              {inGroup ? openGroup.category_name : "תוספת מושלמת"}
            </p>
          </div>
          <span style={{ width: 32 }} />
        </div>

        <div style={sheetBody}>
          {(!groups || groups.length === 0) ? (
            <p style={{ textAlign: "center", color: "var(--muted)", padding: "30px 0" }}>אין תוספות זמינות כרגע.</p>
          ) : inGroup ? (
            // שכבה שנייה: פריטי המחלקה
            <div style={cardGrid}>
              {openGroup.items.map((p) => (
                <AddonCard key={p.id} product={p} onAdd={() => handleAdd(p)} />
              ))}
            </div>
          ) : (
            // שכבה ראשונה: כרטיס לכל מחלקה — תמונה ושם בלבד
            <div style={cardGrid}>
              {groups.map((g) => (
                <GroupCard key={g.category_id} group={g} onOpen={() => setOpenGroup(g)} />
              ))}
            </div>
          )}
        </div>

        <div style={sheetFooter}>
          <Link href="/cart" style={goCartBtn}>מעבר לסל</Link>
          <button onClick={onClose} style={continueBtn}>המשך בקנייה</button>
        </div>
      </div>

      {sizePickFor && (
        <div
          style={sizeOverlay}
          onClick={(e) => { e.stopPropagation(); setSizePickFor(null); }}
        >
          <div style={sizeBox} onClick={(e) => e.stopPropagation()}>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, textAlign: "center" }}>{sizePickFor.name}</p>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12, textAlign: "center" }}>בחירת גודל</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sizePickFor.product_sizes.map((s) => (
                <button key={s.id} onClick={() => addWithSize(sizePickFor, s)} style={sizeOption}>
                  <span>{sizeLabel(s)}</span>
                  <span style={{ fontWeight: 700, color: "var(--green)" }}>₪{Number(s.price)}</span>
                </button>
              ))}
            </div>
            <button onClick={(e) => { e.stopPropagation(); setSizePickFor(null); }} style={sizeCancel}>ביטול</button>
          </div>
        </div>
      )}
    </div>
  );
}

// כרטיס מחלקה (שכבה ראשונה) — תמונה ושם בלבד
function GroupCard({ group, onOpen }) {
  const cheapest = group.items[0]; // כבר ממוין לפי מחיר עולה
  const img = cheapest ? cardImageOf(cheapest) : null;
  return (
    <button style={{ ...card, cursor: "pointer", textAlign: "inherit" }} onClick={onOpen}>
      <div style={cardImg}>
        {img ? <img src={img} alt={group.category_name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <div style={cardImgEmpty}>🪴</div>}
      </div>
      <div style={cardBody}>
        <p style={cardName}>{group.category_name}</p>
        <span style={{ ...addBtn, background: "var(--green)", display: "block", textAlign: "center" }}>לבחירה ›</span>
      </div>
    </button>
  );
}

// כרטיס פריט (שכבה שנייה)
function AddonCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);
  const multi = product.has_sizes && product.product_sizes?.length > 1;
  const price = product.has_sizes && product.product_sizes?.length
    ? Number(product.product_sizes[0].price)
    : Number(product.single_price);
  const img = cardImageOf(product);

  function click() {
    onAdd();
    if (!multi) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    }
  }

  return (
    <div style={card}>
      <div style={cardImg}>
        {img ? <img src={img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <div style={cardImgEmpty}>🪴</div>}
      </div>
      <div style={cardBody}>
        <p style={cardName}>{product.name}</p>
        <p style={cardPriceStyle}>{multi ? `החל מ-₪${price}` : `₪${price}`}</p>
        <button onClick={click} style={{ ...addBtn, background: added ? "#2f6b43" : "var(--green)" }}>
          {added ? "✓ נוסף" : "הוספה לסל"}
        </button>
      </div>
    </div>
  );
}

function cardImageOf(product) {
  if (product.has_sizes && product.product_sizes?.length) {
    const withImg = product.product_sizes.find((s) => s.image_url);
    return product.product_sizes[0].image_url || withImg?.image_url || product.image_url || null;
  }
  return product.image_url || null;
}

const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
const sheet = { background: "#fff", width: "100%", maxWidth: 520, maxHeight: "88vh", borderRadius: 18, display: "flex", flexDirection: "column", overflow: "hidden" };
const sheetHeader = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--line)", flexShrink: 0 };
const closeBtn = { width: 32, height: 32, borderRadius: 999, border: "none", background: "#f2f2f0", fontSize: 18, cursor: "pointer" };
const sheetBody = { padding: "12px", overflowY: "auto", flex: 1 };
const sheetFooter = { display: "flex", gap: 10, padding: "10px 16px", borderTop: "1px solid var(--line)", flexShrink: 0 };
const goCartBtn = { flex: 1, textAlign: "center", padding: "11px", borderRadius: 10, background: "var(--green)", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" };
const continueBtn = { flex: 1, padding: "11px", borderRadius: 10, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", fontSize: 15, fontWeight: 600, cursor: "pointer" };

const cardGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "stretch" };
const card = { border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column", height: "100%", padding: 0 };
const cardImg = { width: "100%", aspectRatio: "1 / 1", background: "#f4f6f4", flexShrink: 0 };
const cardImgEmpty = { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "var(--muted)" };
const cardBody = { display: "flex", flexDirection: "column", flex: 1, padding: "6px 8px 8px" };
const cardName = { fontWeight: 600, fontSize: 13, textAlign: "center", marginBottom: 6, lineHeight: 1.3 };
const cardPriceStyle = { color: "var(--green)", fontWeight: 700, fontSize: 14, textAlign: "center", marginBottom: 6 };
const addBtn = { marginTop: "auto", padding: "7px", borderRadius: 8, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" };

const sizeOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 320, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const sizeBox = { background: "#fff", borderRadius: 14, padding: 18, width: "100%", maxWidth: 320 };
const sizeOption = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" };
const sizeCancel = { width: "100%", marginTop: 12, padding: "10px", borderRadius: 10, border: "none", background: "#f2f2f0", fontSize: 14, cursor: "pointer" };
