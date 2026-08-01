// Fetch wrapper: timeout, no-store, safe JSON parsing, officer session header.

import { officerToken, clearOfficerToken } from "./officer-session.js";

const TIMEOUT_MS = 20000;

async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers = { ...(options.headers || {}) };
  const token = officerToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      ...options,
      headers
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("The server returned an unexpected response.");
    }

    if (res.status === 401 && data.authRequired) {
      clearOfficerToken();
      window.dispatchEvent(
        new CustomEvent("phs-auth-required", {
          detail: { message: data.error || "Sign-in required." }
        })
      );
      throw new Error(data.error || "Sign-in required.");
    }

    if (!res.ok || data.ok === false) {
      throw new Error(data.error || data.detail || `Request failed (${res.status}).`);
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}

export function getJSON(url) {
  return request(url, { method: "GET" });
}

export function postJSON(url, body) {
  return request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

export function submitAction(action, payload) {
  return postJSON("/api/submit", { action, ...payload });
}
