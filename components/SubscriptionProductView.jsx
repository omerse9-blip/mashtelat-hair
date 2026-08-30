"use client";

import { useState } from "react";

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

// תמונה להצגה עבור זר בגודל שנבחר - קודם תמונת הגודל המדויק, אחרת כל תמונה אחרת שיש לזר
function flowerImageForSize(product, sizeKey) {
  const label = SIZE_LABEL_BY_KEY[sizeKey];
  const sizes = product?.product_sizes || [];
  const exact = sizes.find((s) => s.size_label === label && s.image_url);
  if (exact) return exact.image_url;
  const anyWithImage = sizes.find((s) => s.image_url);
  if (anyWithImage) return anyWithImage.image_url;
  return product?.image_url || null;
}

export default function SubscriptionProductView({ product, minPrices, discounts, dayOptions, windowOptions, pool, deliveryFees }) {
  const [step, setStep] = useState(1);
  const [frequency, setFrequency] = useState("");
  const [size, setSize] = useState("");
  const [deliveryDay, setDeliveryDay] = useState("");
  const [deliveryWindow, setDeliveryWindow] = useState("");
  const [surpriseMe, setSurpriseMe] = useState(false);
  const [chosenIds, setChosenIds] = useState([]);
  const [subType, setSubType] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [greeting, setGreeting] = useState("");

  function priceLabel(sizeKey) {
    const base = minPrices?.[sizeKey];
    if (base == null) return null;
    if (!frequency) return base;
    const pct = getDiscountPercent(discounts || [], sizeKey, frequency);
    return Math.round(base * (1 - pct / 100));
  }

  function toggleBouquet(id) {
    setChosenIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function goToStep2() {
    if (!frequency || !size) return;
    setStep(2);
  }
  function goToStep3() {
    if (!deliveryDay) return;
    setStep(3);
  }
  function goToStep4() {
    if (!deliveryWindow) return;
    setStep(4);
  }
  function goToStep5() {
    if (!surpriseMe && chosenIds.length === 0) return;
    setStep(5);
  }

  const windowsForDay = deliveryDay ? (windowOptions?.[deliveryDay] || []) : [];
  const finalPricePreview = !surpriseMe && chosenIds.length > 0
    ? Math.round((maxPriceForChosen(pool || [], size, chosenIds) || 0) * (1 - getDiscountPercent(discounts || [], size, frequency) / 100))
    : null;
  const deliveryFee = subType === "city" ? Number(deliveryFees?.city || 30) : subType === "hotel" ? Number(deliveryFees?.hotel || 50) : 0;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 28, fontWeight: 700, color: "var(--ink)", textAlign: "center", marginBottom: 8 }}>
        {product.name}
      </h1>
      <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 32 }}>
        מנוי לפריחה מתחדשת
      </p>

      {step === 1 && (
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>באיזו תדירות תרצי לקבל?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {FREQUENCIES.map((f) => (
              <button key={f.key} onClick={() => setFrequency(f.key)}
                style={{ padding: "14px 18px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer",
                  background: frequency === f.key ? "var(--green)" : "#fff", color: frequency === f.key ? "#fff" : "var(--ink)",
                  border: frequency === f.key ? "1px solid var(--green)" : "1px solid var(--line)", textAlign: "start" }}>
                {f.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>איזה גודל?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {SIZES.map((s) => {
              const p = priceLabel(s.key);
              return (
                <button key={s.key} onClick={() => setSize(s.key)}
                  style={{ padding: "14px 18px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer",
                    background: size === s.key ? "var(--green)" : "#fff", color: size === s.key ? "#fff" : "var(--ink)",
                    border: size === s.key ? "1px solid var(--green)" : "1px solid var(--line)",
                    display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>{p != null ? `החל מ-₪${p}` : ""}</span>
                </button>
              );
            })}
          </div>

          <button onClick={goToStep2} disabled={!frequency || !size}
            style={{ width: "100%", background: "var(--green)", color: "#fff", fontSize: 16, fontWeight: 700,
              padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", opacity: (!frequency || !size) ? 0.5 : 1 }}>
            המשך
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>באיזה יום קבוע תרצי לקבל?</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
            {(dayOptions || []).map((d) => (
              <button key={d.key} onClick={() => setDeliveryDay(d.key)}
                style={{ flex: 1, padding: "14px 18px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer",
                  background: deliveryDay === d.key ? "var(--green)" : "#fff", color: deliveryDay === d.key ? "#fff" : "var(--ink)",
                  border: deliveryDay === d.key ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                {d.label}
              </button>
            ))}
          </div>
          <StepNav onBack={() => setStep(1)} onNext={goToStep3} disabled={!deliveryDay} />
        </div>
      )}

      {step === 3 && (
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>איזו שעה קבועה?</p>
          <div dir="ltr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }}>
            {windowsForDay.map((w) => (
              <button key={w} onClick={() => setDeliveryWindow(w)}
                style={{ padding: "11px 8px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  background: deliveryWindow === w ? "var(--green)" : "#fff", color: deliveryWindow === w ? "#fff" : "var(--ink)",
                  border: deliveryWindow === w ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                {w.replace("-", ":00-") + ":00"}
              </button>
            ))}
          </div>
          <StepNav onBack={() => setStep(2)} onNext={goToStep4} disabled={!deliveryWindow} />
        </div>
      )}

      {step === 4 && (
        <div>
          <button onClick={() => setSurpriseMe((v) => !v)}
            style={{ width: "100%", padding: "14px 18px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer",
              background: surpriseMe ? "var(--green)" : "#fff", color: surpriseMe ? "#fff" : "var(--ink)",
              border: surpriseMe ? "1px solid var(--green)" : "1px solid var(--line)", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <span>✨</span><span>תפתיעו אותי</span>
          </button>

          {!surpriseMe && (
            <>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>איזה סגנונות את הכי אוהבת?</p>
              <div className="catalog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
                {(pool || []).map((p) => {
                  const selected = chosenIds.includes(p.id);
                  const img = flowerImageForSize(p, size);
                  return (
                    <button key={p.id} onClick={() => toggleBouquet(p.id)}
                      style={{ border: selected ? "2px solid var(--green)" : "1px solid var(--line)", borderRadius: 12, overflow: "hidden", background: "#fff", cursor: "pointer", padding: 0 }}>
                      <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "var(--green-soft)" }}>
                        {img ? (
                          <img src={img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : null}
                        {selected && (
                          <span style={{ position: "absolute", top: 6, insetInlineEnd: 6, background: "var(--green)", color: "#fff", borderRadius: 999, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✓</span>
                        )}
                      </div>
                      <p style={{ padding: "6px 8px", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{p.name}</p>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <StepNav onBack={() => setStep(3)} onNext={goToStep5} disabled={!surpriseMe && chosenIds.length === 0} />
        </div>
      )}

      {step === 5 && (
        <div>
          <Field label="שם מלא">
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="טלפון">
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={inputStyle} />
          </Field>

          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <button onClick={() => setIsGift(false)}
              style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
                background: !isGift ? "var(--green)" : "#fff", color: !isGift ? "#fff" : "var(--ink)",
                border: !isGift ? "1px solid var(--green)" : "1px solid var(--line)" }}>
              זה מגיע אליי
            </button>
            <button onClick={() => setIsGift(true)}
              style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
                background: isGift ? "var(--green)" : "#fff", color: isGift ? "#fff" : "var(--ink)",
                border: isGift ? "1px solid var(--green)" : "1px solid var(--line)" }}>
              🎁 זה מנוי מתנה
            </button>
          </div>

          {isGift && (
            <>
              <Field label="שם המקבלת"><input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} style={inputStyle} /></Field>
              <Field label="טלפון המקבלת"><input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} style={inputStyle} /></Field>
            </>
          )}

          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 8, marginTop: 6 }}>סוג משלוח</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {SUB_TYPES.map((s) => (
              <button key={s.key} onClick={() => setSubType(s.key)}
                style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
                  background: subType === s.key ? "var(--green)" : "#fff", color: subType === s.key ? "#fff" : "var(--ink)",
                  border: subType === s.key ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                {s.label}
              </button>
            ))}
          </div>

          <Field label="כתובת">
            <input value={isGift ? recipientAddress : customerAddress}
              onChange={(e) => isGift ? setRecipientAddress(e.target.value) : setCustomerAddress(e.target.value)}
              style={inputStyle} />
          </Field>

          <Field label="הערה לצוות (אופציונלי)">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          <Field label="כרטיס ברכה (אופציונלי, ניתן לעדכן לכל מחזור בנפרד)">
            <textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          {finalPricePreview != null && (
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, marginTop: 8, marginBottom: 8 }}>
              מחיר משוער למחזור: <strong style={{ color: "var(--green)" }}>₪{finalPricePreview + deliveryFee}</strong>
              {deliveryFee > 0 ? ` (כולל ₪${deliveryFee} משלוח)` : ""}
            </p>
          )}

          <StepNav onBack={() => setStep(4)} onNext={() => setStep(6)} disabled={!customerName || !customerPhone || !subType || !(isGift ? recipientAddress : customerAddress)} />
        </div>
      )}

      {step > 5 && (
        <p style={{ textAlign: "center", color: "var(--muted)" }}>שלב {step} — בבנייה (התחברות, סיכום ותשלום)</p>
      )}
    </div>
  );
}

function StepNav({ onBack, onNext, disabled }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button onClick={onBack} style={{ flex: 1, background: "#fff", color: "var(--ink)", fontSize: 15, fontWeight: 700, padding: "14px", borderRadius: 12, border: "1px solid var(--line)", cursor: "pointer" }}>
        חזרה
      </button>
      <button onClick={onNext} disabled={disabled}
        style={{ flex: 2, background: "var(--green)", color: "#fff", fontSize: 16, fontWeight: 700, padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", opacity: disabled ? 0.5 : 1 }}>
        המשך
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15 };
