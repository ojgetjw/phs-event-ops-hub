// Shared render helpers.

export function icon(name, className = "") {
  return `<svg class="icon ${escapeHtml(className)}" aria-hidden="true"><use href="#icon-${escapeHtml(name)}"></use></svg>`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function setLoading(node, rows = 3) {
  if (!node) return;
  node.innerHTML = Array.from({ length: rows })
    .map((_, i) => `<div class="skeleton ${["wide", "mid", "narrow"][i % 3]}"></div>`)
    .join("");
}

export function setEmpty(node, message) {
  if (!node) return;
  node.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

export function setError(node, message, retryId) {
  if (!node) return;
  node.innerHTML = `
    <div class="error-state" role="alert">
      <p>Unable to load this section.</p>
      ${retryId ? `<button type="button" class="btn btn-quiet" data-retry="${escapeHtml(retryId)}">Try again</button>` : ""}
      <small>${escapeHtml(message)}</small>
    </div>`;
}

export function renderList(node, items, template, emptyText) {
  if (!node) return;
  if (!items.length) {
    setEmpty(node, emptyText);
    return;
  }
  node.innerHTML = items.map(template).join("");
}

export function toast(message, isError = false, duration = 5000) {
  const region = document.getElementById("toastRegion");
  if (!region) return;
  const el = document.createElement("div");
  el.className = "toast" + (isError ? " is-error" : "");
  el.textContent = message;
  region.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

export function priorityBadge(priority) {
  const value = String(priority || "").toLowerCase();
  const cls =
    value === "urgent" ? "badge-urgent" :
    value === "high" ? "badge-high" :
    value === "medium" ? "badge-medium" : "badge-routine";
  return `<span class="badge ${cls}">${escapeHtml(priority || "Routine")}</span>`;
}

export function statusPill(status) {
  const value = String(status || "New").toLowerCase().replace(/\s+/g, "-");
  return `<span class="status-pill status-${escapeHtml(value)}">${escapeHtml(status || "New")}</span>`;
}

export function options(list, { includeBlank = true, blankLabel = "Select…" } = {}) {
  const blank = includeBlank ? `<option value="">${escapeHtml(blankLabel)}</option>` : "";
  return (
    blank +
    (list || [])
      .map((item) => {
        const value = typeof item === "string" ? item : item.value;
        const label = typeof item === "string" ? item : item.label;
        return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
      })
      .join("")
  );
}

export function serializeForm(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = typeof value === "string" ? value.trim() : value;
  });
  form.querySelectorAll('input[type="checkbox"]').forEach((box) => {
    data[box.name] = box.checked;
  });
  return data;
}

export function bindSubmit(form, handler) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    form.querySelectorAll("input, select, textarea").forEach((control) => {
      control.dataset.touched = "true";
    });

    if (!form.reportValidity()) return;

    const button = form.querySelector('button[type="submit"]');
    const originalLabel = button ? button.innerHTML : "";
    if (button) {
      button.disabled = true;
      button.textContent = "Saving…";
    }

    try {
      await handler(serializeForm(form));
      form.reset();
    } catch (error) {
      toast(error.message || "Something went wrong.", true);
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = originalLabel;
      }
    }
  });

  form.addEventListener("blur", (event) => {
    if (event.target.matches("input, select, textarea")) event.target.dataset.touched = "true";
  }, true);
}

