// Officer sign-in gate. Shows a full-screen overlay until a valid Google
// sign-in (checked against the server-side allowlist) has produced an
// officer session token. Re-locks automatically if any API call returns 401.

import { postJSON, getJSON } from "./api.js";
import {
  hasOfficerSession,
  storeOfficerToken,
  clearOfficerToken,
  officerEmail
} from "./officer-session.js";

let resolveSignedIn = null;
let gisInitialized = false;

function overlay() {
  return document.getElementById("signinOverlay");
}

function statusEl() {
  return document.getElementById("signinStatus");
}

function setStatus(message, isError = false) {
  const el = statusEl();
  if (!el) return;
  el.textContent = message || "";
  el.classList.toggle("is-error", Boolean(isError));
}

function showOverlay() {
  const el = overlay();
  if (el) el.hidden = false;
  document.documentElement.setAttribute("data-signin-locked", "");
}

function hideOverlay() {
  const el = overlay();
  if (el) el.hidden = true;
  document.documentElement.removeAttribute("data-signin-locked");
}

function syncSignedInUi() {
  const email = officerEmail();
  const label = document.getElementById("signedInEmail");
  if (label) label.textContent = email || "";
  const wrap = document.getElementById("signOutWrap");
  if (wrap) wrap.hidden = !email;
}

async function waitForGis(timeoutMs = 10000) {
  const started = Date.now();
  while (!window.google?.accounts?.id) {
    if (Date.now() - started > timeoutMs) {
      throw new Error("Google Sign-In failed to load. Check your connection and refresh.");
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return window.google.accounts.id;
}

async function handleCredential(response) {
  setStatus("Checking authorization…");
  try {
    const result = await postJSON("/api/auth", { credential: response?.credential || "" });
    if (!result.sessionToken) {
      throw new Error("Sign-in did not return a session.");
    }
    storeOfficerToken(result.sessionToken);
    syncSignedInUi();
    hideOverlay();
    setStatus("");
    window.dispatchEvent(new CustomEvent("phs-officer-signed-in"));
    if (resolveSignedIn) {
      resolveSignedIn();
      resolveSignedIn = null;
    }
  } catch (error) {
    clearOfficerToken();
    setStatus(error.message || "Sign-in failed.", true);
  }
}

async function renderSignIn() {
  setStatus("Loading sign-in…");

  let config;
  try {
    config = await getJSON("/api/auth");
  } catch (error) {
    setStatus(error.message || "Could not reach the sign-in service.", true);
    return;
  }

  if (!config.configured || !config.clientId) {
    setStatus(
      "Officer sign-in is not configured yet. A supervisor must set GOOGLE_CLIENT_ID and ALLOWED_EMAILS in Netlify.",
      true
    );
    return;
  }

  let gis;
  try {
    gis = await waitForGis();
  } catch (error) {
    setStatus(error.message, true);
    return;
  }

  if (!gisInitialized) {
    gis.initialize({
      client_id: config.clientId,
      callback: handleCredential,
      auto_select: false,
      itp_support: true
    });
    gisInitialized = true;
  }

  const container = document.getElementById("googleSigninBtn");
  if (container) {
    container.innerHTML = "";
    gis.renderButton(container, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "pill",
      width: 280
    });
  }

  setStatus("Sign in with an authorized PHS security account.");
}

// Public: resolves once a valid officer session exists. Called by main.js
// before the app boots.
export function ensureOfficerSession() {
  if (hasOfficerSession()) {
    hideOverlay();
    syncSignedInUi();
    return Promise.resolve();
  }

  showOverlay();
  renderSignIn();
  return new Promise((resolve) => {
    resolveSignedIn = resolve;
  });
}

// Public: called when any API request returns 401 mid-session.
export function relockSignIn(message) {
  clearOfficerToken();
  syncSignedInUi();
  showOverlay();
  renderSignIn().then(() => {
    if (message) setStatus(message, true);
  });
  if (!resolveSignedIn) {
    new Promise((resolve) => {
      resolveSignedIn = resolve;
    });
  }
}

export function signOut() {
  clearOfficerToken();
  syncSignedInUi();
  try {
    window.google?.accounts?.id?.disableAutoSelect();
  } catch {}
  showOverlay();
  renderSignIn();
}

// Wire the header/nav sign-out control and the auth-required event.
window.addEventListener("phs-auth-required", (event) => {
  relockSignIn(event?.detail?.message || "Your session expired. Sign in again.");
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-sign-out]")) {
    event.preventDefault();
    signOut();
  }
});
