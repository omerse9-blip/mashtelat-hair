"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../../components/CartProvider";
import { useDelivery } from "../../components/DeliveryProvider";
import { getDeliveryOptions, getDeliveryFees, createOrder } from "../../lib/siteData";

const FORM_STORAGE_KEY = "mashtela_checkout_form_v2";
const SUB_TYPES = [
  { key: "city", label: "משלוח בעיר" },
  { key: "hotel", label: "משלוח למלון" },
];
const HEB_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function digitsOf(s) {
  return (s || "").replace(/[^0-9]/g, "");
}
function validPhone(s) {
  return digitsOf(s).length >= 9;
}

function isoParts(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return { dayName: HEB_DAYS[date.getDay()], d, m };
}

// קיבוץ פריטי העגלה לקבוצות מסירה: זמין עכשיו, ואחריו כל תאריך+חלון בנפרד
function buildGroups(items) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = { key: "now", fromDate: null, fromWindow: null, items: [] };
  const map = {};

  for (const it of items) {
    const iso = it.availableFromDate;
    let future = false;
    if (iso) {
      const [y, m, d] = String(iso).split("-").map(Number);
      if (y && m && d && new Date(y, m - 1, d) > today) future = true;
    }
    if (!future) {
      now.items.push(it);
      continue;
    }
    const w = it.availableFromWindow || "";
    const key = `${iso}_${w}`;
    if (!map[key]) map[key] = { key, fromDate: iso, fromWindow: w, items: [] };
    map[key].items.push(it);
  }

  const deferred = Object.values(map).sort((a, b) => {
    if (a.fromDate !== b.fromDate) return a.fromDate < b.fromDate ? -1 : 1;
    return parseInt(a.fromWindow || "0") - parseInt(b.fromWindow || "0");
  });

  const out = [];
  if (now.items.length) out.push(now);
  return [...out, ...deferred];
}

