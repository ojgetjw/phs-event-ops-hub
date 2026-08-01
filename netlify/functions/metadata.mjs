// GET /api/metadata — fetches form/option metadata from Apps Script,
// normalizes it, and always returns something usable (fallbacks included).
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

  if (!appsScriptUrl) {
    return json(fallbackMetadata("Missing APPS_SCRIPT_URL / GAS_WEB_APP_URL."));
  }

  const metadataUrl = appsScriptUrl.includes("?")
    ? `${appsScriptUrl}&action=metadata`
    : `${appsScriptUrl}?action=metadata`;

  try {
    const res = await fetch(metadataUrl, {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return json(fallbackMetadata("Apps Script metadata did not return JSON."));
    }

    return json(normalizeMetadata(data));
  } catch (error) {
    return json(fallbackMetadata(error.message || String(error)));
  }
}

export const config = { path: "/api/metadata" };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function normalizeMetadata(data) {
  const reportTypeOptions =
    Array.isArray(data?.reportTypeOptions) && data.reportTypeOptions.length
      ? data.reportTypeOptions
      : objectReportTypesToOptions(data?.reportTypes);

  return {
    ok: data?.ok !== false,
    appName: data?.appName || "PHS Security Hub",
    schoolName: data?.schoolName || "Pembroke Hill School",
    reportTypes: data?.reportTypes || fallbackReportTypesObject(),
    reportTypeOptions,
    incidentTypes:
      Array.isArray(data?.incidentTypes) && data.incidentTypes.length
        ? data.incidentTypes
        : reportTypeOptions.filter((item) => item.key !== "daily_activity"),
    dailyActivityTypes:
      Array.isArray(data?.dailyActivityTypes) && data.dailyActivityTypes.length
        ? data.dailyActivityTypes
        : fallbackDailyActivityTypes(),
    boloTypes:
      Array.isArray(data?.boloTypes) && data.boloTypes.length
        ? data.boloTypes
        : fallbackBoloTypes(),
    shifts:
      Array.isArray(data?.shifts) && data.shifts.length
        ? data.shifts
        : fallbackShifts(),
    campuses:
      Array.isArray(data?.campuses) && data.campuses.length
        ? data.campuses
        : fallbackCampuses(),
    priorityOptions:
      Array.isArray(data?.priorityOptions) && data.priorityOptions.length
        ? data.priorityOptions
        : fallbackPriorities(),
    statusOptions:
      Array.isArray(data?.statusOptions) && data.statusOptions.length
        ? data.statusOptions
        : fallbackStatuses(),
    keyList:
      Array.isArray(data?.keyList) && data.keyList.length
        ? data.keyList
        : fallbackKeyList(),
    locationGroups:
      data?.locationGroups && typeof data.locationGroups === "object"
        ? data.locationGroups
        : fallbackLocationGroups(),
    version: data?.version || null,
    warning: data?.warning || null
  };
}

function fallbackLocationGroups() {
  return {
    "Ward Parkway / Upper Campus": {
      "Main Areas": ["Overall Campus Patrol", "The Bellis Athletic Center", "Grant Gym", "Beals Gym", "Hicks Field", "BAC Parking Lot", "Ref Parking Lot", "Centennial Loading Dock", "Centennial Hall", "Jordan Hall", "Upper School", "Upper School Commons", "Jordan Faculty Lot", "Boocock Middle", "Kemper Library", "Phillips Gym", "The Lawn", "Kroh Complex", "Hall Student Center", "Patterson Hall", "Boocock Parking Lot", "Senior Parking Lot", "Middle School Driveline", "Ward SOC"],
      "Ward Gates": ["Boocock Gate", "Jordan Gate", "Art Gate", "Referee Gate", "Vehicle Gate", "Hicks Gate", "Bellis Gate", "Centennial Gate"]
    },
    "Wornall / Lower Campus": {
      "Main Areas": ["Overall Campus Patrol", "Early Childhood", "Founders Hall", "Dining Hall", "DeRamus Gym", "Intermediate Building", "Primary Building", "Primary Parking Lot", "Early Childhood Parking Lot", "Curry Theater", "Carriage House", "The Quad", "The Turf Field", "Secret Playground", "Gaga Playground", "Mellon Building", "Loose Park", "Early Childhood / Intermediate Driveline", "Wornall Security Kiosk"],
      "Wornall Gates": ["Turf Field Gate", "EC Main Gate", "Wornall Main Gate", "DeRamus Gate", "Dock Gate", "Intermediate Gate", "Archives Gate", "51st Street Gate", "EC Side Gate"]
    }
  };
}

function objectReportTypesToOptions(reportTypes) {
  if (!reportTypes || typeof reportTypes !== "object") {
    return fallbackReportTypeOptions();
  }

  return Object.keys(reportTypes).map((key) => {
    const item = reportTypes[key] || {};
    return {
      key,
      value: key,
      label: item.label || key,
      description: item.description || "",
      category: item.category || "major"
    };
  });
}

function fallbackMetadata(reason) {
  return normalizeMetadata({
    ok: true,
    warning: reason || "Using fallback metadata."
  });
}

function fallbackReportTypesObject() {
  return fallbackReportTypeOptions().reduce((acc, item) => {
    acc[item.key] = {
      label: item.label,
      description: item.description,
      category: item.category
    };
    return acc;
  }, {});
}