export function attachmentStrip(attachments) {
  if (!Array.isArray(attachments) || !attachments.length) return "";

  return `<div class="attachment-strip">${attachments
    .map((item) => {
      const viewUrl = String(item.viewUrl || "");
      const thumbUrl = String(item.thumbUrl || "");
      const name = String(item.name || "Attachment");
      if (!viewUrl.startsWith("https://drive.google.com/")) return "";
      return thumbUrl
        ? `<a href="${escapeHtml(viewUrl)}" target="_blank" rel="noopener" title="${escapeHtml(name)}"><img src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.replaceWith(document.createTextNode(this.alt))" /></a>`
        : `<a href="${escapeHtml(viewUrl)}" target="_blank" rel="noopener">${escapeHtml(name)}</a>`;
    })
    .join("")}</div>`;
}

export function fileField(idPrefix) {
  return `
    <div class="field full file-field">
      <label for="${idPrefix}Files">Photos / files (optional)</label>
      <input id="${idPrefix}Files" type="file" multiple accept="image/*,application/pdf" />
      <p class="hint">Up to 3 files, 4 MB each. Photos and PDFs only. Files save privately to the Security Hub upload folder in Google Drive.</p>
      <ul class="file-list" id="${idPrefix}FileList"></ul>
    </div>`;
}

export function wireFileField(idPrefix) {
  const input = document.getElementById(`${idPrefix}Files`);
  const list = document.getElementById(`${idPrefix}FileList`);

  input.addEventListener("change", () => {
    list.innerHTML = Array.from(input.files)
      .map((file) => `<li>${escapeHtml(file.name)} · ${(file.size / 1024 / 1024).toFixed(1)} MB</li>`)
      .join("");
  });

  return {
    input,
    clear() {
      input.value = "";
      list.innerHTML = "";
    }
  };
}

export async function uploadFiles(input, area, submitActionFn) {
  const files = Array.from(input.files || []);
  if (!files.length) return [];

  if (files.length > 3) {
    throw new Error("Attach up to 3 files.");
  }

  const oversized = files.find((file) => file.size > 4 * 1024 * 1024);
  if (oversized) {
    throw new Error(`"${oversized.name}" is over 4 MB. Resize or crop it and try again.`);
  }

  const uploaded = [];
  for (const file of files) {
    const result = await submitActionFn("uploadFile", {
      area,
      file: {
        name: file.name,
        type: file.type || "application/octet-stream",
        data: await toBase64(file)
      }
    });
    uploaded.push({ name: result.name || file.name, fileId: result.fileId });
  }
  return uploaded;
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error(`Could not read "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

export function locationField(idPrefix) {
  return `
    <div class="field">
      <label for="${idPrefix}Location">Location</label>
      <select id="${idPrefix}Location" required>
        <option value="">Select campus first</option>
      </select>
    </div>
    <div class="field" id="${idPrefix}LocationOtherWrap" hidden>
      <label for="${idPrefix}LocationOther">Location details</label>
      <input id="${idPrefix}LocationOther" placeholder="Describe the location" />
    </div>`;
}

export function wireLocationField(idPrefix, campusSelect, locationGroups) {
  const select = document.getElementById(`${idPrefix}Location`);
  const otherWrap = document.getElementById(`${idPrefix}LocationOtherWrap`);
  const otherInput = document.getElementById(`${idPrefix}LocationOther`);

  function repopulate() {
    const groups = (locationGroups || {})[campusSelect.value];
    select.innerHTML = "";

    if (!groups) {
      select.appendChild(new Option(campusSelect.value ? "Other / not listed" : "Select campus first", "__other__"));
      select.value = "__other__";
      otherWrap.hidden = !campusSelect.value;
      otherInput.required = !otherWrap.hidden;
      return;
    }

    select.appendChild(new Option("Select location…", ""));

    Object.keys(groups).forEach((groupName) => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = groupName;
      groups[groupName].forEach((place) => optgroup.appendChild(new Option(place, place)));
      select.appendChild(optgroup);
    });

    select.appendChild(new Option("Other / not listed", "__other__"));
    otherWrap.hidden = true;
    otherInput.required = false;
  }

  select.addEventListener("change", () => {
    otherWrap.hidden = select.value !== "__other__";
    otherInput.required = !otherWrap.hidden;
    if (!otherWrap.hidden) otherInput.focus();
  });

  campusSelect.addEventListener("change", repopulate);
  repopulate();

  return {
    value() {
      if (select.value === "__other__") return otherInput.value.trim();
      return select.value;
    },
    reset() {
      repopulate();
      otherInput.value = "";
    }
  };
}

export function wireRememberedInput(input, key) {
  if (!input || !key) return;
  try {
    const saved = localStorage.getItem(key);
    if (saved && !input.value) { input.value = saved; input.defaultValue = saved; }
    input.addEventListener("change", () => {
      if (input.value.trim()) { localStorage.setItem(key, input.value.trim()); input.defaultValue = input.value.trim(); }
    });
  } catch {
    // Local storage can be blocked; the app should not care.
  }
}

export function humanDateTime(value) {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value || "");
  return dt.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function compactText(value, max = 180) {
  const text = String(value || "").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
