// Overview — v9 structure C.
// Ticker owns the top strip (mounted globally in main.js, not here).
// Order: promoted counts (only when non-zero) → quick actions →
// unified activity feed → resting tracker cards.

import { store, subscribe, refreshHubData, lastUpdatedLabel } from "../store.js";
import {
  escapeHtml, setLoading, setError, priorityBadge, statusPill,
  attachmentStrip, humanDateTime, compactText, icon
} from "../ui.js";

export function renderOverview(mount) {
  mount.innerHTML = `
    <section id="promotedRow" class="promoted-row" aria-label="Items needing attention" hidden></section>

    <section class="quick-actions-row" aria-label="Quick actions">
      ${action("#/incidents?mode=daily", "activity", "Daily")}
      ${action("#/incidents?mode=incident", "alert", "Incident")}
      ${action("#/keys", "key", "Keys")}
      ${action("#/bolos", "bolo", "B.O.L.O.")}
    </section>

    <section class="feed-section" aria-label="Operational activity">
      <div class="feed-filters" role="group" aria-label="Filter activity">
        <button type="button" class="chip is-active" data-filter="all">All</button>
        <button type="button" class="chip" data-filter="report">Reports</button>
        <button type="button" class="chip" data-filter="activity">Activity</button>
        <button type="button" class="chip" data-filter="passdown">Pass-down</button>
        <button type="button" class="chip" data-filter="bolo">B.O.L.O.</button>
        <button type="button" class="chip" data-filter="key">Keys</button>
      </div>
      <div id="feed" class="feed"></div>
    </section>

    <section id="restingRow" class="resting-row" aria-label="Current trackers"></section>

    <p class="feed-updated muted" id="feedUpdated">${escapeHtml(lastUpdatedLabel())}</p>`;

  let activeFilter = "all";

  mount.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-filter]");
    if (chip) {
      activeFilter = chip.dataset.filter;
      mount.querySelectorAll("[data-filter]").forEach((node) => {
        node.classList.toggle("is-active", node === chip);
      });
      paint();
      return;
    }
    if (event.target.matches("[data-retry]")) refreshHubData();
  });

  const unsubscribe = subscribe(() => {
    if (!document.getElementById("feed")) { unsubscribe(); return; }
    paint();
  });

  paint();

  function paint() {
    const feedNode = document.getElementById("feed");
    if (!feedNode) return;

    if (store.hubStatus === "loading" && !store.hubData) { setLoading(feedNode, 4); return; }
    if (store.hubStatus === "error" && !store.hubData) { setError(feedNode, store.hubError, "hub"); return; }

    const data = store.hubData || {};
    const keys = data.keysAndEquipmentOut || [];
    const passdown = data.passdownEntries || [];
    const bolos = data.activeBolos || [];
    const reports = data.openReports || [];
    const activity = data.recentDailyActivity || data.dailyActivityEntries || [];
    const flagged = passdown.filter((item) => item.flagged);

    paintPromoted({ bolos: bolos.length, keys: keys.length, flagged: flagged.length });
    paintResting({ bolos: bolos.length, keys: keys.length, flagged: flagged.length, passdown });
    paintFeed(feedNode, { reports, activity, passdown, bolos, keys }, activeFilter);

    const updated = document.getElementById("feedUpdated");
    if (updated) updated.textContent = lastUpdatedLabel();
  }
}

// --- promoted counts -------------------------------------------------------
// Only rendered when a tracker has a value; otherwise it stays at the bottom.

function paintPromoted({ bolos, keys, flagged }) {
  const row = document.getElementById("promotedRow");
  if (!row) return;

  const cards = [];
  if (bolos) cards.push(promoted("danger", bolos, bolos === 1 ? "B.O.L.O." : "B.O.L.O.s", "#/bolos"));
  if (keys) cards.push(promoted("warning", keys, keys === 1 ? "key out" : "keys out", "#/keys"));
  if (flagged) cards.push(promoted("warning", flagged, "flagged", "#/passdown"));

  row.hidden = !cards.length;
  row.innerHTML = cards.join("");
}

function promoted(tone, value, label, href) {
  return `<a class="promoted-card promoted-${tone}" href="${escapeHtml(href)}">
    <strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></a>`;
}

// --- resting trackers ------------------------------------------------------
// Shows only the trackers that are NOT promoted, so nothing appears twice.

function paintResting({ bolos, keys, flagged, passdown }) {
  const row = document.getElementById("restingRow");
  if (!row) return;

  const cards = [];
  if (!bolos) cards.push(resting("bolo", "B.O.L.O.s", 0, "No active advisories", "#/bolos"));
  if (!keys) cards.push(resting("key", "Keys out", 0, "Nothing checked out", "#/keys"));
  if (!flagged) {
    const latest = passdown[0];
    cards.push(resting(
      "passdown", "Pass-down", 0,
      latest ? compactText(latest.notes || "", 60) : "No recent entries",
      "#/passdown"
    ));
  }

  row.hidden = !cards.length;
  row.innerHTML = cards.join("");
}

