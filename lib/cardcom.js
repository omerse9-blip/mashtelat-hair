const BASE_URL = "https://secure.cardcom.solutions/api/v11";

// קונפיגורציית קארדקום - ממשתני סביבה בצד שרת בלבד
export function cardcomConfig() {
  return {
    terminalNumber: Number(process.env.CARDCOM_TERMINAL_NUMBER || 1000),
    apiName: process.env.CARDCOM_API_NAME || "CardTest1994",
    apiPassword: process.env.CARDCOM_API_PASSWORD || "",
    operation: process.env.CARDCOM_OPERATION || "ChargeOnly",
  };
}

async function postJson(path, body, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function createLowProfile(payload) {
  return postJson("/LowProfile/Create", payload);
}

// אימות עסקה - טיים אאוט 5 שניות, ניסיון חוזר אחד
export async function getLpResult(payload) {
  try {
    return await postJson("/LowProfile/GetLpResult", payload, 5000);
  } catch {
    return await postJson("/LowProfile/GetLpResult", payload, 5000);
  }
}
