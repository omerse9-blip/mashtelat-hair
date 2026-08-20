import { createClient } from "@supabase/supabase-js";

let client = null;

// לקוח סופרבייס בהרשאות מלאות - נוצר רק בזמן קריאה בפועל, לא בטעינת הקובץ
export function getSupabaseAdmin() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("חסרים משתני סביבה: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  }
  client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}
