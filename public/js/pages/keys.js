import { store, subscribe, refreshHubData } from "../store.js";
import { escapeHtml, options, bindSubmit, toast, setLoading, setError, renderList, wireRememberedInput } from "../ui.js";
import { submitAction } from "../api.js";

export function renderKeys(mount) {
  const meta = store.metadata || {};

  mount.innerHTML = `
    <section class="page-header">
      <div>
        <p class="eyebrow">Keys &amp; Equipment · KC-03</p>
        <h2>Checkout desk</h2>
        <p class="page-subtitle">Issue, track, and return keys, cards, radios, and other controlled items.</p>
      </div>
    </section>


    <div class="two-col">
      <section class="panel">
        <h3>New checkout</h3>
        <p class="required-note">Fields marked * are required.</p>
        <form id="checkoutForm" novalidate>
          <div class="form-grid">
            <div class="field full">
              <label for="kcKey">Key / keycard / item</label>
              <select id="kcKey" name="keyName" required>${options(meta.keyList)}</select>
            </div>
            <div class="field">
              <label for="kcEmployee">Recipient</label>
              <input id="kcEmployee" name="vendorEmployee" required autocomplete="off" placeholder="Vendor / staff name" />
            </div>
            <div class="field">
              <label for="kcCompany">Company / department</label>
              <input id="kcCompany" name="vendorCompany" required autocomplete="off" />
            </div>
            <div class="field">
              <label for="kcBadge">Contractor badge issued</label>
              <select id="kcBadge" name="badgeIssued" required>
                <option value="">Select…</option>
                <option>Yes</option>
                <option>No</option>
                <option>N/A</option>
              </select>
            </div>
            <div class="field">
              <label for="kcTime">Time of issue</label>
              <input id="kcTime" name="timeOfIssue" type="time" required />
            </div>
            <div class="field full">
              <label for="kcOfficer">Issuing officer</label>
              <input id="kcOfficer" name="issuingOfficer" required autocomplete="name" />
            </div>
            <div class="field full">
              <label for="kcRemarks">Remarks</label>
              <textarea id="kcRemarks" name="remarks" placeholder="Expected return time, access limits, escort instructions, etc."></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Issue item</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <h3>Currently out</h3>
        <div class="tool-row">
          <input id="keyFilter" type="search" placeholder="Filter by item, person, company, or officer" />
        </div>
        <div id="openKeysList"></div>
      </section>
    </div>
  `;

  const timeInput = document.getElementById("kcTime");
  const now = new Date();
  timeInput.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  wireRememberedInput(document.getElementById("kcOfficer"), "phsHub.officerName");

  document.getElementById("keyFilter").addEventListener("input", paintOpenKeys);

  bindSubmit(document.getElementById("checkoutForm"), async (data) => {
    const result = await submitAction("keyCheckout", data);
    toast(`${result.message || "Checkout saved."} ${result.checkoutId || ""}`.trim());
    refreshHubData();
  });

  mount.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-return-id]");
    if (!button) return;

    const checkoutId = button.dataset.returnId;
    let defaultOfficer = "Security";
    try { defaultOfficer = localStorage.getItem("phsHub.officerName") || "Security"; } catch {}
    const returnedBy = window.prompt("Returned to (officer name):", defaultOfficer);
    if (returnedBy === null) return;

    button.disabled = true;
    try {
      await submitAction("keyReturn", { checkoutId, returnedBy: returnedBy || "Security" });
      toast(`${checkoutId} marked returned.`);
      refreshHubData();
    } catch (error) {
      toast(error.message, true);
      button.disabled = false;
    }
  });

  const unsubscribe = subscribe(() => {
    if (!document.getElementById("openKeysList")) {
      unsubscribe();
      return;
    }
    paintOpenKeys();
  });

  paintOpenKeys();
}

function paintOpenKeys() {
  const node = document.getElementById("openKeysList");
  const filter = String(document.getElementById("keyFilter")?.value || "").toLowerCase();

  if (store.hubStatus === "loading" && !store.hubData) {
    setLoading(node, 4);
    return;
  }

  if (store.hubStatus === "error" && !store.hubData) {
    setError(node, store.hubError);
    return;
  }

  let items = store.hubData?.keysAndEquipmentOut || [];
  if (filter) {
    items = items.filter((item) => JSON.stringify(item).toLowerCase().includes(filter));
  }

  renderList(node, items, (item) => `
    <article class="key-card">
      <div class="key-card__head">
        <strong>${escapeHtml(item.keyName || "Issued item")}</strong>
        <span class="form-code">${escapeHtml(item.checkoutId || "")}</span>
      </div>
      <p>${escapeHtml(item.vendorEmployee || "Unknown recipient")} · ${escapeHtml(item.vendorCompany || "Unknown company")}</p>
      <p>Issued ${escapeHtml(item.timeOfIssueDisplay || item.timeOfIssue || "")} by ${escapeHtml(item.issuingOfficer || "—")}</p>
      ${item.remarks ? `<p>${escapeHtml(item.remarks)}</p>` : ""}
      <button type="button" class="btn btn-quiet" data-return-id="${escapeHtml(item.checkoutId || "")}">Mark returned</button>
    </article>
  `, filter ? "No matching checkouts." : "Nothing is checked out right now.");
}
