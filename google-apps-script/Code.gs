const CONFIG = {
  APP_NAME: "PHS Security Hub",
  SCHOOL_NAME: "Pembroke Hill School",
  TIME_ZONE: "America/Chicago",
  TOKEN_PROPERTY: "PHS_API_TOKEN",
  DAILY_SUMMARY_RECIPIENTS_PROPERTY: "PHS_DAILY_SUMMARY_RECIPIENTS",
  DAILY_SUMMARY_DEFAULT_RECIPIENTS: "twood9083@gmail.com",
  DAILY_SUMMARY_LOOKBACK_HOURS: 24,
  DAILY_SUMMARY_HOUR: 14,
  UPLOAD_FOLDER: "PHS Security Hub Uploads",
  VERSION: "current",
  // Keep report uploads private by default. Share the upload folder with the
  // security team if they need to view attachments from their own accounts.
  UPLOAD_PUBLIC_LINKS: false,
  LOCATION_GROUPS: {
    "Ward Parkway / Upper Campus": {
      "Main Areas": [
        "Overall Campus Patrol",
        "The Bellis Athletic Center",
        "Grant Gym",
        "Beals Gym",
        "Hicks Field",
        "BAC Parking Lot",
        "Ref Parking Lot",
        "Centennial Loading Dock",
        "Centennial Hall",
        "Jordan Hall",
        "Upper School",
        "Upper School Commons",
        "Jordan Faculty Lot",
        "Boocock Middle",
        "Kemper Library",
        "Phillips Gym",
        "The Lawn",
        "Kroh Complex",
        "Hall Student Center",
        "Patterson Hall",
        "Boocock Parking Lot",
        "Senior Parking Lot",
        "Middle School Driveline",
        "Ward SOC"
      ],
      "Ward Gates": [
        "Boocock Gate",
        "Jordan Gate",
        "Art Gate",
        "Referee Gate",
        "Vehicle Gate",
        "Hicks Gate",
        "Bellis Gate",
        "Centennial Gate"
      ]
    },
    "Wornall / Lower Campus": {
      "Main Areas": [
        "Overall Campus Patrol",
        "Early Childhood",
        "Founders Hall",
        "Dining Hall",
        "DeRamus Gym",
        "Intermediate Building",
        "Primary Building",
        "Primary Parking Lot",
        "Early Childhood Parking Lot",
        "Curry Theater",
        "Carriage House",
        "The Quad",
        "The Turf Field",
        "Secret Playground",
        "Gaga Playground",
        "Mellon Building",
        "Loose Park",
        "Early Childhood / Intermediate Driveline",
        "Wornall Security Kiosk"
      ],
      "Wornall Gates": [
        "Turf Field Gate",
        "EC Main Gate",
        "Wornall Main Gate",
        "DeRamus Gate",
        "Dock Gate",
        "Intermediate Gate",
        "Archives Gate",
        "51st Street Gate",
        "EC Side Gate"
      ]
    }
  },
  CAMPUSES: [
    "Ward Parkway / Upper Campus",
    "Wornall / Lower Campus",
    "Off Campus",
    "Other"
  ],
  PRIORITIES: ["Routine", "Medium", "High", "Urgent"],
  STATUS_OPTIONS: ["Pending Approval", "Approved", "Needs Correction", "Reviewed", "Assigned", "Resolved", "No Action Needed", "Archived"],
  DAILY_ACTIVITY_TYPES: [
    "Patrol Check",
    "Door / Gate Check",
    "Student Assist",
    "Staff Assist",
    "Visitor Assist",
    "Traffic / Driveline",
    "Event Coverage",
    "Alarm Check",
    "Unlock / Lockup",
    "Maintenance Notified",
    "Other"
  ],
  BOLO_TYPES: [
    "Trespass Warning",
    "Vehicle of Interest",
    "Person of Interest",
    "Custody Flag",
    "General Advisory"
  ],
  SHIFTS: ["Day", "Evening", "Event"],
  KEY_LIST: [
    "Master Key — Ward Parkway",
    "Master Key — Wornall",
    "Contractor Keycard 01",
    "Contractor Keycard 02",
    "Contractor Keycard 03",
    "Mechanical Rooms Key",
    "Athletic Facilities Key",
    "Other (note in remarks)"
  ]
};

const REPORT_TYPES = {
  daily_activity: {
    label: "Daily Activity Log",
    description: "Quick officer activity entry for routine posts and patrol tasks.",
    category: "daily"
  },
  threat_violence_concern: {
    label: "Threat / Violence Concern",
    description: "Threats, concerning language, or possible risk of harm.",
    category: "major"
  },
  weapon_dangerous_item: {
    label: "Weapon / Dangerous Item",
    description: "Weapons, ammunition, or dangerous objects.",
    category: "major"
  },
  medical_emergency_serious_injury: {
    label: "Medical Emergency / Serious Injury",
    description: "EMS response, serious injury, or severe medical concern.",
    category: "major"
  },
  missing_unaccounted_for_student: {
    label: "Missing / Unaccounted For Student",
    description: "Student cannot be located or accounted for during operations.",
    category: "major"
  },
  trespassing: {
    label: "Trespassing",
    description: "Unapproved presence, visitor refusal, or trespass concern.",
    category: "major"
  },
  custody_dispute: {
    label: "Custody Dispute",
    description: "Custody-related safety or release concern.",
    category: "major"
  },
  assault_physical_altercation: {
    label: "Assault / Physical Altercation",
    description: "Fight, physical aggression, or assaultive conduct.",
    category: "major"
  },
  abuse_neglect_concern: {
    label: "Abuse / Neglect Concern",
    description: "Observed, reported, or suspected abuse/neglect concern.",
    category: "major"
  },
  bullying: {
    label: "Bullying",
    description: "Bullying report or repeated targeted conduct.",
    category: "major"
  },
  harassment: {
    label: "Harassment",
    description: "Harassment, intimidation, or hostile behavior.",
    category: "major"
  },
  self_harm: {
    label: "Self Harm",
    description: "Self-harm ideation, statements, or conduct.",
    category: "major"
  },
  drug_alcohol_concern: {
    label: "Drug / Alcohol Concern",
    description: "Substance use, possession, or impairment concern.",
    category: "major"
  },
  suspicious_activity: {
    label: "Suspicious Activity",
    description: "Unusual behavior, surveillance, or suspicious circumstance.",
    category: "major"
  },
  vehicle_pedestrian_accident: {
    label: "Vehicle / Pedestrian Accident",
    description: "Traffic, lot, driveline, or pedestrian accident.",
    category: "major"
  },
  lockdown_event: {
    label: "Lockdown Event",
    description: "Lockdown, shelter, or protective action activation.",
    category: "major"
  },
  centegix_alert: {
    label: "CENTEGIX Alert",
    description: "CENTEGIX badge or system alert requiring security response or documentation.",
    category: "major"
  },
  kcpd_response: {
    label: "KCPD Response to Campus",
    description: "KCPD response, assistance, investigation, or enforcement activity on campus.",
    category: "major"
  },
  elopement: {
    label: "Elopement",
    description: "Student leaves an assigned area, supervision, or campus boundary without authorization.",
    category: "major"
  },
  life_safety_event: {
    label: "Life Safety Event",
    description: "Fire, alarm, evacuation, hazardous condition, or other life-safety event.",
    category: "major"
  },
  phs_property_damage: {
    label: "Pembroke Hill Property Damage",
    description: "Damage to school-owned buildings, grounds, equipment, or other property.",
    category: "major"
  },
  personal_property_damage: {
    label: "Personal Property Damage",
    description: "Damage to property owned by a student, employee, visitor, or other individual.",
    category: "major"
  },
  theft_school_property: {
    label: "Theft of School Property",
    description: "Suspected or confirmed theft of school-owned property.",
    category: "major"
  },
  theft_personal_property: {
    label: "Theft of Personal Property",
    description: "Suspected or confirmed theft of property owned by an individual.",
    category: "major"
  }
};

