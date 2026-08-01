import { postJSON } from "./api.js";

const TOKEN_KEY = "phsHub.supervisorToken";

function readStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function writeStoredToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Session storage can be blocked by browser settings. Access then fails closed.
  }
}

function decodePayload(token) {
  try {
    const [payloadPart] = String(token || "").split(".");
    if (!payloadPart) return null;
    const padded = payloadPart.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payloadPart.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function supervisorToken() {
  const token = readStoredToken();
  const payload = decodePayload(token);
  const expires = Number(payload?.exp || 0);

  if (!token || payload?.role !== "supervisor" || !expires || expires <= Date.now()) {
    writeStoredToken("");
    return "";
  }

  return token;
}

export function supervisorSession() {
  const token = supervisorToken();
  const payload = decodePayload(token);
  return token && payload ? payload : null;
}

export function hasSupervisorAccess() {
  return Boolean(supervisorToken());
}

export async function unlockSupervisor(pin) {
  const cleanPin = String(pin || "").trim();
  if (!cleanPin) {
    throw new Error("Enter the supervisor PIN.");
  }

  const result = await postJSON("/api/submit", {
    action: "verifySupervisorPin",
    supervisorPin: cleanPin
  });

  if (!result.supervisorToken) {
    throw new Error("Supervisor access was not returned by the server.");
  }

  writeStoredToken(result.supervisorToken);
  syncSupervisorUi();
  window.dispatchEvent(new CustomEvent("phs-supervisor-access-changed"));
  return result;
}

export function lockSupervisor() {
  writeStoredToken("");
  syncSupervisorUi();
  window.dispatchEvent(new CustomEvent("phs-supervisor-access-changed"));
}

export function syncSupervisorUi() {
  const allowed = hasSupervisorAccess();
  document.documentElement.toggleAttribute("data-supervisor-unlocked", allowed);

  document.querySelectorAll("[data-supervisor-only]").forEach((node) => {
    node.hidden = !allowed;
    node.setAttribute("aria-hidden", String(!allowed));
  });

  const button = document.getElementById("supervisorAccessBtn");
  if (button) {
    const label = button.querySelector("span");
    if (label) label.textContent = allowed ? "Supervisor" : "Supervisor Access";
    button.querySelector("use")?.setAttribute("href", allowed ? "#icon-supervisor" : "#icon-lock");
    button.setAttribute("aria-label", allowed ? "Open Supervisor section" : "Enter supervisor PIN");
  }
}

export function supervisorExpiresLabel() {
  const session = supervisorSession();
  if (!session?.exp) return "";
  return new Date(session.exp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
