"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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

function cheapestFlowerPrices(pool) {
  let cheapest = null;
  let cheapestSmall = null;
  for (const p of pool || []) {
    if (!p.has_sizes || !p.product_sizes?.length) continue;
    const small = p.product_sizes.find((s) => s.size_label === "קטן");
    if (!small) continue;
    const price = Number(small.price);
    if (!isNaN(price) && (cheapestSmall === null || price < cheapestSmall)) {
      cheapestSmall = price;
      cheapest = p;
    }
  }
  if (!cheapest) return { small: null, medium: null, large: null };
  function bySize(label) {
    const s = cheapest.product_sizes.find((x) => x.size_label === label);
    return s ? Number(s.price) : null;
  }
  return { small: bySize("קטן"), medium: bySize("בינוני"), large: bySize("גדול") };
}

function flowerImage(product, sizeKey) {
  const sizes = product?.product_sizes || [];
  if (sizeKey) {
    const label = SIZE_LABEL_BY_KEY[sizeKey];
    const exact = sizes.find((s) => s.size_label === label && s.image_url);
    if (exact) return exact.image_url;
  }
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

function nextMonthFirstLabel() {
  const today = new Date();
  const next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return `1.${next.getMonth() + 1}.${next.getFullYear()}`;
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
  surpriseMe: false,
  chosenIds: [],
  size: "",
  frequency: "",
  deliveryDay: "",
  monthlyWeek: "first",
  deliveryWindow: "",
  billingChoice: "",
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
  pendingAction: "",
};

export default function SubscriptionProductView({ product, discounts, windowOptions, pool, deliveryFees }) {
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

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleBouquet(id) {
    setForm((prev) => ({
      ...prev,
      chosenIds: prev.chosenIds.includes(id) ? prev.chosenIds.filter((x) => x !== id) : [...prev.chosenIds, id],
    }));
  }

  const basePrices = useMemo(() => cheapestFlowerPrices(pool || []), [pool]);

  function estPriceForSize(sizeKey) {
    const base = basePrices?.[sizeKey];
    if (base == null) return null;
    if (!form.frequency) return base;
    const pct = getDiscountPercent(discounts || [], sizeKey, form.frequency);
    return Math.round(base * (1 - pct / 100));
  }

  const windowsForDay = form.deliveryDay ? (windowOptions?.[form.deliveryDay] || []) : [];
  const step2Complete = form.size && form.frequency && form.deliveryDay && form.deliveryWindow && (form.frequency !== "monthly" || form.monthlyWeek);

  function goToStep1Next() { if (!form.surpriseMe && form.chosenIds.length === 0) return; goToStep(2); }
  function goToStep2Next() { if (!step2Complete) return; goToStep(3); }

  const selectedDayInfo = DAY_OPTIONS.find((d) => d.key === form.deliveryDay);
  let remainingDates = [];
  if (selectedDayInfo && form.frequency) {
    if (form.frequency === "monthly") remainingDates = monthlyRemainingDate(selectedDayInfo.dow, form.monthlyWeek);
    else if (form.frequency === "biweekly") remainingDates = biweeklyRemainingDates(selectedDayInfo.dow);
    else remainingDates = remainingWeekdayDatesThisMonth(selectedDayInfo.dow);
  }
  const hasRemaining = remainingDates.length > 0;
  const firstDateLabel = hasRemaining ? formatDate(remainingDates[0]) : "";
  const nextCycleLabel = nextMonthFirstLabel();

  const rawFlowerPrice = !form.surpriseMe && form.chosenIds.length > 0
    ? (maxPriceForChosen(pool || [], form.size, form.chosenIds) || basePrices?.[form.size] || 0)
    : (basePrices?.[form.size] || 0);
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

  const detailsComplete = form.customerName && form.customerPhone && form.subType && (form.isGift ? form.recipientAddress : form.customerAddress);
  const billingResolved = !hasRemaining || !!form.billingChoice;
  const payDisabled = !detailsComplete || !billingResolved;

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

  function runPayment() {
    alert("חיבור התשלום עדיין בבנייה - ייפתח בקרוב.");
  }
  function runAddToCart() {
    alert("חיבור לסל עדיין בבנייה - ייפתח בקרוב.");
  }

  function handlePayClick() {
    if (payDisabled) return;
    if (!session) {
      setField("pendingAction", "pay");
      signInWithGoogle();
      return;
    }
    runPayment();
  }
  function handleCartClick() {
    if (payDisabled) return;
    if (!session) {
      setField("pendingAction", "cart");
      signInWithGoogle();
      return;
    }
    runAddToCart();
  }

  useEffect(() => {
    if (checkingSession || !session || !form.pendingAction) return;
    const action = form.pendingAction;
    setField("pendingAction", "");
    if (action === "pay") runPayment();
    else if (action === "cart") runAddToCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, checkingSession, form.pendingAction]);

  const step = form.step;
  const chosenFlowers = (pool || []).filter((p) => form.chosenIds.includes(p.id));

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <style>{`
        .sub-opt-btn { padding: 8px 6px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .sub-opt-btn-day { padding: 8px 4px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .sub-opt-btn-window { padding: 8px 4px; border-radius: 9px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .sub-primary-btn { font-size: 15px; padding: 12px; border-radius: 11px; }
        .sub-secondary-btn { font-size: 13px; padding: 12px; border-radius: 11px; }
        .sub-input { padding: 10px 11px; border-radius: 9px; font-size: 14px; }
        .sub-flower-card p { font-size: 11px; padding: 4px 6px; }
        .sub-flower-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
        .sub-day-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
        @media (min-width: 641px) {
          .sub-opt-btn { padding: 13px 10px; font-size: 15px; border-radius: 12px; }
          .sub-opt-btn-day { padding: 13px 6px; font-size: 15px; border-radius: 12px; }
          .sub-opt-btn-window { padding: 12px 6px; font-size: 14px; border-radius: 12px; }
          .sub-primary-btn { font-size: 17px; padding: 15px; border-radius: 13px; }
          .sub-secondary-btn { font-size: 15px; padding: 14px; border-radius: 13px; }
          .sub-input { padding: 13px 14px; font-size: 16px; border-radius: 11px; }
          .sub-flower-card p { font-size: 13px; padding: 8px 10px; }
          .sub-flower-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
          .sub-day-grid { gap: 10px; }
        }
      `}</style>

      <h1 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 26, fontWeight: 700, color: "var(--ink)", textAlign: "center", marginBottom: 6 }}>
        {product.name}
      </h1>
      <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 16, fontSize: 14 }}>
        מנוי לפריחה מתחדשת
      </p>

      {/* פס הזרים שנבחרו - מוצג לאורך כל התהליך */}
      {form.surpriseMe ? (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--green-soft)", color: "var(--green)", fontWeight: 700, fontSize: 13, padding: "6px 14px", borderRadius: 999 }}>
            <span>✨</span><span>תפתיעו אותי</span>
          </span>
        </div>
      ) : chosenFlowers.length > 0 ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          {chosenFlowers.map((f) => {
            const img = flowerImage(f, form.size);
            return (
              <div key={f.id} style={{ width: 44, height: 44, borderRadius: 999, overflow: "hidden", border: "2px solid var(--green)", background: "var(--green-soft)" }}>
                {img ? <img src={img} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {step === 1 && (
        <div>
          <button onClick={() => setField("surpriseMe", !form.surpriseMe)}
            className="sub-opt-btn"
            style={{ width: "100%", marginBottom: 14,
              background: form.surpriseMe ? "var(--green)" : "#fff", color: form.surpriseMe ? "#fff" : "var(--ink)",
              border: form.surpriseMe ? "1px solid var(--green)" : "1px solid var(--line)",
              display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <span>✨</span><span>תפתיעו אותי</span>
          </button>

          {!form.surpriseMe && (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>אילו סגנונות הכי מתחברים אליך?</p>
              <div className="sub-flower-grid" style={{ marginBottom: 20 }}>
                {(pool || []).map((p) => {
                  const selected = form.chosenIds.includes(p.id);
                  const img = flowerImage(p, form.size);
                  return (
                    <button key={p.id} onClick={() => toggleBouquet(p.id)} className="sub-flower-card"
                      style={{ border: selected ? "2px solid var(--green)" : "1px solid var(--line)", borderRadius: 10, overflow: "hidden", background: "#fff", cursor: "pointer", padding: 0 }}>
                      <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "var(--green-soft)" }}>
                        {img ? <img src={img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                        {selected && (
                          <span style={{ position: "absolute", top: 5, insetInlineEnd: 5, background: "var(--green)", color: "#fff", borderRadius: 999, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</span>
                        )}
                      </div>
                      <p style={{ fontWeight: 600, color: "var(--ink)" }}>{p.name}</p>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <button onClick={goToStep1Next} disabled={!form.surpriseMe && form.chosenIds.length === 0}
            className="sub-primary-btn"
            style={{ width: "100%", background: "var(--green)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer",
              opacity: (!form.surpriseMe && form.chosenIds.length === 0) ? 0.5 : 1 }}>
            המשך
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>איזה גודל?</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {SIZES.map((s) => {
              const p = estPriceForSize(s.key);
              return (
                <button key={s.key} onClick={() => setField("size", s.key)} className="sub-opt-btn"
                  style={{ flex: 1,
                    background: form.size === s.key ? "var(--green)" : "#fff", color: form.size === s.key ? "#fff" : "var(--ink)",
                    border: form.size === s.key ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                  <div>{s.label}</div>
                  {p != null && <div style={{ fontSize: "0.85em", opacity: 0.85 }}>מ-₪{p}</div>}
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>באיזו תדירות נספק את הזר?</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {FREQUENCIES.map((f) => (
              <button key={f.key} onClick={() => setField("frequency", f.key)} className="sub-opt-btn"
                style={{ flex: 1,
                  background: form.frequency === f.key ? "var(--green)" : "#fff", color: form.frequency === f.key ? "#fff" : "var(--ink)",
                  border: form.frequency === f.key ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                {f.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>באיזה יום קבוע?</p>
          <div className="sub-day-grid" style={{ marginBottom: 12 }}>
            {DAY_OPTIONS.map((d) => (
              <button key={d.key} onClick={() => setField("deliveryDay", d.key)} className="sub-opt-btn-day"
                style={{
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
                  <button key={w.key} onClick={() => setField("monthlyWeek", w.key)} className="sub-opt-btn"
                    style={{ flex: 1,
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
              <div dir="ltr" className="sub-day-grid" style={{ marginBottom: 20 }}>
                {windowsForDay.map((w) => (
                  <button key={w} onClick={() => setField("deliveryWindow", w)} className="sub-opt-btn-window"
                    style={{
                      background: form.deliveryWindow === w ? "var(--green)" : "#fff", color: form.deliveryWindow === w ? "#fff" : "var(--ink)",
                      border: form.deliveryWindow === w ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                    {w.replace("-", ":00-") + ":00"}
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => goToStep(1)} className="sub-secondary-btn" style={{ flex: 1, background: "#fff", color: "var(--ink)", fontWeight: 600, border: "1px solid var(--line)", cursor: "pointer" }}>
              חזרה
            </button>
            <button onClick={goToStep2Next} disabled={!step2Complete} className="sub-primary-btn"
              style={{ flex: 2, background: "var(--green)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", opacity: !step2Complete ? 0.5 : 1 }}>
              המשך
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 13, padding: 16, marginBottom: 18 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>סיכום המנוי</p>
            <SummaryLine label="גודל" value={SIZES.find((s) => s.key === form.size)?.label} />
            <SummaryLine label="תדירות" value={FREQ_LABEL_BY_KEY[form.frequency]} />
            <SummaryLine label="יום משלוח" value={DAY_OPTIONS.find((d) => d.key === form.deliveryDay)?.label} />
            <SummaryLine label="שעה" value={form.deliveryWindow ? form.deliveryWindow.replace("-", ":00-") + ":00" : ""} />
            <SummaryLine label="קו מנחה" value={form.surpriseMe ? "תפתיעו אותי" : `${form.chosenIds.length} סגנונות נבחרו`} />

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", textAlign: "center" }}>
              <div style={{ color: "var(--muted)", fontSize: 14, textDecoration: "line-through" }}>₪{originalFullPrice} לחודש</div>
              <div style={{ color: "var(--green)", fontSize: 24, fontWeight: 700, marginTop: 6 }}>₪{subscriptionMonthlyPrice} <span style={{ fontSize: 14, fontWeight: 600 }}>לחודש</span></div>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
                במנוי זה חסכת בחודש ₪{savings} ({savingsPct}% הנחה)
              </p>
            </div>
          </div>

          <Field label="שם מלא">
            <input value={form.customerName} onChange={(e) => setField("customerName", e.target.value)} className="sub-input" style={inputStyle} />
          </Field>
          <Field label="טלפון">
            <input type="tel" inputMode="tel" value={form.customerPhone} onChange={(e) => setField("customerPhone", e.target.value)} className="sub-input" style={inputStyle} />
          </Field>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setField("isGift", false)} className="sub-opt-btn" style={{ flex: 1,
              background: !form.isGift ? "var(--green)" : "#fff", color: !form.isGift ? "#fff" : "var(--ink)",
              border: !form.isGift ? "1px solid var(--green)" : "1px solid var(--line)" }}>
              המנוי מיועד לי
            </button>
            <button onClick={() => setField("isGift", true)} className="sub-opt-btn" style={{ flex: 1,
              background: form.isGift ? "var(--green)" : "#fff", color: form.isGift ? "#fff" : "var(--ink)",
              border: form.isGift ? "1px solid var(--green)" : "1px solid var(--line)" }}>
              🎁 מתנה
            </button>
          </div>

          {form.isGift && (
            <>
              <Field label="שם המקבל/ת"><input value={form.recipientName} onChange={(e) => setField("recipientName", e.target.value)} className="sub-input" style={inputStyle} /></Field>
              <Field label="טלפון המקבל/ת"><input type="tel" inputMode="tel" value={form.recipientPhone} onChange={(e) => setField("recipientPhone", e.target.value)} className="sub-input" style={inputStyle} /></Field>
            </>
          )}

          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>סוג משלוח</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {SUB_TYPES.map((s) => (
              <button key={s.key} onClick={() => setField("subType", s.key)} className="sub-opt-btn" style={{ flex: 1,
                background: form.subType === s.key ? "var(--green)" : "#fff", color: form.subType === s.key ? "#fff" : "var(--ink)",
                border: form.subType === s.key ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                {s.label}
              </button>
            ))}
          </div>

          <Field label="כתובת">
            <input value={form.isGift ? form.recipientAddress : form.customerAddress}
              onChange={(e) => setField(form.isGift ? "recipientAddress" : "customerAddress", e.target.value)}
              className="sub-input" style={inputStyle} />
          </Field>

          <Field label="הערה לצוות (אופציונלי)">
            <textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} rows={2} className="sub-input" style={textareaStyle} />
          </Field>

          <Field label="כרטיס ברכה (אופציונלי, ניתן לעדכן בכל זר מחדש)">
            <textarea value={form.greeting} onChange={(e) => setField("greeting", e.target.value)} rows={2} className="sub-input" style={textareaStyle} />
          </Field>

          {hasRemaining ? (
            <div style={{ margin: "18px 0 14px" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
                איך רוצה להתחיל?
              </p>
              <button onClick={() => setField("billingChoice", "now")} className="sub-secondary-btn"
                style={{ width: "100%", fontWeight: 700, cursor: "pointer", textAlign: "start", marginBottom: 8,
                  background: form.billingChoice === "now" ? "var(--green)" : "#fff", color: form.billingChoice === "now" ? "#fff" : "var(--ink)",
                  border: form.billingChoice === "now" ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                <div>עכשיו (מ-{firstDateLabel}) · ₪{partialPrice} חיוב חד פעמי</div>
                <div style={{ fontSize: "0.8em", opacity: 0.85, marginTop: 2 }}>ומהחודש הבא: ₪{subscriptionMonthlyPrice} לחודש</div>
              </button>
              <button onClick={() => setField("billingChoice", "next")} className="sub-secondary-btn"
                style={{ width: "100%", fontWeight: 700, cursor: "pointer", textAlign: "start",
                  background: form.billingChoice === "next" ? "var(--green)" : "#fff", color: form.billingChoice === "next" ? "#fff" : "var(--ink)",
                  border: form.billingChoice === "next" ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                <div>להתחיל בחודש הבא, ב-{nextCycleLabel}</div>
                <div style={{ fontSize: "0.8em", opacity: 0.85, marginTop: 2 }}>₪{subscriptionMonthlyPrice} לחודש</div>
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", margin: "18px 0 14px" }}>
              אין ימי אספקה שנותרו החודש - המנוי יתחיל ב-{nextCycleLabel}, ₪{subscriptionMonthlyPrice} לחודש
            </p>
          )}

          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
            ניתן לבטל בכל עת.
          </p>

          <button onClick={handlePayClick} disabled={payDisabled || signingIn} className="sub-primary-btn"
            style={{ width: "100%", background: "var(--green)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", marginBottom: 8, opacity: (payDisabled || signingIn) ? 0.5 : 1 }}>
            {signingIn ? "מעבירה..." : "מעבר לתשלום"}
          </button>
          <button onClick={handleCartClick} disabled={payDisabled || signingIn} className="sub-secondary-btn"
            style={{ width: "100%", background: "#fff", color: "var(--ink)", fontWeight: 600, border: "1px solid var(--line)", cursor: "pointer", opacity: (payDisabled || signingIn) ? 0.5 : 1 }}>
            הוספה לסל וקנייה נוספת
          </button>

          <div style={{ marginTop: 14, textAlign: "center" }}>
            <button onClick={() => goToStep(2)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>
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
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "4px 0", fontSize: 13 }}>
      <span style={{ color: "var(--ink)", fontWeight: 600 }}>{value || "—"}</span>
      <span style={{ color: "var(--muted)" }}>:{label}</span>
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

const inputStyle = { width: "100%", border: "1px solid var(--line)", fontFamily: "inherit" };
const textareaStyle = { ...inputStyle, resize: "vertical", lineHeight: 1.5, wordSpacing: "normal", whiteSpace: "pre-wrap" };
