# PHS Security Hub — v9 specification

Status: approved, phase 1 in progress
Date: July 31, 2026

---

## 1. What v9 is

v9 takes the hub from a working reporting tool to a full security operations
platform. It consolidates 19 planned features into 6 operational areas plus
2 reference areas — fewer navigation items than the current build, holding
roughly three times the functionality.

v8 (the Google sign-in gate) is the immediate predecessor and must deploy
before or alongside phase 1.

---

## 2. Navigation map

| Area | Contains |
| --- | --- |
| **Overview** | Email ticker, promoted counts, unified activity feed |
| **Reporting** | Daily Activity, Incident Reports, case view, PDF export |
| **Shift** | Briefing → pass-down → close-out (one page, three states) |
| **Access** | Keys, equipment, contractors, visitors |
| **B.O.L.O.s** | Advisories, tracked subjects |
| **Insights** | Trends dashboard, monthly report |
| **Resources** | Post orders with sign-off, inspection rounds, gates reference |
| **Supervisor Review** | Approvals, assignments, overdue items |

### Global systems — no navigation item

- Search (across every record type)
- Emergency mode (global toggle)
- Alerts (email / SMS, shares the ticker rules engine)
- Offline queue and sync
- Fast entry (form layer)
- Automated backups
- `/board` wall display

---

## 3. Design decisions settled

### Layout — structure C

The app header is **removed entirely**. The email ticker owns the full top
strip. Identity, clock, connection status, and controls (supervisor, refresh,
theme) move into the side navigation on desktop and the More sheet on mobile.

Overview order, top to bottom:

1. Email ticker (locked banner)
2. Promoted counts — only appear when non-zero
3. Quick actions
4. Unified activity feed with filter chips
5. Keys / pass-down / B.O.L.O. detail cards (when not promoted)

Removed: hero block ("One clear view of the day"), campus aerial, shift
summary strip, pending-approvals count, the five separate activity panels.

### Conditional promotion

B.O.L.O.s, keys out, and flagged pass-downs sit dimmed at the bottom when
zero. When any has a value it moves to a colored row directly under the
ticker and disappears from the bottom. No duplication.

Promotion colors: B.O.L.O.s red, keys and flagged pass-downs amber.

### Crest

New shield mark: fine-line shield with crossed keys, no wordmark.
Deliberately distinct from the official school crest to avoid conflicting
with school branding. Strokes thicken and key teeth drop as the mark
shrinks, so it stays legible from app icon down to favicon.

### Ticker contrast — measured

Pale tint background with dark same-family text. Measured ratios:

| Treatment | Ratio | Verdict |
| --- | --- | --- |
| Red 900 on red 50 | 12.6:1 | Chosen |
| Teal 900 on teal 100 | 9.2:1 | Chosen |
| Blue 800 on blue 50 | 8.6:1 | Chosen |
| White on saturated red 400 | 3.9:1 | Rejected — fails AA |
| Dark mode: red 100 on red 800 | 6.6:1 | Chosen |

Rationale: officers read this outdoors in daylight on phones. Pale
backgrounds with very dark text hold up in sun; mid-toned fills with white
text do not. Dark mode inverts to deep fill with pale text.

---

## 4. Feature specifications

### #23 — Security email ticker

Reads `security@pembrokehill.org`. **No AI reads message content** — matching
is keyword and label rules only, running inside Apps Script and Gmail.

Matching:
- Gmail label ("Security Hub") — anything labeled always appears
- Keyword rules on subject and sender, editable without code changes

Keyword groups: access and gates; arrivals and visitors; coverage requests;
events; issues and concerns; traffic and parking; campus place names.

Display: category tag, subject cleaned up, extracted location and time,
sender, age. Urgent styling on urgent / ASAP / emergency / immediately / now.

Behavior: locked banner, cycles one at a time, pauses on hover, click opens
the message directly in Gmail, dismissal marks it handled.

**Prerequisite:** Apps Script must run as an account that can read the
security mailbox — either move the script or set a forwarding rule.

### #12 + #20 — Shift (one module)

A single page with three states rather than three features:
- **Opens as briefing** — today's pass-downs, active B.O.L.O.s, events,
  weather, who is on, open follow-ups
- **Collects during shift** — pass-down notes as they happen
- **Closes out** — auto-built summary of entries filed, keys handled,
  follow-ups touched, ticker requests handled

Optional "mark as read" so the lead knows the briefing was seen.

### #14 — Access (consolidated)

Contractor arrival and keycard issue become **one action on one record**.
Check-in, badge number, escort, expected return, and return all in a single
entry. Replaces the separate visitor-log concept — two systems tracking the
same contractor is worse than none.

### #7 — Alerts (shares ticker engine)

