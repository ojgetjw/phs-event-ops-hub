import { store, subscribe, lastUpdatedLabel, refreshHubData } from "../store.js";
import { escapeHtml, setLoading, setError, renderList, priorityBadge, attachmentStrip, statusPill, compactText, toast, wireRememberedInput, icon } from "../ui.js";
import { submitAction } from "../api.js";
import { hasSupervisorAccess, lockSupervisor, supervisorExpiresLabel, supervisorToken, unlockSupervisor } from "../auth.js";

export function renderSupervisor(mount) {
  if (!hasSupervisorAccess()) {
    renderSupervisorLock(mount);
    return;
  }

  mount.innerHTML = `
    <section class="page-header">
      <div>
        <p class="page-kicker">Supervisor</p>
        <h2>Supervisor Review</h2>
        <p>Approve new incident reports, track urgent items, and close out follow-up.</p>
      </div>
      <div class="form-actions supervisor-actions" style="margin:0">
        <button type="button" class="btn btn-quiet" onclick="window.print()">Print summary</button>
        <button type="button" class="btn btn-quiet" id="lockSupervisorBtn">Lock supervisor</button>
        <p class="last-updated">${escapeHtml(lastUpdatedLabel())}${supervisorExpiresLabel() ? ` · access until ${escapeHtml(supervisorExpiresLabel())}` : ""}</p>
      </div>
    </section>

    <section class="panel approval-flow-panel">
      <div>
        <h3>Report approval flow</h3>
        <p>New incident reports now start as <strong>Pending Approval</strong>. A supervisor can approve them, send them back for correction, or resolve them after review.</p>
      </div>
      <div class="field supervisor-name-field">
        <label for="supervisorReviewerName">Supervisor name</label>
        <input id="supervisorReviewerName" autocomplete="name" placeholder="Name recorded on approval actions" required />
        <p class="hint">This is saved only in this browser and written to the report approval columns.</p>
      </div>
    </section>

    <section class="dashboard-grid">
      <article class="widget span-12">
        <div class="widget-head"><h3>Reports awaiting approval</h3><a href="#/incidents">File report</a></div>
        <div class="widget-body" id="supPendingApprovals"></div>
      </article>

      <article class="widget span-6">
        <div class="widget-head"><h3>Urgent &amp; high-priority reports</h3><a href="#/incidents">Incidents</a></div>
        <div class="widget-body" id="supUrgent"></div>
      </article>

      <article class="widget span-6">
        <div class="widget-head"><h3>Flagged pass-downs</h3><a href="#/passdown">Pass-down</a></div>
        <div class="widget-body" id="supFlagged"></div>
      </article>

      <article class="widget span-8">
        <div class="widget-head"><h3>All open reports</h3><a href="#/incidents">Incidents</a></div>
        <div class="widget-body" id="supOpen"></div>
      </article>

      <article class="widget span-4">
        <div class="widget-head"><h3>Outstanding checkouts</h3><a href="#/keys">Keys &amp; Equipment</a></div>
        <div class="widget-body" id="supKeys"></div>
      </article>
    </section>
  `;

  wireRememberedInput(document.getElementById("supervisorReviewerName"), "phsHub.supervisorName");

  document.getElementById("lockSupervisorBtn")?.addEventListener("click", () => {
    lockSupervisor();
    toast("Supervisor section locked.");
    renderSupervisor(mount);
  });

  mount.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-report-status]");
    if (!button) return;
    const reportId = button.dataset.reportId;
    const status = button.dataset.reportStatus;
    if (!reportId || !status) return;

    let approvalNotes = "";
    if (status === "Needs Correction") {
      approvalNotes = window.prompt(`What needs to be corrected on ${reportId}?`, "") || "";
      if (!approvalNotes.trim()) {
        toast("Add a correction note so the officer knows what to fix.", true);
        return;
      }
    }

    if (status === "Resolved" && !window.confirm(`Mark ${reportId} resolved?`)) return;
    if (status === "Approved" && !window.confirm(`Approve ${reportId}?`)) return;

    const name = reviewerName();
    if (!name) {
      toast("Enter your supervisor name before updating a report.", true);
      document.getElementById("supervisorReviewerName")?.focus();
      return;
    }

    const token = supervisorToken();
    if (!token) {
      toast("Supervisor access expired. Enter the PIN again.", true);
      renderSupervisor(mount);
      return;
    }

    button.disabled = true;
    try {
      await submitAction("updateReportStatus", {
        reportId,
        status,
        approvalNotes,
        reviewedBy: name,
        supervisorToken: token
      });
      toast(`${reportId} marked ${status}.`);
      refreshHubData();
    } catch (error) {
      toast(error.message || "Could not update report.", true);
      button.disabled = false;
    }
  });

  const unsubscribe = subscribe(() => {
    if (!document.getElementById("supPendingApprovals")) {
      unsubscribe();
      return;
    }
    paint();
  });

  paint();
}

