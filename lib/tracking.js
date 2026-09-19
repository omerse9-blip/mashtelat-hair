// עזרים משותפים למעקב אנליטיקס בצד הדפדפן (בלי ספריות חיצוניות, בלי וורסל)

export const VISITOR_COOKIE = "mh_vid";
export const SESSION_COOKIE = "mh_sid";

export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

// שולחת אירוע (הוספה לעגלה / השלמת הזמנה) לשרת שלנו - לא ישירות ל-Supabase,
// כי צריך את מפתח ה-API שלא נחשוף בדפדפן
export function trackEvent(type) {
  try {
    const sessionId = getCookie(SESSION_COOKIE);
    const visitorId = getCookie(VISITOR_COOKIE);
    if (!sessionId || !visitorId) return;
    const body = JSON.stringify({ type, session_id: sessionId, visitor_id: visitorId });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch { /* התעלמות */ }
}
