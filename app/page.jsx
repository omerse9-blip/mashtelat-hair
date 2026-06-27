import { supabase } from "../lib/supabaseClient";

export const revalidate = 0;

export default async function HomePage() {
  let status = "ok";
  let count = 0;
  let detail = "";

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, kind")
      .limit(5);
    if (error) throw error;
    count = (data || []).length;
    detail = JSON.stringify(data, null, 2);
  } catch (e) {
    status = "error";
    detail = JSON.stringify({
      name: e?.name,
      message: e?.message,
      code: e?.code,
      details: e?.details,
      hint: e?.hint,
      keys: Object.keys(e || {}),
      raw: String(e),
    }, null, 2);
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <p style={{ color: "var(--green)", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>משתלת העיר</p>
      <h1 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
        כל הצמחים, במקום אחד.
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 18, marginBottom: 40 }}>
        עצים, שיחים, צמחי נוי וכלי גינון — האתר בהקמה.
      </p>

      <div style={{ display: "inline-block", padding: "12px 20px", borderRadius: 999, background: status === "ok" ? "var(--green-soft)" : "#fdecec", color: status === "ok" ? "var(--green)" : "#b3261e", fontWeight: 600 }}>
        {status === "ok" ? `מחובר ל-Supabase · ${count} מחלקות` : "אין חיבור ל-Supabase"}
      </div>

      <pre style={{ marginTop: 20, padding: 16, background: "#faf7f7", border: "1px solid #eee", borderRadius: 10, textAlign: "start", direction: "ltr", fontSize: 13, color: status === "ok" ? "#3f7a52" : "#b3261e", whiteSpace: "pre-wrap" }}>
        {detail}
      </pre>
    </main>
  );
}
