# PHS Security Hub

A responsive security operations hub for Pembroke Hill School. The application combines officer reporting, key and equipment accountability, pass-down notes, B.O.L.O.s, supervisor approval, private attachments, and operational references in one deployable Netlify project.

## Included in this build

- Google sign-in gate with a server-side email allowlist. Only accounts
  listed in `ALLOWED_EMAILS` can load any hub data. See `docs/SIGN-IN-SETUP.md`.
- Modern responsive interface for desktop, tablet, and mobile.
- Pembroke Hill-inspired navy, red, white, and gold visual system.
- Light and dark appearance modes with browser preference persistence.
- Campus aerial image integrated into the Overview page.
- Purpose-driven dashboard cards for keys out, flagged pass-downs, active B.O.L.O.s, and reports awaiting approval.
- Distinct Daily Activity and Incident Report workflows.
- Actual date and time fields for Daily Activity and Incident Reports.
- Dynamic People Involved section with multiple-person support:
  - Name required
  - Role required: Witness, Victim, Person of Interest, Other
  - Student Yes/No required
  - Date of birth optional
  - Phone optional
- Incident priority and narrative fields.
- Private photo/PDF attachment handling through Google Drive.
- PIN-protected Supervisor Review.
- Server-side verification for supervisor approval and status changes.
- Report approval flow:
  - Pending Approval
  - Approved
  - Needs Correction
  - Reviewed
  - Resolved
- Embedded Gates & Fences reference site at `https://phsgates.netlify.app/`.
- Accessible landmarks, skip link, labeled controls, keyboard-friendly navigation, and large touch targets.
- Native ES modules with no frontend build command required.
- Daily 2 PM email summary covering actions from the previous 24 hours.

## Architecture

```text
Browser
  ↓
Netlify static site + Netlify Functions
  ↓
Google Apps Script web app
  ↓
Google Sheets + private Google Drive uploads
```

The browser never receives the Apps Script URL, Apps Script API token, supervisor PIN, or supervisor signing secret.

## Repository structure

```text
public/
  index.html
  assets/
  data/
  js/
    pages/
  styles/
netlify/
  functions/
google-apps-script/
docs/
netlify.toml
.env.example
```

## Required Netlify environment variables

Set these in Netlify. Do not commit real values to GitHub.

```text
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
APPS_SCRIPT_TOKEN=YOUR_APPS_SCRIPT_TOKEN
SUPERVISOR_PIN=YOUR_SUPERVISOR_PIN
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
ALLOWED_EMAILS=security@pembrokehill.org,lead-email@pembrokehill.org
```

`GOOGLE_CLIENT_ID` and `ALLOWED_EMAILS` power the officer sign-in gate.
Setup steps: `docs/SIGN-IN-SETUP.md`. The API fails closed without them.

Optional:

```text
SUPERVISOR_SESSION_HOURS=8
SUPERVISOR_SESSION_SECRET=OPTIONAL_LONG_RANDOM_SECRET
AUTH_SESSION_DAYS=7
AUTH_SESSION_SECRET=OPTIONAL_DIFFERENT_LONG_RANDOM_SECRET
```

The supervisor session defaults to 8 hours and is stored in browser session storage. Closing the browser tab or selecting **Lock supervisor** removes the local session.

## Netlify settings

```text
Build command: leave blank
Publish directory: public
Functions directory: netlify/functions
```

The included `netlify.toml` already defines the publish and functions directories.

## Google Apps Script setup

1. Open the Apps Script project bound to the Security Hub Google Sheet.
2. Replace `Code.gs` with `google-apps-script/Code.gs` from this repository.
3. Replace `appsscript.json` with the included file.
4. Save.
5. Run `setup()` once.
6. Copy the API token from the execution log into Netlify as `APPS_SCRIPT_TOKEN`.
7. Confirm the daily summary recipients. By default, the script includes `twood9083@gmail.com`. To add the Security Lead, run this once from Apps Script, replacing the second address with the lead email:

```javascript
configureDailySummaryRecipients("twood9083@gmail.com,lead-email@pembrokehill.org")
```

8. Deploy the Apps Script project as a web app.

Use:

```text
Execute as: Me
Who has access: Anyone
Use the /exec URL, not /dev
```

After every `Code.gs` update:

```text
Deploy → Manage deployments → Edit → New version → Deploy
```

## New sheet columns added by setup()

### Incident Reports

- Incident Date
- Incident Time
- People Involved
- Approval Status
- Approved At
- Approved By
- Approval Notes

### Daily Activity

- Activity Date
- Activity Time
- Start Time
- End Time

### Report Actions

- Timestamp
- Report ID
- Action
- Status
- Actor
- Notes

`setup()` adds missing columns to existing sheets without deleting current records. New form submissions are written by header name rather than fixed column position, which helps prevent data from drifting into the wrong column when fields are added later.

## Daily 2 PM email summary

`setup()` installs a time-based Apps Script trigger for `sendDailySummaryEmail()` at approximately 2:00 PM Central time each day. Google time-based triggers may run a few minutes around the requested time, because even automation apparently needs a window.

The email lists Security Hub actions from the previous 24 hours:

- Incident Reports submitted
- Report approval / status actions
- Daily Activity entries
- Key / equipment checkouts and returns
- Pass-down entries
- B.O.L.O. posts and resolutions

Recipient setup:

```javascript
configureDailySummaryRecipients("twood9083@gmail.com,lead-email@pembrokehill.org")
```

Manual test from Apps Script:

```javascript
sendDailySummaryTest()
```

The Apps Script manifest includes the mail and trigger scopes required for this feature.

## Attachment behavior

Attachments are private by default. The Apps Script project uses the advanced Drive service and the `drive.file` scope so it can manage only files created by the application.

The current browser-to-Netlify-to-Apps-Script upload path is intentionally limited to 3 files at 4 MB each. Larger uploads require a different direct-to-storage upload design and should not be enabled by only changing the browser validation.

Share the `PHS Security Hub Uploads` folder only with approved users who need attachment access.

## Security notes

- Do not commit `.env`, API tokens, supervisor PINs, or session secrets.
- Include only operationally necessary sensitive information in reports.
- PIN access is stronger than hiding a menu item, but school-account authentication and role-based access would be the preferred long-term model.
- The site is marked `noindex, nofollow`, but that is not an access-control mechanism.

## Deployment

Use `docs/UPDATE-STEPS.md` for the exact upgrade sequence and `docs/BUILD-OUTLINE.md` for the component and maintenance guide.
