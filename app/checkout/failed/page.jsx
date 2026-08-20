import Link from "next/link";

export default function CheckoutFailedPage({ searchParams }) {
  const order = searchParams?.order || "";

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>התשלום לא הושלם</h1>
      {order ? <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 6 }}>מספר הזמנה: <b>#{order}</b></p> : null}
      <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 32 }}>לא בוצע חיוב. אפשר לנסות שוב, או ליצור איתנו קשר.</p>
      <Link href="/checkout" style={{ display: "block", background: "var(--green)", color: "#fff", fontSize: 17, fontWeight: 700, padding: "14px", borderRadius: 12, marginBottom: 12, textDecoration: "none" }}>
        חזרה לתשלום
      </Link>
      <Link href="/" style={{ display: "block", color: "var(--muted)", fontWeight: 600 }}>חזרה לקטלוג</Link>
    </main>
  );
}