function fallbackReportTypeOptions() {
  return [
    { key: "daily_activity", value: "daily_activity", label: "Daily Activity Log", description: "Quick officer activity entry for routine posts and patrol tasks.", category: "daily" },
    { key: "threat_violence_concern", value: "threat_violence_concern", label: "Threat / Violence Concern", description: "Threats, concerning language, or possible risk of harm.", category: "major" },
    { key: "weapon_dangerous_item", value: "weapon_dangerous_item", label: "Weapon / Dangerous Item", description: "Weapons, ammunition, or dangerous objects.", category: "major" },
    { key: "medical_emergency_serious_injury", value: "medical_emergency_serious_injury", label: "Medical Emergency / Serious Injury", description: "EMS response, serious injury, or severe medical concern.", category: "major" },
    { key: "missing_unaccounted_for_student", value: "missing_unaccounted_for_student", label: "Missing / Unaccounted For Student", description: "Student cannot be located or accounted for during operations.", category: "major" },
    { key: "trespassing", value: "trespassing", label: "Trespassing", description: "Unapproved presence, visitor refusal, or trespass concern.", category: "major" },
    { key: "custody_dispute", value: "custody_dispute", label: "Custody Dispute", description: "Custody-related safety or release concern.", category: "major" },
    { key: "assault_physical_altercation", value: "assault_physical_altercation", label: "Assault / Physical Altercation", description: "Fight, physical aggression, or assaultive conduct.", category: "major" },
    { key: "abuse_neglect_concern", value: "abuse_neglect_concern", label: "Abuse / Neglect Concern", description: "Observed, reported, or suspected abuse/neglect concern.", category: "major" },
    { key: "bullying", value: "bullying", label: "Bullying", description: "Bullying report or repeated targeted conduct.", category: "major" },
    { key: "harassment", value: "harassment", label: "Harassment", description: "Harassment, intimidation, or hostile behavior.", category: "major" },
    { key: "self_harm", value: "self_harm", label: "Self Harm", description: "Self-harm ideation, statements, or conduct.", category: "major" },
    { key: "drug_alcohol_concern", value: "drug_alcohol_concern", label: "Drug / Alcohol Concern", description: "Substance use, possession, or impairment concern.", category: "major" },
    { key: "suspicious_activity", value: "suspicious_activity", label: "Suspicious Activity", description: "Unusual behavior, surveillance, or suspicious circumstance.", category: "major" },
    { key: "vehicle_pedestrian_accident", value: "vehicle_pedestrian_accident", label: "Vehicle / Pedestrian Accident", description: "Traffic, lot, driveline, or pedestrian accident.", category: "major" },
    { key: "lockdown_event", value: "lockdown_event", label: "Lockdown Event", description: "Lockdown, shelter, or protective action activation.", category: "major" },
    { key: "centegix_alert", value: "centegix_alert", label: "CENTEGIX Alert", description: "CENTEGIX badge or system alert requiring security response or documentation.", category: "major" },
    { key: "kcpd_response", value: "kcpd_response", label: "KCPD Response to Campus", description: "KCPD response, assistance, investigation, or enforcement activity on campus.", category: "major" },
    { key: "elopement", value: "elopement", label: "Elopement", description: "Student leaves an assigned area, supervision, or campus boundary without authorization.", category: "major" },
    { key: "life_safety_event", value: "life_safety_event", label: "Life Safety Event", description: "Fire, alarm, evacuation, hazardous condition, or other life-safety event.", category: "major" },
    { key: "phs_property_damage", value: "phs_property_damage", label: "Pembroke Hill Property Damage", description: "Damage to school-owned buildings, grounds, equipment, or other property.", category: "major" },
    { key: "personal_property_damage", value: "personal_property_damage", label: "Personal Property Damage", description: "Damage to property owned by an individual.", category: "major" },
    { key: "theft_school_property", value: "theft_school_property", label: "Theft of School Property", description: "Suspected or confirmed theft of school-owned property.", category: "major" },
    { key: "theft_personal_property", value: "theft_personal_property", label: "Theft of Personal Property", description: "Suspected or confirmed theft of property owned by an individual.", category: "major" }
  ];
}

function fallbackDailyActivityTypes() {
  return ["Patrol Check", "Door / Gate Check", "Student Assist", "Staff Assist", "Visitor Assist", "Traffic / Driveline", "Event Coverage", "Alarm Check", "Unlock / Lockup", "Maintenance Notified", "Other"];
}

function fallbackBoloTypes() {
  return ["Trespass Warning", "Vehicle of Interest", "Person of Interest", "Custody Flag", "General Advisory"];
}

function fallbackShifts() {
  return ["Day", "Evening", "Event"];
}

function fallbackCampuses() {
  return ["Ward Parkway / Upper Campus", "Wornall / Lower Campus", "Off Campus", "Other"];
}

function fallbackPriorities() {
  return ["Routine", "Medium", "High", "Urgent"];
}

function fallbackStatuses() {
  return ["Pending Approval", "Approved", "Needs Correction", "Reviewed", "Assigned", "Resolved", "No Action Needed", "Archived"];
}

function fallbackKeyList() {
  return ["Master Key — Ward Parkway", "Master Key — Wornall", "Contractor Keycard 01", "Contractor Keycard 02", "Contractor Keycard 03", "Mechanical Rooms Key", "Athletic Facilities Key", "Other (note in remarks)"];
}
