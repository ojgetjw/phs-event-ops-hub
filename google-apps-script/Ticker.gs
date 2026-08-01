/**
 * PHS Security Hub — email ticker rules engine.
 *
 * Reads the security mailbox and surfaces messages that request security
 * attention. Matching is KEYWORD AND LABEL ONLY — no message content is
 * sent to any AI service. Everything below runs inside Apps Script and
 * Gmail, on the school's own account.
 *
 * LEAST PRIVILEGE: this uses `gmail.readonly`. The script can read mail but
 * cannot alter, label, send, or delete anything. Dismissals are recorded in
 * the project's own Sheet rather than by labelling Gmail, precisely so that
 * a write scope is never needed.
 *
 * Add this file to the Security Hub Apps Script project alongside Code.gs.
 * Then wire two actions in Code.gs's doPost router:
 *
 *   if (action === 'tickerFeed')    return jsonOut(tickerFeed());
 *   if (action === 'tickerDismiss') return jsonOut(tickerDismiss(body.messageId, body.handledBy));
 *
 * PREREQUISITE: this script must run as an account that can read
 * security@pembrokehill.org — either move the project to that account or
 * set a Gmail forwarding rule into the account that owns this script.
 */

// ---------------------------------------------------------------------------
// Configuration — edit these lists without touching any other code.
// ---------------------------------------------------------------------------

var TICKER_CONFIG = {
  // Anything with this Gmail label always appears, regardless of keywords.
  // Reading labels is a read operation, so this works under gmail.readonly.
  alwaysLabel: 'Security Hub',

  // Dismissed message IDs live in this sheet, not in Gmail.
  handledSheet: 'Ticker Handled',

  // How far back to look, and the ceiling on returned items.
  lookbackDays: 3,
  maxItems: 12,

  // Words that force URGENT styling wherever they appear.
  urgent: ['urgent', 'asap', 'emergency', 'immediately', 'right now', 'unsafe', 'threat'],

  // Category rules, evaluated in order. First match wins.
  categories: [
    {
      tag: 'ISSUE', tone: 'issue',
      words: ['suspicious', 'concern', 'incident', 'problem', 'issue', 'trespass',
              'unauthorized', 'damage', 'vandalism', 'theft', 'stolen', 'missing',
              'broken', 'alarm']
    },
    {
      tag: 'GATE', tone: 'gate',
      words: ['gate', 'unlock', 'lock up', 'lockup', 'open up', 'access', 'keycard',
              'key card', 'badge', 'door', 'propped']
    },
    {
      tag: 'VISITOR', tone: 'visitor',
      words: ['visitor', 'arriving', 'arrival', 'guest', 'tour', 'delivery', 'deliver',
              'vendor', 'contractor', 'service', 'repair', 'inspection', 'appointment']
    },
    {
      tag: 'COVERAGE', tone: 'coverage',
      words: ['coverage', 'staffing', 'officer needed', 'security needed', 'need security',
              'need an officer', 'escort', 'walk out', 'walk to car', 'standby', 'monitor']
    },
    {
      tag: 'TRAFFIC', tone: 'gate',
      words: ['parking', 'driveline', 'drive line', 'traffic', 'blocked', 'blocking',
              'towed', 'lot']
    },
    {
      tag: 'EVENT', tone: 'event',
      words: ['event', 'game', 'practice', 'tournament', 'rehearsal', 'performance',
              'after hours', 'afterhours', 'weekend']
    }
  ],

  // Campus vocabulary, used to pull a location out of the message.
  places: ['Ward Parkway', 'Ward', 'Wornall', 'Boocock', 'Hicks', 'Centennial',
           'Jordan', 'Kemper', 'Phillips', 'Patterson', 'Bellis', 'Grant Gym',
           'Beals', 'Kroh', 'Early Childhood', 'EC', 'Founders', 'Dining Hall',
           'DeRamus', 'Intermediate', 'Primary', 'Curry', 'Carriage House',
           'Quad', 'Turf Field', 'Mellon', 'Loose Park', 'SOC', 'Kiosk',
           'Upper School', 'Middle School', 'Lower School']
};

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

function tickerFeed() {
  try {
    var query = 'newer_than:' + TICKER_CONFIG.lookbackDays + 'd -in:trash -in:spam';
    var threads = GmailApp.search(query, 0, 60);
    var handled = handledIds_();
    var out = [];

    for (var t = 0; t < threads.length; t++) {
      var messages = threads[t].getMessages();
      var msg = messages[messages.length - 1];

      // Dismissed items are filtered here rather than labelled in Gmail.
      if (handled[msg.getId()]) continue;

      var labels = threadLabelNames_(threads[t]);
      var subject = msg.getSubject() || '';
      var snippet = stripQuoted_(msg.getPlainBody() || '').slice(0, 400);
      var haystack = (subject + ' ' + snippet).toLowerCase();

      var labelled = labels.indexOf(TICKER_CONFIG.alwaysLabel) !== -1;
      var category = matchCategory_(haystack);

      if (!labelled && !category) continue;
      if (!category) category = { tag: 'REQUEST', tone: 'request' };

      var urgent = matchesAny_(haystack, TICKER_CONFIG.urgent);

      out.push({
        id: msg.getId(),
        tag: urgent ? 'URGENT' : category.tag,
        tone: urgent ? 'urgent' : category.tone,
        title: cleanSubject_(subject),
        detail: buildDetail_(subject + ' ' + snippet),
        when: relativeTime_(msg.getDate()),
        from: senderName_(msg.getFrom()),
        link: 'https://mail.google.com/mail/u/0/#all/' + msg.getId(),
        sortKey: msg.getDate().getTime(),
        urgent: urgent
      });

      if (out.length >= TICKER_CONFIG.maxItems * 2) break;
    }

    // Urgent first, then newest.
    out.sort(function (a, b) {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return b.sortKey - a.sortKey;
    });

    return { ok: true, items: out.slice(0, TICKER_CONFIG.maxItems) };
  } catch (err) {
    return { ok: true, items: [], warning: String(err) };
  }
}

