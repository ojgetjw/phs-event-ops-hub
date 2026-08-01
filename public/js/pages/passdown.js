import { store, subscribe, refreshHubData } from "../store.js";
import { escapeHtml, options, bindSubmit, toast, setLoading, setError, renderList, wireRememberedInput, humanDateTime, compactText } from "../ui.js";
import { submitAction } from "../api.js";

export function renderPassdown(mount) {
  const meta = store.metadata || {};

  mount.innerHTML = `
    <section class="page-header">
      <div>
        <p class="eyebrow">Pass-down · PD-04</p>
        <h2>Shift pass-down</h2>
        <p class="page-subtitle">Continuity notes between shifts. Flag anything the next crew should not miss.</p>
      </div>
    </section>

    <div class="two-col">
      <section class="panel">
        <h3>New entry</h3>
        <p class="required-note">Fields marked * are required.</p>
        <form id="passdownForm" novalidate>
          <div class="form-grid">
            <div class="field">
              <label for="pdShift">Shift</label>
              <select id="pdShift" name="shift" required>${options(meta.shifts)}</select>
            </div>
            <div class="field">
              <label for="pdOfficer">Officer</label>
              <input id="pdOfficer" name="officer" required autocomplete="name" />
            </div>
            <div class="field full">
              <label for="pdNotes">Notes</label>
              <textarea id="pdNotes" name="notes" required spellcheck="true" placeholder="What happened, what is still open, and what the next shift needs to do."></textarea>
            </div>
            <div class="field">
              <label for="pdRelated">Related report (optional)</label>
              <input id="pdRelated" name="relatedReport" placeholder="IR-0000" class="mono" />
            </div>
            <div class="field">
              <span class="sr-only" id="pdFlagLabel">Flag for follow-up</span>
              <label class="check-row" for="pdFlag">
                <input type="checkbox" id="pdFlag" name="flagged" />
                Flag for follow-up
              </label>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save pass-down</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <h3>Last 24 hours</h3>
        <div class="tool-row">
          <input id="pdFilter" type="search" placeholder="Filter pass-downs" />
          <select id="pdFlagFilter" aria-label="Flag filter">
            <option value="all">All entries</option>
            <option value="flagged">Flagged only</option>
          </select>
        </div>
        <div id="passdownList"></div>
      </section>
    </div>
  `;

  wireRememberedInput(document.getElementById("pdOfficer"), "phsHub.officerName");
  document.getElementById("pdFilter").addEventListener("input", paint);
  document.getElementById("pdFlagFilter").addEventListener("change", paint);

  bindSubmit(document.getElementById("passdownForm"), async (data) => {
    const result = await submitAction("submitPassdown", data);
    toast(result.message || "Pass-down saved.");
    refreshHubData();
  });

  const unsubscribe = subscribe(() => {
    if (!document.getElementById("passdownList")) {
      unsubscribe();
      return;
    }
    paint();
  });

  paint();
}

function paint() {
  const node = document.getElementById("passdownList");
  const filter = String(document.getElementById("pdFilter")?.value || "").toLowerCase();
  const flagFilter = document.getElementById("pdFlagFilter")?.value || "all";

  if (store.hubStatus === "loading" && !store.hubData) {
    setLoading(node, 4);
    return;
  }

  if (store.hubStatus === "error" && !store.hubData) {
    setError(node, store.hubError);
    return;
  }

  let items = store.hubData?.passdownEntries || [];
  if (flagFilter === "flagged") items = items.filter((item) => item.flagged);
  if (filter) items = items.filter((item) => JSON.stringify(item).toLowerCase().includes(filter));

  renderList(node, items, (item) => `
    <div class="list-row">
      <strong>${escapeHtml(item.shift || "Shift")} · ${escapeHtml(item.officer || "")}
        ${item.flagged ? ' <span class="badge badge-flagged">Flagged</span>' : ""}
      </strong>
      <p>${escapeHtml(compactText(item.notes || "", 260))}</p>
      <div class="row-meta">
        <span class="form-code">${escapeHtml(item.timestampDisplay || humanDateTime(item.timestamp) || "")}</span>
        ${item.relatedReport ? `<span class="form-code">${escapeHtml(item.relatedReport)}</span>` : ""}
      </div>
    </div>
  `, filter || flagFilter === "flagged" ? "No matching pass-down entries." : "No pass-down entries in the last 24 hours.");
}
