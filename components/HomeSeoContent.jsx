import Link from "next/link";
import { categoryPath } from "../lib/slug";

const FAQ = [
  {
    q: "איפה נמצאת משתלת העיר באילת?",
    a: "המשתלה נמצאת ביוזמה 6, אזור התעשייה, אילת. אנחנו פתוחים בימים ראשון עד חמישי בין 9:00 ל-18:00, וביום שישי בין 9:00 ל-15:00.",
  },
  {
    q: "האם יש משלוח פרחים וצמחים באילת?",
    a: "כן, אנחנו משלחים בתוך אילת. בעת ההזמנה בוחרים תאריך וחלון משלוח של שעתיים, ועלות המשלוח מחושבת באתר לפי סוג ההזמנה.",
  },
  {
    q: "אפשר לאסוף את ההזמנה מהמשתלה?",
    a: "כן, איסוף עצמי מהמשתלה ללא עלות משלוח. בוחרים בהזמנה את חלון השעות הנוח לכם.",
  },
  {
    q: "איך שולחים זר או מתנה למישהו באילת?",
    a: "בשלב ההזמנה בוחרים באפשרות של שליחת מתנה או כתובת אחרת, ממלאים את פרטי המקבל ומוסיפים ברכה. אפשר להוסיף לזר אגרטל, יין או בלון.",
  },
  {
    q: "האם המחירים באתר כוללים מע״מ?",
    a: "אילת פטורה ממע״מ, ולכן המחירים באתר מוצגים ללא מע״מ.",
  },
  {
    q: "האם הצמח או הזר יהיו זהים לתמונה?",
    a: "הצמחים והזרים שלנו חיים, וכל פריט שונה מעט מהאחר. התמונות באתר להמחשה, וכל הזמנה מסודרת במיוחד עבורכם.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const h2Style = { fontFamily: "'Rubik', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--ink)", marginBottom: 14 };
const pStyle = { color: "var(--ink)", fontSize: 16, lineHeight: 1.85, marginBottom: 12 };

export default function HomeSeoContent({ categories = [] }) {
  return (
    <section aria-labelledby="about-nursery" style={{ maxWidth: 760, margin: "20px auto 0", borderTop: "1px solid var(--line)", paddingTop: 34 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }}
      />

      <h2 id="about-nursery" style={h2Style}>המשתלה שלכם באילת</h2>
      <p style={pStyle}>
        משתלת העיר היא משתלה באילת עם זרי פרחים, צמחי בית, כדים, בלונים ויין למתנה. אפשר להזמין אונליין בכל שעה,
        ולבחור משלוח עד הבית או הגעה לאסוף מהמשתלה ביוזמה 6, אזור התעשייה.
      </p>
      <p style={pStyle}>
        כל זר מסודר במיוחד עבור ההזמנה, והצמחים מגיעים ישירות מהמשתלה. לשאלות והתייעצות אפשר לדבר איתנו בטלפון
        או בוואטסאפ במספר 053-366-9089.
      </p>

      {categories.length > 0 ? (
        <nav aria-label="מחלקות המשתלה" style={{ margin: "22px 0 34px" }}>
          <h2 style={h2Style}>מה אפשר להזמין</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={categoryPath(c.id, c.name)}
                style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "7px 16px", fontWeight: 600, color: "var(--ink)", background: "var(--card)" }}
              >
                {c.name} באילת
              </Link>
            ))}
          </div>
        </nav>
      ) : null}

      <h2 style={h2Style}>שאלות נפוצות</h2>
      {FAQ.map((f) => (
        <div key={f.q} style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>{f.q}</h3>
          <p style={{ ...pStyle, marginBottom: 0, color: "var(--muted)" }}>{f.a}</p>
        </div>
      ))}
    </section>
  );
}