function setup() {
  const ss = SpreadsheetApp.getActive();

  ensureSheet_(ss, "Incident Reports", [
    "Report ID",
    "Timestamp",
    "Report Type",
    "Submitted By",
    "Campus",
    "Location",
    "Summary",
    "Status",
    "Priority",
    "Attachments",
    "Approval Status",
    "Approved At",
    "Approved By",
    "Approval Notes",
    "Incident Date",
    "Incident Time",
    "Start Time",
    "End Time",
    "People Involved"
  ]);

  ensureSheet_(ss, "Daily Activity", [
    "Entry ID",
    "Timestamp",
    "Activity Type",
    "Officer",
    "Campus",
    "Location",
    "Notes",
    "Attachments",
    "Activity Date",
    "Activity Time",
    "Start Time",
    "End Time"
  ]);

  ensureSheet_(ss, "Key Checkouts", [
    "Checkout ID",
    "Status",
    "Vendor Employee",
    "Vendor Company",
    "Contractor Badge",
    "Key / Keycard",
    "Time of Issue",
    "Issuing Officer",
    "Remarks",
    "Time Returned",
    "Returned By",
    "Created At"
  ]);

  ensureSheet_(ss, "Passdown", [
    "Timestamp",
    "Shift",
    "Officer",
    "Notes",
    "Related Report",
    "Flagged",
    "Status"
  ]);

  ensureSheet_(ss, "Report Actions", [
    "Timestamp",
    "Report ID",
    "Action",
    "Status",
    "Actor",
    "Notes"
  ]);

  const boloSheet = ensureSheet_(ss, "BOLOs", [
    "Timestamp",
    "Type",
    "Subject",
    "Details",
    "Expires",
    "Status",
    "Attachments",
    "Bolo ID",
    "Resolved At"
  ]);
  migrateBoloHeaders_(boloSheet);

  ensureSheet_(ss, "Counters", [
    "Series",
    "Next Number"
  ]);

  const props = PropertiesService.getScriptProperties();
  let token = props.getProperty(CONFIG.TOKEN_PROPERTY);

  if (!token) {
    token = Utilities.getUuid();
    props.setProperty(CONFIG.TOKEN_PROPERTY, token);
  }

  const summaryTrigger = createDailySummaryTrigger_();

  Logger.log("APPS_SCRIPT_TOKEN=" + token);
  Logger.log("DAILY_SUMMARY_RECIPIENTS=" + getDailySummaryRecipients_().join(", "));
  Logger.log("DAILY_SUMMARY_TRIGGER=" + summaryTrigger.message);

  return {
    ok: true,
    token: token,
    dailySummaryRecipients: getDailySummaryRecipients_(),
    dailySummaryTrigger: summaryTrigger
  };
}

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || "health").trim();

  if (action === "metadata") {
    return jsonResponse_(metadata_());
  }

  if (action === "health") {
    return jsonResponse_({
      ok: true,
      appName: CONFIG.APP_NAME,
      timestamp: new Date().toISOString()
    });
  }

  return jsonResponse_({
    ok: false,
    error: "Unknown GET action: " + action
  });
}

function doPost(e) {
  let payload = {};

  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: "Invalid JSON body."
    });
  }

  if (String(payload.token || "") !== getApiToken_()) {
    return jsonResponse_({
      ok: false,
      error: "Invalid API token."
    });
  }

  const action = String(payload.action || "").trim();

  switch (action) {
    case "hubData":
      return jsonResponse_(hubData_());

    case "metadata":
      return jsonResponse_(metadata_());

    // v9 — security email ticker (see Ticker.gs)
    case "tickerFeed":
      return jsonResponse_(tickerFeed());

    case "tickerDismiss":
      return jsonResponse_(tickerDismiss(payload.messageId, payload.handledBy));

    case "keyCheckout":
      return jsonResponse_(keyCheckout_(payload));

    case "keyReturn":
      return jsonResponse_(keyReturn_(payload));

    case "submitReport":
      return jsonResponse_(submitReport_(payload));

    case "submitPassdown":
      return jsonResponse_(submitPassdown_(payload));

    case "submitBolo":
      return jsonResponse_(submitBolo_(payload));

    case "resolveBolo":
      return jsonResponse_(resolveBolo_(payload));

    case "updateReportStatus":
      return jsonResponse_(updateReportStatus_(payload));

    case "uploadFile":
      return jsonResponse_(uploadFile_(payload));

    default:
      return jsonResponse_({
        ok: false,
        error: "Unknown action: " + action
      });
  }
}

function metadata_() {
  const reportTypeOptions = Object.keys(REPORT_TYPES).map(function (key) {
    const item = REPORT_TYPES[key];
    return {
      key: key,
      value: key,
      label: item.label,
      description: item.description,
      category: item.category
    };
  });

  return {
    ok: true,
    appName: CONFIG.APP_NAME,
    schoolName: CONFIG.SCHOOL_NAME,
    reportTypes: REPORT_TYPES,
    reportTypeOptions: reportTypeOptions,
    incidentTypes: reportTypeOptions.filter(function (item) {
      return item.key !== "daily_activity";
    }),
    dailyActivityTypes: CONFIG.DAILY_ACTIVITY_TYPES,
    boloTypes: CONFIG.BOLO_TYPES,
    shifts: CONFIG.SHIFTS,
    campuses: CONFIG.CAMPUSES,
    priorityOptions: CONFIG.PRIORITIES,
    statusOptions: CONFIG.STATUS_OPTIONS,
    keyList: CONFIG.KEY_LIST,
    locationGroups: CONFIG.LOCATION_GROUPS,
    version: CONFIG.VERSION
  };
}

function hubData_() {
  const openKeys = listOpenKeys_();
  const passdownEntries = listPassdown_(24);
  const activeBolos = listActiveBolos_();
  const openReports = listOpenReports_();
  const pendingApprovalReports = openReports.filter(function (report) {
    const approval = String(report.approvalStatus || "").trim().toUpperCase();
    const status = String(report.status || "").trim().toUpperCase();
    return approval === "PENDING" || status === "PENDING APPROVAL";
  });
  const recentDailyActivity = listDailyActivity_(18);

  return {
    ok: true,
    appName: CONFIG.APP_NAME,
    schoolName: CONFIG.SCHOOL_NAME,
    timestamp: new Date().toISOString(),
    keysAndEquipmentOut: openKeys,
    passdownEntries: passdownEntries,
    activeBolos: activeBolos,
    openReports: openReports,
    pendingApprovalReports: pendingApprovalReports,
    recentDailyActivity: recentDailyActivity,
    keysAndEquipmentOutCount: openKeys.length,
    passdownCount: passdownEntries.length,
    activeBoloCount: activeBolos.length,
    openReportCount: openReports.length,
    pendingApprovalCount: pendingApprovalReports.length,
    recentDailyActivityCount: recentDailyActivity.length,
    counts: {
      keysAndEquipmentOut: openKeys.length,
      passdown: passdownEntries.length,
      activeBolos: activeBolos.length,
      openReports: openReports.length,
      pendingApprovalReports: pendingApprovalReports.length,
      recentDailyActivity: recentDailyActivity.length
    }
  };
}

