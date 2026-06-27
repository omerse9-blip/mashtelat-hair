"use client";

import Link from "next/link";
import { useCart } from "../../components/CartProvider";

export default function CartPage() {
  const { items, count, total, ready } = useCart();

  if (!ready) return null;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "56px 20px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 24 }}>העגלה שלי</h1>
      {count === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--line)", borderRadius: 16, color: "var(--muted)" }}>
          העגלה ריקה.{" "}
          <Link href="/" style={{ color: "var(--green)", fontWeight: 600 }}>לקטלוג המשתלה</Link>
        </div>
      ) : (
        <div>
          <p style={{ color: "var(--muted)", marginBottom: 16 }}>{count} פריטים · סה"כ ₪{total.toFixed(0)}</p>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((it) => (
              <li key={it.key} style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12 }}>
                <span>{it.name}{it.sizeLabel ? ` · ${it.sizeLabel}` : ""} ×{it.quantity}</span>
                <span style={{ fontWeight: 700 }}>₪{(Number(it.price) * it.quantity).toFixed(0)}</span>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 24, color: "var(--muted)" }}>טופס ההזמנה ייבנה בשלב הבא.</p>
        </div>
      )}
    </main>
  );
}
