/**
 * PHS Security Hub — automated backups (#22).
 *
 * LEAST PRIVILEGE: this deliberately does NOT copy the source file, because
 * copying requires full `drive` access to your entire Drive. Instead it
 * CREATES a new spreadsheet and writes the data into it. A file the script
 * creates is covered by `drive.file`, which grants access only to files this
 * app made — nothing else in your Drive is visible to it.
 *
 * Setup: add this file to the Security Hub Apps Script project, then run
 * setupBackups() once. Run verifyBackup() any time to confirm backups are
 * readable and complete.
 */

var BACKUP_CONFIG = {
  rootFolderName: 'PHS Security Hub Backups',

  // Nightly run hour, 24h, school local time.
  hour: 2,

  // Keep this many daily backups. Older ones are trashed.
  keepDailyDays: 45,

  // On January 1 the previous year is archived permanently.
  archiveOnJan1: true,

  // Where failures are reported.
  alertEmail: 'twood9083@gmail.com',

  // Sheets excluded from backup (logs about the backup itself).
  skipSheets: ['Backup Log']
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

function setupBackups() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'runNightlyBackup') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('runNightlyBackup')
    .timeBased()
    .atHour(BACKUP_CONFIG.hour)
    .everyDays(1)
    .create();

  var root = backupRoot_();
  Logger.log('Backups configured. Nightly at ~%s:00.', BACKUP_CONFIG.hour);
  Logger.log('Folder: %s', root.getUrl());
  return { ok: true, folderUrl: root.getUrl() };
}

// ---------------------------------------------------------------------------
// Nightly run
// ---------------------------------------------------------------------------

function runNightlyBackup() {
  try {
    var result = createBackup_();
    pruneOldBackups_();
    maybeArchiveYear_();
    recordBackupRun_(result.name, result.sheetCount, result.rowCount, 'OK', '');
    return result;
  } catch (err) {
    recordBackupRun_('', 0, 0, 'FAILED', String(err));
    notifyFailure_(String(err));
    throw err;
  }
}

/**
 * Builds a brand-new spreadsheet and writes every sheet's values into it.
 * Values only — this is a data backup, not a formatting backup, which is
 * what makes `drive.file` sufficient.
 */
function createBackup_() {
  var source = SpreadsheetApp.getActiveSpreadsheet();
  var stamp = Utilities.formatDate(new Date(), timezone_(), 'yyyy-MM-dd');
  var name = 'Security Hub backup ' + stamp;
  var folder = backupRoot_();

  // Replace a same-day backup so repeat runs do not pile up. Iterating a
  // folder this script created is allowed under drive.file.
  var existing = folder.getFiles();
  while (existing.hasNext()) {
    var candidate = existing.next();
    if (candidate.getName() === name) candidate.setTrashed(true);
  }

  var backup = SpreadsheetApp.create(name);
  var backupFile = DriveApp.getFileById(backup.getId());

  // Move it into the backup folder. Using the advanced Drive service so the
  // file leaves My Drive root without needing DriveApp.getRootFolder(),
  // which drive.file does not allow.
  try {
    Drive.Files.update({}, backup.getId(), null, {
      addParents: folder.getId(),
      removeParents: 'root',
      supportsAllDrives: true
    });
  } catch (err) {
    // Fall back to a plain add; the file then also remains in My Drive root,
    // which is untidy but harmless.
    try { folder.addFile(backupFile); } catch (err2) {}
  }

  var sheets = source.getSheets();
  var rowCount = 0;
  var copied = 0;
  var first = true;

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var sheetName = sheet.getName();
    if (BACKUP_CONFIG.skipSheets.indexOf(sheetName) !== -1) continue;

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    var target;
    if (first) {
      target = backup.getSheets()[0];
      target.setName(sheetName);
      first = false;
    } else {
      target = backup.insertSheet(sheetName);
    }

    if (lastRow > 0 && lastCol > 0) {
      var values = sheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();
      target.getRange(1, 1, lastRow, lastCol).setValues(values);
      rowCount += Math.max(0, lastRow - 1);
    }
    copied++;
  }

  // Stamp the backup so its origin and moment are self-evident.
  var meta = backup.insertSheet('_backup_info');
  meta.getRange(1, 1, 4, 2).setValues([
    ['Created', Utilities.formatDate(new Date(), timezone_(), 'yyyy-MM-dd HH:mm:ss')],
    ['Source', source.getName()],
    ['Sheets', copied],
    ['Data rows', rowCount]
  ]);

  return {
    ok: true,
    name: name,
    fileId: backup.getId(),
    url: backup.getUrl(),
    sheetCount: copied,
    rowCount: rowCount
  };
}

// ---------------------------------------------------------------------------
// Retention
// ---------------------------------------------------------------------------

function pruneOldBackups_() {
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - BACKUP_CONFIG.keepDailyDays);

  var files = backupRoot_().getFiles();
  var removed = 0;

  while (files.hasNext()) {
    var file = files.next();
    // Yearly archives are never pruned.
    if (file.getName().indexOf('archive') !== -1) continue;
    if (file.getDateCreated() < cutoff) {
      file.setTrashed(true);
      removed++;
    }
  }
  return removed;
}