function keyCheckout_(payload) {
  const required = [
    "vendorEmployee",
    "vendorCompany",
    "badgeIssued",
    "keyName",
    "timeOfIssue",
    "issuingOfficer"
  ];

  const missing = required.filter(function (field) {
    return isBlank_(payload[field]);
  });

  if (missing.length) {
    return {
      ok: false,
      error: "Missing required fields: " + missing.join(", ")
    };
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName("Key Checkouts");
  const checkoutId = nextId_("KEY");

  sheet.appendRow([
    checkoutId,
    "OUT",
    clean_(payload.vendorEmployee),
    clean_(payload.vendorCompany),
    clean_(payload.badgeIssued),
    clean_(payload.keyName),
    clean_(payload.timeOfIssue),
    clean_(payload.issuingOfficer),
    clean_(payload.remarks),
    "",
    "",
    nowDisplay_()
  ]);

  return {
    ok: true,
    message: "Checkout saved.",
    checkoutId: checkoutId
  };
}

function keyReturn_(payload) {
  const checkoutId = String(payload.checkoutId || "").trim();
  const returnedBy = clean_(payload.returnedBy || payload.officer || "Security");
  const returnedAt = clean_(payload.returnedAt || nowDisplay_());

  if (!checkoutId) {
    return {
      ok: false,
      error: "Missing checkoutId."
    };
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName("Key Checkouts");
  const headerMap = headerMap_(sheet);
  const rows = dataRows_(sheet);

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var currentId = String(row[headerMap["Checkout ID"] - 1] || "").trim();

    if (currentId === checkoutId) {
      var rowNumber = i + 2;
      var status = String(row[headerMap["Status"] - 1] || "").trim().toUpperCase();

      if (status !== "OUT") {
        return {
          ok: false,
          error: "Checkout is not currently OUT."
        };
      }

      sheet.getRange(rowNumber, headerMap["Status"]).setValue("RETURNED");
      sheet.getRange(rowNumber, headerMap["Time Returned"]).setValue(returnedAt);
      sheet.getRange(rowNumber, headerMap["Returned By"]).setValue(returnedBy);

      return {
        ok: true,
        message: "Checkout returned.",
        checkoutId: checkoutId
      };
    }
  }

  return {
    ok: false,
    error: "Checkout ID not found."
  };
}

function listOpenKeys_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Key Checkouts");
  const headerMap = headerMap_(sheet);
  const rows = dataRows_(sheet);

  return rows
    .filter(function (row) {
      return String(row[headerMap["Status"] - 1] || "").trim().toUpperCase() === "OUT";
    })
    .map(function (row) {
      return {
        checkoutId: value_(row, headerMap, "Checkout ID"),
        status: value_(row, headerMap, "Status"),
        vendorEmployee: value_(row, headerMap, "Vendor Employee"),
        vendorCompany: value_(row, headerMap, "Vendor Company"),
        badgeIssued: value_(row, headerMap, "Contractor Badge"),
        keyName: value_(row, headerMap, "Key / Keycard"),
        timeOfIssue: value_(row, headerMap, "Time of Issue"),
        timeOfIssueDisplay: displayDate_(value_(row, headerMap, "Time of Issue")),
        issuingOfficer: value_(row, headerMap, "Issuing Officer"),
        remarks: value_(row, headerMap, "Remarks")
      };
    })
    .sort(function (a, b) {
      return sortDateDesc_(a.timeOfIssue, b.timeOfIssue);
    });
}

function listPassdown_(hoursBack) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Passdown");
  const headerMap = headerMap_(sheet);
  const rows = dataRows_(sheet);
  const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  return rows
    .filter(function (row) {
      const dt = normalizeDate_(value_(row, headerMap, "Timestamp"));
      return dt && dt >= cutoff;
    })
    .map(function (row) {
      return {
        timestamp: isoDate_(value_(row, headerMap, "Timestamp")),
        timestampDisplay: displayDate_(value_(row, headerMap, "Timestamp")),
        shift: value_(row, headerMap, "Shift"),
        officer: value_(row, headerMap, "Officer"),
        notes: value_(row, headerMap, "Notes"),
        relatedReport: value_(row, headerMap, "Related Report"),
        flagged: toBool_(value_(row, headerMap, "Flagged")),
        status: value_(row, headerMap, "Status")
      };
    })
    .sort(function (a, b) {
      return sortDateDesc_(a.timestamp, b.timestamp);
    });
}

function listActiveBolos_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("BOLOs");
  migrateBoloHeaders_(sheet);
  const headerMap = headerMap_(sheet);
  const rows = dataRows_(sheet);
  const now = new Date();

  return rows
    .filter(function (row) {
      const status = String(value_(row, headerMap, "Status") || "").trim().toUpperCase();
      const expires = normalizeDate_(value_(row, headerMap, "Expires"));

      const statusActive = !status || status === "ACTIVE";
      const notExpired = !expires || expires >= now;

      return statusActive && notExpired;
    })
    .map(function (row) {
      return {
        timestamp: isoDate_(value_(row, headerMap, "Timestamp")),
        timestampDisplay: displayDate_(value_(row, headerMap, "Timestamp")),
        type: value_(row, headerMap, "Type"),
        subject: value_(row, headerMap, "Subject"),
        details: value_(row, headerMap, "Details"),
        expires: isoDate_(value_(row, headerMap, "Expires")),
        expiresDisplay: displayDate_(value_(row, headerMap, "Expires")),
        status: value_(row, headerMap, "Status") || "Active",
        boloId: String(value_(row, headerMap, "Bolo ID") || "").trim(),
        attachments: withDriveUrls_(parseAttachments_(value_(row, headerMap, "Attachments")))
      };
    })
    .sort(function (a, b) {
      return sortDateAsc_(a.expires, b.expires);
    });
}

function listDailyActivity_(hoursBack) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Daily Activity");
  const headerMap = headerMap_(sheet);
  const rows = dataRows_(sheet);
  const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  return rows
    .filter(function (row) {
      const dt = normalizeDate_(value_(row, headerMap, "Timestamp"));
      return dt && dt >= cutoff;
    })
    .map(function (row) {
      return {
        entryId: value_(row, headerMap, "Entry ID"),
        timestamp: isoDate_(value_(row, headerMap, "Timestamp")),
        timestampDisplay: displayDate_(value_(row, headerMap, "Timestamp")),
        activityType: value_(row, headerMap, "Activity Type"),
        officer: value_(row, headerMap, "Officer"),
        campus: value_(row, headerMap, "Campus"),
        location: value_(row, headerMap, "Location"),
        notes: value_(row, headerMap, "Notes"),
        activityDate: displayDateOnly_(value_(row, headerMap, "Activity Date")),
        activityTime: displayTimeOnly_(firstValue_(row, headerMap, "Start Time", "Activity Time")),
        activityStartTime: displayTimeOnly_(firstValue_(row, headerMap, "Start Time", "Activity Time")),
        activityEndTime: displayTimeOnly_(value_(row, headerMap, "End Time")),
        occurrenceDisplay: occurrenceRangeDisplay_(value_(row, headerMap, "Activity Date"), firstValue_(row, headerMap, "Start Time", "Activity Time"), value_(row, headerMap, "End Time")),
        attachments: withDriveUrls_(parseAttachments_(value_(row, headerMap, "Attachments")))
      };
    })
    .sort(function (a, b) {
      return sortDateDesc_(a.timestamp, b.timestamp);
    })
    .slice(0, 30);
}

function listOpenReports_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Incident Reports");
  const headerMap = headerMap_(sheet);
  const rows = dataRows_(sheet);

  return rows
    .filter(function (row) {
      const status = String(value_(row, headerMap, "Status") || "").trim().toUpperCase();
      return ["RESOLVED", "ARCHIVED", "CLOSED", "COMPLETED"].indexOf(status) === -1;
    })
    .map(function (row) {
      return {
        reportId: value_(row, headerMap, "Report ID"),
        timestamp: isoDate_(value_(row, headerMap, "Timestamp")),
        timestampDisplay: displayDate_(value_(row, headerMap, "Timestamp")),
        reportType: value_(row, headerMap, "Report Type"),
        submittedBy: value_(row, headerMap, "Submitted By"),
        campus: value_(row, headerMap, "Campus"),
        location: value_(row, headerMap, "Location"),
        summary: value_(row, headerMap, "Summary"),
        status: value_(row, headerMap, "Status"),
        priority: value_(row, headerMap, "Priority"),
        approvalStatus: value_(row, headerMap, "Approval Status"),
        approvedAt: isoDate_(value_(row, headerMap, "Approved At")),
        approvedAtDisplay: displayDate_(value_(row, headerMap, "Approved At")),
        approvedBy: value_(row, headerMap, "Approved By"),
        approvalNotes: value_(row, headerMap, "Approval Notes"),
        incidentDate: displayDateOnly_(value_(row, headerMap, "Incident Date")),
        incidentTime: displayTimeOnly_(firstValue_(row, headerMap, "Start Time", "Incident Time")),
        incidentStartTime: displayTimeOnly_(firstValue_(row, headerMap, "Start Time", "Incident Time")),
        incidentEndTime: displayTimeOnly_(value_(row, headerMap, "End Time")),
        occurrenceDisplay: occurrenceRangeDisplay_(value_(row, headerMap, "Incident Date"), firstValue_(row, headerMap, "Start Time", "Incident Time"), value_(row, headerMap, "End Time")),
        peopleInvolved: parsePeople_(value_(row, headerMap, "People Involved")),
        attachments: withDriveUrls_(parseAttachments_(value_(row, headerMap, "Attachments")))
      };
    })
    .sort(function (a, b) {
      return sortDateDesc_(a.timestamp, b.timestamp);
    });
}

