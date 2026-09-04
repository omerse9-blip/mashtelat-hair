"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../../components/CartProvider";
import { useDelivery } from "../../components/DeliveryProvider";
import { getDeliveryOptions, getDeliveryFees, createOrder } from "../../lib/siteData";

const FORM_STORAGE_KEY = "mashtela_checkout_form_v3";
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
      groups.forEach((g) => {
        if (next[g.key]) return;
        changed = true;
        const base = {
          method: null, subType: "", forWho: "", rName: "", rPhone: "", rAddr: "",
          greeting: "", selDate: "", selWindow: "", collapsed: false,
        };
        if (!prefilled && delivery.method) {
          base.method = delivery.method === "pickup" ? "pickup" : "delivery";
          if (delivery.method === "delivery") {
            if (delivery.subType) base.subType = delivery.subType;
            if (delivery.street || delivery.houseNumber) {
              base.forWho = "self";
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

  // כתובת שכבר מולאה בבלוק קודם — למילוי מהיר
  function previousAddress(index) {
    for (let i = index - 1; i >= 0; i--) {
      const b = blocks[groups[i].key];
      if (b && b.method === "delivery" && b.rAddr && b.rAddr.trim()) {
        return { forWho: b.forWho, rName: b.rName, rPhone: b.rPhone, rAddr: b.rAddr, subType: b.subType };
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
      if (!b.method) return `יש לבחור איסוף עצמי או משלוח${n}.`;
      if (b.method === "delivery") {
        if (!b.subType) return `יש לבחור משלוח בעיר או למלון${n}.`;
        if (!b.forWho) return `יש לבחור למי המשלוח${n}.`;
        if (!b.rAddr?.trim()) return `יש למלא כתובת למשלוח${n}.`;
        if (b.forWho === "other") {
          if (!b.rName?.trim()) return `יש למלא את שם המקבל${n}.`;
          if (!b.rPhone?.trim()) return `יש למלא את טלפון המקבל${n}.`;
          if (!validPhone(b.rPhone)) return `טלפון המקבל אינו תקין${n}.`;
        }
      }
      if (!b.selDate || !b.selWindow) return `יש לבחור מועד${n}.`;
    }
    return "";
  }

  function detailsFor(g) {
    const b = blocks[g.key] || {};
    const isDelivery = b.method === "delivery";
    const toOther = isDelivery && b.forWho === "other";
    return {
      customer_name: cName.trim(),
      customer_phone: cPhone.trim(),
      customer_address: isDelivery && !toOther ? (b.rAddr || "").trim() : "",
      is_gift: toOther,
      recipient_name: toOther ? (b.rName || "").trim() : "",
      recipient_phone: toOther ? (b.rPhone || "").trim() : "",
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

      {groups.length > 1 ? (
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>
          ההזמנה מחולקת ל-{groups.length} מסירות, לפי מועדי הזמינות של הפריטים. לכל מסירה נבחרים אופן ומועד בנפרד.
        </p>
      ) : null}

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
          : (allOnlinePayable ? "מעבר לתשלום מאובטח" : "שליחת ההזמנה")}
      </button>
    </main>
  );
}

function DeliveryBlock({ group, index, multi, block, options, fees, itemsTotal, fee, prevAddress, onChange }) {
  const b = block;
  const isDelivery = b.method === "delivery";
  const toOther = isDelivery && b.forWho === "other";
  const currentDay = options.find((o) => o.date === b.selDate);
  const rPhoneBad = (b.rPhone || "").trim() !== "" && !validPhone(b.rPhone);

  // בלוק שעדיין לא מולא נשאר פתוח — אין מה לכווץ
  const complete = !!b.method && !!b.selDate && !!b.selWindow && (
    b.method === "pickup" ||
    (b.subType && b.rAddr?.trim() && (b.forWho === "self" || (b.forWho === "other" && b.rName?.trim() && validPhone(b.rPhone))))
  );
  const open = !complete || !b.collapsed;

  const title = !multi
    ? "אופן ומועד המסירה"
    : group.fromDate
      ? `מסירה ${index + 1} · זמין מיום ${isoParts(group.fromDate).dayName} ${isoParts(group.fromDate).d}.${isoParts(group.fromDate).m}`
      : `מסירה ${index + 1} · זמין עכשיו`;

  const summary = b.selDate
    ? `${isoParts(b.selDate).dayName} ${isoParts(b.selDate).d}.${isoParts(b.selDate).m}${b.selWindow ? ` · ${b.selWindow.replace("-", ":00-")}:00` : ""}`
    : "";

  const methodText = b.method === "pickup"
    ? "איסוף עצמי מהמשתלה"
    : isDelivery
      ? (b.subType === "hotel" ? "משלוח למלון" : "משלוח בעיר")
      : "";

  function fillPrevAddress() {
    if (!prevAddress) return;
    onChange({
      forWho: prevAddress.forWho || "self",
      rName: prevAddress.rName,
      rPhone: prevAddress.rPhone,
      rAddr: prevAddress.rAddr,
      subType: prevAddress.subType,
    });
  }

  const bigBtn = (active, label, onClick) => (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer",
        background: active ? "var(--green)" : "#fff",
        color: active ? "#fff" : "var(--ink)",
        border: active ? "1px solid var(--green)" : "1px solid var(--line)",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{title}</p>

      <div style={{ background: "var(--green-soft)", borderRadius: 10, padding: 12, marginBottom: 16 }}>
        {group.items.map((it, k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: k === group.items.length - 1 ? 0 : 10 }}>
            <div style={{ width: 46, height: 46, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#f4f6f4" }}>
              {it.image ? (
                <img src={it.image} alt={it.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🪴</div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</p>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>
                {it.sizeLabel ? `${it.sizeLabel} · ` : ""}{it.quantity > 1 ? `×${it.quantity}` : "יחידה"}
              </p>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, flexShrink: 0 }}>₪{(Number(it.price) * it.quantity).toFixed(0)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", marginTop: 10, paddingTop: 10, fontWeight: 700, fontSize: 14 }}>
          <span>סכום המסירה</span>
          <span>₪{(itemsTotal + fee).toFixed(0)}{fee > 0 ? ` (כולל משלוח ₪${fee.toFixed(0)})` : ""}</span>
        </div>
      </div>

      {!open ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700 }}>{methodText}</p>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 2 }}>{summary}</p>
            {isDelivery && b.rAddr ? (
              <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {b.rAddr}{toOther && b.rName ? ` · ${b.rName}` : ""}
              </p>
            ) : null}
          </div>
          <button
            onClick={() => onChange({ collapsed: false })}
            style={{ background: "none", border: "1px solid var(--green)", borderRadius: 999, padding: "7px 14px", color: "var(--green)", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
          >
            עריכת המסירה
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {bigBtn(b.method === "pickup", "איסוף עצמי", () => onChange({ method: "pickup" }))}
            {bigBtn(b.method === "delivery", "משלוח", () => onChange({ method: "delivery" }))}
          </div>

          {isDelivery ? (
            <>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                {SUB_TYPES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => onChange({ subType: s.key })}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
                      background: b.subType === s.key ? "var(--green)" : "#fff",
                      color: b.subType === s.key ? "#fff" : "var(--ink)",
                      border: b.subType === s.key ? "1px solid var(--green)" : "1px solid var(--line)",
                    }}
                  >
                    {s.label} · ₪{fees[s.key] ?? ""}
                  </button>
                ))}
              </div>

              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>למי המשלוח?</label>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                {bigBtn(b.forWho === "self", "אליי", () => onChange({ forWho: "self", rName: "", rPhone: "" }))}
                {bigBtn(b.forWho === "other", "למישהו אחר", () => onChange({ forWho: "other" }))}
              </div>

              {b.forWho ? (
                <>
                  {prevAddress ? (
                    <button
                      onClick={fillPrevAddress}
                      style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1px solid var(--green)", background: "#fff", color: "var(--green)", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 14 }}
                    >
                      מילוי אותה כתובת
                    </button>
                  ) : null}

                  {toOther ? (
                    <>
                      {field("שם המקבל *", b.rName || "", (v) => onChange({ rName: v }), { placeholder: "שם המקבל" })}
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>טלפון המקבל *</label>
                        <input
                          value={b.rPhone || ""}
                          onChange={(e) => onChange({ rPhone: e.target.value })}
                          type="tel" inputMode="tel" placeholder="05X-XXXXXXX"
                          style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: `1px solid ${rPhoneBad ? "#b3261e" : "var(--line)"}`, fontSize: 15 }}
                        />
                        {rPhoneBad ? <p style={{ color: "#b3261e", fontSize: 13, marginTop: 4 }}>יש להזין מספר טלפון מלא.</p> : null}
                      </div>
                    </>
                  ) : null}

                  {field(toOther ? "כתובת המקבל *" : "כתובת למשלוח *", b.rAddr || "", (v) => onChange({ rAddr: v }), { placeholder: "רחוב, מספר, עיר" })}
                </>
              ) : null}
            </>
          ) : null}

          {b.method ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>ברכה לכרטיס (אופציונלי)</label>
                <textarea
                  value={b.greeting || ""}
                  onChange={(e) => onChange({ greeting: e.target.value.slice(0, 100) })}
                  rows={2}
                  maxLength={100}
                  style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15 }}
                  placeholder="הברכה שתודפס על הכרטיס"
                />
                <p style={{ textAlign: "left", color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{(b.greeting || "").length}/100</p>
              </div>

              <p style={{ fontWeight: 700, marginBottom: 12 }}>{b.method === "pickup" ? "מועד איסוף" : "מועד משלוח"}</p>
              {options.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: 14 }}>אין מועדים זמינים כרגע. ניצור קשר לתיאום.</p>
              ) : (
                <>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>יום</label>
                  <select
                    value={b.selDate || ""}
                    onChange={(e) => {
                      const day = options.find((o) => o.date === e.target.value);
                      onChange({ selDate: e.target.value, selWindow: day?.windows[0] || "" });
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
                        onClick={() => onChange({ selWindow: w })}
                        style={{
                          padding: "11px 8px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                          background: b.selWindow === w ? "var(--green)" : "#fff",
                          color: b.selWindow === w ? "#fff" : "var(--ink)",
                          border: b.selWindow === w ? "1px solid var(--green)" : "1px solid var(--line)",
                        }}
                      >
                        {w.replace("-", ":00-") + ":00"}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {multi && complete ? (
                <button
                  onClick={() => onChange({ collapsed: true })}
                  style={{ width: "100%", marginTop: 16, padding: "11px", borderRadius: 10, border: "1px solid var(--green)", background: "#fff", color: "var(--green)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  אישור פרטי המסירה
                </button>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
