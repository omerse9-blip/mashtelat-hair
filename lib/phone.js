// טלפון ישראלי: ספרות בלבד, בפורמט מקומי (0501234567). +972 / 972 הופך ל-0.
export function normalizePhone(s) {
  let d = String(s || "").replace(/\D/g, "");
  if (d.startsWith("972")) d = "0" + d.slice(3);
  return d;
}

// נייד: 05X + 7 ספרות | קו נייח: 02/03/04/08/09 + 7 ספרות | קווי אינטרנט: 07X + 7 ספרות
export function isValidPhone(s) {
  const d = normalizePhone(s);
  return /^05\d{8}$/.test(d) || /^0[23489]\d{7}$/.test(d) || /^07\d{8}$/.test(d);
}