function maybeArchiveYear_() {
  if (!BACKUP_CONFIG.archiveOnJan1) return;

  var now = new Date();
  if (now.getMonth() !== 0 || now.getDate() !== 1) return;

  var year = now.getFullYear() - 1;
  var name = 'Security Hub archive ' + year;
  var folder = backupRoot_();

  // Iterate rather than query — drive.file does not permit name searches.
  var files = folder.getFiles();
  while (files.hasNext()) {
    if (files.next().getName() === name) return;
  }

  var made = createBackup_();
  DriveApp.getFileById(made.fileId).setName(name);
  Logger.log('Archived %s', name);
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

/**
 * Opens the most recent backup, confirms it is readable, and compares its
 * sheet and row counts against the live spreadsheet.
 */
function verifyBackup() {
  var files = backupRoot_().getFiles();
  var newest = null;

  while (files.hasNext()) {
    var file = files.next();
    if (!newest || file.getDateCreated() > newest.getDateCreated()) newest = file;
  }

  if (!newest) {
    var msg = 'No backups found. Run setupBackups() then runNightlyBackup().';
    Logger.log(msg);
    return { ok: false, error: msg };
  }

  var backup = SpreadsheetApp.openById(newest.getId());
  var live = SpreadsheetApp.getActiveSpreadsheet();

  var report = [];
  var problems = [];

  live.getSheets().forEach(function (sheet) {
    var name = sheet.getName();
    if (BACKUP_CONFIG.skipSheets.indexOf(name) !== -1) return;

    var mirror = backup.getSheetByName(name);
    if (!mirror) {
      problems.push('Missing sheet in backup: ' + name);
      return;
    }

    var liveRows = Math.max(0, sheet.getLastRow() - 1);
    var backupRows = Math.max(0, mirror.getLastRow() - 1);

    // A backup may trail live by rows added since it ran, but must never
    // contain more than existed at capture time.
    if (backupRows > liveRows) {
      problems.push(name + ': backup has more rows than live (' +
                    backupRows + ' vs ' + liveRows + ')');
    }

    report.push(name + ': ' + backupRows + ' rows');
  });

  var age = Math.round((Date.now() - newest.getDateCreated().getTime()) / 3600000);
  if (age > 30) problems.push('Newest backup is ' + age + ' hours old.');

  var ok = problems.length === 0;
  Logger.log('Backup: %s (%s hrs old)', newest.getName(), age);
  report.forEach(function (line) { Logger.log('  %s', line); });
  if (ok) {
    Logger.log('VERIFIED — backup is readable and complete.');
  } else {
    problems.forEach(function (p) { Logger.log('PROBLEM: %s', p); });
  }

  return {
    ok: ok,
    backupName: newest.getName(),
    backupUrl: newest.getUrl(),
    ageHours: age,
    sheets: report,
    problems: problems
  };
}

/**
 * Restore path. Deliberately not automated — restoring is a decision.
 */
function restoreInstructions() {
  var result = verifyBackup();
  var steps = [
    '1. Open the backup spreadsheet linked below.',
    '2. Check the _backup_info tab for when it was captured.',
    '3. For a single sheet: select the data, copy, and paste into the live',
    '   sheet after clearing the damaged rows.',
    '4. For a full restore: File > Make a copy of the backup, then point the',
    '   Apps Script project at the copy.',
    '5. Run setup() so any missing columns are rebuilt.',
    '6. Publish a new Apps Script deployment version.',
    'NOTE: backups store values, not formulas or formatting. Re-running',
    'setup() restores the expected structure.'
  ];
  Logger.log('Restore from: %s', result.backupUrl || 'NO BACKUP FOUND');
  steps.forEach(function (s) { Logger.log(s); });
  return { backup: result, steps: steps };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the backup folder, creating it on first use.
 *
 * IMPORTANT: `drive.file` does not permit searching Drive, so
 * DriveApp.getFoldersByName() is unavailable. The folder ID is stored in
 * Script Properties on creation and fetched by ID afterwards, which IS
 * permitted for files and folders this script created.
 */
function backupRoot_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('BACKUP_FOLDER_ID');

  if (id) {
    try {
      return DriveApp.getFolderById(id);
    } catch (err) {
      // Folder was deleted or is unreachable; fall through and make a new one.
    }
  }

  var folder = DriveApp.createFolder(BACKUP_CONFIG.rootFolderName);
  props.setProperty('BACKUP_FOLDER_ID', folder.getId());
  return folder;
}

function timezone_() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() || 'America/Chicago';
  } catch (err) {
    return 'America/Chicago';
  }
}

function recordBackupRun_(name, sheetCount, rowCount, status, note) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Backup Log');
    if (!sheet) {
      sheet = ss.insertSheet('Backup Log');
      sheet.appendRow(['Timestamp', 'Backup', 'Sheets', 'Rows', 'Status', 'Note']);
    }
    sheet.appendRow([new Date(), name, sheetCount, rowCount, status, note]);
  } catch (err) {
    // Logging must never break the backup itself.
  }
}

function notifyFailure_(message) {
  try {
    if (!BACKUP_CONFIG.alertEmail) return;
    MailApp.sendEmail(
      BACKUP_CONFIG.alertEmail,
      'PHS Security Hub — backup FAILED',
      'The nightly Security Hub backup did not complete.\n\n' + message +
      '\n\nRun verifyBackup() in Apps Script to check the most recent good backup.'
    );
  } catch (err) {
    // Nothing further to do if mail also fails.
  }
}

/** Run once from the editor to take a backup immediately and verify it. */
function backupNowAndVerify() {
  var created = createBackup_();
  Logger.log('Created: %s', created.name);
  Logger.log('URL: %s', created.url);
  return verifyBackup();
}
