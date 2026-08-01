# Officer sign-in setup (Google, email allowlist)

The Security Hub now requires Google sign-in before anything loads. Only the
email addresses listed in the `ALLOWED_EMAILS` Netlify environment variable
can get in — even other pembrokehill.org accounts are rejected.

How it works:

```text
Officer clicks "Sign in with Google"
  ↓
Google verifies the account and returns a signed credential
  ↓
Netlify function /api/auth verifies the credential signature,
checks the email against ALLOWED_EMAILS, and issues a session token
  ↓
Every API call (hub data, metadata, submissions) requires that token.
No token, no data — the API returns 401 and the sign-in screen reappears.
```

The supervisor PIN is unchanged and now sits **behind** officer sign-in:
you must be a signed-in officer before the PIN even gets checked.

---

## Step 1 — Create the Google OAuth Client ID (one time, ~5 minutes)

1. Go to <https://console.cloud.google.com/> and sign in
   (the Security Lead's pembrokehill.org account is a good choice).
2. Create a project (top bar → project picker → **New project**).
   Name it `PHS Security Hub`.
3. Menu → **APIs & Services** → **OAuth consent screen**.
   - If offered **Internal** (Google Workspace), choose it. Otherwise choose
     **External** — the allowlist still controls who gets in.
   - App name: `PHS Security Hub`. Support email: your address. Save through
     the remaining screens; no scopes need to be added.
4. Menu → **APIs & Services** → **Credentials** → **Create credentials** →
   **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `PHS Security Hub Web`.
   - **Authorized JavaScript origins** — add every URL the hub is served from:
     - `https://gptv1.netlify.app`
     - your custom domain later, if you add one
   - No redirect URIs are needed.
5. Copy the **Client ID** (ends in `.apps.googleusercontent.com`).
   It is not a secret; it identifies the app.

## Step 2 — Set the Netlify environment variables

Netlify → Site configuration → Environment variables. Add:

```text
GOOGLE_CLIENT_ID=the Client ID from Step 1
ALLOWED_EMAILS=security@pembrokehill.org,lead-email@pembrokehill.org
```

Use the real shared-officer and lead addresses, comma-separated, no spaces
needed. Optional:

```text
AUTH_SESSION_DAYS=7        # days signed in per device (default 7, max 30)
AUTH_SESSION_SECRET=a long random string
```

Set these BEFORE deploying the new code. The API fails closed: if
`GOOGLE_CLIENT_ID` or `ALLOWED_EMAILS` is missing, nobody can load data.

## Step 3 — Deploy

Upload this build to GitHub as usual. Netlify redeploys automatically.
No Apps Script changes are required for sign-in.

## Step 4 — Test

- [ ] Site loads to a sign-in screen; no data visible behind it.
- [ ] An allowlisted account signs in and the hub loads.
- [ ] A non-allowlisted Google account gets "not authorized."
- [ ] Sign out (bottom of the side menu / More sheet) returns to the sign-in
      screen.
- [ ] Supervisor PIN still works after signing in.
- [ ] Open the site in a private/incognito window: sign-in required again
      (sessions are per browser).

## Managing access later

- **Add someone:** append their email to `ALLOWED_EMAILS` in Netlify → save →
  redeploy the site (Deploys → Trigger deploy). Takes about a minute.
- **Remove someone:** delete their email from `ALLOWED_EMAILS` and redeploy.
  The allowlist is re-checked on every request, so they are locked out
  immediately — no waiting for their session to expire.
- **Panic button:** change `AUTH_SESSION_SECRET` (or set it if unset) and
  redeploy. Every device is signed out at once.

## Notes

- Sessions last `AUTH_SESSION_DAYS` per device, so officers are not signing
  in every shift. On a shared kiosk, use Sign out at end of shift if desired.
- The Client ID is safe to expose; the allowlist and session secret live only
  in Netlify environment variables.
- This gate protects the API (all hub data). The static shell (logo, empty
  layout) is still technically public, which is fine — it contains no records.
- Google Drive attachments are shared through Drive permissions, not through
  this sign-in. Keep the uploads folder restricted to approved accounts.