/**
 * Records a dismissal in the project's own Sheet. Gmail is never modified.
 */
function tickerDismiss(messageId, handledBy) {
  try {
    if (!messageId) return { ok: false, error: 'Missing message id.' };

    var subject = '';
    try {
      var msg = GmailApp.getMessageById(messageId);
      if (msg) subject = msg.getSubject() || '';
    } catch (err) {
      // Reading the subject is a nicety; dismissal still records without it.
    }

    var sheet = handledSheet_();
    sheet.appendRow([new Date(), messageId, subject, handledBy || '']);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function handledSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TICKER_CONFIG.handledSheet);
  if (!sheet) {
    sheet = ss.insertSheet(TICKER_CONFIG.handledSheet);
    sheet.appendRow(['Handled At', 'Message ID', 'Subject', 'Handled By']);
  }
  return sheet;
}

/** Map of dismissed message ids, pruned to the lookback window. */
function handledIds_() {
  var map = {};
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(TICKER_CONFIG.handledSheet);
    if (!sheet || sheet.getLastRow() < 2) return map;

    var cutoff = Date.now() - (TICKER_CONFIG.lookbackDays + 2) * 86400000;
    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();

    for (var i = 0; i < values.length; i++) {
      var when = values[i][0];
      var id = String(values[i][1] || '');
      if (!id) continue;
      var stamp = when instanceof Date ? when.getTime() : 0;
      if (stamp && stamp < cutoff) continue;
      map[id] = true;
    }
  } catch (err) {
    // If the sheet is unreadable, show everything rather than nothing.
  }
  return map;
}

// ---------------------------------------------------------------------------
// Matching helpers
// ---------------------------------------------------------------------------

function matchCategory_(haystack) {
  for (var i = 0; i < TICKER_CONFIG.categories.length; i++) {
    if (matchesAny_(haystack, TICKER_CONFIG.categories[i].words)) {
      return TICKER_CONFIG.categories[i];
    }
  }
  return null;
}

function matchesAny_(haystack, words) {
  for (var i = 0; i < words.length; i++) {
    var word = words[i].toLowerCase();
    // Whole-word match for short words so "lot" does not match "a lot of".
    if (word.length <= 4 && word.indexOf(' ') === -1) {
      if (new RegExp('\\b' + escapeRe_(word) + '\\b').test(haystack)) return true;
    } else if (haystack.indexOf(word) !== -1) {
      return true;
    }
  }
  return false;
}

// Builds the condensed second line: location and time pulled from the text.
function buildDetail_(text) {
  var parts = [];
  var place = findPlace_(text);
  if (place) parts.push(place);
  var when = findTime_(text);
  if (when) parts.push(when);
  return parts.join(' · ');
}

function findPlace_(text) {
  var lower = text.toLowerCase();
  for (var i = 0; i < TICKER_CONFIG.places.length; i++) {
    var place = TICKER_CONFIG.places[i];
    if (lower.indexOf(place.toLowerCase()) !== -1) return place;
  }
  return '';
}

function findTime_(text) {
  var time = text.match(/\b(1[0-2]|0?[1-9])(:[0-5][0-9])?\s?(am|pm|AM|PM)\b/);
  var day = text.match(/\b(today|tonight|tomorrow|this morning|this afternoon|this evening|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
  var out = [];
  if (day) out.push(titleCase_(day[0]));
  if (time) out.push(time[0].toLowerCase().replace(/\s+/g, ' '));
  return out.join(' ');
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function cleanSubject_(subject) {
  return String(subject || '')
    .replace(/^(re|fwd|fw)\s*:\s*/i, '')
    .replace(/\[.*?\]\s*/g, '')
    .trim() || 'Security request';
}

function senderName_(from) {
  var match = String(from || '').match(/^\s*"?([^"<]+?)"?\s*</);
  var name = match ? match[1].trim() : String(from || '').split('@')[0];
  var parts = name.split(/\s+/);
  if (parts.length >= 2) return parts[0].charAt(0) + '. ' + parts[parts.length - 1];
  return name;
}

function relativeTime_(date) {
  var mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + ' min ago';
  var hours = Math.round(mins / 60);
  if (hours < 24) return hours + ' hr ago';
  return Math.round(hours / 24) + ' d ago';
}

function stripQuoted_(body) {
  return String(body || '')
    .split(/\r?\n/)
    .filter(function (line) { return line.indexOf('>') !== 0; })
    .join(' ')
    .replace(/On .+ wrote:/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function threadLabelNames_(thread) {
  return thread.getLabels().map(function (l) { return l.getName(); });
}

function escapeRe_(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function titleCase_(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
}

/** Run once from the editor to confirm matching works against real mail. */
function tickerTest() {
  var result = tickerFeed();
  Logger.log('Matched %s item(s)', (result.items || []).length);
  (result.items || []).forEach(function (item) {
    Logger.log('[%s] %s — %s (%s, %s)', item.tag, item.title, item.detail, item.from, item.when);
  });
}
