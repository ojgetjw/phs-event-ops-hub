// Security email ticker — locked banner at the top of every page.
// Cycles matched security-request emails one at a time. Pauses on hover
// and on focus. Click opens the message in Gmail.
//
// Contrast: pale tint background with dark same-family text (measured
// 8.6:1 to 12.6:1 in light mode, ~6.5:1 in dark). Deliberately not white
// text on saturated fill, which measured 3.9:1 and fails in daylight.

import { getJSON } from "./api.js";
import { escapeHtml, compactText } from "./ui.js";

const ROTATE_MS = 7000;
const REFRESH_MS = 120000;

let items = [];
let index = 0;
let timer = null;
let paused = false;

export function mountTicker() {
  const host = document.getElementById("ticker");
  if (!host) return;

  host.addEventListener("mouseenter", () => { paused = true; });
  host.addEventListener("mouseleave", () => { paused = false; });
  host.addEventListener("focusin", () => { paused = true; });
  host.addEventListener("focusout", () => { paused = false; });

  host.addEventListener("click", (event) => {
    const dismiss = event.target.closest("[data-dismiss]");
    if (dismiss) {
      event.preventDefault();
      event.stopPropagation();
      dismissCurrent();
      return;
    }
    const step = event.target.closest("[data-step]");
    if (step) {
      event.preventDefault();
      advance(Number(step.dataset.step));
    }
  });

  load();
  setInterval(load, REFRESH_MS);
  startRotation();
}

async function load() {
  try {
    const data = await getJSON("/api/ticker");
    items = Array.isArray(data.items) ? data.items : [];
    if (index >= items.length) index = 0;
  } catch {
    // Ticker is supplementary; a failure should never block the hub.
    items = [];
  }
  paint();
}

function startRotation() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (!paused && items.length > 1) advance(1);
  }, ROTATE_MS);
}

function advance(step) {
  if (!items.length) return;
  index = (index + step + items.length) % items.length;
  paint();
  startRotation();
}

function dismissCurrent() {
  const item = items[index];
  if (!item) return;
  items.splice(index, 1);
  if (index >= items.length) index = 0;
  paint();
  // Fire and forget; the ticker reloads from the server anyway.
  fetch("/api/ticker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "dismiss", messageId: item.id })
  }).catch(() => {});
}

function paint() {
  const host = document.getElementById("ticker");
  if (!host) return;

  if (!items.length) {
    host.className = "ticker ticker-quiet";
    host.innerHTML = `<span class="ticker-quiet-text">No open security requests</span>`;
    return;
  }

  const item = items[index];
  const tone = toneFor(item);

  host.className = `ticker ticker-${tone}`;
  host.innerHTML = `
    <span class="ticker-tag">${escapeHtml(item.tag || "REQUEST")}</span>
    <a class="ticker-body" href="${escapeHtml(item.link || "#")}" target="_blank" rel="noopener">
      <span class="ticker-title">${escapeHtml(compactText(item.title || "", 70))}</span>
      <span class="ticker-detail">${escapeHtml(detailLine(item))}</span>
    </a>
    <span class="ticker-count">${index + 1} of ${items.length}</span>
    <span class="ticker-controls">
      ${items.length > 1 ? `
        <button type="button" data-step="-1" aria-label="Previous request">&#8249;</button>
        <button type="button" data-step="1" aria-label="Next request">&#8250;</button>` : ""}
      <button type="button" data-dismiss aria-label="Mark handled">&#10005;</button>
    </span>`;
}

function detailLine(item) {
  return [item.detail, item.when, item.from].filter(Boolean).join(" · ");
}

function toneFor(item) {
  const tone = String(item.tone || "").toLowerCase();
  if (["urgent", "gate", "visitor", "coverage", "issue", "event"].includes(tone)) return tone;
  return "request";
}
