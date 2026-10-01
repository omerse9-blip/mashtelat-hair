import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { priceGroups, PricingError } from "../../../lib/orderPricing";

// הזמנה לתשלום אחר כך (בלי סליקה מקוונת). המחירים ודמי המשלוח נקבעים בשרת מהמסד.
export async function POST(req) {
  const supabaseAdmin = getSupabaseAdmin();
  const created = [];

  async function deleteCreated() {
    if (!created.length) return;
    try {
      const { data: rows } = await supabaseAdmin.from("orders").select("id").in("order_number", created);
      const ids = (rows || []).map((r) => r.id);
      if (ids.length) {
        await supabaseAdmin.from("order_items").delete().in("order_id", ids);
        await supabaseAdmin.from("orders").delete().in("id", ids);
      }
    } catch (cleanupErr) {
      console.error("[orders][CRITICAL] cleanup failed", { created, cleanupErr });
    }
  }

  try {
    const body = await req.json();
    const rawGroups = Array.isArray(body?.groups) ? body.groups : null;
    if (!rawGroups || rawGroups.length === 0) {
      return NextResponse.json({ error: "נתוני ההזמנה חסרים" }, { status: 400 });
    }

    const first = rawGroups[0]?.details || {};
    if (!String(first.customer_name || "").trim() || !String(first.customer_phone || "").trim()) {
      return NextResponse.json({ error: "חסרים פרטי לקוח" }, { status: 400 });
    }

    const groups = await priceGroups(supabaseAdmin, rawGroups, { requireOnline: false });

    for (const g of groups) {
      const d = g.details || {};
      const { data: orderNumber, error } = await supabaseAdmin.rpc("create_public_order", {
        p_customer_name: d.customer_name,
        p_customer_phone: d.customer_phone,
        p_customer_address: d.customer_address || "",
        p_is_gift: !!d.is_gift,
        p_recipient_name: d.recipient_name || "",
        p_recipient_phone: d.recipient_phone || "",
        p_recipient_address: d.recipient_address || "",
        p_notes: d.notes || "",
        p_items: g.items,
        p_fulfillment_type: d.fulfillment_type || "delivery",
        p_delivery_date: d.delivery_date || null,
        p_delivery_window: d.delivery_window || "",
        p_greeting: d.greeting || "",
        p_delivery_sub_type: d.delivery_sub_type || null,
        p_delivery_fee: d.delivery_fee || 0,
      });
      if (error) {
        console.error("[orders] order creation failed", error);
        await deleteCreated();
        return NextResponse.json({ error: "שגיאה ביצירת ההזמנה" }, { status: 500 });
      }
      created.push(orderNumber);
    }

    return NextResponse.json({ orderNumbers: created });
  } catch (err) {
    await deleteCreated();
    if (err instanceof PricingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[orders] unexpected failure", err);
    return NextResponse.json({ error: "אירעה שגיאה בשליחה. נסו שוב." }, { status: 500 });
  }
}
