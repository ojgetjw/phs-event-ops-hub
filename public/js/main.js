import { loadMetadata, refreshHubData, subscribe, connectionState } from "./store.js";
import { registerRoute, startRouter, navigate } from "./router.js";
import { renderOverview } from "./pages/overview.js";
import { renderIncidents } from "./pages/incidents.js";
import { renderKeys } from "./pages/keys.js";
import { renderPassdown } from "./pages/passdown.js";
import { renderBolos } from "./pages/bolos.js";
import { renderSupervisor } from "./pages/supervisor.js";
import { renderResources } from "./pages/resources.js";
import { hasSupervisorAccess, syncSupervisorUi } from "./auth.js";
import { ensureOfficerSession } from "./signin.js";
import { mountTicker } from "./ticker.js";

registerRoute("overview", renderOverview);
registerRoute("incidents", renderIncidents);
registerRoute("keys", renderKeys);
registerRoute("passdown", renderPassdown);
registerRoute("bolos", renderBolos);
registerRoute("supervisor", renderSupervisor);
registerRoute("resources", renderResources);

const chip = document.getElementById("connectionChip");
subscribe(() => {
  const state = connectionState();
  chip.className = `status-chip is-${state}`;
  chip.textContent = state === "live" ? "Connected" : state === "checking" ? "Checking" : state === "delayed" ? "Delayed" : "Offline";
});

document.getElementById("refreshHubBtn").addEventListener("click", refreshHubData);

const themeToggleBtn = document.getElementById("themeToggleBtn");
function currentTheme() { return document.documentElement.dataset.theme === "dark" ? "dark" : "light"; }
function syncThemeButton() {
  const dark = currentTheme() === "dark";
  themeToggleBtn?.setAttribute("aria-label", dark ? "Use light mode" : "Use dark mode");
  themeToggleBtn?.setAttribute("title", dark ? "Use light mode" : "Use dark mode");
  themeToggleBtn?.querySelector("use")?.setAttribute("href", dark ? "#icon-sun" : "#icon-theme");
}
themeToggleBtn?.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("phsHub.theme", next); } catch {}
  syncThemeButton();
});
syncThemeButton();

function openSupervisor() {
  if (window.location.hash.replace(/^#\/?/, "").split("?")[0] === "supervisor") { navigate(); return; }
  window.location.hash = "#/supervisor";
}
document.getElementById("supervisorAccessBtn")?.addEventListener("click", openSupervisor);
document.getElementById("moreSupervisorBtn")?.addEventListener("click", openSupervisor);
document.getElementById("moreThemeBtn")?.addEventListener("click", () => themeToggleBtn?.click());
window.addEventListener("phs-supervisor-access-changed", () => {
  syncSupervisorUi();
  if (hasSupervisorAccess() && window.location.hash.replace(/^#\/?/, "").split("?")[0] === "supervisor") navigate();
});

const todayLabel = document.getElementById("todayLabel");
const clockLabel = document.getElementById("clockLabel");
function paintClock() {
  const now = new Date();
  if (todayLabel) todayLabel.textContent = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  if (clockLabel) clockLabel.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
paintClock(); setInterval(paintClock, 30000);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") refreshHubData(); });
setInterval(() => { if (document.visibilityState === "visible") refreshHubData(); }, 60000);

const moreBtn = document.getElementById("moreNavBtn");
const sheet = document.getElementById("moreSheet");
const backdrop = document.getElementById("sheetBackdrop");
function toggleSheet(open) {
  sheet.hidden = !open; backdrop.hidden = !open; moreBtn.setAttribute("aria-expanded", String(open));
  if (open) sheet.querySelector("a")?.focus(); else moreBtn.focus();
}
moreBtn.addEventListener("click", () => toggleSheet(sheet.hidden));
backdrop.addEventListener("click", () => toggleSheet(false));
sheet.addEventListener("click", (event) => { if (event.target.closest("a")) toggleSheet(false); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !sheet.hidden) toggleSheet(false); });

const EXPECTED_BACKEND_VERSION = "current";
syncSupervisorUi();

// After a mid-session re-sign-in (401 relock), refresh data automatically.
window.addEventListener("phs-officer-signed-in", () => {
  loadMetadata();
  refreshHubData();
});

(async () => {
  await ensureOfficerSession();
  const meta = await loadMetadata();
  startRouter(document.getElementById("main"));
  refreshHubData();
  mountTicker();
  if (meta && !meta.warning && meta.version !== EXPECTED_BACKEND_VERSION) {
    const found = meta.version || "older build";
    import("./ui.js").then(({ toast }) => toast(`Backend version mismatch: the site expects ${EXPECTED_BACKEND_VERSION} but Apps Script is serving ${found}. In Apps Script: Deploy > Manage deployments > pencil > New version > Deploy.`, true, 15000));
  }
})();
