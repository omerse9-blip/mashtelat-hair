import Link from "next/link";

const PHONE = "0533669089";
const PHONE_DISPLAY = "053-3669089";
const WA = "972533669089";
const EMAIL = "service.ginun@gmail.com";
const FB_NURSERY = "https://www.facebook.com/share/1BCkoPJAca/";
const FB_GARDEN = "https://www.facebook.com/share/1JJUirptBe/";
const IG_NURSERY = "https://www.instagram.com/mishtelet_city";
const MAPS = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("משתלת העיר אילת");

function SocialRow({ href, label, bg, icon }) {
  return (
    
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}
    >
      <span style={{ width: 38, height: 38, borderRadius: 999, background: bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ color: "var(--ink)", fontWeight: 600, fontSize: 15 }}>{label}</span>
    </a>
  );
}

const IG_ICON = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const FB_ICON = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const WA_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.6 6.3A7.9 7.9 0 0 0 12 4a8 8 0 0 0-6.9 12l-1.1 4 4.1-1.1A8 8 0 1 0 17.6 6.3zM12 18.5a6.5 6.5 0 0 1-3.3-.9l-.24-.14-2.43.64.65-2.37-.16-.25A6.5 6.5 0 1 1 12 18.5zm3.6-4.87c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.44.1-.51.64-.63.77-.23.15-.43.05a5.3 5.3 0 0 1-1.56-.96 5.9 5.9 0 0 1-1.08-1.34c-.11-.2 0-.3.09-.4s.2-.23.3-.35a1.36 1.36 0 0 0 .2-.33.37.37 0 0 0 0-.35c0-.1-.44-1.06-.6-1.45s-.32-.33-.44-.34h-.37a.72.72 0 0 0-.52.24 2.17 2.17 0 0 0-.68 1.62 3.77 3.77 0 0 0 .79 2 8.63 8.63 0 0 0 3.3 2.92c.46.2.82.32 1.1.41a2.66 2.66 0 0 0 1.22.08 2 2 0 0 0 1.3-.92 1.62 1.62 0 0 0 .12-.92c-.05-.08-.18-.13-.38-.23z" />
  </svg>
);

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 80, background: "#fafbfa" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>משתלת העיר</p>
          <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 12 }}>
            יוזמה 6, אזור התעשייה<br />אילת
          </p>
          
            href={MAPS}
            target="_blank"
            rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 999, border: "1px solid var(--green)", color: "var(--green)", fontWeight: 600, fontSize: 14 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            ניווט למשתלה
          </a>
        </div>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>שעות פתיחה</p>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            ראשון–חמישי: 9:00–18:00<br />
            שישי: 9:00–15:00
          </p>
        </div>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 14 }}>יצירת קשר</p>
          <p style={{ lineHeight: 2, marginBottom: 14 }}>
            <a href={`tel:${PHONE}`} style={{ color: "var(--ink)" }}>טלפון: {PHONE_DISPLAY}</a><br />
            <a href={`mailto:${EMAIL}`} style={{ color: "var(--ink)" }}>{EMAIL}</a>
          </p>
          <SocialRow href={`https://wa.me/${WA}`} label="וואטסאפ" bg="#25D366" icon={WA_ICON} />
        </div>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 14 }}>עקבו אחרינו</p>
          <SocialRow href={IG_NURSERY} label="משתלת העיר" bg="#E1306C" icon={IG_ICON} />
          <SocialRow href={FB_NURSERY} label="משתלת העיר" bg="#1877F2" icon={FB_ICON} />
          <SocialRow href={FB_GARDEN} label="גינון העיר" bg="#1877F2" icon={FB_ICON} />
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
