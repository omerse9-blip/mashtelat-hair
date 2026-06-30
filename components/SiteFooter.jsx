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

function WhatsappIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.218zm5.522-6.273c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <radialGradient id="ig-grad" cx="0.3" cy="1" r="1.2">
          <stop offset="0" stopColor="#FED576" />
          <stop offset="0.25" stopColor="#F47133" />
          <stop offset="0.5" stopColor="#BC3081" />
          <stop offset="0.75" stopColor="#4C63D2" />
        </radialGradient>
      </defs>
      <path fill="url(#ig-grad)" d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38C1.36 2.67.94 3.34.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12.66.66 1.33 1.08 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.38.66-.66 1.08-1.33 1.38-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.12C21.33 1.36 20.66.94 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0z"/>
      <path fill="url(#ig-grad)" d="M12 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8z"/>
      <circle fill="url(#ig-grad)" cx="18.41" cy="5.59" r="1.44"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z"/>
    </svg>
  );
}

function Social(props) {
  const wrap = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
  return (
    <a href={props.href} target="_blank" rel="noreferrer" style={wrap}>
      <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{props.icon}</span>
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
          <Social href={`https://wa.me/${WA}`} label="וואטסאפ" icon={<WhatsappIcon />} />
        </div>

        <div>
          <p style={{ fontWeight: 700, marginBottom: 14 }}>עקבו אחרינו</p>
          <Social href={IG_NURSERY} label="משתלת העיר" icon={<InstagramIcon />} />
          <Social href={FB_NURSERY} label="משתלת העיר" icon={<FacebookIcon />} />
          <Social href={FB_GARDEN} label="גינון העיר" icon={<FacebookIcon />} />
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
