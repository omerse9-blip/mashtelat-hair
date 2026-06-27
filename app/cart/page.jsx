"use client";

import Link from "next/link";
import { useCart } from "../../components/CartProvider";

export default function CartPage() {
  const { items, count, total, removeItem, setQuantity, ready } = useCart();

  if (!ready) return null;

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 24 }}>העגלה שלי</h1>

      {count === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--line)", borderRadius: 16, color: "var(--muted)" }}>
          העגלה ריקה.{" "}
          <Link href="/" style={{ color: "var(--green)", fontWeight: 600 }}>לקטלוג המשתלה</Link>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {items.map((it) => (
              <div key={it.key} style={{ display: "flex", gap: 14, alignItems: "center", padding: 12, border: "1px solid var(--line)", borderRadius: 14 }}>
                <div style={{ width: 70, height: 70, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f4f6f4" }}>
                  {it.image ? (
                    <img src={it.image} alt={it.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🪴</div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 16 }}>{it.name}</p>
                  {it.sizeLabel ? <p style={{ color: "var(--muted)", fontSize: 13 }}>{it.sizeLabel}</p> : null}
                  <p style={{ color: "var(--green)", fontWeight: 700, marginTop: 2 }}>₪{Number(it.price).toFixed(0)}</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
                    <button onClick={() => setQuantity(it.key, it.quantity - 1)} style={{ width: 34, height: 36, border: "none", background: "#fff", fontSize: 18, cursor: "pointer" }}>−</button>
                    <span style={{ minWidth: 30, textAlign: "center", fontWeight: 700 }}>{it.quantity}</span>
                    <button onClick={() => setQuantity(it.key, it.quantity + 1)} style={{ width: 34, height: 36, border: "none", background: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
                  </div>
                  <button onClick={() => removeItem(it.key)} style={{ background: "none", border: "none", color: "#b3261e", fontSize: 13, cursor: "pointer" }}>הסרה</button>
                </div>
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
    </main>
  );
}
