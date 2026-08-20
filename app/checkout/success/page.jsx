import Link from "next/link";

const BUSINESS_WA = "972533669089";

export default function CheckoutSuccessPage({ searchParams }) {
  const order = searchParams?.order || "";
  const msg = `שלום, ביצעתי הזמנה ותשלום במשתלת העיר. מספר הזמנה ${order}.`;
  const waUrl = `https://wa.me/${BUSINESS_WA}?text=${encodeURIComponent(msg)}`;

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🌿</div>
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>התשלום התקבל, תודה!</h1>
      {order ? <p style={{ color: "var(--muted)", fontSize: 17, marginBottom: 6 }}>מספר הזמנה: <b>#{order}</b></p> : null}
      <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 32 }}>ניצור איתך קשר לתיאום המסירה.</p>
      <a href={waUrl} target="_blank" rel="noreferrer" style={{ display: "block", background: "#25D366", color: "#fff", fontSize: 17, fontWeight: 700, padding: "14px", borderRadius: 12, marginBottom: 12 }}>
        שליחת אישור בוואטסאפ
      </a>
      <Link href="/" style={{ display: "block", color: "var(--green)", fontWeight: 600 }}>חזרה לקטלוג</Link>
    </main>
  );
}
