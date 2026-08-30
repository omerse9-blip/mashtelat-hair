"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

const FREQ_LABEL_BY_KEY = { monthly: "חודשי", biweekly: "דו שבועי", weekly: "שבועי" };
const SIZE_LABEL_BY_KEY = { small: "קטן", medium: "בינוני", large: "גדול" };
const DAY_LABEL_BY_KEY = {
  sunday: "ראשון", monday: "שני", tuesday: "שלישי",
  wednesday: "רביעי", thursday: "חמישי", friday: "שישי",
};
const STATUS_LABELS = {
  pending_payment: { label: "ממתין לתשלום", color: "var(--muted)" },
  active: { label: "פעיל", color: "var(--green)" },
  pending_cancellation: { label: "ממתין לביטול", color: "#c17a4f" },
  cancelled: { label: "מבוטל", color: "var(--muted)" },
};
const CANCEL_REASONS = [
  { key: "price", label: "מחיר" },
  { key: "taste", label: "הזרים לא תאמו את הטעם שלי" },
  { key: "service", label: "חוויית השירות לא הייתה כמו שציפיתי" },
  { key: "other", label: "נשמח לשמוע במילים שלך למה ביטלת" },
];

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export default function AccountPage() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [subs, setSubs] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data?.session || null);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { alive = false; listener?.subscription?.unsubscribe(); };
  }, []);

  const loadSubs = useCallback(async (userId) => {
    setLoadingSubs(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("auth_user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      setSubs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubs(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) loadSubs(session.user.id);
  }, [session, loadSubs]);

  async function signInWithGoogle() {
    setSigningIn(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.href },
      });
    } catch {
      alert("שגיאה בהתחברות. נסי שוב.");
      setSigningIn(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSubs([]);
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 26, fontWeight: 700, color: "var(--ink)", textAlign: "center", marginBottom: 24 }}>
        האזור שלי
      </h1>

      {checkingSession ? (
        <p style={{ textAlign: "center", color: "var(--muted)" }}>בודקת חיבור...</p>
      ) : !session ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "var(--ink)", marginBottom: 16 }}>
            כדי לראות את המנוי שלך, צריך להתחבר
          </p>
          <button onClick={signInWithGoogle} disabled={signingIn}
            style={{ background: "#fff", color: "var(--ink)", fontSize: 15, fontWeight: 700,
              padding: "13px 24px", borderRadius: 12, border: "1px solid var(--line)", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span>🔵</span>
            <span>{signingIn ? "מעבירה..." : "המשך עם Google"}</span>
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>{session.user.email}</p>
            <button onClick={signOut} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              התנתקות
            </button>
          </div>

          {loadingSubs ? (
            <p style={{ textAlign: "center", color: "var(--muted)" }}>טוענת...</p>
          ) : subs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <p style={{ fontSize: 15, color: "var(--ink)", marginBottom: 14 }}>עדיין אין לך מנוי פעיל</p>
              <Link href="/" style={{ color: "var(--green)", fontWeight: 700, fontSize: 14 }}>לגלות את מנוי הפריחה שלך</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {subs.map((s) => (
                <SubscriptionCard key={s.id} sub={s} onCancelClick={() => setCancelTargetId(s.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {cancelTargetId && (
        <CancelModal
          subscriptionId={cancelTargetId}
          onClose={() => setCancelTargetId(null)}
          onDone={async () => {
            setCancelTargetId(null);
            if (session?.user?.id) await loadSubs(session.user.id);
          }}
        />
      )}
    </main>
  );
}

function SubscriptionCard({ sub, onCancelClick }) {
  const statusInfo = STATUS_LABELS[sub.status] || STATUS_LABELS.active;
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>מנוי הפריחה שלך</p>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: statusInfo.color, padding: "3px 10px", borderRadius: 999 }}>
          {statusInfo.label}
        </span>
      </div>

      <InfoLine label="גודל" value={SIZE_LABEL_BY_KEY[sub.size] || sub.size} />
      <InfoLine label="תדירות" value={FREQ_LABEL_BY_KEY[sub.frequency] || sub.frequency} />
      <InfoLine label="יום משלוח" value={DAY_LABEL_BY_KEY[sub.delivery_day] || sub.delivery_day} />
      <InfoLine label="כתובת" value={sub.customer_address || (sub.is_gift ? sub.recipient_address : "")} />
      {sub.next_billing_date && <InfoLine label="חיוב הבא" value={formatDate(sub.next_billing_date)} />}
      <InfoLine label="קו מנחה" value={sub.surprise_me ? "תפתיעו אותי" : `${(sub.preferred_bouquet_ids || []).length} סגנונות נבחרו`} />

      {sub.status === "cancelled" && (sub.cancel_reason_category || sub.cancel_reason_text) && (
        <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "#FBF2EF", fontSize: 13, color: "var(--ink)" }}>
          <span style={{ fontWeight: 700, color: "#c17a4f" }}>סיבת ביטול: </span>
          {CANCEL_REASONS.find((c) => c.key === sub.cancel_reason_category)?.label || sub.cancel_reason_category}
          {sub.cancel_reason_text ? ` — ${sub.cancel_reason_text}` : ""}
        </div>
      )}

      {(sub.status === "active" || sub.status === "pending_payment") && (
        <button onClick={onCancelClick}
          style={{ marginTop: 14, width: "100%", padding: "11px", borderRadius: 11, fontSize: 14, fontWeight: 700,
            background: "#fff", color: "#c17a4f", border: "1px solid #c17a4f", cursor: "pointer" }}>
          ביטול מנוי
        </button>
      )}
    </div>
  );
}

function InfoLine({ label, value }) {
  if (!value) return null;
  return (
    <p style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "4px 0" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ color: "var(--ink)", fontWeight: 600 }}>{value}</span>
    </p>
  );
}

