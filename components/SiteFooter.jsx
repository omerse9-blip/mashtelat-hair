import Link from "next/link";

const PHONE = "0533669089";
const PHONE_DISPLAY = "053-3669089";
const WA = "972533669089";
const EMAIL = "service.ginun@gmail.com";
const FB_NURSERY = "https://www.facebook.com/share/1BCkoPJAca/";
const FB_GARDEN = "https://www.facebook.com/share/1JJUirptBe/";
const IG_NURSERY = "https://www.instagram.com/mishtelet_city";
const MAPS = "https://maps.app.goo.gl/?link=" + encodeURIComponent("https://www.google.com/maps/place/?q=place_id:ChIJAYo6AjhxABURzvN46FMox1A");

const FOOTER_BG = "#f7f2e9";

const linkStyle = { color: "var(--ink)" };
const mutedLink = { color: "var(--muted)" };

function Social(props) {
  const wrap = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
  const badge = {
    width: 38, height: 38, borderRadius: 999, background: props.bg, color: "#fff",
    fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  };
  return (
    <a href={props.href} target="_blank" rel="noreferrer" style={wrap}>
      <span style={badge}>{props.glyph}</span>
      <span style={{ color: "var(--ink)", fontWeight: 600, fontSize: 15 }}>{props.label}</span>
    </a>
  );
}

export default function SiteFooter() {
  const grid = {
    maxWidth: 1100, margin: "0 auto", padding: "48px 20px", display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32,
    background: FOOTER_BG,
  };
  const navBtn = {
    display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px",
    borderRadius: 999, border: "1px solid var(--green)", color: "var(--green)",
    fontWeight: 600, fontSize: 14,
  };
  const bottomBar = {
    borderTop: "1px solid var(--line)", padding: "16px 20px", textAlign: "center",
    color: "var(--muted)", fontSize: 13, background: FOOTER_BG,
  };
  const bottomLinks = {
    display: "flex", flexWrap: "wrap", gap: "6px 18px", justifyContent: "center", marginBottom: 10,
  };

  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 80, background: FOOTER_BG }}>
      <div style={grid}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>משתלת העיר</p>
          <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 12 }}>
            יוזמה 6, אזור התעשייה, אילת
          </p>
          <a href={MAPS} target="_blank" rel="noreferrer" style={navBtn}>ניווט למשתלה</a>
        </div>

        <div>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>שעות פתיחה</p>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            ראשון עד חמישי: 9:00 - 18:00
          </p>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            שישי: 9:00 - 15:00
          </p>
        </div>

        <div>
          <p style={{ fontWeight: 700, marginBottom: 14 }}>יצירת קשר</p>
          <p style={{ lineHeight: 2, marginBottom: 14 }}>
            <a href={`tel:${PHONE}`} style={linkStyle}>טלפון: {PHONE_DISPLAY}</a>
          </p>
          <p style={{ lineHeight: 2, marginBottom: 14 }}>
            <a href={`mailto:${EMAIL}`} style={linkStyle}>{EMAIL}</a>
          </p>
          <Social href={`https://wa.me/${WA}`} label="וואטסאפ" bg="#25D366" glyph="W" />
        </div>

        <div>
          <p style={{ fontWeight: 700, marginBottom: 14 }}>עקבו אחרינו</p>
          <Social href={IG_NURSERY} label="משתלת העיר" bg="#E1306C" glyph="IG" />
          <Social href={FB_NURSERY} label="משתלת העיר" bg="#1877F2" glyph="f" />
          <Social href={FB_GARDEN} label="גינון העיר" bg="#1877F2" glyph="f" />
        </div>

        <div>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>מידע ותקנון</p>
          <p style={{ lineHeight: 2 }}>
            <Link href="/terms" style={linkStyle}>תקנון ותנאי שימוש</Link>
          </p>
          <p style={{ lineHeight: 2 }}>
            <Link href="/refund-policy" style={linkStyle}>מדיניות ביטולים והחזרות</Link>
          </p>
          <p style={{ lineHeight: 2 }}>
            <Link href="/privacy" style={linkStyle}>מדיניות פרטיות</Link>
          </p>
          <p style={{ lineHeight: 2 }}>
            <Link href="/accessibility" style={linkStyle}>הצהרת נגישות</Link>
          </p>
        </div>
      </div>

      <div style={bottomBar}>
        <div style={bottomLinks}>
          <Link href="/terms" style={mutedLink}>תקנון</Link>
          <Link href="/refund-policy" style={mutedLink}>ביטולים והחזרות</Link>
          <Link href="/privacy" style={mutedLink}>פרטיות</Link>
          <Link href="/accessibility" style={mutedLink}>נגישות</Link>
        </div>
        © {new Date().getFullYear()} משתלת העיר · גינון העיר · כל הזכויות שמורות
      </div>
    </footer>
  );
}
