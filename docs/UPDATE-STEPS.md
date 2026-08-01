# PHS Security Hub deployment steps

## 1. Back up the current site and sheet

- Download the current GitHub repository as a ZIP.
- Make a copy of the Google Sheet before changing Apps Script.

## 2. Replace the GitHub repository files

1. Unzip this package.
2. Open the existing GitHub repository.
3. Replace the old repository contents with the **contents** of this folder.
4. Confirm these folders are at the repository root:

```text
public
netlify
google-apps-script
docs
```

5. Commit the changes.

## 3. Update Google Apps Script

1. Open the Apps Script project bound to the Security Hub Google Sheet.
2. Replace the existing `Code.gs` with `google-apps-script/Code.gs`.
3. Replace `appsscript.json` with the included file.
4. Save.
5. Run `setup()` once.

`setup()` adds missing report approval, occurrence date/time, People Involved, Start/End Time, and Report Actions columns. It also installs the daily 2 PM summary trigger, keeps existing records, and repairs the B.O.L.O. header layout when needed.

## 4. Set daily summary recipients

By default, the daily summary includes Tim at `twood9083@gmail.com`. Add the Security Lead by running this once in Apps Script, replacing the second address with the correct lead email:

```javascript
configureDailySummaryRecipients("twood9083@gmail.com,lead-email@pembrokehill.org")
```

The summary runs daily at approximately 2:00 PM Central and covers the previous 24 hours. Run this to send a test immediately:

```javascript
sendDailySummaryTest()
```

## 5. Publish a new Apps Script deployment version

1. Select **Deploy**.
2. Select **Manage deployments**.
3. Select the edit/pencil icon for the web app.
4. Select **New version**.
5. Select **Deploy**.
6. Continue using the `/exec` URL.

## 6. Confirm Netlify environment variables

Open Netlify → Site configuration → Environment variables.

```text
APPS_SCRIPT_URL=your Apps Script /exec URL
APPS_SCRIPT_TOKEN=the token from setup()
SUPERVISOR_PIN=your supervisor-only PIN
```

Optional:

```text
SUPERVISOR_SESSION_HOURS=8
SUPERVISOR_SESSION_SECRET=a long random secret
```

## 7. Confirm Netlify build settings

```text
Build command: blank
Publish directory: public
Functions directory: netlify/functions
```

## 8. Smoke test

Test each item after the Netlify deployment completes:

- Overview loads and displays the campus aerial image.
- Light/dark appearance toggle works and persists after refresh.
- Daily Activity requires actual date, time, campus, location, activity type, officer, and activity details.
- Daily Activity saves and returns a DA number.
- Incident Report requires actual date/time, priority, campus/location, narrative, and a People Involved Yes/No response.
- Multiple involved people can be added.
- Incident Report saves and returns an IR number.
- New incident appears in Supervisor Review as Pending Approval.
- Supervisor link remains hidden until the PIN is accepted.
- Approve, Needs Correction, Reviewed, and Resolve actions work.
- Key checkout appears in Currently Out and can be returned.
- Pass-down entry saves and flagged entries appear on the dashboard.
- B.O.L.O. can be posted and resolved.
- Gates & Fences loads inside Resources and the full-site button works.
- Attachments upload into the private Google Drive folder.
- Daily summary test email sends to Tim and the Security Lead.

## 9. Attachment access

Uploads are private by default. Share the upload folder or appropriate subfolders with approved Security Hub users who need to open attachments.


## Location and time-field patch

This patch adds Centennial Gate, Overall Campus Patrol for both campuses, and Start Time / End Time dropdown support for Daily Activity and Incident Reports. It also normalizes time-only sheet values so dashboard cards do not display 1899 dates.

After replacing `google-apps-script/Code.gs`, run `setup()` once. Existing sheets will keep their data and receive the new `Start Time` and `End Time` columns. Then publish a new Apps Script deployment version.


## Daily email summary patch

This patch adds an automated daily email at approximately 2:00 PM Central. The message includes Incident Reports, approval/status actions, Daily Activity, keys/equipment actions, pass-downs, and B.O.L.O. actions from the previous 24 hours. It also adds a `Report Actions` sheet so supervisor approvals and status changes are captured in the daily summary.
