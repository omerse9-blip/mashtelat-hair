const PHONE = "0533669089";
const PHONE_DISPLAY = "053-3669089";
const WA = "972533669089";
const EMAIL = "service.ginun@gmail.com";

const FB_NURSERY = "https://www.facebook.com/share/1BCkoPJAca/";
const FB_GARDEN = "https://www.facebook.com/share/1JJUirptBe/";
const IG_NURSERY = "https://www.instagram.com/mishtelet_city";

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 80, background: "#fafbfa" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>משתלת העיר</p>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            יוזמה 6, אזור התעשייה<br />אילת
          </p>
        </div>

        <div>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>שעות פתיחה</p>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            ראשון–חמישי: 9:00–18:00<br />
            שישי: 9:00–15:00
          </p>
        </div>

        <div>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>יצירת קשר</p>
          <p style={{ lineHeight: 2 }}>
            <a href={`tel:${PHONE}`} style={{ color: "var(--ink)" }}>טלפון: {PHONE_DISPLAY}</a><br />
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer" style={{ color: "var(--green)", fontWeight: 600 }}>וואטסאפ</a><br />
            <a href={`mailto:${EMAIL}`} style={{ color: "var(--ink)" }}>{EMAIL}</a>
          </p>
        </div>

        <div>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>עקבו אחרינו</p>
          <p style={{ lineHeight: 2 }}>
            <a href={IG_NURSERY} target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>אינסטגרם — משתלת העיר</a><br />
            <a href={FB_NURSERY} target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>פייסבוק — משתלת העיר</a><br />
            <a href={FB_GARDEN} target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>פייסבוק — גינון העיר</a>
          </p>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--line)", padding: "16px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
        © {new Date().getFullYear()} משתלת העיר · כל הזכויות שמורות
      </div>
    </footer>
  );
}
