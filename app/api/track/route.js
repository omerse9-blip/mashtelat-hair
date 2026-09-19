// נקודת קצה שמקבלת אותות מהדפדפן (זמן שהות בדף, הוספה לעגלה, השלמת הזמנה)
// ורושמת אותם ב-Supabase. הדפדפן לא מדבר ישירות עם Supabase כדי לא לחשוף מפתחות.

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

  const { type, session_id, visitor_id, path, duration_ms } = body || {};
  if (!type || !session_id) return new Response(null, { status: 204 });

  if (type === "duration") {
    if (!path || !Number.isFinite(duration_ms) || duration_ms <= 0) return new Response(null, { status: 204 });
    await insert("site_visit_durations", { session_id, path, duration_ms: Math.round(duration_ms) });
  } else if (type === "cart_add" || type === "order_complete") {
    if (!visitor_id) return new Response(null, { status: 204 });
    await insert("site_cart_events", { session_id, visitor_id, event_type: type });
  }

  return new Response(null, { status: 204 });
}