// סינון מועדים אפשריים לקבוצה: לא לפני תאריך הזמינות, ובאותו יום לא לפני החלון
function filterOptions(options, fromDate, fromWindow) {
  if (!fromDate) return options;
  const startH = fromWindow ? parseInt(String(fromWindow).split("-")[0], 10) : null;
  return options
    .filter((o) => o.date >= fromDate)
    .map((o) => {
      if (o.date !== fromDate || startH == null) return o;
      return { ...o, windows: o.windows.filter((w) => parseInt(String(w).split("-")[0], 10) >= startH) };
    })
    .filter((o) => o.windows.length > 0);
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
  const { items, total, count, ready, allOnlinePayable } = useCart();
  const { delivery, ready: deliveryReady } = useDelivery();

  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [blocks, setBlocks] = useState({});
  const [options, setOptions] = useState([]);
  const [fees, setFees] = useState({ city: 30, hotel: 50 });

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [prefilled, setPrefilled] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [orderSent, setOrderSent] = useState(null);

  const groups = buildGroups(items);

  // טעינת טופס שמור
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FORM_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setCName(saved.cName || "");
        setCPhone(saved.cPhone || "");
        setNotes(saved.notes || "");
        if (saved.blocks) setBlocks(saved.blocks);
        if (saved.cName || saved.blocks) setPrefilled(true);
      }
    } catch { /* התעלמות */ }
    setFormReady(true);
  }, []);

  // שמירת הטופס בכל שינוי
  useEffect(() => {
    if (!formReady) return;
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({ cName, cPhone, notes, blocks }));
    } catch { /* התעלמות */ }
  }, [formReady, cName, cPhone, notes, blocks]);

  // דמי המשלוח המוגדרים
  useEffect(() => {
    getDeliveryFees().then(setFees).catch(() => {});
  }, []);

  // טעינת ימי וחלונות המסירה
  useEffect(() => {
    let alive = true;
    getDeliveryOptions(21).then((opts) => { if (alive) setOptions(opts); }).catch(() => setOptions([]));
    return () => { alive = false; };
  }, []);

  // אתחול בלוק לכל קבוצה, כולל מילוי מוקדם מבחירת המשלוח בעמוד הבית
  useEffect(() => {
    if (!formReady || !deliveryReady || !groups.length) return;
    setBlocks((prev) => {
      const next = { ...prev };
      let changed = false;
      groups.forEach((g, i) => {
        if (next[g.key]) return;
        changed = true;
        const base = { method: null, subType: "", rName: "", rPhone: "", rAddr: "", greeting: "", selDate: "", selWindow: "", open: i === 0 };
        if (!prefilled && delivery.method) {
          base.method = delivery.method === "pickup" ? "pickup" : "delivery";
          if (delivery.method === "delivery") {
            if (delivery.subType) base.subType = delivery.subType;
            if (delivery.street || delivery.houseNumber) {
              base.rAddr = `${delivery.street} ${delivery.houseNumber}`.trim();
            }
          }
        }
        next[g.key] = base;
      });
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formReady, deliveryReady, items.length]);

  // ברירת מחדל למועד בכל בלוק, ברגע שיש אפשרויות
  useEffect(() => {
    if (!options.length || !groups.length) return;
    setBlocks((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const g of groups) {
        const b = next[g.key];
        if (!b) continue;
        const opts = filterOptions(options, g.fromDate, g.fromWindow);
        if (!opts.length) continue;
        const validDate = b.selDate && opts.find((o) => o.date === b.selDate);
        const date = validDate ? b.selDate : opts[0].date;
        const day = opts.find((o) => o.date === date);
        const validWindow = b.selWindow && day?.windows.includes(b.selWindow);
        const win = validWindow ? b.selWindow : (day?.windows[0] || "");
        if (b.selDate !== date || b.selWindow !== win) {
          next[g.key] = { ...b, selDate: date, selWindow: win };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, items.length]);

  function updateBlock(key, patch) {
    setBlocks((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), ...patch } }));
  }

  function groupTotal(g) {
    return g.items.reduce((s, it) => s + Number(it.price) * it.quantity, 0);
  }
  function groupFee(g) {
    const b = blocks[g.key];
    if (!b || b.method !== "delivery" || !b.subType) return 0;
    return Number(fees[b.subType] || 0);
  }

  const feesTotal = groups.reduce((s, g) => s + groupFee(g), 0);
  const grandTotal = total + feesTotal;

  // הכתובת שכבר מולאה בבלוק קודם — למילוי מהיר
  function previousAddress(index) {
    for (let i = index - 1; i >= 0; i--) {
      const b = blocks[groups[i].key];
      if (b && b.method === "delivery" && b.rAddr && b.rAddr.trim()) {
        return { rName: b.rName, rPhone: b.rPhone, rAddr: b.rAddr, subType: b.subType };
      }
    }
    return null;
  }

  if (!ready) return null;

  if (count === 0) {
    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 20px", textAlign: "center", color: "var(--muted)" }}>
        העגלה ריקה.{" "}
        <Link href="/" style={{ color: "var(--green)", fontWeight: 600 }}>לקטלוג המשתלה</Link>
      </main>
    );
  }

  if (orderSent) {
    return (
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "64px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>📞</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>ההזמנה שלך נשלחה</h1>
        <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 6 }}>
          {Array.isArray(orderSent) ? `מספרי הזמנה: ${orderSent.map((n) => `#${n}`).join(", ")}` : `מספר הזמנה #${orderSent}`}
        </p>
        <p style={{ color: "var(--ink)", fontSize: 16, lineHeight: 1.7 }}>
          חלק מהפריטים בהזמנה דורשים תיאום, ולכן היא נשלחה בלי חיוב.
          ניצור איתך קשר טלפוני בהקדם לתיאום פרטי המשלוח והתשלום.
        </p>
        <Link href="/" style={{ display: "inline-block", marginTop: 24, color: "var(--green)", fontWeight: 700 }}>
          חזרה לקטלוג המשתלה
        </Link>
      </main>
    );
  }

  function validate() {
    if (!cName.trim()) return "יש למלא שם מלא.";
    if (!cPhone.trim()) return "יש למלא מספר טלפון — שדה חובה.";
    if (!validPhone(cPhone)) return "מספר הטלפון אינו תקין — יש להזין מספר מלא.";
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      const b = blocks[g.key] || {};
      const n = groups.length > 1 ? ` (מסירה ${i + 1})` : "";
      if (!b.method) return `יש לבחור איסוף עצמי או שליחה לכתובת${n}.`;
      if (b.method === "delivery") {
        if (!b.subType) return `יש לבחור משלוח בעיר או למלון${n}.`;
        if (!b.rName?.trim()) return `יש למלא את שם המקבל${n}.`;
        if (!b.rPhone?.trim()) return `יש למלא את טלפון המקבל${n}.`;
        if (!validPhone(b.rPhone)) return `טלפון המקבל אינו תקין${n}.`;
        if (!b.rAddr?.trim()) return `יש למלא את כתובת המקבל${n}.`;
      }
      if (!b.selDate || !b.selWindow) return `יש לבחור מועד${n}.`;
    }
    return "";
  }

  function detailsFor(g) {
    const b = blocks[g.key] || {};
    const isDelivery = b.method === "delivery";
    return {
      customer_name: cName.trim(),
      customer_phone: cPhone.trim(),
      customer_address: "",
      is_gift: isDelivery,
      recipient_name: isDelivery ? (b.rName || "").trim() : "",
      recipient_phone: isDelivery ? (b.rPhone || "").trim() : "",
      recipient_address: isDelivery ? (b.rAddr || "").trim() : "",
      notes: notes.trim(),
      fulfillment_type: b.method === "pickup" ? "pickup" : "delivery",
      delivery_date: b.selDate,
      delivery_window: b.selWindow,
      greeting: (b.greeting || "").trim(),
      delivery_sub_type: isDelivery ? b.subType : null,
      delivery_fee: groupFee(g),
    };
  }

  async function handleSubmit() {
    setErr("");
    const v = validate();
    if (v) { setErr(v); return; }

    setSubmitting(true);
    try {
      const payload = groups.map((g) => ({
        details: detailsFor(g),
        items: g.items.map((it) => ({
          name: it.name,
          sizeLabel: it.sizeLabel || "",
          price: Number(it.price),
          quantity: it.quantity,
        })),
        deliveryFee: groupFee(g),
        feeLabel: (blocks[g.key] || {}).subType === "hotel" ? "דמי משלוח למלון" : "דמי משלוח בעיר",
      }));

      if (!allOnlinePayable) {
        const numbers = [];
        for (const p of payload) {
          const n = await createOrder(p.details, p.items);
          numbers.push(n);
        }
        try { localStorage.removeItem(FORM_STORAGE_KEY); } catch { /* התעלמות */ }
        setOrderSent(numbers.length === 1 ? numbers[0] : numbers);
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/cardcom/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "אירעה שגיאה בשליחה. נסו שוב.");
      window.location.href = data.url;
    } catch (e) {
      setErr(e.message || "אירעה שגיאה בשליחה. נסו שוב.");
      setSubmitting(false);
    }
  }

  const cPhoneBad = cPhone.trim() !== "" && !validPhone(cPhone);

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
      <Link href="/cart" style={{ color: "var(--muted)", fontSize: 14, display: "inline-block", marginBottom: 20 }}>› חזרה לעגלה</Link>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>פרטי הזמנה</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>{count} פריטים · סה"כ ₪{grandTotal.toFixed(0)}</p>

      <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <p style={{ fontWeight: 700, marginBottom: 12 }}>הפרטים שלך</p>
        {field("שם מלא *", cName, setCName, { placeholder: "שם" })}
        <div style={{ marginBottom: 0 }}>
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

      {groups.map((g, i) => (
        <DeliveryBlock
          key={g.key}
          group={g}
          index={i}
          multi={groups.length > 1}
          block={blocks[g.key] || {}}
          options={filterOptions(options, g.fromDate, g.fromWindow)}
          fees={fees}
          itemsTotal={groupTotal(g)}
          fee={groupFee(g)}
          prevAddress={previousAddress(i)}
          onChange={(patch) => updateBlock(g.key, patch)}
        />
      ))}

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>הערות למשתלה (אופציונלי)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15 }} />
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 18, background: "var(--green-soft)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, marginBottom: 6 }}>
          <span>פריטים</span>
          <span style={{ fontWeight: 600 }}>₪{total.toFixed(0)}</span>
        </div>
        {feesTotal > 0 ? (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, marginBottom: 6 }}>
            <span>דמי משלוח</span>
            <span style={{ fontWeight: 600 }}>₪{feesTotal.toFixed(0)}</span>
          </div>
        ) : null}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, borderTop: "1px solid var(--line)", paddingTop: 8, marginTop: 8 }}>
          <span>סה"כ לתשלום</span>
          <span style={{ color: "var(--green)" }}>₪{grandTotal.toFixed(0)}</span>
        </div>
      </div>

      {!allOnlinePayable ? (
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>
          חלק מפריטי ההזמנה דורשים תיאום מחיר משלוח, ולכן ההזמנה תישלח בלי חיוב — ניצור איתך קשר טלפוני להשלמת התשלום.
        </p>
      ) : null}

      {err ? <p style={{ color: "#b3261e", fontSize: 14, marginBottom: 14 }}>{err}</p> : null}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ width: "100%", background: "var(--green)", color: "#fff", fontSize: 17, fontWeight: 700, padding: "15px", borderRadius: 12, border: "none", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}
      >
        {submitting
          ? (allOnlinePayable ? "מעביר לתשלום..." : "שולח הזמנה...")
          : (allOnlinePayable ?