function getApiToken_() {
  return PropertiesService.getScriptProperties().getProperty(CONFIG.TOKEN_PROPERTY) || "";
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return sheet;
  }

  // Append any headers added in later versions to existing sheets.
  const existing = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(function (header) { return String(header).trim(); });

  headers.forEach(function (header) {
    if (existing.indexOf(header) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
    }
  });

  return sheet;
}

function appendMappedRow_(sheet, valuesByHeader) {
  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(function (header) { return String(header || "").trim(); });

  const row = headers.map(function (header) {
    return Object.prototype.hasOwnProperty.call(valuesByHeader, header) ? valuesByHeader[header] : "";
  });

  sheet.appendRow(row);
}

function migrateBoloHeaders_(sheet) {
  if (!sheet || sheet.getLastColumn() < 1) return;

  const desired = [
    "Timestamp",
    "Type",
    "Subject",
    "Details",
    "Expires",
    "Status",
    "Attachments",
    "Bolo ID",
    "Resolved At"
  ];

  const lastColumn = Math.max(sheet.getLastColumn(), desired.length);
  const current = sheet
    .getRange(1, 1, 1, lastColumn)
    .getValues()[0]
    .map(function (header) { return String(header || "").trim(); });

  // A previous build could create two "Expires" headers while row values were
  // already written in the intended Expires / Status / Attachments / ID order.
  // Rewriting the canonical header positions repairs that mapping without
  // moving existing records.
  desired.forEach(function (header, index) {
    if (current[index] !== header) {
      sheet.getRange(1, index + 1).setValue(header);
    }
  });

  // setup() may have appended missing canonical headers to the far right of a
  // legacy sheet before this repair runs. Clear only duplicate canonical
  // headers beyond the official layout so headerMap_ cannot point at them.
  for (var column = desired.length + 1; column <= lastColumn; column++) {
    var extraHeader = String(sheet.getRange(1, column).getValue() || "").trim();
    if (desired.indexOf(extraHeader) !== -1) {
      sheet.getRange(1, column).clearContent();
    }
  }
}

function headerMap_(sheet) {
  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const map = {};

  headers.forEach(function (header, index) {
    map[String(header).trim()] = index + 1;
  });

  return map;
}

function dataRows_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow < 2 || lastColumn < 1) {
    return [];
  }

  return sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
}

function nextId_(series) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Counters");
  const rows = dataRows_(sheet);

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var currentSeries = String(row[0] || "").trim();

    if (currentSeries === series) {
      var current = Number(row[1] || 1);
      var next = current + 1;
      sheet.getRange(i + 2, 2).setValue(next);
      return series + "-" + pad_(current, 4);
    }
  }

  sheet.appendRow([series, 2]);
  return series + "-0001";
}

function value_(row, map, key) {
  return map[key] ? row[map[key] - 1] : "";
}

function firstValue_(row, map) {
  for (var i = 2; i < arguments.length; i++) {
    var value = value_(row, map, arguments[i]);
    if (String(value || "").trim() !== "") return value;
  }
  return "";
}

function clean_(value) {
  var text = String(value || "").trim();
  // Formula-injection guard: prefix cells that would execute as formulas.
  if (/^[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }
  return text;
}

function isBlank_(value) {
  return String(value || "").trim() === "";
}

function pad_(value, length) {
  var str = String(value);
  while (str.length < length) str = "0" + str;
  return str;
}

function normalizeDate_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value)) {
    return value;
  }

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const dt = new Date(value);
  return isNaN(dt) ? null : dt;
}

function displayDate_(value) {
  const dt = normalizeDate_(value);
  if (!dt) return String(value || "");
  return Utilities.formatDate(dt, CONFIG.TIME_ZONE, "M/d/yyyy h:mm a");
}

function isoDate_(value) {
  const dt = normalizeDate_(value);
  return dt ? dt.toISOString() : "";
}

function nowDisplay_() {
  return Utilities.formatDate(new Date(), CONFIG.TIME_ZONE, "M/d/yyyy h:mm a");
}

function toBool_(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "true" || normalized === "yes" || normalized === "1" || value === true;
}

function sortDateDesc_(a, b) {
  const aDt = normalizeDate_(a);
  const bDt = normalizeDate_(b);

  const aVal = aDt ? aDt.getTime() : 0;
  const bVal = bDt ? bDt.getTime() : 0;

  return bVal - aVal;
}

function sortDateAsc_(a, b) {
  const aDt = normalizeDate_(a);
  const bDt = normalizeDate_(b);

  const aVal = aDt ? aDt.getTime() : Number.MAX_SAFE_INTEGER;
  const bVal = bDt ? bDt.getTime() : Number.MAX_SAFE_INTEGER;

  return aVal - bVal;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}


/* ------------------------------------------------------------------ */
/* Write actions                                                      */
/* ------------------------------------------------------------------ */

