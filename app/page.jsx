export const metadata = { title: "משתלת העיר — משתלה" };

export default function NurseryPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 20px" }}>
      <section style={{ textAlign: "center", marginBottom: 48 }}>
        <p style={{ color: "var(--green)", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>משתלת העיר · אילת</p>
        <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.12, marginBottom: 14 }}>
          כל הצמחים, במקום אחד.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 19, maxWidth: 560, margin: "0 auto" }}>
          עצים, שיחים, צמחי נוי, כדים וכלי גינון — בחרו, הזמינו, ואנחנו ניצור קשר לתיאום.
        </p>
      </section>

      <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--line)", borderRadius: 16, color: "var(--muted)" }}>
        כאן יוצג קטלוג המשתלה — בקרוב.
      </div>
    </main>
  );
}
