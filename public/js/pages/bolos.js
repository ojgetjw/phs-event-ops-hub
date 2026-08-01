import { store, subscribe, refreshHubData } from "../store.js";
import { escapeHtml, options, bindSubmit, toast, setLoading, setError, renderList, attachmentStrip, fileField, wireFileField, uploadFiles, humanDateTime, compactText } from "../ui.js";
import { submitAction } from "../api.js";

export function renderBolos(mount) {
  const meta = store.metadata || {};

  mount.innerHTML = `
    <section class="page-header">
      <div>
        <p class="eyebrow">B.O.L.O.s · BL-06</p>
        <h2>Advisory board</h2>
        <p class="page-subtitle">Active be-on-the-lookout advisories for both campuses.</p>
      </div>
      <span class="badge badge-private">Drive uploads private by default</span>
    </section>

    <div class="two-col">
      <section class="panel panel-bolo">
        <h3>Post a B.O.L.O.</h3>
        <p class="required-note">Fields marked * are required.</p>
        <form id="boloForm" novalidate>
          <div class="form-grid">
            <div class="field">
              <label for="blType">Type</label>
              <select id="blType" name="type" required>${options(meta.boloTypes)}</select>
            </div>
            <div class="field">
              <label for="blExpires">Expires (optional)</label>
              <input id="blExpires" name="expires" type="date" />
            </div>
            <div class="field full">
              <label for="blSubject">Subject</label>
              <input id="blSubject" name="subject" required placeholder="Person, vehicle, or advisory title" />
            </div>
            <div class="field full">
              <label for="blDetails">Details</label>
              <textarea id="blDetails" name="details" required spellcheck="true" placeholder="Description, last known location, instructions for officers, and who to notify."></textarea>
            </div>
            ${fileField("bl")}
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Post B.O.L.O.</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <h3>Active advisories</h3>
        <div class="tool-row">
          <input id="boloFilter" type="search" placeholder="Filter advisories" />
        </div>
        <div id="boloList"></div>
      </section>
    </div>
  `;

  const files = wireFileField("bl");
  document.getElementById("boloFilter").addEventListener("input", paint);

  bindSubmit(document.getElementById("boloForm"), async (data) => {
    const attachments = await uploadFiles(files.input, "BOLOs", submitAction);
    const result = await submitAction("submitBolo", { ...data, attachments });
    toast(`${result.message || "B.O.L.O. posted."} ${result.boloId || ""}`.trim());
    files.clear();
    refreshHubData();
  });

  mount.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-resolve-subject]");
    if (!button) return;

    if (!window.confirm(`Resolve B.O.L.O. "${button.dataset.resolveSubject}"?`)) return;

    button.disabled = true;
    try {
      await submitAction("resolveBolo", {
        boloId: button.dataset.resolveId || "",
        subject: button.dataset.resolveSubject,
        timestamp: button.dataset.resolveTimestamp || ""
      });
      toast("B.O.L.O. resolved.");
      refreshHubData();
    } catch (error) {
      toast(error.message, true);
      button.disabled = false;
    }
  });

  const unsubscribe = subscribe(() => {
    if (!document.getElementById("boloList")) {
      unsubscribe();
      return;
    }
    paint();
  });

  paint();
}

function paint() {
  const node = document.getElementById("boloList");
  const filter = String(document.getElementById("boloFilter")?.value || "").toLowerCase();

  if (store.hubStatus === "loading" && !store.hubData) {
    setLoading(node, 4);
    return;
  }

  if (store.hubStatus === "error" && !store.hubData) {
    setError(node, store.hubError);
    return;
  }

  let items = store.hubData?.activeBolos || [];
  if (filter) items = items.filter((item) => JSON.stringify(item).toLowerCase().includes(filter));

  renderList(node, items, (item) => `
    <div class="list-row">
      <strong>${escapeHtml(item.subject || "B.O.L.O.")}
        ${item.boloId ? `<span class="form-code">${escapeHtml(item.boloId)}</span>` : ""}
        <span class="badge badge-urgent">Active</span></strong>
      <p>${escapeHtml(compactText(item.details || "", 320))}</p>
      <div class="row-meta">
        <span class="form-code">${escapeHtml(item.type || "")}</span>
        <span class="form-code">Posted ${escapeHtml(item.timestampDisplay || humanDateTime(item.timestamp) || "")}</span>
        ${item.expiresDisplay || item.expires ? `<span class="form-code">Expires ${escapeHtml(item.expiresDisplay || item.expires)}</span>` : ""}
      </div>
      ${attachmentStrip(item.attachments)}
      <button type="button" class="btn btn-quiet"
        data-resolve-id="${escapeHtml(item.boloId || "") }"
        data-resolve-subject="${escapeHtml(item.subject || "") }"
        data-resolve-timestamp="${escapeHtml(item.timestamp || "") }">Resolve</button>
    </div>
  `, filter ? "No matching B.O.L.O.s." : "No active B.O.L.O.s.");
}
