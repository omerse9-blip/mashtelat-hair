"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const FREQUENCIES = [
  { key: "monthly", label: "חודשי" },
  { key: "biweekly", label: "דו שבועי" },
  { key: "weekly", label: "שבועי" },
];
const SIZES = [
  { key: "small", label: "קטן" },
  { key: "medium", label: "בינוני" },
  { key: "large", label: "גדול" },
];
const SUB_TYPES = [
  { key: "city", label: "משלוח בעיר" },
  { key: "hotel", label: "משלוח למלון" },
];
const SIZE_LABEL_BY_KEY = { small: "קטן", medium: "בינוני", large: "גדול" };
const FREQ_LABEL_BY_KEY = { monthly: "חודשי", biweekly: "דו שבועי", weekly: "שבועי" };
const DAY_OPTIONS = [
  { key: "sunday", label: "ראשון", dow: 0 },
  { key: "monday", label: "שני", dow: 1 },
  { key: "tuesday", label: "שלישי", dow: 2 },
  { key: "wednesday", label: "רביעי", dow: 3 },
  { key: "thursday", label: "חמישי", dow: 4 },
  { key: "friday", label: "שישי", dow: 5 },
];
const MONTHLY_WEEK_OPTIONS = [
  { key: "first", label: "ראשון בחודש" },
  { key: "last", label: "אחרון בחודש" },
];

const STORAGE_PREFIX = "subscription_form_";

function getDiscountPercent(discounts, size, frequency) {
  const row = discounts.find((d) => d.size === size && d.frequency === frequency);
  return row ? Number(row.discount_percent) : 0;
}

function maxPriceForChosen(pool, sizeKey, chosenIds) {
  if (!chosenIds.length) return null;
  const label = SIZE_LABEL_BY_KEY[sizeKey];
  let max = null;
  for (const id of chosenIds) {
    const p = pool.find((x) => x.id === id);
    if (!p || !p.has_sizes || !p.product_sizes?.length) continue;
    const match = p.product_sizes.find((s) => s.size_label === label);
    if (match) {
      const price = Number(match.price);
      if (!isNaN(price) && (max === null || price > max)) max = price;
    }
  }
  return max;
}

function flowerImageForSize(product, sizeKey) {
  const label = SIZE_LABEL_BY_KEY[sizeKey];
  const sizes = product?.product_sizes || [];
  const exact = sizes.find((s) => s.size_label === label && s.image_url);
  if (exact) return exact.image_url;
  const anyWithImage = sizes.find((s) => s.image_url);
  if (anyWithImage) return anyWithImage.image_url;
  return product?.image_url || null;
}

function remainingWeekdayDatesThisMonth(dow) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const dates = [];
  const d = new Date(year, month, today.getDate());
  while (d.getMonth() === month) {
    if (d.getDay() === dow) dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function monthlyRemainingDate(dow, monthlyWeek) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  let d;
  if (monthlyWeek === "first") {
    d = new Date(year, month, 1);
    while (d.getDay() !== dow) d.setDate(d.getDate() + 1);
  } else {
    d = new Date(year, month + 1, 0);
    while (d.getDay() !== dow) d.setDate(d.getDate() - 1);
  }
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d >= todayMidnight ? [d] : [];
}

function biweeklyRemainingDates(dow) {
  const all = remainingWeekdayDatesThisMonth(dow);
  return all.filter((_, i) => i % 2 === 0);
}

function formatDate(d) {
  return `${d.getDate()}.${d.getMonth() + 1}`;
}

function ceilTo(n, step) {
  return Math.ceil(n / step) * step;
}

function monthlyMultiplier(frequency) {
  if (frequency === "weekly") return 52 / 12;
  if (frequency === "biweekly") return 26 / 12;
  return 1;
}

const EMPTY_FORM = {
  step: 1,
  frequency: "",
  size: "",
  deliveryDay: "",
  monthlyWeek: "first",
  deliveryWindow: "",
  billingChoice: "",
  surpriseMe: false,
  chosenIds: [],
  subType: "",
  isGift: false,
  recipientName: "",
  recipientPhone: "",
  recipientAddress: "",
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  notes: "",
  greeting: "",
};

