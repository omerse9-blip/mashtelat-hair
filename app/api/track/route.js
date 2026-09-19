const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const runtime = "edge";

async function insert(table, payload) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const { type, session_id, visitor_id, path, duration_ms, device_type } = body || {};
  if (!type || !session_id) return new Response(null, { status: 204 });

  if (type === "duration") {
    if (!path || !Number.isFinite(duration_ms) || duration_ms <= 0) return new Response(null, { status: 204 });
    await insert("site_visit_durations", { session_id, path, duration_ms: Math.round(duration_ms) });
  } else if (type === "cart_add" || type === "order_complete") {
    if (!visitor_id) return new Response(null, { status: 204 });
    await insert("site_cart_events", { session_id, visitor_id, event_type: type });
  } else if (type === "pageview") {
    // ניווט פנימי אמיתי בין דפים באתר (SPA) - ראו הערה ב-lib/tracking.js
    if (!visitor_id || !path) return new Response(null, { status: 204 });
    await insert("site_visits", {
      visitor_id,
      session_id,
      path,
      referrer_host: null,
      device_type: device_type === "mobile" ? "mobile" : "desktop",
      is_new_visitor: false,
    });
  }

  return new Response(null, { status: 204 });
}
