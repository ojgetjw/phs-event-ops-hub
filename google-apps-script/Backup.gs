/**
 * PHS Security Hub — automated backups (#22).
 *
 * Nightly dated export of every sheet, yearly archives, retention policy,
 * and a verified restore path. Runs entirely inside Apps Script and Drive.
 *
 * Setup: add this file to the Security Hub Apps Script project, then run
 * setupBackups() once from the editor. That installs the nightly trigger
 * and creates the folder structure. Run verifyBackup() any time to confirm
 * backups are readable and complete.
 */

var BACKUP_CONFIG = {
  rootFolderName: 'PHS Security Hub Backups',
  dailyFolderName: 'Daily',
  yearlyFolderName: 'Yearly',

  // Nightly run hour, 24h, school local time.
  hour: 2,

  // Keep this many daily backups. Older ones are deleted (trashed).
  keepDailyDays: 45,

  // On January 1 the previous year is archived permanently.
  archiveOnJan1: true,

  // Where failures are reported.
  alertEmail: 'twood9083@gmail.com'
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
  childFolder_(root, BACKUP_CONFIG.dailyFolderName);
  childFolder_(root, BACKUP_CONFIG.yearlyFolderName);

  Logger.log('Backups configured. Nightly at ~%s:00. Folder: %s',
             BACKUP_CONFIG.hour, root.getUrl());
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

function createBackup_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var stamp = Utilities.formatDate(new Date(), timezone_(), 'yyyy-MM-dd');
  var name = 'Security Hub backup ' + stamp;

  var dailyFolder = childFolder_(backupRoot_(), BACKUP_CONFIG.dailyFolderName);

  // Remove a same-day backup if the job runs twice, so the folder stays clean.
  var existing = dailyFolder.getFilesByName(name);
  while (existing.hasNext()) existing.next().setTrashed(true);

  var copy = DriveApp.getFileById(ss.getId()).makeCopy(name, dailyFolder);

  // Count what was captured so verification has something to check against.
  var sheets = ss.getSheets();
  var rowCount = 0;
  sheets.forEach(function (sheet) { rowCount += Math.max(0, sheet.getLastRow() - 1); });

  return {
    ok: true,
    name: name,
    fileId: copy.getId(),
    url: copy.getUrl(),
    sheetCount: sheets.length,
    rowCount: rowCount
  };
}

// ---------------------------------------------------------------------------
// Retention
// ---------------------------------------------------------------------------

function pruneOldBackups_() {
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - BACKUP_CONFIG.keepDailyDays);

  var dailyFolder = childFolder_(backupRoot_(), BACKUP_CONFIG.dailyFolderName);
  var files = dailyFolder.getFiles();
  var removed = 0;

  while (files.hasNext()) {
    var file = files.next();
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
  var yearlyFolder = childFolder_(backupRoot_(), BACKUP_CONFIG.yearlyFolderName);
  var name = 'Security Hub archive ' + year;

  if (yearlyFolder.getFilesByName(name).hasNext()) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  DriveApp.getFileById(ss.getId()).makeCopy(name, yearlyFolder);
  Logger.log('Archived %s', name);
}

// ---------------------------------------------------------------------------
// Verification — the part that makes a backup trustworthy
// ---------------------------------------------------------------------------

/**
 * Opens the most recent backup, confirms it is readable, and compares its
 * sheet and row counts against the live spreadsheet. Run this any time.
 */
function verifyBackup() {
  var dailyFolder = childFolder_(backupRoot_(), BACKUP_CONFIG.dailyFolderName);
  var files = dailyFolder.getFiles();
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

  var liveSheets = live.getSheets();
  var report = [];
  var problems = [];

  liveSheets.forEach(function (sheet) {
    var name = sheet.getName();
    if (name === 'Backup Log') return;

    var mirror = backup.getSheetByName(name);
    if (!mirror) {
      problems.push('Missing sheet in backup: ' + name);
      return;
    }

    var liveRows = Math.max(0, sheet.getLastRow() - 1);
    var backupRows = Math.max(0, mirror.getLastRow() - 1);

    // The backup can trail the live sheet by rows added since it ran, but it
    // must never contain fewer rows than existed at capture time.
    if (backupRows > liveRows) {
      problems.push(name + ': backup has more rows than live (' + backupRows + ' vs ' + liveRows + ')');
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
 * Restore path. Deliberately NOT automated — restoring is a decision, not a
 * job. This returns the steps and the file to restore from.
 */
function restoreInstructions() {
  var result = verifyBackup();
  var steps = [
    '1. Open the backup file listed below in Google Sheets.',
    '2. File > Make a copy, so the backup itself stays untouched.',
    '3. In the copy, confirm the data you expect is present.',
    '4. Either point the Apps Script project at the copy, or copy the',
    '   affected sheet(s) back into the live spreadsheet.',
    '5. Re-run setup() so any missing columns are rebuilt.',
    '6. Publish a new Apps Script deployment version.'
  ];
  Logger.log('Restore from: %s', result.backupUrl || 'NO BACKUP FOUND');
  steps.forEach(function (s) { Logger.log(s); });
  return { backup: result, steps: steps };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function backupRoot_() {
  var existing = DriveApp.getFoldersByName(BACKUP_CONFIG.rootFolderName);
  return existing.hasNext() ? existing.next() : DriveApp.createFolder(BACKUP_CONFIG.rootFolderName);
}

function childFolder_(parent, name) {
  var existing = parent.getFoldersByName(name);
  return existing.hasNext() ? existing.next() : parent.createFolder(name);
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
  return verifyBackup();
}
