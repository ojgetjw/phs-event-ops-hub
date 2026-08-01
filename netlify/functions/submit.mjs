// POST /api/submit — proxies write actions to Apps Script.
// The browser never sees the Apps Script URL or token; this function
// attaches the token server-side and only forwards whitelisted actions.

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { requireOfficer } from "./_shared/officer-session.mjs";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};

const ALLOWED_ACTIONS = new Set([
  "verifySupervisorPin",
  "submitReport",
  "submitPassdown",
  "submitBolo",
  "resolveBolo",
  "keyCheckout",
  "keyReturn",
  "updateReportStatus",
  "uploadFile"
]);

const SUPERVISOR_ACTIONS = new Set([
  "updateReportStatus"
]);

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "POST required." }, 405);
  }

  // Every write action — including supervisor PIN entry — requires a
  // signed-in officer session first.
  const officer = requireOfficer(request);
  if (!officer.ok) {
    return officer.response;
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL || process.env.GAS_WEB_APP_URL;
  const apiToken = process.env.APPS_SCRIPT_TOKEN || process.env.GAS_API_TOKEN;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const action = String(payload?.action || "").trim();

  if (!ALLOWED_ACTIONS.has(action)) {
    return json({ ok: false, error: `Action not allowed: ${action}` }, 400);
  }

  if (action === "verifySupervisorPin") {
    return verifySupervisorPin(payload, apiToken);
  }

  if (!appsScriptUrl || !apiToken) {
    return json(
      { ok: false, error: "Backend is not configured. Contact a supervisor." },
      502
    );
  }

  if (SUPERVISOR_ACTIONS.has(action)) {
    const verified = verifySupervisorToken(payload?.supervisorToken, apiToken);
    if (!verified.ok) {
      return json({ ok: false, error: verified.error || "Supervisor PIN required." }, 403);
    }
  }

  // Never trust a token from the browser; always use the server's. Also strip
  // supervisor proof before forwarding so the sheet never stores the PIN or
  // signed session token by accident, because leaking secrets into spreadsheets
  // is a very normal way for civilization to embarrass itself.
  const forwarded = { ...payload, action, token: apiToken, submittedByEmail: officer.email };
  delete forwarded.supervisorPin;
  delete forwarded.supervisorToken;

  try {
    const res = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
        Accept: "application/json"
      },
      body: JSON.stringify(forwarded)
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Apps Script did not return JSON: ${text.slice(0, 300)}`);
    }

    return json(data, data.ok === false ? 400 : 200);
  } catch (error) {
    return json(
      {
        ok: false,
        error: "Submission failed.",
        detail: error.message || String(error)
      },
      502
    );
  }
}

export const config = { path: "/api/submit" };

function verifySupervisorPin(payload, apiToken) {
  const configuredPin = String(process.env.SUPERVISOR_PIN || "").trim();
  const providedPin = String(payload?.supervisorPin || "").trim();

  if (!configuredPin) {
    return json({ ok: false, error: "SUPERVISOR_PIN is not configured in Netlify." }, 503);
  }

  if (!safeEqual(providedPin, configuredPin)) {
    return json({ ok: false, error: "Invalid supervisor PIN." }, 403);
  }

  const hours = Number(process.env.SUPERVISOR_SESSION_HOURS || 8);
  const ttlMs = Math.max(1, Math.min(hours || 8, 24)) * 60 * 60 * 1000;
  const expiresAt = Date.now() + ttlMs;
  const token = signSupervisorPayload({
    role: "supervisor",
    iat: Date.now(),
    exp: expiresAt,
    nonce: randomBytes(12).toString("hex")
  }, apiToken);

  return json({
    ok: true,
    message: "Supervisor access granted.",
    supervisorToken: token,
    expiresAt
  });
}

function signSupervisorPayload(payload, apiToken) {
  const body = toBase64Url(Buffer.from(JSON.stringify(payload), "utf8"));
  const signature = createHmac("sha256", supervisorSecret(apiToken)).update(body).digest();
  return `${body}.${toBase64Url(signature)}`;
}

function verifySupervisorToken(token, apiToken) {
  const [body, signature] = String(token || "").split(".");

  if (!body || !signature) {
    return { ok: false, error: "Supervisor access expired or missing. Enter the PIN again." };
  }

  const expected = toBase64Url(createHmac("sha256", supervisorSecret(apiToken)).update(body).digest());

  if (!safeEqual(signature, expected)) {
    return { ok: false, error: "Supervisor access could not be verified. Enter the PIN again." };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(fromBase64Url(body), "base64").toString("utf8"));
  } catch {
    return { ok: false, error: "Supervisor access is invalid. Enter the PIN again." };
  }

  if (payload.role !== "supervisor" || Number(payload.exp || 0) <= Date.now()) {
    return { ok: false, error: "Supervisor access expired. Enter the PIN again." };
  }

  return { ok: true, payload };
}

function supervisorSecret(apiToken) {
  return String(process.env.SUPERVISOR_SESSION_SECRET || process.env.SUPERVISOR_PIN || apiToken || "phs-supervisor-session");
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));

  if (left.length !== right.length) {
    // Still run a timing-safe comparison against same-length hashes so the
    // length mismatch does not become a tiny oracle for bored troublemakers.
    const leftHash = createHmac("sha256", "compare").update(left).digest();
    const rightHash = createHmac("sha256", "compare").update(right).digest();
    timingSafeEqual(leftHash, rightHash);
    return false;
  }

  return timingSafeEqual(left, right);
}

function toBase64Url(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromBase64Url(value) {
  const text = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  return text.padEnd(Math.ceil(text.length / 4) * 4, "=");
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