function resting(iconName, label, value, help, href) {
  return `<a class="resting-card" href="${escapeHtml(href)}">
    <div class="resting-head">
      <span>${icon(iconName)} ${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
    <p>${escapeHtml(help)}</p></a>`;
}

// --- unified feed ----------------------------------------------------------
// Five separate panels merged into one chronological, filterable stream.

function paintFeed(node, sets, filter) {
  const items = buildFeedItems(sets)
    .filter((item) => filter === "all" || item.kind === filter)
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 25);

  if (!items.length) {
    node.innerHTML = `<div class="empty-state">Nothing to show for this filter.</div>`;
    return;
  }

  node.innerHTML = items.map((item) => `
    <article class="feed-item feed-${escapeHtml(item.kind)}${item.alert ? " is-alert" : ""}">
      <div class="feed-item-head">
        <strong>${item.title}</strong>
        ${item.badge || ""}
      </div>
      ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ""}
      <div class="feed-item-meta">
        ${item.when ? `<span>${escapeHtml(item.when)}</span>` : ""}
        ${item.who ? `<span>${escapeHtml(item.who)}</span>` : ""}
      </div>
      ${item.extra || ""}
    </article>`).join("");
}

function buildFeedItems({ reports, activity, passdown, bolos, keys }) {
  const items = [];

  reports.forEach((item) => {
    const priority = String(item.priority || "").toLowerCase();
    items.push({
      kind: "report",
      alert: priority === "urgent" || priority === "high",
      sortKey: timeOf(item.occurrence || item.timestamp),
      title: `${escapeHtml(item.reportType || "Report")} <span class="form-code">${escapeHtml(item.reportId || "")}</span>`,
      badge: `${statusPill(item.status || "Pending Approval")}${priorityBadge(item.priority)}`,
      body: [item.campus, item.location].filter(Boolean).join(" · ")
        + (item.summary ? ` — ${compactText(item.summary, 140)}` : ""),
      when: item.occurrenceDisplay || humanDateTime(item.timestampDisplay || item.timestamp),
      who: Array.isArray(item.peopleInvolved) && item.peopleInvolved.length
        ? `${item.peopleInvolved.length} involved` : "",
      extra: attachmentStrip(item.attachments)
    });
  });

  activity.forEach((item) => {
    items.push({
      kind: "activity",
      sortKey: timeOf(item.occurrence || item.timestamp),
      title: escapeHtml(item.activityType || "Activity"),
      body: [item.location || item.campus, item.notes ? compactText(item.notes, 120) : ""]
        .filter(Boolean).join(" · "),
      when: item.occurrenceDisplay || humanDateTime(item.timestampDisplay || item.timestamp),
      who: item.officer || ""
    });
  });

  passdown.forEach((item) => {
    items.push({
      kind: "passdown",
      alert: Boolean(item.flagged),
      sortKey: timeOf(item.timestamp),
      title: `Pass-down · ${escapeHtml(item.shift || "Shift")}`,
      badge: item.flagged ? '<span class="badge badge-flagged">Flagged</span>' : "",
      body: compactText(item.notes || "", 150),
      when: item.timestampDisplay || humanDateTime(item.timestamp),
      who: item.officer || ""
    });
  });

  bolos.forEach((item) => {
    items.push({
      kind: "bolo",
      alert: true,
      sortKey: timeOf(item.timestamp),
      title: escapeHtml(item.subject || item.type || "B.O.L.O."),
      badge: '<span class="badge badge-urgent">Active</span>',
      body: compactText(item.details || "", 150),
      when: item.timestampDisplay || humanDateTime(item.timestamp),
      extra: attachmentStrip(item.attachments)
    });
  });

  keys.forEach((item) => {
    items.push({
      kind: "key",
      sortKey: timeOf(item.timeOfIssue || item.timestamp),
      title: escapeHtml(item.keyName || "Issued item"),
      body: [item.vendorEmployee, item.vendorCompany].filter(Boolean).join(" · "),
      when: item.timeOfIssueDisplay || item.timeOfIssue || "",
      who: item.issuingOfficer || ""
    });
  });

  return items;
}

function timeOf(value) {
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? 0 : dt.getTime();
}

function action(href, iconName, label) {
  return `<a class="quick-action" href="${escapeHtml(href)}">
    ${icon(iconName)}<span>${escapeHtml(label)}</span></a>`;
}
