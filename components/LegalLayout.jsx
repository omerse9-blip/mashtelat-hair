import Link from "next/link";

const DOCS = [
  { href: "/terms", label: "תקנון ותנאי שימוש" },
  { href: "/refund-policy", label: "מדיניות ביטולים והחזרות" },
  { href: "/privacy", label: "מדיניות פרטיות" },
  { href: "/accessibility", label: "הצהרת נגישות" },
];

export default function LegalLayout({ title, updated, current, children }) {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 22px 72px" }}>
      <div style={{ marginBottom: 8 }}>
        <Link href="/" style={{ color: "var(--green)", fontSize: 14, fontWeight: 600 }}>חזרה לאתר</Link>
      </div>

      <header style={{ borderBottom: "2px solid var(--green)", paddingBottom: 18, marginBottom: 32 }}>
        <p style={{ color: "#cf9b6f", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, marginBottom: 8 }}>גינון העיר · משתלת העיר</p>
        <h1 style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15, color: "var(--ink)" }}>{title}</h1>
        {updated ? <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 10 }}>עדכון אחרון: {updated}</p> : null}
      </header>

      <article className="legal-body">{children}</article>

      <nav style={{ marginTop: 56, paddingTop: 28, borderTop: "1px solid var(--line)" }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "var(--ink)" }}>מסמכים נוספים</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DOCS.filter((d) => d.href !== current).map((d) => (
            <Link key={d.href} href={d.href} style={{ color: "var(--green)", fontWeight: 600, fontSize: 15 }}>
              {d.label}
            </Link>
          ))}
        </div>
      </nav>

      <style>{`
        .legal-body { color: var(--ink); font-size: 16.5px; line-height: 1.85; }
        .legal-body h2 {
          font-size: 21px; font-weight: 700; color: var(--ink);
          margin: 38px 0 14px; padding-bottom: 6px;
        }
        .legal-body h2:first-child { margin-top: 0; }
        .legal-body h3 { font-size: 17px; font-weight: 700; color: var(--ink); margin: 24px 0 8px; }
        .legal-body p { margin-bottom: 14px; }
        .legal-body ul { margin: 0 0 16px; padding-inline-start: 22px; }
        .legal-body li { margin-bottom: 8px; }
        .legal-body strong { font-weight: 700; }
        .legal-body .lead {
          background: #f7f2e9; border: 1px solid rgba(207,155,111,0.3);
          border-radius: 14px; padding: 18px 20px; margin-bottom: 28px;
          color: var(--ink); font-size: 16px;
        }
        .legal-body a { color: var(--green); font-weight: 600; }
        @media (max-width: 640px) {
          .legal-body { font-size: 16px; }
          .legal-body h2 { font-size: 19px; }
        }
      `}</style>
    </main>
  );
}
