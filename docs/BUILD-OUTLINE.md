# PHS Security Hub build and maintenance outline

## Design goals

1. Put the most actionable information first.
2. Keep routine officer entries fast.
3. Keep formal incident reporting clearly separate.
4. Use red only for priority, incident, and approval attention states.
5. Maintain readable contrast and do not rely on color alone.
6. Keep mobile actions reachable with the bottom navigation.
7. Protect supervisor actions on the server, not only in the interface.

## Application shell

- `public/index.html`
  - App header
  - Desktop side navigation
  - Mobile bottom navigation
  - Accessible skip link
  - Shared SVG icon sprite
  - Main render target

- `public/js/main.js`
  - Route registration
  - Clock
  - Theme control
  - Refresh cycle
  - Backend connection indicator
  - Mobile More menu

- `public/js/router.js`
  - Hash routing
  - Active navigation state

- `public/js/store.js`
  - Shared metadata and dashboard data
  - Loading/error states
  - Refresh timestamps

## Page modules

- `pages/overview.js`
  - Campus image hero
  - KPI cards
  - Quick actions
  - Current activity widgets

- `pages/incidents.js`
  - Daily Activity workflow
  - Incident Report workflow
  - Actual occurrence date/time
  - Dynamic People Involved section
  - Attachments
  - Report guidance panel

- `pages/keys.js`
  - Checkout and return workflows
  - Outstanding item search/filter

- `pages/passdown.js`
  - Shift continuity notes
  - Flagged entries

- `pages/bolos.js`
  - Active advisory posting
  - Attachments
  - Resolution workflow

- `pages/supervisor.js`
  - PIN lock screen
  - Pending approvals
  - Urgent/high-priority reports
  - Flagged pass-downs
  - Open reports
  - Outstanding checkouts

- `pages/resources.js`
  - Embedded Gates & Fences site
  - Reference categories
  - Officer reminders

## Styling

- `tokens.css`
  - Brand colors
  - Light/dark theme tokens
  - Typography
  - Spacing
  - Radius and shadow tokens

- `base.css`
  - Global reset
  - Typography
  - Focus states
  - Shared SVG icon behavior

- `layout.css`
  - Header
  - Sidebar
  - Page layout
  - Overview hero
  - Responsive grids
  - Mobile navigation

- `components.css`
  - Buttons
  - Cards
  - Forms
  - Status chips
  - Report workflow cards
  - People Involved cards
  - Tables
  - Supervisor states
  - Embedded resources

## Backend responsibilities

### Netlify Functions

- `/api/metadata`
  - Loads and normalizes form options.
  - Returns safe fallbacks when Apps Script metadata is unavailable.

- `/api/hub-data`
  - Loads overview and supervisor dashboard data.
  - Keeps the Apps Script URL and token out of the browser.

- `/api/submit`
  - Allows only whitelisted actions.
  - Adds the Apps Script token server-side.
  - Verifies the supervisor PIN.
  - Issues signed, expiring supervisor sessions.
  - Requires a valid supervisor session for report status changes.

### Google Apps Script

- Creates and repairs sheet headers.
- Generates DA, IR, KC, and B.O.L.O. identifiers.
- Validates required fields.
- Stores People Involved as JSON in one report cell.
- Stores attachment references.
- Returns dashboard data.
- Updates report approval state.

## Future hardening path

The recommended future authentication model is school Google account sign-in plus a role table:

```text
Name | Email | Role | Active
```

Suggested roles:

```text
Officer
Supervisor
Administrator
```

That model would provide individual accountability and remove shared-PIN risk while keeping the current role-aware interface.
