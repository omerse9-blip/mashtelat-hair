"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../../components/CartProvider";
import { useDelivery } from "../../components/DeliveryProvider";
import { getDeliveryOptions } from "../../lib/siteData";

const FORM_STORAGE_KEY = "mashtela_checkout_form_v1";

function digitsOf(s) {
  return (s || "").replace(/[^0-9]/g, "");
}
function validPhone(s) {
  return digitsOf(s).length >= 9;
}

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
  const { items, total, count, ready } = useCart();
  const { delivery, ready: deliveryReady } = useDelivery();

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
  const [prefilled, setPrefilled] = useState(false);
  const [formReady, setFormReady] = useState(false);

  // טעינת טופס שמור (למשל אחרי חזרה מתשלום שנכשל)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FORM_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.method) setMethod(saved.method);
        setCName(saved.cName || "");
        setCPhone(saved.cPhone || "");
        setRName(saved.rName || "");
        setRPhone(saved.rPhone || "");
        setRAddr(saved.rAddr || "");
        setGreeting(saved.greeting || "");
        setNotes(saved.notes || "");
        setSelDate(saved.selDate || "");
        setSelWindow(saved.selWindow || "");
        if (saved.method) setPrefilled(true);
      }
    } catch { /* התעלמות */ }
    setFormReady(true);
  }, []);

  // שמירת הטופס בכל שינוי
  useEffect(() => {
    if (!formReady) return;
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({
        method, cName, cPhone, rName, rPhone, rAddr, greeting, notes, selDate, selWindow,
      }));
    } catch { /* התעלמות */ }
  }, [formReady, method, cName, cPhone, rName, rPhone, rAddr, greeting, notes, selDate, selWindow]);

  // מילוי מוקדם מתוך בחירת המשלוח בעמוד הבית (רק אם אין טופס שמור)
  useEffect(() => {
    if (!deliveryReady || prefilled) return;
    if (delivery.method) {
      setMethod(delivery.method === "pickup" ? "pickup" : "gift");
    }
    if (delivery.method === "delivery" && (delivery.street || delivery.houseNumber)) {
      setRAddr(`${delivery.street} ${delivery.houseNumber}`.trim());
    }
    setPrefilled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryReady]);

  // טעינת ימי וחלונות המסירה כשנבחרה שיטה
  useEffect(() => {
    if (!method) return;
    let alive = true;
    getDeliveryOptions(10).then((opts) => {
      if (!alive) return;
      setOptions(opts);
      if (opts.length) {
        const preDate = selDate && opts.find((o) => o.date === selDate) ? selDate : opts[0].date;
        setSelDate(preDate);
        const day = opts.find((o) => o.date === preDate);
        const preWindow = selWindow && day?.windows.includes(selWindow) ? selWindow : (day?.windows[0] || "");
        setSelWindow(preWindow);
      }
    }).catch(() => setOptions([]));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  const currentDay = options.find((o) => o.date === selDate);

  if (!ready) return null;

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
    if (!cName.trim()) { setErr("יש למלא שם מלא."); return; }
    if (!cPhone.trim()) { setErr("יש למלא מספר טלפון — שדה חובה."); return; }
    if (!validPhone(cPhone)) { setErr("מספר הטלפון אינו תקין — יש להזין מספר מלא."); return; }
    if (method === "gift") {
      if (!rName.trim()) { setErr("יש למלא את שם המקבל."); return; }
      if (!rPhone.trim()) { setErr("יש למלא את טלפון המקבל — שדה חובה."); return; }
      if (!validPhone(rPhone)) { setErr("טלפון המקבל אינו תקין — יש להזין מספר מלא."); return; }
      if (!rAddr.trim()) { setErr("יש למלא את כתובת המקבל."); return; }
    }
    if (!selDate || !selWindow) { setErr("יש לבחור מועד."); return; }

    setSubmitting(true);
    try {
      const isGift = method === "gift";
      const payloadItems = items.map((it) => ({
        name: it.name,
        sizeLabel: it.sizeLabel || "",
        price: Number(it.price),
        quantity: it.quantity,
      }));
      const res = await fetch("/api/cardcom/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          details: {
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
          },
          items: payloadItems,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "אירעה שגיאה בשליחה. נסו שוב.");
      window.location.href = data.url;
    } catch (e) {
      setErr(e.message || "אירעה שגיאה בשליחה. נסו שוב.");
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

  const cPhoneBad = cPhone.trim() !== "" && !validPhone(cPhone);
  const rPhoneBad = rPhone.trim() !== "" && !validPhone(rPhone);

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
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>טלפון *</label>
              <input
                value={cPhone}
                onChange={(e) => setCPhone(e.target.value)}
                type="tel" inputMode="tel" placeholder="05X-XXXXXXX"
                style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: `1px solid ${cPhoneBad ? "#b3261e" : "var(--line)"}`, fontSize: 15 }}
              />
              {cPhoneBad ? <p style={{ color: "#b3261e", fontSize: 13, marginTop: 4 }}>יש להזין מספר טלפון מלא.</p> : null}
            </div>
          </div>

          {method === "gift" ? (
            <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
              <p style={{ fontWeight: 700, marginBottom: 12 }}>פרטי המקבל</p>
              {field("שם המקבל *", rName, setRName, { placeholder: "שם המקבל" })}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>טלפון המקבל *</label>
                <input
                  value={rPhone}
                  onChange={(e) => setRPhone(e.target.value)}
                  type="tel" inputMode="tel" placeholder="05X-XXXXXXX"
                  style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: `1px solid ${rPhoneBad ? "#b3261e" : "var(--line)"}`, fontSize: 15 }}
                />
                {rPhoneBad ? <p style={{ color: "#b3261e", fontSize: 13, marginTop: 4 }}>יש להזין מספר טלפון מלא.</p> : null}
              </div>
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
            {submitting ? "מעביר לתשלום..." : "מעבר לתשלום מאובטח"}
          </button>
        </>
      ) : (
        <p style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
          בחרו איסוף עצמי או שליחת מתנה כדי להמשיך.
        </p>
      )}
    </main>
  );
}