export default function SubscriptionProductView({ product, minPrices, discounts, windowOptions, pool, deliveryFees }) {
  const storageKey = STORAGE_PREFIX + product.id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        setForm((prev) => ({ ...prev, ...saved }));
      }
    } catch { /* התעלמות */ }
    setLoadedFromStorage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loadedFromStorage) return;
    try { localStorage.setItem(storageKey, JSON.stringify(form)); } catch { /* התעלמות */ }
  }, [form, loadedFromStorage, storageKey]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [form.step]);

  const initializedHistory = useRef(false);
  useEffect(() => {
    if (!initializedHistory.current) {
      window.history.replaceState({ subscriptionStep: form.step }, "");
      initializedHistory.current = true;
    }
    function onPop(e) {
      const backStep = e.state?.subscriptionStep;
      if (backStep && backStep < form.step) {
        setForm((prev) => ({ ...prev, step: backStep }));
      }
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.step]);

  function goToStep(n) {
    window.history.pushState({ subscriptionStep: n }, "");
    setForm((prev) => ({ ...prev, step: n }));
  }

  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data?.session || null);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => { alive = false; listener?.subscription?.unsubscribe(); };
  }, []);

  // ברגע שיש session פעיל בשלב ההתחברות - ממשיכים אוטומטית לסיכום, בלי מסך שם נפרד
  useEffect(() => {
    if (form.step === 4 && session && !checkingSession) {
      goToStep(5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.step, session, checkingSession]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function estPriceForSize(sizeKey) {
    const base = minPrices?.[sizeKey];
    if (base == null) return null;
    if (!form.frequency) return base;
    const pct = getDiscountPercent(discounts || [], sizeKey, form.frequency);
    return Math.round(base * (1 - pct / 100));
  }

  function toggleBouquet(id) {
    setForm((prev) => ({
      ...prev,
      chosenIds: prev.chosenIds.includes(id) ? prev.chosenIds.filter((x) => x !== id) : [...prev.chosenIds, id],
    }));
  }

  const windowsForDay = form.deliveryDay ? (windowOptions?.[form.deliveryDay] || []) : [];
  const step1Complete = form.frequency && form.size && form.deliveryDay && form.deliveryWindow && (form.frequency !== "monthly" || form.monthlyWeek);

  function goToStep2() { if (!step1Complete) return; goToStep(2); }
  function goToStep3() { if (!form.surpriseMe && form.chosenIds.length === 0) return; goToStep(3); }
  function goToStep4() {
    if (!form.customerName || !form.customerPhone || !form.subType || !(form.isGift ? form.recipientAddress : form.customerAddress)) return;
    goToStep(4);
  }

  async function signInWithGoogle() {
    setSigningIn(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.href },
      });
    } catch (e) {
      alert("שגיאה בהתחברות. נסי שוב.");
      setSigningIn(false);
    }
  }

  const selectedDayInfo = DAY_OPTIONS.find((d) => d.key === form.deliveryDay);
  let remainingDates = [];
  if (selectedDayInfo && form.frequency) {
    if (form.frequency === "monthly") remainingDates = monthlyRemainingDate(selectedDayInfo.dow, form.monthlyWeek);
    else if (form.frequency === "biweekly") remainingDates = biweeklyRemainingDates(selectedDayInfo.dow);
    else remainingDates = remainingWeekdayDatesThisMonth(selectedDayInfo.dow);
  }
  const hasRemaining = remainingDates.length > 0;
  const firstDateLabel = hasRemaining ? formatDate(remainingDates[0]) : "";

  const rawFlowerPrice = !form.surpriseMe && form.chosenIds.length > 0
    ? (maxPriceForChosen(pool || [], form.size, form.chosenIds) || minPrices?.[form.size] || 0)
    : (minPrices?.[form.size] || 0);
  const discountPct = getDiscountPercent(discounts || [], form.size, form.frequency);
  const discountedFlowerPrice = rawFlowerPrice * (1 - discountPct / 100);
  const mult = monthlyMultiplier(form.frequency);
  const deliveryFeeFull = 30;
  const deliveryFeeDisc = 15;

  const originalFullPrice = Math.ceil(rawFlowerPrice * mult + deliveryFeeFull * mult);
  const subscriptionMonthlyPrice = ceilTo(discountedFlowerPrice * mult + deliveryFeeDisc * mult, 10);
  const savings = originalFullPrice - subscriptionMonthlyPrice;
  const savingsPct = originalFullPrice > 0 ? Math.round((savings / originalFullPrice) * 100) : 0;

  const partialPrice = form.frequency !== "monthly"
    ? Math.ceil(discountedFlowerPrice * remainingDates.length + deliveryFeeDisc * remainingDates.length)
    : subscriptionMonthlyPrice;

  function handlePayNow() {
    if (hasRemaining && !form.billingChoice) return;
    alert("חיבור התשלום עדיין בבנייה - ייפתח בקרוב.");
  }
  function handleAddToCart() {
    if (hasRemaining && !form.billingChoice) return;
    alert("חיבור לסל עדיין בבנייה - ייפתח בקרוב.");
  }

  const step = form.step;
  const payDisabled = hasRemaining && !form.billingChoice;

  function selectionSummaryText() {
    const parts = [];
    if (form.frequency) parts.push(FREQ_LABEL_BY_KEY[form.frequency]);
    if (form.size) parts.push(SIZES.find((s) => s.key === form.size)?.label);
    if (form.deliveryDay) parts.push(DAY_OPTIONS.find((d) => d.key === form.deliveryDay)?.label);
    if (form.deliveryWindow) parts.push(form.deliveryWindow.replace("-", ":00-") + ":00");
    return parts.join(" · ");
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 26, fontWeight: 700, color: "var(--ink)", textAlign: "center", marginBottom: 6 }}>
        {product.name}
      </h1>
      <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
        מנוי לפריחה מתחדשת
      </p>

      {step === 1 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>באיזו תדירות נספק את הזר?</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {FREQUENCIES.map((f) => (
              <button key={f.key} onClick={() => setField("frequency", f.key)}
                style={{ flex: 1, padding: "8px 6px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: form.frequency === f.key ? "var(--green)" : "#fff", color: form.frequency === f.key ? "#fff" : "var(--ink)",
                  border: form.frequency === f.key ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                {f.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>איזה גודל?</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {SIZES.map((s) => {
              const p = estPriceForSize(s.key);
              return (
                <button key={s.key} onClick={() => setField("size", s.key)}
                  style={{ flex: 1, padding: "8px 6px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: form.size === s.key ? "var(--green)" : "#fff", color: form.size === s.key ? "#fff" : "var(--ink)",
                    border: form.size === s.key ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                  <div>{s.label}</div>
                  {p != null && <div style={{ fontSize: 11, opacity: 0.85 }}>מ-₪{p}</div>}
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>באיזה יום קבוע?</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
            {DAY_OPTIONS.map((d) => (
              <button key={d.key} onClick={() => setField("deliveryDay", d.key)}
                style={{ padding: "8px 4px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: form.deliveryDay === d.key ? "var(--green)" : "#fff", color: form.deliveryDay === d.key ? "#fff" : "var(--ink)",
                  border: form.deliveryDay === d.key ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                {d.label}
              </button>
            ))}
          </div>

          {form.frequency === "monthly" && (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>שבוע בחודש</p>
              <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                {MONTHLY_WEEK_OPTIONS.map((w) => (
                  <button key={w.key} onClick={() => setField("monthlyWeek", w.key)}
                    style={{ flex: 1, padding: "8px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      background: form.monthlyWeek === w.key ? "var(--green)" : "#fff", color: form.monthlyWeek === w.key ? "#fff" : "var(--ink)",
                      border: form.monthlyWeek === w.key ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                    {w.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {form.deliveryDay && (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>באיזו שעה?</p>
              <div dir="ltr" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 20 }}>
                {windowsForDay.map((w) => (
                  <button key={w} onClick={() => setField("deliveryWindow", w)}
                    style={{ padding: "8px 4px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      background: form.deliveryWindow === w ? "var(--green)" : "#fff", color: form.deliveryWindow === w ? "#fff" : "var(--ink)",
                      border: form.deliveryWindow === w ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                    {w.replace("-", ":00-") + ":00"}
                  </button>
                ))}
              </div>
            </>
          )}

          {selectionSummaryText() && (
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>{selectionSummaryText()}</p>
          )}

          <button onClick={goToStep2} disabled={!step1Complete}
            style={{ width: "100%", background: "var(--green)", color: "#fff", fontSize: 15, fontWeight: 700,
              padding: "12px", borderRadius: 11, border: "none", cursor: "pointer", opacity: !step1Complete ? 0.5 : 1 }}>
            המשך
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <button onClick={() => setField("surpriseMe", !form.surpriseMe)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "pointer",
              background: form.surpriseMe ? "var(--green)" : "#fff", color: form.surpriseMe ? "#fff" : "var(--ink)",
              border: form.surpriseMe ? "1px solid var(--green)" : "1px solid var(--line)", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <span>✨</span><span>תפתיעו אותי</span>
          </button>

          {!form.surpriseMe && (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>אילו סגנונות הכי מתחברים אליך?</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8, marginBottom: 20 }}>
                {(pool || []).map((p) => {
                  const selected = form.chosenIds.includes(p.id);
                  const img = flowerImageForSize(p, form.size);
                  return (
                    <button key={p.id} onClick={() => toggleBouquet(p.id)}
                      style={{ border: selected ? "2px solid var(--green)" : "1px solid var(--line)", borderRadius: 10, overflow: "hidden", background: "#fff", cursor: "pointer", padding: 0 }}>
                      <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "var(--green-soft)" }}>
                        {img ? <img src={img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                        {selected && (
                          <span style={{ position: "absolute", top: 5, insetInlineEnd: 5, background: "var(--green)", color: "#fff", borderRadius: 999, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</span>
                        )}
                      </div>
                      <p style={{ padding: "4px 6px", fontSize: 11, fontWeight: 600, color: "var(--ink)" }}>{p.name}</p>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
            {selectionSummaryText()}{form.surpriseMe ? " · תפתיעו אותי" : form.chosenIds.length ? ` · ${form.chosenIds.length} סגנונות` : ""}
          </p>

          <StepNav onBack={() => goToStep(1)} onNext={goToStep3} disabled={!form.surpriseMe && form.chosenIds.length === 0} />
        </div>
      )}

      {step === 3 && (
        <div>
          <Field label="שם מלא">
            <input value={form.customerName} onChange={(e) => setField("customerName", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="טלפון">
            <input type="tel" inputMode="tel" value={form.customerPhone} onChange={(e) => setField("customerPhone", e.target.value)} style={inputStyle} />
          </Field>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setField("isGift", false)}
              style={{ flex: 1, padding: "9px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: !form.isGift ? "var(--green)" : "#fff", color: !form.isGift ? "#fff" : "var(--ink)",
                border: !form.isGift ? "1px solid var(--green)" : "1px solid var(--line)" }}>
              המנוי מיועד לי
            </button>
            <button onClick={() => setField("isGift", true)}
              style={{ flex: 1, padding: "9px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: form.isGift ? "var(--green)" : "#fff", color: form.isGift ? "#fff" : "var(--ink)",
                border: form.isGift ? "1px solid var(--green)" : "1px solid var(--line)" }}>
              🎁 מתנה
            </button>
          </div>

          {form.isGift && (
            <>
              <Field label="שם המקבל/ת"><input value={form.recipientName} onChange={(e) => setField("recipientName", e.target.value)} style={inputStyle} /></Field>
              <Field label="טלפון המקבל/ת"><input type="tel" inputMode="tel" value={form.recipientPhone} onChange={(e) => setField("recipientPhone", e.target.value)} style={inputStyle} /></Field>
            </>
          )}

          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>סוג משלוח</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {SUB_TYPES.map((s) => (
              <button key={s.key} onClick={() => setField("subType", s.key)}
                style={{ flex: 1, padding: "9px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: form.subType === s.key ? "var(--green)" : "#fff", color: form.subType === s.key ? "#fff" : "var(--ink)",
                  border: form.subType === s.key ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                {s.label}
              </button>
            ))}
          </div>

          <Field label="כתובת">
            <input value={form.isGift ? form.recipientAddress : form.customerAddress}
              onChange={(e) => setField(form.isGift ? "recipientAddress" : "customerAddress", e.target.value)}
              style={inputStyle} />
          </Field>

          <Field label="הערה לצוות (אופציונלי)">
            <textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} rows={2} style={textareaStyle} />
          </Field>

          <Field label="כרטיס ברכה (אופציונלי, ניתן לעדכן לכל מחזור בנפרד)">
            <textarea value={form.greeting} onChange={(e) => setField("greeting", e.target.value)} rows={2} style={textareaStyle} />
          </Field>

          <StepNav onBack={() => goToStep(2)} onNext={goToStep4} disabled={!form.customerName || !form.customerPhone || !form.subType || !(form.isGift ? form.recipientAddress : form.customerAddress)} />
        </div>
      )}

      {step === 4 && (
        <div>
          {checkingSession ? (
            <p style={{ textAlign: "center", color: "var(--muted)" }}>בודקת חיבור...</p>
          ) : (
            <>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 14, textAlign: "center" }}>
                כדי לנהל את המנוי בהמשך, צריך להתחבר
              </p>
              <button onClick={signInWithGoogle} disabled={signingIn}
                style={{ width: "100%", background: "#fff", color: "var(--ink)", fontSize: 14, fontWeight: 700,
                  padding: "11px", borderRadius: 10, border: "1px solid var(--line)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span>🔵</span>
                <span>{signingIn ? "מעבירה..." : "המשך עם Google"}</span>
              </button>
              <div style={{ marginTop: 14 }}>
                <button onClick={() => goToStep(3)} style={{ width: "100%", background: "#fff", color: "var(--ink)", fontSize: 13, fontWeight: 600, padding: "11px", borderRadius: 10, border: "1px solid var(--line)", cursor: "pointer" }}>
                  חזרה
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 5 && (
        <div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 13, padding: 14, marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>סיכום המנוי</p>
            <SummaryLine label="תדירות" value={FREQ_LABEL_BY_KEY[form.frequency]} />
            <SummaryLine label="גודל" value={SIZES.find((s) => s.key === form.size)?.label} />
            <SummaryLine label="יום משלוח" value={DAY_OPTIONS.find((d) => d.key === form.deliveryDay)?.label} />
            <SummaryLine label="שעה" value={form.deliveryWindow ? form.deliveryWindow.replace("-", ":00-") + ":00" : ""} />
            <SummaryLine label="קו מנחה" value={form.surpriseMe ? "תפתיעו אותי" : `${form.chosenIds.length} סגנונות נבחרו`} />
            <SummaryLine label="כתובת" value={form.isGift ? form.recipientAddress : form.customerAddress} />

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)", textAlign: "center" }}>
              <span style={{ color: "var(--muted)", fontSize: 14, textDecoration: "line-through" }}>₪{originalFullPrice}</span>
              <span style={{ color: "var(--green)", fontSize: 20, fontWeight: 700, marginInlineStart: 8 }}>₪{subscriptionMonthlyPrice}</span>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                במנוי זה חסכת בחודש ₪{savings} ({savingsPct}% הנחה)
              </p>
            </div>
          </div>

          {hasRemaining ? (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
                המשלוח הראשון האפשרי: {firstDateLabel}. איך רוצה להתחיל?
              </p>
              <button onClick={() => setField("billingChoice", "now")}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  background: form.billingChoice === "now" ? "var(--green)" : "#fff", color: form.billingChoice === "now" ? "#fff" : "var(--ink)",
                  border: form.billingChoice === "now" ? "1px solid var(--green)" : "1px solid var(--line)", textAlign: "start", marginBottom: 8 }}>
                <div>עכשיו ({firstDateLabel}) · ₪{partialPrice}</div>
              </button>
              <button onClick={() => setField("billingChoice", "next")}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  background: form.billingChoice === "next" ? "var(--green)" : "#fff", color: form.billingChoice === "next" ? "#fff" : "var(--ink)",
                  border: form.billingChoice === "next" ? "1px solid var(--green)" : "1px solid var(--line)", textAlign: "start" }}>
                <div>מ-1 לחודש הבא · ₪{subscriptionMonthlyPrice}</div>
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", marginBottom: 14 }}>
              אין ימי אספקה שנותרו החודש - המנוי יתחיל מהמחזור המלא הבא
            </p>
          )}

          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
            ניתן לבטל בכל עת.
          </p>

          <button onClick={handlePayNow} disabled={payDisabled}
            style={{ width: "100%", background: "var(--green)", color: "#fff", fontSize: 15, fontWeight: 700,
              padding: "12px", borderRadius: 11, border: "none", cursor: "pointer", marginBottom: 8, opacity: payDisabled ? 0.5 : 1 }}>
            מעבר לתשלום
          </button>
          <button onClick={handleAddToCart} disabled={payDisabled}
            style={{ width: "100%", background: "#fff", color: "var(--ink)", fontSize: 13, fontWeight: 600,
              padding: "10px", borderRadius: 10, border: "1px solid var(--line)", cursor: "pointer", opacity: payDisabled ? 0.5 : 1 }}>
            הוספה לסל וקנייה נוספת
          </button>

          <div style={{ marginTop: 14, textAlign: "center" }}>
            <button onClick={() => goToStep(4)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>
              חזרה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: 13 }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ color: "var(--ink)", fontWeight: 600 }}>{value || "—"}</span>
    </div>
  );
}

function StepNav({ onBack, onNext, disabled }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={onBack} style={{ flex: 1, background: "#fff", color: "var(--ink)", fontSize: 13, fontWeight: 600, padding: "12px", borderRadius: 11, border: "1px solid var(--line)", cursor: "pointer" }}>
        חזרה
      </button>
      <button onClick={onNext} disabled={disabled}
        style={{ flex: 2, background: "var(--green)", color: "#fff", fontSize: 15, fontWeight: 700, padding: "12px", borderRadius: 11, border: "none", cursor: "pointer", opacity: disabled ? 0.5 : 1 }}>
        המשך
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--ink)" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px 11px", borderRadius: 9, border: "1px solid var(--line)", fontSize: 14, fontFamily: "inherit" };
const textareaStyle = { ...inputStyle, resize: "vertical", lineHeight: 1.5, wordSpacing: "normal", whiteSpace: "pre-wrap" };
