// Shared officer sign-in helpers: Google ID token verification and
// HMAC-signed officer session tokens. Imported by auth.mjs, hub-data.mjs,
// metadata.mjs, and submit.mjs. This file lives in _shared/ so Netlify does
// not deploy it as its own function.

import {
  createHmac,
  createPublicKey,
  verify as verifySignature,
  randomBytes,
  timingSafeEqual
} from "node:crypto";

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);
const JWKS_TTL_MS = 60 * 60 * 1000;

let jwksCache = { keys: [], fetchedAt: 0 };

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export function authConfig() {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
  const allowedEmails = String(process.env.ALLOWED_EMAILS || "")
    .split(/[,;\s]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return {
    clientId,
    allowedEmails,
    configured: Boolean(clientId && allowedEmails.length)
  };
}

function sessionSecret() {
  return String(
    process.env.AUTH_SESSION_SECRET ||
      process.env.SUPERVISOR_SESSION_SECRET ||
      process.env.APPS_SCRIPT_TOKEN ||
      "phs-officer-session"
  );
}

function sessionTtlMs() {
  const days = Number(process.env.AUTH_SESSION_DAYS || 7);
  const clamped = Math.max(1, Math.min(Number.isFinite(days) ? days : 7, 30));
  return clamped * 24 * 60 * 60 * 1000;
}

// ---------------------------------------------------------------------------
// Google ID token verification
// ---------------------------------------------------------------------------

async function fetchJwks() {
  const res = await fetch(GOOGLE_JWKS_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Google key fetch failed (${res.status}).`);
  const data = await res.json();
  jwksCache = { keys: Array.isArray(data?.keys) ? data.keys : [], fetchedAt: Date.now() };
  return jwksCache.keys;
}

async function findJwk(kid) {
  const fresh = Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS;
  let keys = fresh && jwksCache.keys.length ? jwksCache.keys : await fetchJwks();
  let match = keys.find((key) => key.kid === kid);

  // Key rotation: refetch once if the kid is unknown but the cache was warm.
  if (!match && fresh) {
    keys = await fetchJwks();
    match = keys.find((key) => key.kid === kid);
  }

  return match || null;
}

export async function verifyGoogleCredential(credential, clientId) {
  const parts = String(credential || "").split(".");
  if (parts.length !== 3) {
    return { ok: false, error: "Malformed Google credential." };
  }

  let header;
  let payload;
  try {
    header = JSON.parse(fromBase64Url(parts[0]).toString("utf8"));
    payload = JSON.parse(fromBase64Url(parts[1]).toString("utf8"));
  } catch {
    return { ok: false, error: "Unreadable Google credential." };
  }

  if (header?.alg !== "RS256") {
    return { ok: false, error: "Unexpected credential algorithm." };
  }

  let jwk;
  try {
    jwk = await findJwk(header.kid);
  } catch (error) {
    return { ok: false, error: error.message || "Could not reach Google signing keys." };
  }
  if (!jwk) {
    return { ok: false, error: "Google signing key not found." };
  }

  let publicKey;
  try {
    publicKey = createPublicKey({ key: jwk, format: "jwk" });
  } catch {
    return { ok: false, error: "Google signing key could not be loaded." };
  }

  const signedData = Buffer.from(`${parts[0]}.${parts[1]}`, "utf8");
  const signature = fromBase64Url(parts[2]);

  let valid = false;
  try {
    valid = verifySignature("RSA-SHA256", signedData, publicKey, signature);
  } catch {
    valid = false;
  }
  if (!valid) {
    return { ok: false, error: "Google credential signature is invalid." };
  }

  if (!GOOGLE_ISSUERS.has(String(payload?.iss || ""))) {
    return { ok: false, error: "Credential issuer is not Google." };
  }
  if (String(payload?.aud || "") !== clientId) {
    return { ok: false, error: "Credential was issued for a different application." };
  }
  if (Number(payload?.exp || 0) * 1000 <= Date.now()) {
    return { ok: false, error: "Google credential is expired. Try signing in again." };
  }

  const email = String(payload?.email || "").trim().toLowerCase();
  const emailVerified = payload?.email_verified === true || payload?.email_verified === "true";
  if (!email || !emailVerified) {
    return { ok: false, error: "Google did not verify this email address." };
  }

  return { ok: true, email, name: String(payload?.name || "") };
}

// ---------------------------------------------------------------------------
// Officer session tokens (same HMAC pattern as the supervisor session)
// ---------------------------------------------------------------------------

export function issueOfficerToken(email) {
  const expiresAt = Date.now() + sessionTtlMs();
  const body = toBase64Url(
    Buffer.from(
      JSON.stringify({
        role: "officer",
        email: String(email || "").trim().toLowerCase(),
        iat: Date.now(),
        exp: expiresAt,
        nonce: randomBytes(12).toString("hex")
      }),
      "utf8"
    )
  );
  const signature = createHmac("sha256", sessionSecret()).update(body).digest();
  return { token: `${body}.${toBase64Url(signature)}`, expiresAt };
}

export function verifyOfficerToken(token) {
  const [body, signature] = String(token || "").split(".");
  if (!body || !signature) {
    return { ok: false, error: "Sign-in required." };
  }

  const expected = toBase64Url(createHmac("sha256", sessionSecret()).update(body).digest());
  if (!safeEqual(signature, expected)) {
    return { ok: false, error: "Session could not be verified. Sign in again." };
  }

  let payload;
  try {
    payload = JSON.parse(fromBase64Url(body).toString("utf8"));
  } catch {
    return { ok: false, error: "Session is invalid. Sign in again." };
  }

  if (payload?.role !== "officer" || Number(payload?.exp || 0) <= Date.now()) {
    return { ok: false, error: "Session expired. Sign in again." };
  }

  // The allowlist is re-checked on every request, so removing an email from
  // ALLOWED_EMAILS locks that account out immediately, not at token expiry.
  const { allowedEmails, configured } = authConfig();
  const email = String(payload?.email || "").trim().toLowerCase();
  if (configured && !allowedEmails.includes(email)) {
    return { ok: false, error: "This account is no longer authorized." };
  }

  return { ok: true, email, payload };
}

// Reads the Authorization header and either passes (returning the officer
// email) or returns a ready-to-send 401/503 Response.
export function requireOfficer(request) {
  const { configured } = authConfig();
  if (!configured) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({
          ok: false,
          authRequired: true,
          authConfigured: false,
          error:
            "Officer sign-in is not configured. Set GOOGLE_CLIENT_ID and ALLOWED_EMAILS in Netlify environment variables."
        }),
        { status: 503, headers: JSON_HEADERS }
      )
    };
  }

  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  const result = verifyOfficerToken(token);

  if (!result.ok) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({
          ok: false,
          authRequired: true,
          authConfigured: true,
          error: result.error || "Sign-in required."
        }),
        { status: 401, headers: JSON_HEADERS }
      )
    };
  }

  return { ok: true, email: result.email };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));

  if (left.length !== right.length) {
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
  return Buffer.from(text.padEnd(Math.ceil(text.length / 4) * 4, "="), "base64");
}
