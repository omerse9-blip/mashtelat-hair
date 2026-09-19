export const VISITOR_COOKIE = "mh_vid";
export const SESSION_COOKIE = "mh_sid";

export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function isMobileUA() {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
}

function sendBeaconOrFetch(body) {
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch { /* התעלמות */ }
}

export function trackEvent(type) {
  const sessionId = getCookie(SESSION_COOKIE);
  const visitorId = getCookie(VISITOR_COOKIE);
  if (!sessionId || !visitorId) return;
  sendBeaconOrFetch(JSON.stringify({ type, session_id: sessionId, visitor_id: visitorId }));
}

// ניווט פנימי אמיתי בתוך האתר (SPA, בלי טעינה מחדש של הדף) - המידלוור לא תמיד
// רואה בקשה חדשה במקרה כזה (הדף כבר נטען מראש בזיכרון), אז מדווחים על זה מכאן.
// זה חייב להיות המקור היחיד לניווט פנימי (המידלוור לא סופר אותו בכלל), כדי שלא
// תהיה ספירה כפולה.
export function trackPageview(path) {
  const sessionId = getCookie(SESSION_COOKIE);
  const visitorId = getCookie(VISITOR_COOKIE);
  if (!sessionId || !visitorId) return;
  sendBeaconOrFetch(JSON.stringify({
    type: "pageview",
    session_id: sessionId,
    visitor_id: visitorId,
    path,
    device_type: isMobileUA() ? "mobile" : "desktop",
  }));
}
