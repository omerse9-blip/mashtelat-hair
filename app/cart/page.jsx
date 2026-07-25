"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../../components/CartProvider";

export default function CartPage() {
  const { items, count, total, removeItem, addItem, setQuantity, clear, ready } = useCart();
  const [undo, setUndo] = useState(null); // { items: [...], label }
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (!ready) return null;

  // קיבוץ: כל זר אב עם התוספות שנצמדו אליו
  const parents = items.filter((it) => !it.parentKey);
  const addonsOf = (key) => items.filter((it) => it.parentKey === key);
  const orphanAddons = items.filter((it) => it.parentKey && !parents.some((p) => p.key === it.parentKey));

  function startUndo(removed, label) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setUndo({ items: removed, label });
    timerRef.current = setTimeout(() => setUndo(null), 7000);
  }

  function removeParent(parent) {
    const children = addonsOf(parent.key);
    const removed = [parent, ...children];
    children.forEach((c) => removeItem(c.key));
    removeItem(parent.key);
    startUndo(removed, "הפריט והתוספות הוסרו");
  }

  function removeSingle(item) {
    removeItem(item.key);
    startUndo([item], "הפריט הוסר");
  }

  function doUndo() {
    if (!undo) return;
    undo.items.forEach((it) => addItem(it, it.quantity));
    setUndo(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function emptyCart() {
    if (!window.confirm("לרוקן את כל הסל?")) return;
    const removed = [...items];
    clear();
    startUndo(removed, "הסל רוקן");
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700 }}>העגלה שלי</h1>
        {count > 0 && (
          <button onClick={emptyCart} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 14, cursor: "pointer", textDecoration: "underline" }}>
            רוקן סל
          </button>
        )}
      </div>

      {count === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--line)", borderRadius: 16, color: "var(--muted)" }}>
          העגלה ריקה.{" "}
          <Link href="/" style={{ color: "var(--green)", fontWeight: 600 }}>לקטלוג המשתלה</Link>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {parents.map((it) => (
              <div key={it.key} style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
                <CartRow item={it} onRemove={() => removeParent(it)} setQuantity={setQuantity} />
                {addonsOf(it.key).map((ad) => (
                  <div key={ad.key} style={{ borderTop: "1px solid var(--line)", background: "#faf9f6", paddingInlineStart: 18 }}>
                    <CartRow item={ad} onRemove={() => removeSingle(ad)} setQuantity={setQuantity} isAddon />
                  </div>
                ))}
              </div>
            ))}
            {orphanAddons.map((it) => (
              <div key={it.key} style={{ border: "1px solid var(--line)", borderRadius: 14 }}>
                <CartRow item={it} onRemove={() => removeSingle(it)} setQuantity={setQuantity} />
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>סה"כ ({count} פריטים)</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "var(--green)" }}>₪{total.toFixed(0)}</span>
            </div>
            <Link href="/checkout" style={{ display: "block", textAlign: "center", background: "var(--green)", color: "#fff", fontSize: 17, fontWeight: 700, padding: "14px", borderRadius: 12 }}>
              המשך להזמנה
            </Link>
            <Link href="/" style={{ display: "block", textAlign: "center", color: "var(--muted)", fontSize: 14, marginTop: 14 }}>
              המשך בקנייה
            </Link>
          </div>
        </div>
      )}

      {undo && (
        <div style={undoStrip}>
          <span style={{ fontSize: 14 }}>{undo.label}</span>
          <button onClick={doUndo} style={undoBtn}>ביטול</button>
        </div>
      )}
    </main>
  );
}

function CartRow({ item, onRemove, setQuantity, isAddon }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", padding: 12 }}>
      <div style={{ width: isAddon ? 54 : 70, height: isAddon ? 54 : 70, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f4f6f4" }}>
        {item.image ? (
          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🪴</div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {isAddon && <span style={{ fontSize: 11, color: "var(--muted)" }}>תוספת</span>}
        <p style={{ fontWeight: 700, fontSize: isAddon ? 14 : 16 }}>{item.name}</p>
        {item.sizeLabel ? <p style={{ color: "var(--muted)", fontSize: 13 }}>{item.sizeLabel}</p> : null}
        <p style={{ color: "var(--green)", fontWeight: 700, marginTop: 2 }}>₪{Number(item.price).toFixed(0)}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
          <button onClick={() => setQuantity(item.key, item.quantity - 1)} style={{ width: 34, height: 36, border: "none", background: "#fff", fontSize: 18, cursor: "pointer" }}>−</button>
          <span style={{ minWidth: 30, textAlign: "center", fontWeight: 700 }}>{item.quantity}</span>
          <button onClick={() => setQuantity(item.key, item.quantity + 1)} style={{ width: 34, height: 36, border: "none", background: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
        </div>
        <button onClick={onRemove} style={{ background: "none", border: "none", color: "#b3261e", fontSize: 13, cursor: "pointer" }}>הסרה</button>
      </div>
    </div>
  );
}

const undoStrip = {
  position: "fixed", left: 0, right: 0, bottom: 0,
  background: "rgba(43,58,42,0.96)", color: "#fff",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "14px 20px", zIndex: 400,
};
const undoBtn = {
  background: "none", border: "none", color: "#9fd3ab",
  fontSize: 15, fontWeight: 700, cursor: "pointer",
};
