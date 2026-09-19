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

export function middleware(request, event) {
  const res = NextResponse.next();

  // טעינה-מראש (prefetch) שהדפדפן שולח לבד ברקע - לא כניסה אמיתית, מדלגים
  if (request.headers.get("next-router-prefetch") || request.headers.get("purpose") === "prefetch") {
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
    const debugHeaders = JSON.stringify({
      rsc: request.headers.get("rsc"),
      nextRouterPrefetch: request.headers.get("next-router-prefetch"),
      nextRouterState: request.headers.get("next-router-state-tree") ? "yes" : null,
      purpose: request.headers.get("purpose"),
      secFetchMode: request.headers.get("sec-fetch-mode"),
      secFetchDest: request.headers.get("sec-fetch-dest"),
      accept: request.headers.get("accept"),
    });
    const payload = {
      visitor_id: visitorId,
      session_id: sessionId,
      path: request.nextUrl.pathname,
      referrer_host: referrerHost(referer, request.nextUrl.hostname),
      device_type: isMobileUA(ua) ? "mobile" : "desktop",
      is_new_visitor: isNewVisitor,
      debug_headers: debugHeaders,
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
