# PHS Event Operations Hub - Data Model

## Core Tables

### users
Stores user accounts with role-based access control.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| email | TEXT | Login email |
| full_name | TEXT | Display name |
| role | ENUM | Admin, KCPD Scheduler, Security Lead, Viewer |
| active | BOOLEAN | Account status |
| created_at | TIMESTAMP | Account creation |

**Roles:**
- **Admin:** Full system access, user management, audit logs
- **KCPD Scheduler:** See all events, manage KCPD coverage requests and assignments
- **Security Lead:** See all events, manage contract security coverage and assignments
- **Viewer:** Read-only access to dashboard

---

### events
Master event registry. All events (athletics, academics, community) funnel here.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| event_id | TEXT | External ID (unique identifier from source) |
| title | TEXT | Event name |
| description | TEXT | Details |
| category | TEXT | Type (Athletics, Community, etc.) |
| campus | TEXT | Upper, Lower, or other |
| venue | TEXT | Location/stadium name |
| event_date | DATE | When it happens |
| start_time | TIME | Start time |
| end_time | TIME | End time |
| expected_attendance | INTEGER | Projected headcount |
| source | ENUM | Where it came from (arbiter_live, google_calendar, manual, other) |
| workflow_status | ENUM | Current stage in workflow (see Workflow section) |
| kcpd_needed | INTEGER | How many KCPD officers needed |
| contract_security_needed | INTEGER | How many security staff needed |
| estimated_cost | DECIMAL | Projected cost for staffing |

**Workflow Status:**
```
Imported → Needs Review → Coverage Determined → Coverage Requested
  ↓                                                    ↓
  Cancelled (can happen anytime)          Partially Assigned → Fully Assigned
                                                                 ↓
                                          Operationally Ready → Completed → Closed
```

---

### coverage_requests
Specific staffing requests for an event (one per provider per event).

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| event_id | UUID | Link to event |
| provider | ENUM | KCPD or Contract Security |
| officers_required | INTEGER | How many needed |
| assigned_count | INTEGER | How many assigned |
| open_slots | INTEGER | Calculated (required - assigned) |
| shift_start | TIME | When coverage starts |
| shift_end | TIME | When coverage ends |
| request_status | ENUM | Open, Partial, Full, Confirmed |

**One coverage_request per event per provider.** If event needs 5 KCPD + 3 security, there are 2 rows.

---

### assignments
Individual person assigned to a coverage request.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| coverage_request_id | UUID | Which coverage request |
| event_id | UUID | Which event |
| person_name | TEXT | Officer/staff name |
| person_id | TEXT | Badge number or ID |
| provider | ENUM | KCPD or Contract Security |
| shift_start | TIME | Their shift start |
| shift_end | TIME | Their shift end |
| assignment_status | ENUM | Proposed, Confirmed, Completed, Cancelled |

**Granular control:** Each person assigned to each coverage request gets a row.

---

### event_sources
Configuration for where events come from.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| name | TEXT | "PHS Athletics", "PHS Primary Calendar", etc. |
| source_type | ENUM | arbiter_live, google_calendar, manual, other |
| import_enabled | BOOLEAN | Is this source active? |
| config | JSONB | API keys, calendar IDs, etc. (encrypted) |
| last_sync | TIMESTAMP | When we last fetched from this source |

---

### audit_log
Every change to events, coverage, assignments is logged.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| table_name | TEXT | Which table changed |
| record_id | UUID | Which record |
| action | TEXT | INSERT, UPDATE, DELETE |
| changes | JSONB | Before/after values |
| changed_by | UUID | Who made the change |
| changed_at | TIMESTAMP | When |

**For compliance and debugging.** Never delete, only archive.

---

## Relationships

```
users (1) ──→ (many) events (created_by)
users (1) ──→ (many) assignments (assigned_by)
users (1) ──→ (many) audit_log (changed_by)

event_sources (1) ──→ (many) events (source)

events (1) ──→ (many) coverage_requests
events (1) ──→ (many) assignments

coverage_requests (1) ──→ (many) assignments
```

---

## Key Queries

### Get all upcoming events needing coverage
```sql
SELECT e.*, 
  COUNT(CASE WHEN cr.provider='KCPD' THEN 1 END) as kcpd_requests,
  COUNT(CASE WHEN cr.provider='Contract Security' THEN 1 END) as security_requests
FROM events e
LEFT JOIN coverage_requests cr ON e.id = cr.event_id
WHERE e.event_date >= CURRENT_DATE 
  AND e.workflow_status NOT IN ('Cancelled', 'Closed')
GROUP BY e.id
ORDER BY e.event_date;
```

### Get open slots by provider
```sql
SELECT cr.provider, COUNT(*) as open_count, SUM(cr.open_slots) as total_slots
FROM coverage_requests cr
WHERE cr.request_status IN ('Open', 'Partial')
GROUP BY cr.provider;
```

### Get event readiness status
```sql
SELECT 
  COUNT(CASE WHEN workflow_status = 'Operationally Ready' THEN 1 END) as ready,
  COUNT(CASE WHEN workflow_status = 'Partially Assigned' THEN 1 END) as partial,
  COUNT(CASE WHEN workflow_status IN ('Needs Review', 'Coverage Determined') THEN 1 END) as needs_work
FROM events
WHERE event_date >= CURRENT_DATE AND workflow_status NOT IN ('Cancelled', 'Closed');
```

---

## Security

- **Row Level Security (RLS):** Enabled on all tables
- **Role-based access:** Admins see everything, schedulers see their specific coverage requests
- **Audit trail:** All changes logged
- **No cascading deletes on purpose:** Soft deletes only (mark as Cancelled)

