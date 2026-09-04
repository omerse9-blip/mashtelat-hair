import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { cardcomConfig, createLowProfile } from "../../../../lib/cardcom";

export async function POST(req) {
  const supabaseAdmin = getSupabaseAdmin();
  const body = await req.json();

  // תמיכה בשני המבנים: groups (מסירות מרובות) או details+items (מסירה אחת)
  const groups = Array.isArray(body?.groups) && body.groups.length
    ? body.groups
    : (body?.details && Array.isArray(body?.items)
      ? [{ details: body.details, items: body.items, deliveryFee: body.details.delivery_fee || 0, feeLabel: "דמי משלוח" }]
      : null);

  if (!groups) {
    return NextResponse.json({ error: "נתוני ההזמנה חסרים" }, { status: 400 });
  }

  const first = groups[0].details || {};
  if (!first.customer_name?.trim() || !first.customer_phone?.trim()) {
    return NextResponse.json({ error: "חסרים פרטי לקוח" }, { status: 400 });
  }
  for (const g of groups) {
    if (!Array.isArray(g.items) || g.items.length === 0) {
      return NextResponse.json({ error: "העגלה ריקה" }, { status: 400 });
    }
  }

  // יצירת הזמנה לכל מסירה
  const orderNumbers = [];
  for (const g of groups) {
    const d = g.details || {};
    const { data: orderNumber, error: orderErr } = await supabaseAdmin.rpc("create_public_order", {
      p_customer_name: d.customer_name,
      p_customer_phone: d.customer_phone,
      p_customer_address: d.customer_address || "",
      p_is_gift: d.is_gift,
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
    if (orderErr) {
      console.error("[cardcom] order creation failed", orderErr);
      return NextResponse.json({ error: "שגיאה ביצירת ההזמנה" }, { status: 500 });
    }
    orderNumbers.push(orderNumber);
  }

  // סכום כולל: פריטים של כל המסירות + דמי משלוח של כל מסירה
  let amount = 0;
  const products = [];
  for (const g of groups) {
    for (const it of g.items) {
      amount += Number(it.price) * Number(it.quantity);
      products.push({
        Description: it.sizeLabel ? `${it.name} (${it.sizeLabel})` : it.name,
        UnitCost: Number(it.price),
        Quantity: Number(it.quantity),
      });
    }
    const fee = Number(g.deliveryFee || 0);
    if (fee > 0) {
      amount += fee;
      products.push({
        Description: g.feeLabel || "דמי משלוח",
        UnitCost: fee,
        Quantity: 1,
      });
    }
  }
  amount = Number(amount.toFixed(2));

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const cfg = cardcomConfig();
  const returnValue = orderNumbers.join(",");
  const orderParam = encodeURIComponent(returnValue);

  const payload = {
    TerminalNumber: cfg.terminalNumber,
    ApiName: cfg.apiName,
    Operation: cfg.operation,
    ReturnValue: returnValue,
    Amount: amount,
    SuccessRedirectUrl: `${origin}/checkout/success?order=${orderParam}`,
    FailedRedirectUrl: `${origin}/checkout/failed?order=${orderParam}`,
    WebHookUrl: `${origin}/api/cardcom/webhook`,
    Language: "he",
    ISOCoinId: 1,
    UIDefinition: {
      CardOwnerNameValue: first.customer_name,
      CardOwnerPhoneValue: first.customer_phone,
    },
    Document: {
      DocumentTypeToCreate: "Auto",
      IsAllowEditDocument: true,
      Name: first.customer_name,
      Mobile: first.customer_phone,
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
    console.error("[cardcom][CRITICAL] create low profile failed", { orderNumbers, description: result.Description });
    await supabaseAdmin.from("orders").update({
      payment_status: "error",
      cardcom_description: result.Description || "",
    }).in("order_number", orderNumbers);
    return NextResponse.json(
      { error: "מצטערים, אירעה שגיאת שרת, נסו שוב בעוד כמה רגעים, ואם השגיאה חוזרת צרו איתנו קשר" },
      { status: 502 }
    );
  }

  const { error: updateErr } = await supabaseAdmin.from("orders").update({
    cardcom_low_profile_id: result.LowProfileId,
    cardcom_operation: cfg.operation,
    payment_status: "awaiting_payment",
  }).in("order_number", orderNumbers);

  if (updateErr) {
    console.error("[cardcom] failed saving LowProfileId", updateErr);
    return NextResponse.json({ error: "שגיאה בשמירת פרטי התשלום" }, { status: 500 });
  }

  return NextResponse.json({ url: result.Url, orderNumber: orderNumbers[0], orderNumbers });
}
