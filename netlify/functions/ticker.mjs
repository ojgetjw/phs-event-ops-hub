// /api/ticker — proxies the security-email ticker feed from Apps Script.
// GET  → matched security requests, already condensed server-side.
// POST → dismiss (marks the message handled in Gmail).
//
// No message body ever reaches an AI service; Apps Script matches on
// keywords and labels only and returns just the condensed fields.

import { requireOfficer } from "./_shared/officer-session.mjs";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  const officer = requireOfficer(request);
  if (!officer.ok) return officer.response;

  const appsScriptUrl = process.env.APPS_SCRIPT_URL || process.env.GAS_WEB_APP_URL;
  const apiToken = process.env.APPS_SCRIPT_TOKEN || process.env.GAS_API_TOKEN;

  if (!appsScriptUrl || !apiToken) {
    return json({ ok: true, items: [], warning: "Ticker backend not configured." });
  }

  let body = { action: "tickerFeed", token: apiToken };

  if (request.method === "POST") {
    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON body." }, 400);
    }
    if (String(payload?.action) !== "dismiss") {
      return json({ ok: false, error: "Unsupported ticker action." }, 400);
    }
    body = {
      action: "tickerDismiss",
      token: apiToken,
      messageId: String(payload?.messageId || ""),
      handledBy: officer.email
    };
  }

  try {
    const res = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
        Accept: "application/json"
      },
      body: JSON.stringify(body)
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return json({ ok: true, items: [], warning: "Ticker returned no usable data." });
    }

    if (request.method === "POST") {
      return json({ ok: data.ok !== false });
    }

    return json({
      ok: true,
      items: Array.isArray(data.items) ? data.items.slice(0, 12) : [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Never let a ticker failure surface as an app error.
    return json({ ok: true, items: [], warning: error.message || String(error) });
  }
}

export const config = { path: "/api/ticker" };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
