// Officer session token storage. No imports so api.js and signin.js can both
// use it without a circular dependency.

const TOKEN_KEY = "phsHub.officerSession";

function decodePayload(token) {
  try {
    const [payloadPart] = String(token || "").split(".");
    if (!payloadPart) return null;
    const padded = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function officerToken() {
  let token = "";
  try {
    token = localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }

  const payload = decodePayload(token);
  if (!token || payload?.role !== "officer" || Number(payload?.exp || 0) <= Date.now()) {
    clearOfficerToken();
    return "";
  }

  return token;
}

export function officerEmail() {
  return decodePayload(officerToken())?.email || "";
}

export function hasOfficerSession() {
  return Boolean(officerToken());
}

export function storeOfficerToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage can be blocked; the user will simply sign in again next visit.
  }
}

export function clearOfficerToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}
