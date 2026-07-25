"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../../components/CartProvider";
import { createOrder, getDeliveryOptions } from "../../lib/siteData";

const BUSINESS_WA = "972533669089";

function field(label, value, onChange, props = {}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15 }}
        {...props}
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total, count, clear, ready } = useCart();

  const [method, setMethod] = useState(null); // "pickup" | "gift"
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [rName, setRName] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rAddr, setRAddr] = useState("");
  const [greeting, setGreeting] = useState("");
  const [notes, setNotes] = useState("");

  const [options, setOptions] = useState([]);
  const [selDate, setSelDate] = useState("");
  const [selWindow, setSelWindow] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);

  // טעינת ימי וחלונות המסירה כשנבחרה שיטה
  useEffect(() => {
    if (!method) return;
    let alive = true;
    getDeliveryOptions(10).then((opts) => {
      if (!alive) return;
      setOptions(opts);
      if (opts.length) {
        setSelDate(opts[0].date);
        setSelWindow(opts[0].windows[0] || "");
      }
    }).catch(() => setOptions([]));
    return () => { alive = false; };
  }, [method]);

  // אחרי שההזמנה נשלחה — גלילה לראש הדף כדי להראות את מסך האישור
  useEffect(() => {
    if (done) window.scrollTo({ top: 0, behavior: "auto" });
  }, [done]);

  const currentDay = options.find((o) => o.date === selDate);

  if (!ready) return null;

  if (done) {
    const msg = `שלום, ביצעתי הזמנה במשתלת העיר. מספר הזמנה ${done}. שמי ${cName}.`;
    const waUrl = `https://wa.me/${BUSINESS_WA}?text=${encodeURIComponent(msg)}`;
    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🌿</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>ההזמנה נשלחה!</h1>
        <p style={{ color: "var(--muted)", fontSize: 17, marginBottom: 6 }}>מספר הזמנה: <b>#{done}</b></p>
        <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 32 }}>ניצור איתך קשר טלפוני לאישור הפרטים והתשלום.</p>
        <a href={waUrl} target="_blank" rel="noreferrer" style={{ display: "block", background: "#25D366", color: "#fff", fontSize: 17, fontWeight: 700, padding: "14px", borderRadius: 12, marginBottom: 12 }}>
          שליחת אישור בוואטסאפ
        </a>
        <Link href="/" style={{ display: "block", color: "var(--green)", fontWeight: 600 }}>חזרה לקטלוג</Link>
      </main>
    );
  }

  if (count === 0) {
    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 20px", textAlign: "center", color: "var(--muted)" }}>
        העגלה ריקה.{" "}
        <Link href="/" style={{ color: "var(--green)", fontWeight: 600 }}>לקטלוג המשתלה</Link>
      </main>
    );
  }

  async function handleSubmit() {
    setErr("");
    if (!method) { setErr("יש לבחור איסוף עצמי או שליחת מתנה."); return; }
    if (!cName.trim() || !cPhone.trim()) { setErr("יש למלא שם וטלפון."); return; }
    if (method === "gift" && (!rName.trim() || !rPhone.trim() || !rAddr.trim())) {
      setErr("במשלוח מתנה יש למלא שם, טלפון וכתובת של המקבל."); return;
    }
    if (!selDate || !selWindow) { setErr("יש לבחור מועד."); return; }

    setSubmitting(true);
    try {
      const isGift = method === "gift";
      const orderNumber = await createOrder({
        customer_name: cName.trim(),
        customer_phone: cPhone.trim(),
        customer_address: "",
        is_gift: isGift,
        recipient_name: isGift ? rName.trim() : "",
        recipient_phone: isGift ? rPhone.trim() : "",
        recipient_address: isGift ? rAddr.trim() : "",
        notes: notes.trim(),
        fulfillment_type: method === "pickup" ? "pickup" : "delivery",
        delivery_date: selDate,
        delivery_window: selWindow,
        greeting: greeting.trim(),
      }, items);
      clear();
      setDone(orderNumber);
    } catch (e) {
      setErr(e.message || "אירעה שגיאה בשליחה. נסו שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  const methodBtn = (val, label) => (
    <button
      onClick={() => setMethod(val)}
      style={{
        flex: 1, padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer",
        background: method === val ? "var(--green)" : "#fff",
        color: method === val ? "#fff" : "var(--ink)",
        border: method === val ? "1px solid var(--green)" : "1px solid var(--line)",
      }}
    >
      {label}
    </button>
  );

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
      <Link href="/cart" style={{ color: "var(--muted)", fontSize: 14, display: "inline-block", marginBottom: 20 }}>› חזרה לעגלה</Link>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>פרטי הזמנה</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>{count} פריטים · סה"כ ₪{total.toFixed(0)}</p>

      {/* בחירת שיטה */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {methodBtn("pickup", "איסוף עצמי")}
        {methodBtn("gift", "שליחת מתנה / כתובת אחרת")}
      </div>

      {method ? (
        <>
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
            <p style={{ fontWeight: 700, marginBottom: 12 }}>הפרטים שלך</p>
            {field("שם מלא *", cName, setCName, { placeholder: "שם" })}
            {field("טלפון *", cPhone, setCPhone, { type: "tel", inputMode: "tel", placeholder: "05X-XXXXXXX" })}
          </div>

          {method === "gift" ? (
            <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
              <p style={{ fontWeight: 700, marginBottom: 12 }}>פרטי המקבל</p>
              {field("שם המקבל *", rName, setRName, { placeholder: "שם המקבל" })}
              {field("טלפון המקבל *", rPhone, setRPhone, { type: "tel", inputMode: "tel", placeholder: "05X-XXXXXXX" })}
              {field("כתובת המקבל *", rAddr, setRAddr, { placeholder: "רחוב, עיר" })}
            </div>
          ) : null}

          {/* ברכה — בשתי השיטות */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>ברכה לכרטיס (אופציונלי)</label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value.slice(0, 100))}
              rows={2}
              maxLength={100}
              style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15 }}
              placeholder="הברכה שתודפס על הכרטיס"
            />
            <p style={{ textAlign: "left", color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{greeting.length}/100</p>
          </div>

          {/* מועד */}
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
            <p style={{ fontWeight: 700, marginBottom: 12 }}>{method === "pickup" ? "מועד איסוף" : "מועד מסירה"}</p>
            {options.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>אין מועדים זמינים כרגע. ניצור קשר לתיאום.</p>
            ) : (
              <>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>יום</label>
                <select
                  value={selDate}
                  onChange={(e) => {
                    setSelDate(e.target.value);
                    const day = options.find((o) => o.date === e.target.value);
                    setSelWindow(day?.windows[0] || "");
                  }}
                  style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15, marginBottom: 14, background: "#fff" }}
                >
                  {options.map((o) => <option key={o.date} value={o.date}>{o.label}</option>)}
                </select>

                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>שעה</label>
                <div dir="ltr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {(currentDay?.windows || []).map((w) => (
                    <button
                      key={w}
                      onClick={() => setSelWindow(w)}
                      style={{
                        padding: "11px 8px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                        background: selWindow === w ? "var(--green)" : "#fff",
                        color: selWindow === w ? "#fff" : "var(--ink)",
                        border: selWindow === w ? "1px solid var(--green)" : "1px solid var(--line)",
                      }}
                    >
                      {w.replace("-", ":00-") + ":00"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* הערות */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>הערות למשתלה (אופציונלי)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15 }} />
          </div>

          {method === "gift" ? (
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>
              ייתכנו דמי משלוח בהתאם להזמנה, שיימסרו טלפונית עם אישור ההזמנה.
            </p>
          ) : null}

          {err ? <p style={{ color: "#b3261e", fontSize: 14, marginBottom: 14 }}>{err}</p> : null}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ width: "100%", background: "var(--green)", color: "#fff", fontSize: 17, fontWeight: 700, padding: "15px", borderRadius: 12, border: "none", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? "שולח..." : "שליחת הזמנה"}
          </button>
          <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", marginTop: 12 }}>
            אין תשלום באתר — ניצור קשר טלפוני לאישור וחיוב.
          </p>
        </>
      ) : (
        <p style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
          בחרו איסוף עצמי או שליחת מתנה כדי להמשיך.
        </p>
      )}
    </main>
  );
}
