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

// טקסט לחיץ: ירוק המותג באופן קבוע — מסמן לחיצוּת בכל מכשיר, גם מובייל
const linkStyle = { color: "var(--green)", fontWeight: 600, textDecoration: "none" };
const mutedLink = { color: "var(--muted)", textDecoration: "none" };

// תווית עמודה: קטנה ומרווחת מאוד, אפורה, עם הרבה אוויר מתחתיה — נקראת כתווית ולא כטקסט קטן
const colHeading = {
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: "0.18em",
  color: "var(--muted)",
  marginBottom: 22,
};

// תוכן לא-לחיץ (כתובת, שעות): שחור-רך
const bodyText = {
  color: "var(--ink)",
  fontSize: 15,
  lineHeight: 1.8,
  marginBottom: 12,
};

function WhatsappIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true">
      <path fill="#25D366" d="M16 0C7.164 0 0 7.164 0 16c0 2.824.738 5.476 2.03 7.78L0 32l8.43-2.2A15.93 15.93 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0z"/>
      <path fill="#fff" d="M23.41 19.46c-.4-.2-2.37-1.17-2.74-1.3-.37-.13-.64-.2-.9.2-.27.4-1.04 1.3-1.27 1.57-.23.27-.47.3-.87.1-.4-.2-1.68-.62-3.2-1.97-1.18-1.05-1.98-2.35-2.21-2.75-.23-.4-.02-.62.18-.82.18-.18.4-.47.6-.7.2-.23.27-.4.4-.67.13-.27.07-.5-.03-.7-.1-.2-.9-2.17-1.23-2.97-.32-.78-.65-.67-.9-.68-.23-.01-.5-.01-.77-.01s-.7.1-1.07.5c-.37.4-1.4 1.37-1.4 3.34s1.43 3.87 1.63 4.14c.2.27 2.82 4.3 6.83 6.03.95.41 1.7.66 2.28.84.96.3 1.83.26 2.52.16.77-.12 2.37-.97 2.7-1.9.33-.94.33-1.74.23-1.9-.1-.17-.36-.27-.76-.47z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z"/>
    </svg>
  );
}

function Social(props) {
  const wrap = { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 };
  return (
    <a href={props.href} target="_blank" rel="noreferrer" style={wrap}>
      <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{props.icon}</span>
      <span style={{ color: "var(--green)", fontWeight: 600, fontSize: 15 }}>{props.label}</span>
    </a>
  );
}

export default function SiteFooter() {
  const grid = {
    maxWidth: 1100, margin: "0 auto", padding: "64px 20px", display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 40,
    background: FOOTER_BG,
  };
  const navBtn = {
    display: "inline-flex", alignItems: "center", gap: 7, marginTop: 4, padding: "9px 16px",
    borderRadius: 999, border: "1px solid var(--green)", color: "var(--green)",
    fontWeight: 600, fontSize: 14, textDecoration: "none",
  };
  const bottomBar = {
    borderTop: "1px solid var(--line)", padding: "20px", textAlign: "center",
    color: "var(--muted)", fontSize: 13, background: FOOTER_BG,
  };
  const bottomLinks = {
    display: "flex", flexWrap: "wrap", gap: "6px 18px", justifyContent: "center", marginBottom: 10,
  };

  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 80, background: FOOTER_BG }}>
      <div style={grid}>
        <div>
          <p style={colHeading}>משתלת העיר</p>
          <p style={bodyText}>יוזמה 6, אזור התעשייה, אילת</p>
          <a href={MAPS} target="_blank" rel="noreferrer" style={navBtn}>ניווט למשתלה</a>
        </div>

        <div>
          <p style={colHeading}>שעות פתיחה</p>
          <p style={{ ...bodyText, whiteSpace: "nowrap", marginBottom: 6 }}>ראשון עד חמישי: 9:00 - 18:00</p>
          <p style={{ ...bodyText, whiteSpace: "nowrap" }}>שישי: 9:00 - 15:00</p>
        </div>

        <div>
          <p style={colHeading}>יצירת קשר</p>
          <p style={bodyText}>
            <a href={`tel:${PHONE}`} style={linkStyle}>טלפון: {PHONE_DISPLAY}</a>
          </p>
          <Social href={`https://wa.me/${WA}`} label="וואטסאפ" icon={<WhatsappIcon />} />
          <p style={bodyText}>
            <a href={`mailto:${EMAIL}`} style={linkStyle}>{EMAIL}</a>
          </p>
        </div>

        <div>
          <p style={colHeading}>עקבו אחרינו</p>
          <Social href={IG_NURSERY} label="משתלת העיר" icon={<InstagramIcon />} />
          <Social href={FB_NURSERY} label="משתלת העיר" icon={<FacebookIcon />} />
          <Social href={FB_GARDEN} label="גינון העיר" icon={<FacebookIcon />} />
        </div>

        <div>
          <p style={colHeading}>מידע ותקנון</p>
          <p style={bodyText}><Link href="/terms" style={linkStyle}>תקנון ותנאי שימוש</Link></p>
          <p style={bodyText}><Link href="/refund-policy" style={linkStyle}>מדיניות ביטולים והחזרות</Link></p>
          <p style={bodyText}><Link href="/privacy" style={linkStyle}>מדיניות פרטיות</Link></p>
          <p style={bodyText}><Link href="/accessibility" style={linkStyle}>הצהרת נגישות</Link></p>
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
