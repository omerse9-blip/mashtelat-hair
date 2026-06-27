export const metadata = { title: "משתלת העיר — גינון" };

export default function GardenPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 20px" }}>
      <section style={{ textAlign: "center", marginBottom: 48 }}>
        <p style={{ color: "var(--green)", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>גינון העיר</p>
        <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.12, marginBottom: 14 }}>
          גינה שמדברת בעדכם.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 19, maxWidth: 560, margin: "0 auto" }}>
          הקמת גינות, תחזוקה שוטפת ושדרוג — עבודה מקצועית מהיסוד ועד הפרט האחרון.
        </p>
      </section>

      <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--line)", borderRadius: 16, color: "var(--muted)" }}>
        כאן יוצגו עבודות הגינון — תמונות, סרטונים ותיאום פגישה. בקרוב.
      </div>
    </main>
  );
}