function submitReport_(payload) {
  const reportType = String(payload.reportType || "").trim();

  if (!REPORT_TYPES[reportType]) {
    return { ok: false, error: "Unknown report type: " + reportType };
  }

  if (reportType === "daily_activity") {
    return submitDailyActivity_(payload);
  }

  const incidentStartTime = cleanTime_(payload.incidentStartTime || payload.incidentTime);
  const incidentEndTime = cleanTime_(payload.incidentEndTime || payload.incidentTime);
  payload.incidentTime = incidentStartTime;

  const required = ["submittedBy", "campus", "location", "summary", "priority", "incidentDate", "incidentTime", "peopleInvolvedChoice"];
  const missing = required.filter(function (field) {
    return isBlank_(payload[field]);
  });
  if (!incidentEndTime) missing.push("incidentEndTime");

  if (missing.length) {
    return { ok: false, error: "Missing required fields: " + missing.join(", ") };
  }

  const peopleChoice = String(payload.peopleInvolvedChoice || "").trim().toLowerCase();
  const people = Array.isArray(payload.peopleInvolved) ? payload.peopleInvolved : [];
  if (peopleChoice === "yes") {
    if (!people.length) return { ok: false, error: "Add at least one person involved." };
    const invalidPerson = people.some(function (person) {
      return !person || isBlank_(person.name) || isBlank_(person.role) || isBlank_(person.student);
    });
    if (invalidPerson) return { ok: false, error: "Each involved person needs a name, role, and Student Yes/No selection." };
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName("Incident Reports");
  const reportId = nextId_("IR");

  appendMappedRow_(sheet, {
    "Report ID": reportId,
    "Timestamp": nowDisplay_(),
    "Report Type": clean_(REPORT_TYPES[reportType].label),
    "Submitted By": clean_(payload.submittedBy),
    "Campus": clean_(payload.campus),
    "Location": clean_(payload.location),
    "Summary": clean_(payload.summary),
    "Status": "Pending Approval",
    "Priority": clean_(payload.priority),
    "Attachments": attachmentsJson_(payload.attachments),
    "Approval Status": "Pending",
    "Approved At": "",
    "Approved By": "",
    "Approval Notes": "",
    "Incident Date": cleanDateOnly_(payload.incidentDate),
    "Incident Time": incidentStartTime,
    "Start Time": incidentStartTime,
    "End Time": incidentEndTime,
    "People Involved": peopleChoice === "yes" ? peopleJson_(people) : ""
  });

  return { ok: true, message: "Incident report filed.", reportId: reportId };
}

function submitDailyActivity_(payload) {
  const activityStartTime = cleanTime_(payload.activityStartTime || payload.activityTime);
  const activityEndTime = cleanTime_(payload.activityEndTime || payload.activityTime);
  payload.activityTime = activityStartTime;

  const required = ["activityType", "officer", "campus", "location", "activityDate", "activityTime", "notes"];
  const missing = required.filter(function (field) {
    return isBlank_(payload[field]);
  });
  if (!activityEndTime) missing.push("activityEndTime");

  if (missing.length) {
    return { ok: false, error: "Missing required fields: " + missing.join(", ") };
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName("Daily Activity");
  const entryId = nextId_("DA");

  appendMappedRow_(sheet, {
    "Entry ID": entryId,
    "Timestamp": nowDisplay_(),
    "Activity Type": clean_(payload.activityType),
    "Officer": clean_(payload.officer),
    "Campus": clean_(payload.campus),
    "Location": clean_(payload.location),
    "Notes": clean_(payload.notes),
    "Attachments": attachmentsJson_(payload.attachments),
    "Activity Date": cleanDateOnly_(payload.activityDate),
    "Activity Time": activityStartTime,
    "Start Time": activityStartTime,
    "End Time": activityEndTime
  });

  return { ok: true, message: "Daily activity entry logged.", entryId: entryId };
}

function submitPassdown_(payload) {
  const required = ["shift", "officer", "notes"];
  const missing = required.filter(function (field) {
    return isBlank_(payload[field]);
  });

  if (missing.length) {
    return { ok: false, error: "Missing required fields: " + missing.join(", ") };
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName("Passdown");

  sheet.appendRow([
    nowDisplay_(),
    clean_(payload.shift),
    clean_(payload.officer),
    clean_(payload.notes),
    clean_(payload.relatedReport),
    toBool_(payload.flagged) ? "TRUE" : "FALSE",
    "Open"
  ]);

  return { ok: true, message: "Pass-down entry saved." };
}

function submitBolo_(payload) {
  const required = ["type", "subject", "details"];
  const missing = required.filter(function (field) {
    return isBlank_(payload[field]);
  });

  if (missing.length) {
    return { ok: false, error: "Missing required fields: " + missing.join(", ") };
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName("BOLOs");
  migrateBoloHeaders_(sheet);

  const attachments = attachmentsJson_(payload.attachments);
  const boloId = nextId_("BL");

  sheet.appendRow([
    nowDisplay_(),
    clean_(payload.type),
    clean_(payload.subject),
    clean_(payload.details),
    clean_(payload.expires),
    "Active",
    attachments,
    boloId,
    ""
  ]);

  return { ok: true, message: "B.O.L.O. posted.", boloId: boloId };
}

function resolveBolo_(payload) {
  const boloId = String(payload.boloId || "").trim();
  const subject = String(payload.subject || "").trim().toLowerCase();
  const timestamp = String(payload.timestamp || "").trim();

  if (!boloId && !subject) {
    return { ok: false, error: "Missing boloId or subject." };
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName("BOLOs");
  migrateBoloHeaders_(sheet);
  const headerMap = headerMap_(sheet);
  const rows = dataRows_(sheet);

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var rowStatus = String(value_(row, headerMap, "Status") || "").trim().toUpperCase();
    var isActive = !rowStatus || rowStatus === "ACTIVE";

    if (!isActive) {
      continue;
    }

    var matched = false;

    var rowId = String(value_(row, headerMap, "Bolo ID") || "").trim();
    if (boloId && rowId && rowId === boloId) {
      matched = true;
    }

    if (!matched && !boloId) {
      // Legacy fallback for B.O.L.O.s posted before IDs existed:
      // case-insensitive subject match, timestamps compared after
      // normalizing both sides to ISO dates.
      var rowSubject = String(value_(row, headerMap, "Subject") || "").trim().toLowerCase();
      var rowStampIso = isoDate_(value_(row, headerMap, "Timestamp"));
      matched = rowSubject === subject && (!timestamp || rowStampIso === timestamp);
    }

    if (matched) {
      sheet.getRange(i + 2, headerMap["Status"]).setValue("Resolved");
      if (headerMap["Resolved At"]) {
        sheet.getRange(i + 2, headerMap["Resolved At"]).setValue(nowDisplay_());
      }
      return { ok: true, message: "B.O.L.O. resolved." };
    }
  }

  return { ok: false, error: "Active B.O.L.O. not found." };
}



function updateReportStatus_(payload) {
  const reportId = String(payload.reportId || "").trim();
  const status = clean_(payload.status || "");
  const allowed = CONFIG.STATUS_OPTIONS.map(function (item) { return String(item).toUpperCase(); });
  const notes = clean_(payload.approvalNotes || "");
  const reviewedBy = clean_(payload.reviewedBy || payload.approvedBy || "Supervisor");

  if (!reportId) {
    return { ok: false, error: "Missing reportId." };
  }

  if (!status || allowed.indexOf(status.toUpperCase()) === -1) {
    return { ok: false, error: "Invalid status." };
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName("Incident Reports");
  const headerMap = headerMap_(sheet);
  const rows = dataRows_(sheet);

  for (var i = 0; i < rows.length; i++) {
    var currentId = String(value_(rows[i], headerMap, "Report ID") || "").trim();
    if (currentId === reportId) {
      var rowNumber = i + 2;
      sheet.getRange(rowNumber, headerMap["Status"]).setValue(status);

      if (headerMap["Approval Status"]) {
        var approvalStatus = approvalStatusFor_(status);
        if (approvalStatus) {
          sheet.getRange(rowNumber, headerMap["Approval Status"]).setValue(approvalStatus);
        }
      }

      if (headerMap["Approved At"] && ["APPROVED", "NEEDS CORRECTION", "REVIEWED", "RESOLVED", "NO ACTION NEEDED", "ARCHIVED"].indexOf(status.toUpperCase()) !== -1) {
        sheet.getRange(rowNumber, headerMap["Approved At"]).setValue(nowDisplay_());
      }

      if (headerMap["Approved By"] && reviewedBy) {
        sheet.getRange(rowNumber, headerMap["Approved By"]).setValue(reviewedBy);
      }

      if (headerMap["Approval Notes"] && notes) {
        sheet.getRange(rowNumber, headerMap["Approval Notes"]).setValue(notes);
      }

      logReportAction_(reportId, status, reviewedBy, notes);

      return { ok: true, message: "Report status updated.", reportId: reportId, status: status };
    }
  }

  return { ok: false, error: "Report ID not found." };
}

function approvalStatusFor_(status) {
  switch (String(status || "").trim().toUpperCase()) {
    case "PENDING APPROVAL":
      return "Pending";
    case "APPROVED":
    case "ASSIGNED":
    case "REVIEWED":
      return "Approved";
    case "NEEDS CORRECTION":
      return "Needs Correction";
    case "RESOLVED":
    case "NO ACTION NEEDED":
    case "ARCHIVED":
      return "Closed";
    default:
      return "";
  }
}

function peopleJson_(people) {
  if (!Array.isArray(people) || !people.length) return "";
  return JSON.stringify(people.slice(0, 25).map(function (person) {
    return {
      name: clean_(person && person.name),
      role: clean_(person && person.role),
      student: clean_(person && person.student),
      dob: clean_(person && person.dob),
      phone: clean_(person && person.phone)
    };
  }));
}

function parsePeople_(value) {
  const text = String(value || "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function cleanDateOnly_(value) {
  var text = String(value || "").trim();
  var match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return text;
  var dt = normalizeDate_(value);
  if (!dt) return clean_(value);
  if (dt.getFullYear && dt.getFullYear() < 1900) return "";
  return Utilities.formatDate(dt, CONFIG.TIME_ZONE, "yyyy-MM-dd");
}

function cleanTime_(value) {
  var text = String(value || "").trim();
  var timeMatch = text.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) return pad_(Number(timeMatch[1]), 2) + ":" + timeMatch[2];

  var dt = normalizeDate_(value);
  if (!dt) return clean_(value);
  return Utilities.formatDate(dt, CONFIG.TIME_ZONE, "HH:mm");
}

function displayDateOnly_(value) {
  var text = String(value || "").trim();
  var match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    var dt = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Utilities.formatDate(dt, CONFIG.TIME_ZONE, "M/d/yyyy");
  }

  var dt2 = normalizeDate_(value);
  if (!dt2) return text;
  if (dt2.getFullYear && dt2.getFullYear() < 1900) return "";
  return Utilities.formatDate(dt2, CONFIG.TIME_ZONE, "M/d/yyyy");
}

function displayTimeOnly_(value) {
  var text = String(value || "").trim();
  if (!text) return "";

  var match = text.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    var hour = Number(match[1]);
    var minute = Number(match[2]);
    var dt = new Date(2000, 0, 1, hour, minute);
    return Utilities.formatDate(dt, CONFIG.TIME_ZONE, "h:mm a");
  }

  var dt2 = normalizeDate_(value);
  if (!dt2) return text.replace(/1899[^ ]* ?/g, "").trim();
  return Utilities.formatDate(dt2, CONFIG.TIME_ZONE, "h:mm a");
}

function occurrenceDisplay_(dateValue, timeValue) {
  return occurrenceRangeDisplay_(dateValue, timeValue, "");
}

function occurrenceRangeDisplay_(dateValue, startTimeValue, endTimeValue) {
  var dateText = displayDateOnly_(dateValue);
  var startText = displayTimeOnly_(startTimeValue);
  var endText = displayTimeOnly_(endTimeValue);

  if (!dateText && !startText && !endText) return "";
  if (startText && endText && startText !== endText) {
    return [dateText, startText + " – " + endText].filter(function (part) { return part; }).join(" ");
  }

  return [dateText, startText || endText].filter(function (part) { return part; }).join(" ");
}

function parseAttachments_(value) {
  const text = String(value || "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}


/* ------------------------------------------------------------------ */
/* Daily 2 PM email summary                                            */
/* ------------------------------------------------------------------ */

function configureDailySummaryRecipients(recipients) {
  const emails = splitEmails_(recipients);
  if (!emails.length) {
    throw new Error("Enter at least one email address, separated by commas or semicolons.");
  }

  PropertiesService
    .getScriptProperties()
    .setProperty(CONFIG.DAILY_SUMMARY_RECIPIENTS_PROPERTY, emails.join(","));

  const trigger = createDailySummaryTrigger_();

  Logger.log("DAILY_SUMMARY_RECIPIENTS=" + emails.join(", "));
  Logger.log("DAILY_SUMMARY_TRIGGER=" + trigger.message);

  return {
    ok: true,
    recipients: emails,
    trigger: trigger
  };
}

function sendDailySummaryEmail() {
  const recipients = getDailySummaryRecipients_();
  if (!recipients.length) {
    Logger.log("Daily summary skipped: no recipients configured.");
    return { ok: false, error: "No daily summary recipients configured." };
  }

  const hoursBack = Number(CONFIG.DAILY_SUMMARY_LOOKBACK_HOURS || 24);
  const data = buildDailySummaryData_(hoursBack);
  const subject = "PHS Security Hub Daily Summary - " + Utilities.formatDate(data.end, CONFIG.TIME_ZONE, "M/d/yyyy h:mm a");
  const htmlBody = dailySummaryHtml_(data);
  const body = dailySummaryText_(data);

  MailApp.sendEmail({
    to: recipients.join(","),
    subject: subject,
    htmlBody: htmlBody,
    body: body,
    name: "PHS Security Hub"
  });

  Logger.log("Daily summary sent to " + recipients.join(", "));

  return {
    ok: true,
    message: "Daily summary sent.",
    recipients: recipients,
    counts: data.counts
  };
}

function sendDailySummaryTest() {
  return sendDailySummaryEmail();
}

function createDailySummaryTrigger_() {
  const handler = "sendDailySummaryEmail";

  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction && trigger.getHandlerFunction() === handler) {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger(handler)
    .timeBased()
    .everyDays(1)
    .atHour(Number(CONFIG.DAILY_SUMMARY_HOUR || 14))
    .nearMinute(0)
    .inTimezone(CONFIG.TIME_ZONE)
    .create();

  return {
    ok: true,
    message: "Daily summary trigger installed for approximately 2:00 PM " + CONFIG.TIME_ZONE + "."
  };
}

function getDailySummaryRecipients_() {
  const props = PropertiesService.getScriptProperties();
  const configured = props.getProperty(CONFIG.DAILY_SUMMARY_RECIPIENTS_PROPERTY);
  const defaultRecipients = CONFIG.DAILY_SUMMARY_DEFAULT_RECIPIENTS || "";
  return splitEmails_(configured || defaultRecipients);
}

function splitEmails_(value) {
  return String(value || "")
    .split(/[;,\n]/)
    .map(function (item) { return String(item || "").trim(); })
    .filter(function (item, index, all) {
      return item && item.indexOf("@") > 0 && all.indexOf(item) === index;
    });
}

function buildDailySummaryData_(hoursBack) {
  const end = new Date();
  const start = new Date(end.getTime() - Number(hoursBack || 24) * 60 * 60 * 1000);

  const dailyActivity = dailyActivitySummaryRows_(start, end);
  const incidentReports = incidentSummaryRows_(start, end);
  const reportActions = reportActionSummaryRows_(start, end);
  const keyActions = keyActionSummaryRows_(start, end);
  const passdowns = passdownSummaryRows_(start, end);
  const bolos = boloSummaryRows_(start, end);

  return {
    start: start,
    end: end,
    dailyActivity: dailyActivity,
    incidentReports: incidentReports,
    reportActions: reportActions,
    keyActions: keyActions,
    passdowns: passdowns,
    bolos: bolos,
    counts: {
      dailyActivity: dailyActivity.length,
      incidentReports: incidentReports.length,
      reportActions: reportActions.length,
      keyActions: keyActions.length,
      passdowns: passdowns.length,
      bolos: bolos.length,
      total: dailyActivity.length + incidentReports.length + reportActions.length + keyActions.length + passdowns.length + bolos.length
    }
  };
}

function dailyActivitySummaryRows_(start, end) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Daily Activity");
  if (!sheet) return [];
  const map = headerMap_(sheet);

  return rowsInWindow_(sheet, map, "Timestamp", start, end).map(function (row) {
    return {
      when: displayDate_(value_(row, map, "Timestamp")),
      id: value_(row, map, "Entry ID"),
      type: value_(row, map, "Activity Type"),
      person: value_(row, map, "Officer"),
      campus: value_(row, map, "Campus"),
      location: value_(row, map, "Location"),
      occurrence: occurrenceRangeDisplay_(value_(row, map, "Activity Date"), firstValue_(row, map, "Start Time", "Activity Time"), value_(row, map, "End Time")),
      notes: value_(row, map, "Notes")
    };
  });
}

function incidentSummaryRows_(start, end) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Incident Reports");
  if (!sheet) return [];
  const map = headerMap_(sheet);

  return rowsInWindow_(sheet, map, "Timestamp", start, end).map(function (row) {
    return {
      when: displayDate_(value_(row, map, "Timestamp")),
      id: value_(row, map, "Report ID"),
      type: value_(row, map, "Report Type"),
      person: value_(row, map, "Submitted By"),
      campus: value_(row, map, "Campus"),
      location: value_(row, map, "Location"),
      occurrence: occurrenceRangeDisplay_(value_(row, map, "Incident Date"), firstValue_(row, map, "Start Time", "Incident Time"), value_(row, map, "End Time")),
      priority: value_(row, map, "Priority"),
      status: value_(row, map, "Status"),
      notes: value_(row, map, "Summary")
    };
  });
}

function reportActionSummaryRows_(start, end) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Report Actions");
  if (!sheet) return [];
  const map = headerMap_(sheet);

  return rowsInWindow_(sheet, map, "Timestamp", start, end).map(function (row) {
    return {
      when: displayDate_(value_(row, map, "Timestamp")),
      id: value_(row, map, "Report ID"),
      type: value_(row, map, "Action"),
      person: value_(row, map, "Actor"),
      campus: "",
      location: "",
      occurrence: "",
      priority: "",
      status: value_(row, map, "Status"),
      notes: value_(row, map, "Notes")
    };
  });
}

function keyActionSummaryRows_(start, end) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Key Checkouts");
  if (!sheet) return [];
  const map = headerMap_(sheet);
  const rows = dataRows_(sheet);
  const output = [];

  rows.forEach(function (row) {
    const issueDt = normalizeDate_(firstValue_(row, map, "Created At", "Time of Issue"));
    if (inWindow_(issueDt, start, end)) {
      output.push({
        when: displayDate_(issueDt),
        id: value_(row, map, "Checkout ID"),
        type: "Key / Equipment Checkout",
        person: value_(row, map, "Issuing Officer"),
        campus: "",
        location: value_(row, map, "Key / Keycard"),
        occurrence: "",
        priority: "",
        status: value_(row, map, "Status") || "OUT",
        notes: [value_(row, map, "Vendor Employee"), value_(row, map, "Vendor Company"), value_(row, map, "Remarks")].filter(function (part) { return part; }).join(" | ")
      });
    }

    const returnDt = normalizeDate_(value_(row, map, "Time Returned"));
    if (inWindow_(returnDt, start, end)) {
      output.push({
        when: displayDate_(returnDt),
        id: value_(row, map, "Checkout ID"),
        type: "Key / Equipment Return",
        person: value_(row, map, "Returned By"),
        campus: "",
        location: value_(row, map, "Key / Keycard"),
        occurrence: "",
        priority: "",
        status: "Returned",
        notes: [value_(row, map, "Vendor Employee"), value_(row, map, "Vendor Company")].filter(function (part) { return part; }).join(" | ")
      });
    }
  });

  return output.sort(function (a, b) { return sortDateDesc_(a.when, b.when); });
}

function passdownSummaryRows_(start, end) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Passdown");
  if (!sheet) return [];
  const map = headerMap_(sheet);

  return rowsInWindow_(sheet, map, "Timestamp", start, end).map(function (row) {
    return {
      when: displayDate_(value_(row, map, "Timestamp")),
      id: value_(row, map, "Related Report"),
      type: toBool_(value_(row, map, "Flagged")) ? "Flagged Pass-down" : "Pass-down",
      person: value_(row, map, "Officer"),
      campus: "",
      location: value_(row, map, "Shift"),
      occurrence: "",
      priority: "",
      status: value_(row, map, "Status"),
      notes: value_(row, map, "Notes")
    };
  });
}

