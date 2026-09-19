import { NextResponse } from "next/server";

// רישום כל כניסה אמיתית לדף באתר, ישירות מהשרת של האתר עצמו - לא תלוי בוורסל.
// רץ לפני שהדף בכלל נטען, כדי שהעוגיות (מזהה מבקר, מזהה ביקור) יהיו מוכנות
// כשה-layout נטען.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const VISITOR_COOKIE = "mh_vid";
const SESSION_COOKIE = "mh_sid";
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365; // שנה - מזהה מבקר קבוע
const SESSION_MAX_AGE = 60 * 30; // חצי שעה ללא פעילות = ביקור חדש

function isMobileUA(ua) {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua || "");
}

// מארח ההפניה (מאיפה הגיעו) - null אם ניווט פנימי באתר עצמו או שאין הפניה בכלל
function referrerHost(referer, ownHost) {
  if (!referer) return null;
  try {
    const h = new URL(referer).hostname.replace(/^www\./, "");
    if (h === ownHost) return null;
    return h;
  } catch {
    return null;
  }
}

// האם זו כניסה אמיתית של אדם, ולא טעינה-מראש ברקע (של Next או של הדפדפן עצמו)
function isRealPageView(headers) {
  if (headers.get("next-router-prefetch") || headers.get("purpose") === "prefetch") return false;

  const secFetchMode = headers.get("sec-fetch-mode");
  const secFetchDest = headers.get("sec-fetch-dest");

  // טעינה מלאה של דף - כתובת שהוקלדה, רענון, או לינק חיצוני
  if (secFetchMode === "navigate" && secFetchDest === "document") return true;

  // הערה: ניווט פנימי בתוך האתר (קליק על קישור, בלי טעינה מחדש) לא נספר כאן בכלל,
  // גם אם זו בקשת RSC אמיתית ולא prefetch - כי Next.js לפעמים מגיש אותו מהמטמון בלי
  // בקשה חדשה לשרת (אחרי prefetch), ולפעמים כן שולח בקשה. כדי שלא תהיה ספירה כפולה
  // או חוסרה, כל ניווט פנימי נספר אך ורק בצד הלקוח (SessionTracker.jsx + trackPageview)

  // דפדפן ללא כותרות Sec-Fetch (נדיר) - מניחים שזו כניסה אמיתית
  if (secFetchMode == null) return true;

  // כל השאר - טעינה-מראש שהדפדפן יוזם לבד לקישורים בדף (link rel=prefetch) - לא כניסה אמיתית
  return false;
}

// נתיבים שרובוטי סריקה אוטומטיים מנסים (חיפוש קבצי סודות/פאנלים ישנים) -
// לא ביקורים אמיתיים, לא נרצה לרשום אותם באנליטיקס בכלל
function isBotScan(pathname) {
  if (/(^|\/)\.[^/]+/.test(pathname)) return true; // כל קובץ/תיקייה שמתחילים בנקודה, כמו .env או .git
  return /^\/(wp-admin|wp-login\.php|phpmyadmin|admin|xmlrpc\.php)/i.test(pathname);
}

export function middleware(request, event) {
  const res = NextResponse.next();

  if (isBotScan(request.nextUrl.pathname)) {
    return res;
  }

  if (!isRealPageView(request.headers)) {
    return res;
  }

  const cookieStore = request.cookies;
  let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
  let isNewVisitor = false;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    isNewVisitor = true;
  }
  res.cookies.set(VISITOR_COOKIE, visitorId, { maxAge: VISITOR_MAX_AGE, path: "/", sameSite: "lax" });

  let sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) sessionId = crypto.randomUUID();
  res.cookies.set(SESSION_COOKIE, sessionId, { maxAge: SESSION_MAX_AGE, path: "/", sameSite: "lax" });

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const ua = request.headers.get("user-agent");
    const referer = request.headers.get("referer");
    const payload = {
      visitor_id: visitorId,
      session_id: sessionId,
      path: request.nextUrl.pathname,
      referrer_host: referrerHost(referer, request.nextUrl.hostname),
      device_type: isMobileUA(ua) ? "mobile" : "desktop",
      is_new_visitor: isNewVisitor,
    };

    const insertPromise = fetch(`${SUPABASE_URL}/rest/v1/site_visits`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    }).catch(() => {});

    if (event && typeof event.waitUntil === "function") {
      event.waitUntil(insertPromise);
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map|txt|xml)$).*)",
  ],
};
