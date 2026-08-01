// GET /api/hub-data — asks Apps Script for the dashboard payload (hubData
// action), normalizes field-name aliases, and returns a stable shape.
// Requires a signed-in officer session.

import { requireOfficer } from "./_shared/officer-session.mjs";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  const officer = requireOfficer(request);
  if (!officer.ok) {
    return officer.response;
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL || process.env.GAS_WEB_APP_URL;
  const apiToken = process.env.APPS_SCRIPT_TOKEN || process.env.GAS_API_TOKEN;

  if (!appsScriptUrl) {
    return json(emptyPayload("Missing APPS_SCRIPT_URL / GAS_WEB_APP_URL."), 502);
  }

  if (!apiToken) {
    return json(emptyPayload("Missing APPS_SCRIPT_TOKEN / GAS_API_TOKEN."), 502);
  }

  try {
    const res = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
        Accept: "application/json"
      },
      body: JSON.stringify({ action: "hubData", token: apiToken })
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Apps Script did not return JSON: ${text.slice(0, 300)}`);
    }

    if (data.ok === false) {
      throw new Error(data.error || "Apps Script returned ok:false.");
    }

    return json(normalizeHubData(data));
  } catch (error) {
    return json(
      {
        ...emptyPayload("Hub data request failed."),
        detail: error.message || String(error)
      },
      502
    );
  }
}

export const config = { path: "/api/hub-data" };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function emptyPayload(error) {
  return {
    ok: false,
    error,
    keysAndEquipmentOut: [],
    passdownEntries: [],
    activeBolos: [],
    openReports: [],
    pendingApprovalReports: [],
    recentDailyActivity: [],
    keysAndEquipmentOutCount: 0,
    timestamp: new Date().toISOString()
  };
}

function normalizeHubData(data = {}) {
  const keysAndEquipmentOut =
    firstArray(data.keysAndEquipmentOut, data.keysEquipmentOut, data.openKeys, data.keysOut, data.openCheckouts) || [];

  const passdownEntries =
    firstArray(data.passdownEntries, data.passdown, data.passdowns) || [];

  const activeBolos =
    firstArray(data.activeBolos, data.bolos, data.activeBOLOs) || [];

  const openReports =
    firstArray(data.openReports, data.reportsOpen, data.followUps) || [];

  const pendingApprovalReports =
    firstArray(data.pendingApprovalReports, data.pendingApprovals, data.reportsPendingApproval) ||
    openReports.filter((report) => {
      const approval = String(report?.approvalStatus || "").trim().toLowerCase();
      const status = String(report?.status || "").trim().toLowerCase();
      return approval === "pending" || status === "pending approval";
    });

  const recentDailyActivity =
    firstArray(data.recentDailyActivity, data.dailyActivityEntries, data.dailyActivity) || [];

  return {
    ok: data.ok !== false,
    timestamp: data.timestamp || new Date().toISOString(),
    keysAndEquipmentOut,
    passdownEntries,
    activeBolos,
    openReports,
    pendingApprovalReports,
    recentDailyActivity,
    keysAndEquipmentOutCount: keysAndEquipmentOut.length,
    passdownCount: passdownEntries.length,
    activeBoloCount: activeBolos.length,
    openReportCount: openReports.length,
    pendingApprovalCount: pendingApprovalReports.length,
    recentDailyActivityCount: recentDailyActivity.length,
    counts: {
      keysAndEquipmentOut: keysAndEquipmentOut.length,
      passdown: passdownEntries.length,
      activeBolos: activeBolos.length,
      openReports: openReports.length,
      pendingApprovalReports: pendingApprovalReports.length,
      recentDailyActivity: recentDailyActivity.length
    }
  };
}

function firstArray(...values) {
  return values.find((value) => Array.isArray(value));
}
