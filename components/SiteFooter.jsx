import Link from "next/link";

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
        <div>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>מידע ותקנון</p>
          <p style={{ lineHeight: 2 }}>
            <Link href="/terms" style={{ color: "var(--ink)" }}>תקנון ותנאי שימוש</Link><br />
            <Link href="/refund-policy" style={{ color: "var(--ink)" }}>מדיניות ביטולים והחזרות</Link><br />
            <Link href="/privacy" style={{ color: "var(--ink)" }}>מדיניות פרטיות</Link><br />
            <Link href="/accessibility" style={{ color: "var(--ink)" }}>הצהרת נגישות</Link>
          </p>
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--line)", padding: "16px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", justifyContent: "center", marginBottom: 10 }}>
          <Link href="/terms" style={{ color: "var(--muted)" }}>תקנון</Link>
          <Link href="/refund-policy" style={{ color: "var(--muted)" }}>ביטולים והחזרות</Link>
          <Link href="/privacy" style={{ color: "var(--muted)" }}>פרטיות</Link>
          <Link href="/accessibility" style={{ color: "var(--muted)" }}>נגישות</Link>
        </div>
        © {new Date().getFullYear()} משתלת העיר · גינון העיר · כל הזכויות שמורות
      </div>
    </footer>
  );
}
