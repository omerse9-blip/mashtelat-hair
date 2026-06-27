"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../components/CartProvider";
import { createOrder } from "../../lib/siteData";

const BUSINESS_WA = "972533669089";

function field(label, value, onChange, props = {}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15 }}
        {...props}
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total, count, clear, ready } = useCart();

  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cAddr, setCAddr] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [rName, setRName] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rAddr, setRAddr] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);

  if (!ready) return null;

  if (done) {
    const msg = `שלום, ביצעתי הזמנה במשתלת העיר. מספר הזמנה ${done}. שמי ${cName}.`;
    const waUrl = `https://wa.me/${BUSINESS_WA}?text=${encodeURIComponent(msg)}`;
    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🌿</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>ההזמנה נשלחה!</h1>
        <p style={{ color: "var(--muted)", fontSize: 17, marginBottom: 6 }}>מספר הזמנה: <b>#{done}</b></p>
        <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 32 }}>ניצור איתך קשר טלפוני לאישור הפרטים והתשלום.</p>

        <a href={waUrl} target="_blank" rel="noreferrer" style={{ display: "block", background: "#25D366", color: "#fff", fontSize: 17, fontWeight: 700, padding: "14px", borderRadius: 12, marginBottom: 12 }}>
          שליחת אישור בוואטסאפ
        </a>
        <Link href="/" style={{ display: "block", color: "var(--green)", fontWeight: 600 }}>חזרה לקטלוג</Link>
      </main>
    );
  }

  if (count === 0) {
    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 20px", textAlign: "center", color: "var(--muted)" }}>
        העגלה ריקה.{" "}
        <Link href="/" style={{ color: "var(--green)", fontWeight: 600 }}>לקטלוג המשתלה</Link>
      </main>
    );
  }

  async function handleSubmit() {
    setErr("");
    if (!cName.trim() || !cPhone.trim()) {
      setErr("יש למלא שם וטלפון.");
      return;
    }
    if (isGift && (!rName.trim() || !rPhone.trim())) {
      setErr("במשלוח מתנה יש למלא שם וטלפון של המקבל.");
      return;
    }
    setSubmitting(true);
    try {
      const orderNumber = await createOrder({
        customer_name: cName.trim(),
        customer_phone: cPhone.trim(),
        customer_address: cAddr.trim(),
        is_gift: isGift,
        recipient_name: rName.trim(),
        recipient_phone: rPhone.trim(),
        recipient_address: rAddr.trim(),
        notes: notes.trim(),
      }, items);
      clear();
      setDone(orderNumber);
    } catch (e) {
      setErr(e.message || "אירעה שגיאה בשליחה. נסו שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
      <Link href="/cart" style={{ color: "var(--muted)", fontSize: 14, display: "inline-block", marginBottom: 20 }}>› חזרה לעגלה</Link>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>פרטי הזמנה</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>{count} פריטים · סה"כ ₪{total.toFixed(0)}</p>

      <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <p style={{ fontWeight: 700, marginBottom: 12 }}>הפרטים שלך</p>
        {field("שם מלא *", cName, setCName, { placeholder: "שם" })}
        {field("טלפון *", cPhone, setCPhone, { type: "tel", inputMode: "tel", placeholder: "05X-XXXXXXX" })}
        {field("כתובת (אופציונלי)", cAddr, setCAddr, { placeholder: "רחוב, עיר" })}
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, fontSize: 15, fontWeight: 600 }}>
        <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--green)" }} />
        שליחת מתנה / כתובת אחרת
      </label>

      {isGift ? (
        <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>פרטי המקבל</p>
          {field("שם המקבל *", rName, setRName, { placeholder: "שם המקבל" })}
          {field("טלפון המקבל *", rPhone, setRPhone, { type: "tel", inputMode: "tel", placeholder: "05X-XXXXXXX" })}
          {field("כתובת המקבל (אופציונלי)", rAddr, setRAddr, { placeholder: "רחוב, עיר" })}
        </div>
      ) : null}

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>הערות למשתלה (אופציונלי)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15 }} />
      </div>

      {err ? <p style={{ color: "#b3261e", fontSize: 14, marginBottom: 14 }}>{err}</p> : null}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ width: "100%", background: "var(--green)", color: "#fff", fontSize: 17, fontWeight: 700, padding: "15px", borderRadius: 12, border: "none", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}
      >
        {submitting ? "שולח..." : "שליחת הזמנה"}
      </button>
      <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", marginTop: 12 }}>
        אין תשלום באתר — ניצור קשר טלפוני לאישור וחיוב.
      </p>
    </main>
  );
}
