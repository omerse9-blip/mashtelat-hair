"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getCookie, SESSION_COOKIE } from "../lib/tracking";

// עוקב אחרי כמה זמן המבקר שוהה בכל דף, ושולח את זה לשרת כשעוזב את הדף
// (או עובר לדף אחר באתר, או סוגר את הטאב)
export default function SessionTracker() {
  const pathname = usePathname();
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();

    function send() {
      const sessionId = getCookie(SESSION_COOKIE);
      if (!sessionId) return;
      const duration = Date.now() - startRef.current;
      if (duration < 500) return; // רגע חטוף מדי, לא רלוונטי
      const body = JSON.stringify({ type: "duration", session_id: sessionId, path: pathname, duration_ms: duration });
      try {
        navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      } catch { /* התעלמות */ }
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") send();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", send);

    return () => {
      send(); // ניווט פנימי לדף הבא - שולחים את זמן השהות בדף הקודם
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", send);
    };
  }, [pathname]);

  return null;
}
