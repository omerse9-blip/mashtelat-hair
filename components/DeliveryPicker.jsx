"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDelivery } from "./DeliveryProvider";
import { getDeliveryOptions } from "../lib/siteData";

const BTN_BG = "#fbf8f1";
const BTN_BORDER = "#ece3d4";
const QUICK_LABELS = ["היום", "מחר", "מחרתיים"];

function TruckIcon({ color = "#111" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "scaleX(-1)", flexShrink: 0 }}>
      <path d="M1 3h13v13H1z" />
      <path d="M14 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="1.8" />
      <circle cx="17.5" cy="18.5" r="1.8" />
    </svg>
  );
}

function StorePinIcon({ color = "#111" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M3 9.5 12 3l9 6.5" />
      <path d="M5 9.5V20h5v-6h4v6h5V9.5" />
      <path d="M9.5 9.5h5" />
    </svg>
  );
}

export default function DeliveryPicker({ scrollTargetId }) {
  const { delivery, setDelivery, ready } = useDelivery();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState("method");

  const [tMethod, setTMethod] = useState(null);
  const [tDate, setTDate] = useState("");
  const [tWindow, setTWindow] = useState("");
  const [tDateLabel, setTDateLabel] = useState("");
  const [tStreet, setTStreet] = useState("");
  const [tHouse, setTHouse] = useState("");

  const [options, setOptions] = useState([]);
  const [showAllDates, setShowAllDates] = useState(false);
  const [addrErr, setAddrErr] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    window.history.pushState({ deliveryModal: true }, "");
    const onPop = () => setOpen(false);
    window.addEventListener("popstate", onPop);
    document.body.style.overflow = "hidden";
    getDeliveryOptions(14).then((opts) => setOptions(opts || [])).catch(() => setOptions([]));
    return () => {
      window.removeEventListener("popstate", onPop);
      document.body.style.overflow = "";
    };
  }, [open]);

  function openModal() {
    setTMethod(delivery.method || null);
    setTDate(delivery.date || "");
    setTWindow(delivery.window || "");
    setTDateLabel(delivery.dateLabel || "");
    setTStreet(delivery.street || "");
    setTHouse(delivery.houseNumber || "");
    setStep("method");
    setShowAllDates(false);
    setAddrErr("");
    setOpen(true);
  }

  function closeModal() {
    if (window.history.state && window.history.state.deliveryModal) {
      window.history.back();
    } else {
      setOpen(false);
    }
  }

  function pickMethod(val) {
    setTMethod(val);
    setStep("date");
  }

  function pickQuickDate(opt, label) {
    setTDate(opt.date);
    setTDateLabel(label);
    setTWindow(opt.windows[0] || "");
    setShowAllDates(false);
  }

  function pickFromList(dateVal) {
    const opt = options.find((o) => o.date === dateVal);
    setTDate(dateVal);
    setTDateLabel(opt?.label || "");
    setTWindow(opt?.windows[0] || "");
  }

  function goNextFromDate() {
    if (!tDate || !tWindow) return;
    if (tMethod === "delivery") {
      setStep("address");
    } else {
      finish();
    }
  }

  function finish() {
    if (tMethod === "delivery" && (!tStreet.trim() || !tHouse.trim())) {
      setAddrErr("יש למלא רחוב ומספר בית.");
      return;
    }
    setDelivery({
      method: tMethod,
      date: tDate,
      window: tWindow,
      dateLabel: tDateLabel,
      street: tMethod === "delivery" ? tStreet.trim() : "",
      houseNumber: tMethod === "delivery" ? tHouse.trim() : "",
    });
    closeModal();
    setTimeout(() => {
      const el = scrollTargetId ? document.getElementById(scrollTargetId) : null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
  }

  if (!ready) return null;

  const currentDay = options.find((o) => o.date === tDate);

  let summary = "בחרו כתובת ותאריך למשלוח";
  if (delivery.method === "pickup") {
    summary = `איסוף עצמי · ${delivery.dateLabel || delivery.date} · ${delivery.window ? delivery.window.replace("-", ":00-") + ":00" : ""}`;
  } else if (delivery.method === "delivery") {
    summary = `משלוח · ${delivery.dateLabel || delivery.date} · ${delivery.window ? delivery.window.replace("-", ":00-") + ":00" : ""} · ${delivery.street} ${delivery.houseNumber}`;
  }

  const modal = (
    <div
      onClick={closeModal}
      style={{ position: "fixed", inset: 0, background: "rgba(33,58,45,0.45)", backdropFilter: "blur(2px)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, minHeight: "52vh", maxHeight: "88vh", overflowY: "auto",
          background: "#f7f2e9", borderRadius: "20px 20px 0 0", boxShadow: "0 0 50px rgba(0,0,0,0.25)",
          padding: "20px 20px 28px", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ position: "relative", marginBottom: 24 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 20, color: "var(--green)", marginBottom: 4 }}>אופן אספקת המוצרים</p>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>בחרו את השיטה הנוחה לכם</p>
          </div>
          <button
            onClick={closeModal}
            aria-label="Close"
            style={{ position: "absolute", top: 0, right: 0, width: 34, height: 34, borderRadius: 999, border: "none", background: BTN_BG, color: "var(--ink)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ✕
          </button>
        </div>

        {step === "method" ? (
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => pickMethod("delivery")}
              style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 10, minWidth: 190, padding: "16px 18px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", background: tMethod === "delivery" ? "var(--green)" : "#fff", color: tMethod === "delivery" ? "#fff" : "var(--ink)", border: tMethod === "delivery" ? "1px solid var(--green)" : "1px solid var(--line)" }}
            >
              <TruckIcon color={tMethod === "delivery" ? "#fff" : "#111"} />
              <span>משלוח על ידי שליח</span>
            </button>
            <button
              onClick={() => pickMethod("pickup")}
              style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 10, minWidth: 190, padding: "16px 18px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", background: tMethod === "pickup" ? "var(--green)" : "#fff", color: tMethod === "pickup" ? "#fff" : "var(--ink)", border: tMethod === "pickup" ? "1px solid var(--green)" : "1px solid var(--line)" }}
            >
              <StorePinIcon color={tMethod === "pickup" ? "#fff" : "#111"} />
              <span>איסוף עצמי</span>
            </button>
          </div>
        ) : null}

        {step === "date" ? (
          <div>
            {options.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>אין מועדים זמינים כרגע.</p>
            ) : (
              <>
                {!showAllDates ? (
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    {options.slice(0, 3).map((o, i) => (
                      <button
                        key={o.date}
                        onClick={() => pickQuickDate(o, QUICK_LABELS[i])}
                        style={{ flex: 1, padding: "12px 6px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", background: tDate === o.date ? "var(--green)" : "#fff", color: tDate === o.date ? "#fff" : "var(--ink)", border: tDate === o.date ? "1px solid var(--green)" : "1px solid var(--line)" }}
                      >
                        {QUICK_LABELS[i]}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowAllDates(true)}
                      style={{ flexShrink: 0, padding: "12px 14px", borderRadius: 12, fontSize: 18, cursor: "pointer", background: "#fff", border: "1px solid var(--line)" }}
                      aria-label="תאריך אחר"
                    >
                      📅
                    </button>
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <select
                      value={tDate}
                      onChange={(e) => pickFromList(e.target.value)}
                      style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15, background: "#fff", marginBottom: 8 }}
                    >
                      <option value="">בחירת תאריך</option>
                      {options.map((o) => <option key={o.date} value={o.date}>{o.label}</option>)}
                    </select>
                    <button onClick={() => setShowAllDates(false)} style={{ background: "none", border: "none", color: "var(--green)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      חזרה לבחירה מהירה
                    </button>
                  </div>
                )}

                {tDate ? (
                  <>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>שעה</label>
                    <div dir="ltr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                      {(currentDay?.windows || []).map((w) => (
                        <button
                          key={w}
                          onClick={() => setTWindow(w)}
                          style={{ padding: "11px 8px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", background: tWindow === w ? "var(--green)" : "#fff", color: tWindow === w ? "#fff" : "var(--ink)", border: tWindow === w ? "1px solid var(--green)" : "1px solid var(--line)" }}
                        >
                          {w.replace("-", ":00-") + ":00"}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}

                <button
                  onClick={goNextFromDate}
                  disabled={!tDate || !tWindow}
                  style={{ width: "100%", background: "var(--green)", color: "#fff", fontSize: 16, fontWeight: 700, padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", opacity: (!tDate || !tWindow) ? 0.5 : 1 }}
                >
                  {tMethod === "delivery" ? "המשך" : "המשך להזמנה"}
                </button>
              </>
            )}
          </div>
        ) : null}

        {step === "address" ? (
          <div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>רחוב *</label>
              <input
                value={tStreet}
                onChange={(e) => setTStreet(e.target.value)}
                placeholder="שם הרחוב"
                style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15 }}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>מספר בית *</label>
              <input
                value={tHouse}
                onChange={(e) => setTHouse(e.target.value)}
                placeholder="מספר"
                style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15 }}
              />
            </div>
            {addrErr ? <p style={{ color: "#b3261e", fontSize: 14, marginBottom: 14 }}>{addrErr}</p> : null}
            <button
              onClick={finish}
              style={{ width: "100%", background: "var(--green)", color: "#fff", fontSize: 16, fontWeight: 700, padding: "14px", borderRadius: 12, border: "none", cursor: "pointer" }}
            >
              המשך להזמנה
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <button
        onClick={openModal}
        style={{
          display: "inline-flex", alignItems: "center", maxWidth: "100%",
          padding: "11px 18px", borderRadius: 999, border: "none", background: "var(--green)",
          boxShadow: "0 2px 6px rgba(63,122,82,0.25)", cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{summary}</span>
      </button>

      {open && mounted ? createPortal(modal, document.body) : null}
    </div>
  );
}