function renderSupervisorLock(mount) {
  mount.innerHTML = `
    <section class="page-header">
      <div>
        <p class="page-kicker">Supervisor access</p>
        <h2>Supervisor Review</h2>
        <p>Enter the supervisor PIN to view approval tools and update report status.</p>
      </div>
    </section>

    <section class="panel supervisor-lock-panel">
      <div class="lock-icon" aria-hidden="true">${icon("lock")}</div>
      <h3>Locked supervisor section</h3>
      <p>Regular officer tools remain available. Approval tools and report-status changes require a valid supervisor session.</p>
      <form id="supervisorPinForm" class="supervisor-pin-form" novalidate>
        <div class="field">
          <label for="supervisorPin">Supervisor PIN</label>
          <input id="supervisorPin" name="supervisorPin" type="password" inputmode="numeric" autocomplete="current-password" required autofocus />
          <p class="hint">The PIN is checked by the Netlify function. The Apps Script token still stays hidden from the browser.</p>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Unlock supervisor</button>
        </div>
      </form>
    </section>
  `;

  const form = document.getElementById("supervisorPinForm");
  const input = document.getElementById("supervisorPin");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = "Checking…";

    try {
      await unlockSupervisor(input.value);
      toast("Supervisor section unlocked.");
      renderSupervisor(mount);
    } catch (error) {
      toast(error.message || "Invalid supervisor PIN.", true);
      input.value = "";
      input.focus();
    } finally {
      button.disabled = false;
      button.textContent = "Unlock supervisor";
    }
  });
}

function paint() {
  const nodes = ["supPendingApprovals", "supUrgent", "supFlagged", "supOpen", "supKeys"].map((id) =>
    document.getElementById(id)
  );

  if (store.hubStatus === "loading" && !store.hubData) {
    nodes.forEach((n) => setLoading(n));
    return;
  }

  if (store.hubStatus === "error" && !store.hubData) {
    nodes.forEach((n) => setError(n, store.hubError));
    return;
  }

  const data = store.hubData || {};
  const reports = data.openReports || [];
  const pendingApprovals = data.pendingApprovalReports || reports.filter(isPendingApproval);
  const urgent = reports.filter((item) =>
    ["urgent", "high"].includes(String(item.priority || "").toLowerCase())
  );
  const flagged = (data.passdownEntries || []).filter((item) => item.flagged);
  const keys = data.keysAndEquipmentOut || [];

  renderList(document.getElementById("supPendingApprovals"), pendingApprovals, pendingReportRow, "No reports awaiting approval.");
  renderList(document.getElementById("supUrgent"), urgent, openReportRow, "No urgent or high-priority reports open.");
  renderList(document.getElementById("supOpen"), reports, openReportRow, "No open reports.");

  renderList(document.getElementById("supFlagged"), flagged, (item) => `
    <div class="list-row">
      <strong>${escapeHtml(item.shift || "Shift")} · ${escapeHtml(item.officer || "")} <span class="badge badge-flagged">Flagged</span></strong>
      <p>${escapeHtml(compactText(item.notes || "", 260))}</p>
      <div class="row-meta"><span class="form-code">${escapeHtml(item.timestampDisplay || item.timestamp || "")}</span></div>
    </div>
  `, "Nothing flagged in the last 24 hours.");

  renderList(document.getElementById("supKeys"), keys, (item) => `
    <div class="list-row">
      <strong>${escapeHtml(item.keyName || "Issued item")} <span class="form-code">${escapeHtml(item.checkoutId || "")}</span></strong>
      <p>${escapeHtml(item.vendorEmployee || "")} · ${escapeHtml(item.vendorCompany || "")} — issued ${escapeHtml(item.timeOfIssueDisplay || item.timeOfIssue || "")}</p>
    </div>
  `, "Nothing checked out.");
}

