// /api/auth — officer sign-in endpoint.
// GET  → returns the Google OAuth client ID so the sign-in page can render.
// POST → verifies a Google ID token, checks the email allowlist, and issues
//        an HMAC-signed officer session token used on every other API call.

import {
  authConfig,
  verifyGoogleCredential,
  issueOfficerToken
} from "./_shared/officer-session.mjs";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  const config = authConfig();

  if (request.method === "GET") {
    return json({
      ok: true,
      configured: config.configured,
      clientId: config.clientId || null
    });
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "POST required." }, 405);
  }

  if (!config.configured) {
    return json(
      {
        ok: false,
        authConfigured: false,
        error:
          "Officer sign-in is not configured. Set GOOGLE_CLIENT_ID and ALLOWED_EMAILS in Netlify environment variables."
      },
      503
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const credential = String(payload?.credential || "").trim();
  if (!credential) {
    return json({ ok: false, error: "Missing Google credential." }, 400);
  }

  const verified = await verifyGoogleCredential(credential, config.clientId);
  if (!verified.ok) {
    return json({ ok: false, error: verified.error }, 403);
  }

  if (!config.allowedEmails.includes(verified.email)) {
    // Deliberately generic: no hint about which emails are on the list.
    return json(
      { ok: false, error: "This Google account is not authorized for the Security Hub." },
      403
    );
  }

  const session = issueOfficerToken(verified.email);

  return json({
    ok: true,
    message: "Signed in.",
    sessionToken: session.token,
    email: verified.email,
    expiresAt: session.expiresAt
  });
}

export const config = { path: "/api/auth" };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
