import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { cardcomConfig, createLowProfile } from "../../../../lib/cardcom";

export async function POST(req) {
  const supabaseAdmin = getSupabaseAdmin();
  const body = await req.json();
  const { details, items } = body || {};

  if (!details?.customer_name?.trim() || !details?.customer_phone?.trim()) {
    return NextResponse.json({ error: "חסרים פרטי לקוח" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "העגלה ריקה" }, { status: 400 });
  }

  const { data: orderNumber, error: orderErr } = await supabaseAdmin.rpc("create_public_order", {
    p_customer_name: details.customer_name,
    p_customer_phone: details.customer_phone,
    p_customer_address: details.customer_address || "",
    p_is_gift: details.is_gift,
    p_recipient_name: details.recipient_name || "",
    p_recipient_phone: details.recipient_phone || "",
    p_recipient_address: details.recipient_address || "",
    p_notes: details.notes || "",
    p_items: items,
    p_fulfillment_type: details.fulfillment_type || "delivery",
    p_delivery_date: details.delivery_date || null,
    p_delivery_window: details.delivery_window || "",
    p_greeting: details.greeting || "",
    p_delivery_sub_type: details.delivery_sub_type || null,
    p_delivery_fee: details.delivery_fee || 0,
  });
  if (orderErr) {
    console.error("[cardcom] order creation failed", orderErr);
    return NextResponse.json({ error: "שגיאה ביצירת ההזמנה" }, { status: 500 });
  }

  const amount = Number(
    items.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0).toFixed(2)
  );

  const products = items.map((it) => ({
    Description: it.sizeLabel ? `${it.name} (${it.sizeLabel})` : it.name,
    UnitCost: Number(it.price),
    Quantity: Number(it.quantity),
  }));

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const cfg = cardcomConfig();

  const payload = {
    TerminalNumber: cfg.terminalNumber,
    ApiName: cfg.apiName,
    Operation: cfg.operation,
    ReturnValue: String(orderNumber),
    Amount: amount,
    SuccessRedirectUrl: `${origin}/checkout/success?order=${orderNumber}`,
    FailedRedirectUrl: `${origin}/checkout/failed?order=${orderNumber}`,
    WebHookUrl: `${origin}/api/cardcom/webhook`,
    Language: "he",
    ISOCoinId: 1,
    UIDefinition: {
      CardOwnerNameValue: details.customer_name,
      CardOwnerPhoneValue: details.customer_phone,
    },
    Document: {
      DocumentTypeToCreate: "Auto",
      IsAllowEditDocument: true,
      Name: details.customer_name,
      Mobile: details.customer_phone,
      Language: "he",
      Products: products,
    },
  };

  let result;
  try {
    result = await createLowProfile(payload);
  } catch (e) {
    console.error("[cardcom] create low profile network error", e);
    return NextResponse.json({ error: "שגיאת תקשורת מול ספק הסליקה" }, { status: 500 });
  }

  if (result.ResponseCode !== 0) {
    console.error("[cardcom][CRITICAL] create low profile failed", { orderNumber, description: result.Description });
    await supabaseAdmin.from("orders").update({
      payment_status: "error",
      cardcom_description: result.Description || "",
    }).eq("order_number", orderNumber);
    return NextResponse.json(
      { error: "מצטערים, אירעה שגיאת שרת, נסו שוב בעוד כמה רגעים, ואם השגיאה חוזרת צרו איתנו קשר" },
      { status: 502 }
    );
  }

  const { error: updateErr } = await supabaseAdmin.from("orders").update({
    cardcom_low_profile_id: result.LowProfileId,
    cardcom_operation: cfg.operation,
    payment_status: "awaiting_payment",
  }).eq("order_number", orderNumber);

  if (updateErr) {
    console.error("[cardcom] failed saving LowProfileId", updateErr);
    return NextResponse.json({ error: "שגיאה בשמירת פרטי התשלום" }, { status: 500 });
  }

  return NextResponse.json({ url: result.Url, orderNumber });
}