function boloSummaryRows_(start, end) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("BOLOs");
  if (!sheet) return [];
  migrateBoloHeaders_(sheet);
  const map = headerMap_(sheet);
  const rows = dataRows_(sheet);
  const output = [];

  rows.forEach(function (row) {
    const createdDt = normalizeDate_(value_(row, map, "Timestamp"));
    if (inWindow_(createdDt, start, end)) {
      output.push({
        when: displayDate_(createdDt),
        id: value_(row, map, "Bolo ID"),
        type: "B.O.L.O. Created - " + value_(row, map, "Type"),
        person: "",
        campus: "",
        location: "",
        occurrence: value_(row, map, "Expires") ? "Expires " + displayDate_(value_(row, map, "Expires")) : "",
        priority: "",
        status: value_(row, map, "Status") || "Active",
        notes: [value_(row, map, "Subject"), value_(row, map, "Details")].filter(function (part) { return part; }).join(" | ")
      });
    }

    const resolvedDt = normalizeDate_(value_(row, map, "Resolved At"));
    if (inWindow_(resolvedDt, start, end)) {
      output.push({
        when: displayDate_(resolvedDt),
        id: value_(row, map, "Bolo ID"),
        type: "B.O.L.O. Resolved",
        person: "",
        campus: "",
        location: "",
        occurrence: "",
        priority: "",
        status: "Resolved",
        notes: value_(row, map, "Subject")
      });
    }
  });

  return output.sort(function (a, b) { return sortDateDesc_(a.when, b.when); });
}

