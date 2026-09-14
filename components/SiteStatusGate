"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const DEFAULT_MESSAGE = "כרגע איננו קולטים הזמנות חדשות מהאתר. נחזור להזמנות בהקדם. תודה על הסבלנות, עמכם הסליחה 🌹";

function formatCountdown(ms) {
  if (ms <= 0) return null;
  const totalMinutes = Math.ceil(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (days) parts.push(`${days} ${days === 1 ? "יום" : "ימים"}`);
  if (hours) parts.push(`${hours} ${hours === 1 ? "שעה" : "שעות"}`);
  if (minutes || parts.length === 0) parts.push(`${minutes} ${minutes === 1 ? "דקה" : "דקות"}`);
  return `נחזור בעוד ${parts.join(" ו-")}`;
}

export default function SiteStatusGate({ children }) {
  const [status, setStatus] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let alive = true;
    async function load() {
      const { data } = await supabase.from("site_status").select("*").eq("id", 1).maybeSingle();
      if (alive) setStatus(data);
    }
    load();
    const poll = setInterval(load, 30000);
    return () => { alive = false; clearInterval(poll); };
  }, []);

  useEffect(() => {
    if (!status?.disabled_until) return;
    const tick = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(tick);
  }, [status?.disabled_until]);

  const isDisabled = !!status?.is_disabled;
  let countdownText = null;
  if (isDisabled && status?.disabled_until) {
    const remain = new Date(status.disabled_until).getTime() - now;
    countdownText = formatCountdown(remain);
  }

  return (
    <>
      {children}
      {isDisabled && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            backgroundColor: "rgba(20,20,20,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "#fdfaf3", borderRadius: 16, padding: "28px 24px",
              maxWidth: 360, textAlign: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            }}
          >
            <p style={{ fontSize: 17, fontWeight: 600, margin: "0 0 10px", color: "#2b3a2a", fontFamily: "Rubik, sans-serif" }}>
              {status.message || DEFAULT_MESSAGE}
            </p>
            {countdownText && (
              <p style={{ fontSize: 14, color: "#6E8C58", fontWeight: 600, margin: 0, fontFamily: "Rubik, sans-serif" }}>
                {countdownText}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
