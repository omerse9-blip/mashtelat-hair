"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../../components/CartProvider";

const BUSINESS_WA = "972533669089";
const FORM_STORAGE_KEY = "mashtela_checkout_form_v2";

function SuccessContent() {
  const searchParams = useSearchParams();
  const order = searchParams.get("order") || "";
  const { clear } = useCart();

  useEffect(() => {
    clear();
    try { localStorage.removeItem(FORM_STORAGE_KEY); } catch { /* התעלמות */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const numbers = order.split(",").map((n) => n.trim()).filter(Boolean);
  const multi = numbers.length > 1;
  const numbersText = numbers.map((n) => `#${n}`).join(", ");

  const msg = multi
    ? `שלום, ביצעתי הזמנה ותשלום במשתלת העיר. מספרי הזמנה ${numbers.join(", ")}.`
    : `שלום, ביצעתי הזמנה ותשלום במשתלת העיר. מספר הזמנה ${order}.`;
  const waUrl = `https://wa.me/${BUSINESS_WA}?text=${encodeURIComponent(msg)}`;

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🌿</div>
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>התשלום התקבל, תודה!</h1>
      {numbers.length ? (
        <p style={{ color: "var(--muted)", fontSize: 17, marginBottom: 6 }}>
          {multi ? "מספרי הזמנה: " : "מספר הזמנה: "}<b>{numbersText}</b>
        </p>
      ) : null}
      {multi ? (
        <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 6 }}>
          הפריטים נמסרים במועדים שונים, ולכן חולקו לכמה הזמנות.
        </p>
      ) : null}
      <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 32 }}>ניצור איתך קשר לתיאום המסירה.</p>
      <a href={waUrl} target="_blank" rel="noreferrer" style={{ display: "block", background: "#25D366", color: "#fff", fontSize: 17, fontWeight: 700, padding: "14px", borderRadius: 12, marginBottom: 12 }}>
        שליחת אישור בוואטסאפ
      </a>
      <Link href="/" style={{ display: "block", color: "var(--green)", fontWeight: 600 }}>חזרה לקטלוג</Link>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