function pendingReportRow(item) {
  return reportShell(item, `
    <button type="button" class="btn btn-primary" data-report-id="${escapeHtml(item.reportId || "")}" data-report-status="Approved">Approve report</button>
    <button type="button" class="btn btn-danger" data-report-id="${escapeHtml(item.reportId || "")}" data-report-status="Needs Correction">Needs correction</button>
  `);
}

function openReportRow(item) {
  const isPending = isPendingApproval(item);
  return reportShell(item, `
    ${isPending ? `<button type="button" class="btn btn-primary" data-report-id="${escapeHtml(item.reportId || "")}" data-report-status="Approved">Approve</button>` : `<button type="button" class="btn btn-quiet" data-report-id="${escapeHtml(item.reportId || "")}" data-report-status="Reviewed">Mark reviewed</button>`}
    <button type="button" class="btn btn-danger" data-report-id="${escapeHtml(item.reportId || "")}" data-report-status="Resolved">Resolve</button>
  `);
}

function reportShell(item, actions) {
  return `
    <div class="list-row">
      <strong>${escapeHtml(item.reportType || "Report")} <span class="form-code">${escapeHtml(item.reportId || "")}</span></strong>
      <div class="row-meta">
        ${priorityBadge(item.priority)}
        ${statusPill(item.status || "Pending Approval")}
        ${item.approvalStatus ? `<span class="status-pill status-approval">Approval: ${escapeHtml(item.approvalStatus)}</span>` : ""}
        <span class="form-code">${escapeHtml(item.campus || "")}</span>
        ${item.location ? `<span class="form-code">${escapeHtml(item.location)}</span>` : ""}
        ${item.occurrenceDisplay ? `<span class="form-code">${escapeHtml(item.occurrenceDisplay)}</span>` : ""}
      </div>
      <p>${escapeHtml(compactText(item.summary || "", 260))}</p>
      ${peopleDetails(item.peopleInvolved)}
      ${item.approvalNotes ? `<p class="approval-note"><strong>Approval note:</strong> ${escapeHtml(compactText(item.approvalNotes, 220))}</p>` : ""}
      ${attachmentStrip(item.attachments)}
      <div class="form-actions">${actions}</div>
    </div>`;
}

function peopleDetails(people) {
  if (!Array.isArray(people) || !people.length) return "";
  return `<div class="record-meta"><strong>People involved:</strong> ${people.map((person) => {
    const details = [person.name, person.role, person.student ? `Student: ${person.student}` : ""].filter(Boolean).map(escapeHtml).join(" · ");
    return `<span>${details}</span>`;
  }).join("")}</div>`;
}

function isPendingApproval(item) {
  const approval = String(item?.approvalStatus || "").trim().toLowerCase();
  const status = String(item?.status || "").trim().toLowerCase();
  return approval === "pending" || status === "pending approval";
}

function reviewerName() {
  const input = document.getElementById("supervisorReviewerName");
  const value = String(input?.value || "").trim();
  if (value) return value;
  try {
    return localStorage.getItem("phsHub.supervisorName") || "";
  } catch {
    return "";
  }
}
