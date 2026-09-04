import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { cardcomConfig, getLpResult } from "../../../../lib/cardcom";

export async function POST(req) {
  const supabaseAdmin = getSupabaseAdmin();
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const lowProfileId = body?.LowProfileId;
  if (!lowProfileId) {
    return NextResponse.json({ error: "missing LowProfileId" }, { status: 400 });
  }

  // תשלום אחד יכול לכסות כמה הזמנות (מסירות במועדים שונים)
  const { data: orders, error: findErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("cardcom_low_profile_id", lowProfileId);

  if (findErr || !orders || orders.length === 0) {
    console.error("[cardcom][CRITICAL] webhook order not found", { lowProfileId, findErr });
    return NextResponse.json({ ok: true });
  }

  const pending = orders.filter((o) => !o.cardcom_tranzaction_id);
  if (pending.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const cfg = cardcomConfig();
  let result;
  try {
    result = await getLpResult({
      TerminalNumber: cfg.terminalNumber,
      ApiName: cfg.apiName,
      LowProfileId: lowProfileId,
    });
  } catch (e) {
    console.error("[cardcom] GetLpResult failed after retry", e);
    return NextResponse.json({ error: "validation failed" }, { status: 500 });
  }

  const tokenInfo = result.TokenInfo || {};
  const documentInfo = result.DocumentInfo || {};

  const update = {
    cardcom_token: tokenInfo.Token || null,
    cardcom_token_card_year: tokenInfo.CardYear ?? null,
    cardcom_token_card_month: tokenInfo.CardMonth ?? null,
    cardcom_token_token_approval_number: tokenInfo.TokenApprovalNumber || null,
    cardcom_token_card_owner_identity_number: tokenInfo.CardOwnerIdentityNumber || null,
    cardcom_response_code: String(result.ResponseCode),
    cardcom_description: result.Description || "",
    cardcom_document_type: documentInfo.DocumentType || null,
    cardcom_document_number: documentInfo.DocumentNumber ?? null,
  };

  if (result.ResponseCode !== 0) {
    update.payment_status = "failed";
  } else if (result.Operation === "ChargeOnly") {
    update.payment_status = "paid";
    update.cardcom_tranzaction_id = result.TranzactionId;
  } else if (result.Operation === "CreateTokenOnly") {
    update.payment_status = "pending_charge";
    update.cardcom_tranzaction_id = 0;
  }

  const { error: updateErr } = await supabaseAdmin
    .from("orders")
    .update(update)
    .in("id", pending.map((o) => o.id));

  if (updateErr) {
    console.error("[cardcom] failed updating orders after validation", updateErr);
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