function rowsInWindow_(sheet, map, timestampHeader, start, end) {
  return dataRows_(sheet)
    .filter(function (row) {
      const dt = normalizeDate_(value_(row, map, timestampHeader));
      return inWindow_(dt, start, end);
    })
    .sort(function (a, b) {
      return sortDateDesc_(value_(a, map, timestampHeader), value_(b, map, timestampHeader));
    });
}

function inWindow_(dt, start, end) {
  return dt && dt >= start && dt <= end && (!dt.getFullYear || dt.getFullYear() >= 1900);
}

function logReportAction_(reportId, status, actor, notes) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Report Actions");
  if (!sheet) return;

  appendMappedRow_(sheet, {
    "Timestamp": nowDisplay_(),
    "Report ID": clean_(reportId),
    "Action": "Report Status Updated",
    "Status": clean_(status),
    "Actor": clean_(actor),
    "Notes": clean_(notes)
  });
}

function dailySummaryHtml_(data) {
  const range = htmlEscape_(Utilities.formatDate(data.start, CONFIG.TIME_ZONE, "M/d/yyyy h:mm a")) +
    " to " +
    htmlEscape_(Utilities.formatDate(data.end, CONFIG.TIME_ZONE, "M/d/yyyy h:mm a"));

  return '<div style="font-family:Arial,sans-serif;color:#172033;line-height:1.45">' +
    '<h2 style="margin:0 0 6px;color:#981e32">PHS Security Hub Daily Summary</h2>' +
    '<p style="margin:0 0 16px;color:#4f5b6f">Actions recorded from ' + range + '.</p>' +
    '<div style="background:#f4f6f9;border:1px solid #d9dee8;border-radius:12px;padding:12px;margin-bottom:16px">' +
    '<strong>Total actions:</strong> ' + data.counts.total + '<br>' +
    'Daily Activity: ' + data.counts.dailyActivity + ' | Incident Reports: ' + data.counts.incidentReports +
    ' | Report Actions: ' + data.counts.reportActions + ' | Key Actions: ' + data.counts.keyActions +
    ' | Pass-downs: ' + data.counts.passdowns + ' | B.O.L.O.s: ' + data.counts.bolos +
    '</div>' +
    sectionTableHtml_("Incident Reports Submitted", data.incidentReports) +
    sectionTableHtml_("Report Approval / Status Actions", data.reportActions) +
    sectionTableHtml_("Daily Activity", data.dailyActivity) +
    sectionTableHtml_("Key / Equipment Actions", data.keyActions) +
    sectionTableHtml_("Pass-down Entries", data.passdowns) +
    sectionTableHtml_("B.O.L.O. Actions", data.bolos) +
    '<p style="margin-top:18px;color:#667085;font-size:12px">Generated automatically by the PHS Security Hub.</p>' +
    '</div>';
}