One keyword and label rules table drives both the ticker and alerts. The
ticker is the in-app channel; email and SMS handle away-from-app. Severity
routing decides which. Quiet hours for routine alerts; urgent always fires.

Push notifications are unavailable while the PWA is paused.

### #6 — Supervisor queue (merged)

Follow-up assignments merge **into** Supervisor Review rather than forming a
competing task list. One queue holds approvals, assignments, and overdue
items. Officers see their slice through a "my items" filter.

Closure requires a disposition note.

### #4 — Case linking (additive only)

Adds a case ID field to existing records. **Never restructures or migrates
existing data.** Old reports keep working untouched; backfill is optional and
manual. Case view stitches DA entries, IRs, B.O.L.O.s, pass-downs,
attachments, and approvals into one chronological timeline.

Suggests possible links on matching location and type within 14 days.

### #22 — Backups (automatic, verified)

Nightly dated export of all Sheets data with no manual step, yearly archive
files, and a defined retention policy. Includes a **verified restore path**
so the backups are known to work rather than assumed.

Must land before any data model change (#4).

### #10 — Wall display (read-only view)

Renders existing hub data in a different layout at `/board`. Adds no data
model of its own. Current shift, live pass-downs, active B.O.L.O.s with
photos, keys out with overdue in red, clock. Auto-rotating, auto-refresh, no
interaction.

### #15 / #16 — Resources additions

Inspection rounds: recurring checklists (radios, AEDs, extinguishers, gate
and fence walks) with overdue items surfacing on the Overview.

Post orders: versioned, with required read-and-acknowledge per officer.

### #13 — Emergency mode

Global toggle flipping the hub into incident footing: lockdown and
evacuation checklists, one-tap timestamped event log for the after-action
report, roll-call tracker.

**Depends on #2 (offline)** — it is needed exactly when networks are
congested or down.

### #2 + #3 — Offline and fast entry (one pass)

Both rewrite the form layer, so they ship together rather than writing forms
twice.

Offline: reports, pass-downs, and checkouts queue locally and sync on
reconnect, with a visible pending count. Read-only cache of today's
B.O.L.O.s, pass-downs, and post orders. Queued entries keep their original
written-at timestamp. Draft autosave.

Fast entry: native time pickers, "now" and "15 min ago" buttons, direct
camera access with client-side compression, repeat-last-entry, smart
defaults per device, templates for common entries, photo annotation.

### #17 — Search

One box across IRs, DAs, pass-downs, B.O.L.O.s, and key logs. Filters for
date, campus, type, officer. Reindexes after #4 lands.

### #8 / #9 — Insights

Trends: campus map heat overlay, hour-of-day by day-of-week grid, type and
location trend lines, spike detection. Every chart drills into underlying
reports.

Monthly report: one-click PDF with executive summary, month-over-month
stats, notable incidents, open follow-ups, equipment accountability, and an
editable recommendations section. Auto-emails on the 1st.

---

## 5. Build phases

### Phase 1 — Foundation
Deploy v8 sign-in · backups (#22) · Overview redesign · email ticker (#23)

Backups first so everything after is protected. The ticker's rules engine is
built to be reused by alerts later.

### Phase 2 — Field experience
Fast entry (#3) + offline (#2) as one pass · search (#17)

### Phase 3 — Structure
Case linking (#4) → PDF export (#5) · Shift module (#12 + #20) ·
supervisor queue (#6)

Data model change. Search reindexes after.

### Phase 4 — Operations
Access + visitors (#14) · inspection rounds (#15) · post orders (#16) ·
alerts (#7) · emergency mode (#13)

### Phase 5 — Intelligence
Trends (#8) → monthly report (#9) → wall display (#10)

Needs accumulated linked data. The board reads everything, so it goes last.

---

## 6. Paused

| # | Feature | Note |
| --- | --- | --- |
| 1 | Installable app (PWA) | See open question below |
| 11 | Guard tour verification | QR/NFC checkpoint scanning |
| 18 | Roles and permissions | Read-only leadership view |
| 19 | AI report assistant | Paused deliberately — no AI reads security content |

### Dropped

| # | Feature | Reason |
| --- | --- | --- |
| 21 | Lost and found | Cut |

---

## 7. Open questions

**PWA overlap.** Offline mode (#2) requires a service worker, which is most
of what makes an app installable. Building #2 delivers roughly 80% of #1
without collecting the payoff. Recommend un-pausing #1 when phase 2 starts.

**Alert channel.** Without the PWA, push notifications are unavailable;
alerts are email and SMS only.

**Insights audience.** While #18 is paused, anyone who signs in sees
everything, including trends and the monthly report. This is fine for an
officers-only hub but becomes a problem the moment leadership needs a login.

**Mailbox access.** Confirm whether Apps Script moves to the security
account or a forwarding rule is set.
