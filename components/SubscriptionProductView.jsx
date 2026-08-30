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

function getDiscountPercent(discounts, size, frequency) {
  const row = discounts.find((d) => d.size === size && d.frequency === frequency);
  return row ? Number(row.discount_percent) : 0;
}

export default function SubscriptionProductView({ product, minPrices, discounts, dayOptions }) {
  const [step, setStep] = useState(1);
  const [frequency, setFrequency] = useState("");
  const [size, setSize] = useState("");
  const [deliveryDay, setDeliveryDay] = useState("");

  function priceLabel(sizeKey) {
    const base = minPrices?.[sizeKey];
    if (base == null) return null;
    if (!frequency) return base;
    const pct = getDiscountPercent(discounts || [], sizeKey, frequency);
    return Math.round(base * (1 - pct / 100));
  }

  function goToStep2() {
    if (!frequency || !size) return;
    setStep(2);
  }

  function goToStep3() {
    if (!deliveryDay) return;
    setStep(3);
  }

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
              <button
                key={f.key}
                onClick={() => setFrequency(f.key)}
                style={{
                  padding: "14px 18px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer",
                  background: frequency === f.key ? "var(--green)" : "#fff",
                  color: frequency === f.key ? "#fff" : "var(--ink)",
                  border: frequency === f.key ? "1px solid var(--green)" : "1px solid var(--line)",
                  textAlign: "start",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>איזה גודל?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {SIZES.map((s) => {
              const p = priceLabel(s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => setSize(s.key)}
                  style={{
                    padding: "14px 18px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer",
                    background: size === s.key ? "var(--green)" : "#fff",
                    color: size === s.key ? "#fff" : "var(--ink)",
                    border: size === s.key ? "1px solid var(--green)" : "1px solid var(--line)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>
                    {p != null ? `החל מ-₪${p}` : ""}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={goToStep2}
            disabled={!frequency || !size}
            style={{
              width: "100%", background: "var(--green)", color: "#fff", fontSize: 16, fontWeight: 700,
              padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
              opacity: (!frequency || !size) ? 0.5 : 1,
            }}
          >
            המשך
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>באיזה יום קבוע תרצי לקבל?</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
            {(dayOptions || []).map((d) => (
              <button
                key={d.key}
                onClick={() => setDeliveryDay(d.key)}
                style={{
                  flex: 1, padding: "14px 18px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer",
                  background: deliveryDay === d.key ? "var(--green)" : "#fff",
                  color: deliveryDay === d.key ? "#fff" : "var(--ink)",
                  border: deliveryDay === d.key ? "1px solid var(--green)" : "1px solid var(--line)",
                }}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setStep(1)}
              style={{
                flex: 1, background: "#fff", color: "var(--ink)", fontSize: 15, fontWeight: 700,
                padding: "14px", borderRadius: 12, border: "1px solid var(--line)", cursor: "pointer",
              }}
            >
              חזרה
            </button>
            <button
              onClick={goToStep3}
              disabled={!deliveryDay}
              style={{
                flex: 2, background: "var(--green)", color: "#fff", fontSize: 16, fontWeight: 700,
                padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
                opacity: !deliveryDay ? 0.5 : 1,
              }}
            >
              המשך
            </button>
          </div>
        </div>
      )}

      {step > 2 && (
        <p style={{ textAlign: "center", color: "var(--muted)" }}>שלב {step} — בבנייה</p>
      )}
    </div>
  );
}