function sectionTableHtml_(title, rows) {
  if (!rows.length) {
    return '<h3 style="margin:20px 0 8px;color:#172033">' + htmlEscape_(title) + '</h3>' +
      '<p style="margin:0 0 12px;color:#667085">No entries recorded.</p>';
  }

  const header = '<tr>' +
    '<th align="left" style="border-bottom:1px solid #d9dee8;padding:8px">When</th>' +
    '<th align="left" style="border-bottom:1px solid #d9dee8;padding:8px">ID</th>' +
    '<th align="left" style="border-bottom:1px solid #d9dee8;padding:8px">Type</th>' +
    '<th align="left" style="border-bottom:1px solid #d9dee8;padding:8px">Person</th>' +
    '<th align="left" style="border-bottom:1px solid #d9dee8;padding:8px">Campus / Location</th>' +
    '<th align="left" style="border-bottom:1px solid #d9dee8;padding:8px">Status</th>' +
    '<th align="left" style="border-bottom:1px solid #d9dee8;padding:8px">Notes</th>' +
    '</tr>';

  const body = rows.map(function (row) {
    const place = [row.campus, row.location, row.occurrence].filter(function (part) { return part; }).join(' / ');
    const status = [row.priority, row.status].filter(function (part) { return part; }).join(' / ');
    return '<tr>' +
      '<td valign="top" style="border-bottom:1px solid #edf0f5;padding:8px">' + htmlEscape_(row.when) + '</td>' +
      '<td valign="top" style="border-bottom:1px solid #edf0f5;padding:8px">' + htmlEscape_(row.id) + '</td>' +
      '<td valign="top" style="border-bottom:1px solid #edf0f5;padding:8px">' + htmlEscape_(row.type) + '</td>' +
      '<td valign="top" style="border-bottom:1px solid #edf0f5;padding:8px">' + htmlEscape_(row.person) + '</td>' +
      '<td valign="top" style="border-bottom:1px solid #edf0f5;padding:8px">' + htmlEscape_(place) + '</td>' +
      '<td valign="top" style="border-bottom:1px solid #edf0f5;padding:8px">' + htmlEscape_(status) + '</td>' +
      '<td valign="top" style="border-bottom:1px solid #edf0f5;padding:8px">' + htmlEscape_(truncate_(row.notes, 280)) + '</td>' +
      '</tr>';
  }).join('');

  return '<h3 style="margin:20px 0 8px;color:#172033">' + htmlEscape_(title) + '</h3>' +
    '<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;font-size:13px;border:1px solid #d9dee8;border-radius:8px;overflow:hidden">' +
    header + body + '</table>';
}

function dailySummaryText_(data) {
  const lines = [
    'PHS Security Hub Daily Summary',
    'Actions recorded from ' + Utilities.formatDate(data.start, CONFIG.TIME_ZONE, 'M/d/yyyy h:mm a') + ' to ' + Utilities.formatDate(data.end, CONFIG.TIME_ZONE, 'M/d/yyyy h:mm a'),
    '',
    'Total actions: ' + data.counts.total,
    'Daily Activity: ' + data.counts.dailyActivity,
    'Incident Reports: ' + data.counts.incidentReports,
    'Report Actions: ' + data.counts.reportActions,
    'Key Actions: ' + data.counts.keyActions,
    'Pass-downs: ' + data.counts.passdowns,
    'B.O.L.O.s: ' + data.counts.bolos,
    ''
  ];

  appendTextSection_(lines, 'Incident Reports Submitted', data.incidentReports);
  appendTextSection_(lines, 'Report Approval / Status Actions', data.reportActions);
  appendTextSection_(lines, 'Daily Activity', data.dailyActivity);
  appendTextSection_(lines, 'Key / Equipment Actions', data.keyActions);
  appendTextSection_(lines, 'Pass-down Entries', data.passdowns);
  appendTextSection_(lines, 'B.O.L.O. Actions', data.bolos);

  return lines.join('\n');
}

function appendTextSection_(lines, title, rows) {
  lines.push(title);
  lines.push('='.repeat(title.length));

  if (!rows.length) {
    lines.push('No entries recorded.');
    lines.push('');
    return;
  }

  rows.forEach(function (row) {
    const place = [row.campus, row.location, row.occurrence].filter(function (part) { return part; }).join(' / ');
    const status = [row.priority, row.status].filter(function (part) { return part; }).join(' / ');
    lines.push('- ' + [row.when, row.id, row.type, row.person, place, status].filter(function (part) { return part; }).join(' | '));
    if (row.notes) lines.push('  ' + truncate_(row.notes, 280));
  });

  lines.push('');
}

function truncate_(value, length) {
  const text = String(value || '').trim();
  if (text.length <= length) return text;
  return text.slice(0, Math.max(0, length - 1)) + '…';
}

function htmlEscape_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


/* ------------------------------------------------------------------ */
/* Drive uploads: files live in the owner's Google Drive under         */
/* "PHS Security Hub Uploads"; the Sheet stores file IDs only.         */
/* ------------------------------------------------------------------ */

const UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
const UPLOAD_ALLOWED_TYPES = /^(image\/(png|jpeg|jpg|gif|webp|heic|heif)|application\/pdf)$/i;
const UPLOAD_AREAS = {
  BOLOs: "BOLOs",
  IncidentReports: "Incident Reports",
  DailyActivity: "Daily Activity"
};

function uploadFile_(payload) {
  const file = payload.file || {};
  const name = String(file.name || "file").slice(0, 200);
  const type = String(file.type || "application/octet-stream");
  const data = String(file.data || "");
  const area = UPLOAD_AREAS[String(payload.area || "")] || "BOLOs";

  if (!UPLOAD_ALLOWED_TYPES.test(type)) {
    return { ok: false, error: '"' + name + '" is not an allowed type. Use photos or PDFs.' };
  }

  if (!data) {
    return { ok: false, error: '"' + name + '" is empty.' };
  }

  let bytes;
  try {
    bytes = Utilities.base64Decode(data);
  } catch (error) {
    return { ok: false, error: '"' + name + '" could not be read.' };
  }

  if (bytes.length > UPLOAD_MAX_BYTES) {
    return { ok: false, error: '"' + name + '" is over 4 MB. Resize or crop it and try again.' };
  }

  // Uses the Drive API advanced service, not the classic DriveApp
  // library: the Drive API works with the narrow drive.file scope,
  // which can only see files this script created.
  const folderId = getUploadFolderId_(area);
  const blob = Utilities.newBlob(bytes, type, name);

  const created = Drive.Files.create(
    { name: name, parents: [folderId] },
    blob,
    { fields: "id" }
  );

  // Safer default: do not create public-anyone links.
  // If CONFIG.UPLOAD_PUBLIC_LINKS is intentionally changed to true, files
  // become viewable by anyone with the link. Do that only when leadership wants it.
  if (CONFIG.UPLOAD_PUBLIC_LINKS === true) {
    Drive.Permissions.create({ role: "reader", type: "anyone" }, created.id);
  }

  const withUrls = withDriveUrls_([{ name: name, fileId: created.id }])[0];

  return {
    ok: true,
    message: "File uploaded.",
    name: withUrls.name,
    fileId: withUrls.fileId,
    viewUrl: withUrls.viewUrl,
    thumbUrl: withUrls.thumbUrl
  };
}

function getUploadFolderId_(subName) {
  const parentId = findOrCreateFolderId_(CONFIG.UPLOAD_FOLDER, null);
  return findOrCreateFolderId_(subName, parentId);
}

function findOrCreateFolderId_(name, parentId) {
  const safeName = String(name).replace(/'/g, "\\'");
  let query =
    "name = '" + safeName + "' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";

  if (parentId) {
    query += " and '" + parentId + "' in parents";
  }

  const found = Drive.Files.list({ q: query, fields: "files(id)", pageSize: 1 });

  if (found.files && found.files.length) {
    return found.files[0].id;
  }

  const resource = { name: String(name), mimeType: "application/vnd.google-apps.folder" };
  if (parentId) {
    resource.parents = [parentId];
  }

  return Drive.Files.create(resource, null, { fields: "id" }).id;
}

function attachmentsJson_(attachments) {
  if (!Array.isArray(attachments) || !attachments.length) {
    return "";
  }

  return JSON.stringify(
    attachments.slice(0, 5).map(function (item) {
      return {
        name: String((item && item.name) || "file").slice(0, 200),
        fileId: String((item && item.fileId) || "").slice(0, 100)
      };
    })
  );
}

function withDriveUrls_(attachments) {
  return (attachments || [])
    .filter(function (item) {
      return item && item.fileId;
    })
    .map(function (item) {
      const fileId = String(item.fileId);
      return {
        name: String(item.name || "Attachment"),
        fileId: fileId,
        viewUrl: "https://drive.google.com/file/d/" + fileId + "/view",
        thumbUrl: "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w400"
      };
    });
}
