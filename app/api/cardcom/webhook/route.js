import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { cardcomConfig, getLpResult } from "../../../../lib/cardcom";

export async function POST(req) {
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

  const { data: order, error: findErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("cardcom_low_profile_id", lowProfileId)
    .maybeSingle();

  if (findErr || !order) {
    console.error("[cardcom][CRITICAL] webhook order not found", { lowProfileId, findErr });
    return NextResponse.json({ ok: true });
  }

  if (order.cardcom_tranzaction_id) {
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
    .eq("id", order.id);

  if (updateErr) {
    console.error("[cardcom] failed updating order after validation", updateErr);
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