function CancelModal({ subscriptionId, onClose, onDone }) {
  const [reasonKey, setReasonKey] = useState("");
  const [freeText, setFreeText] = useState("");
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          cancel_reason_category: reasonKey || null,
          cancel_reason_text: reasonKey === "other" ? freeText.trim() || null : null,
        })
        .eq("id", subscriptionId);
      if (error) throw new Error(error.message);
      onDone();
    } catch (e) {
      alert(e.message || "שגיאה בביטול");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(43,58,42,0.45)" }}>
      <div style={{ width: "100%", maxWidth: 380, borderRadius: 16, padding: 18, background: "#fff", maxHeight: "88vh", overflowY: "auto" }}>
        <h3 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 17, fontWeight: 700, color: "var(--ink)", textAlign: "center", marginBottom: 14 }}>
          ביטול מנוי
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {CANCEL_REASONS.map((r) => {
            const selected = reasonKey === r.key;
            return (
              <button key={r.key} onClick={() => setReasonKey(r.key)}
                style={{ width: "100%", textAlign: "start", padding: "10px 12px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  background: selected ? "var(--green)" : "#fff", color: selected ? "#fff" : "var(--ink)",
                  border: selected ? "1px solid var(--green)" : "1px solid var(--line)" }}>
                {r.label}
              </button>
            );
          })}
        </div>

        {reasonKey === "other" && (
          <textarea value={freeText} onChange={(e) => setFreeText(e.target.value)} rows={3} autoFocus
            placeholder="ספרי לנו במילים שלך..."
            style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", fontSize: 14, marginBottom: 12, resize: "vertical", fontFamily: "inherit" }} />
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} disabled={busy}
            style={{ flex: 1, padding: "11px", borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: "pointer", background: "#fff", color: "var(--ink)", border: "1px solid var(--line)" }}>
            חזרה
          </button>
          <button onClick={confirm} disabled={busy}
            style={{ flex: 1, padding: "11px", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "pointer", background: "#c17a4f", color: "#fff", border: "none", opacity: busy ? 0.6 : 1 }}>
            {busy ? "מבטלת..." : "אישור הביטול"}
          </button>
        </div>
      </div>
    </div>
  );
}
