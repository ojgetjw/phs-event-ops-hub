# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Sign up" (free tier is fine)
3. Create a new project:
   - Name: `phs-event-ops-hub`
   - Database password: Save securely
   - Region: `us-west-1` or closest to you
4. Wait for database to initialize (~2-3 mins)

## Step 2: Apply Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy-paste the entire content of `database/schema/01_init.sql`
4. Click **Run**
5. Verify: Go to **Table Editor** and confirm all tables exist

## Step 3: Set Up Authentication

Supabase Auth is pre-configured, but customize settings:

1. Go to **Authentication → Providers**
2. Email provider is enabled by default
3. Go to **Authentication → URL Configuration**
4. Add your frontend URL:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.vercel.app`
5. Go to **Authentication → Email Templates**
6. Customize if desired

## Step 4: Create Initial Users

1. Go to **Authentication → Users**
2. Click **Add user**
3. Create users:
   - KCPD Scheduler: `kcpd@pembrokehll.example.com`
   - Security Lead: `security@pembrokehll.example.com`
   - Admin: `admin@pembrokehll.example.com`
4. Set temporary password for each

## Step 5: Assign User Roles

1. Go to **SQL Editor**
2. Run this query for each user:

```sql
UPDATE users SET role = 'kcpd_scheduler' 
WHERE email = 'kcpd@pembrokehll.example.com';

UPDATE users SET role = 'security_lead' 
WHERE email = 'security@pembrokehll.example.com';

UPDATE users SET role = 'admin' 
WHERE email = 'admin@pembrokehll.example.com';
```

## Step 6: Get API Keys

1. Go to **Project Settings → API**
2. Copy:
   - **Project URL** (as `VITE_SUPABASE_URL`)
   - **Anon Public Key** (as `VITE_SUPABASE_ANON_KEY`)
3. Create `.env.local` in frontend dir with these values

## Step 7: Set Up Event Sources

1. Go to **Table Editor → event_sources**
2. Create rows:

```
name: "PHS Primary Calendar"
source_type: "google_calendar"
import_enabled: false
config: {"calendar_id": "primary", "readonly": true}
last_sync: null

name: "PHS Athletics (Arbiter)"
source_type: "arbiter_live"
import_enabled: true
config: {"school_id": "17783", "scrape_interval_minutes": 15}
last_sync: null
```

## Step 8: Create Stored Functions (Optional, for Advanced)

For real-time updates and complex queries:

1. Go to **SQL Editor**
2. Create function for dashboard stats:

```sql
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  upcoming_events bigint,
  needs_review bigint,
  open_slots bigint
) AS $$
BEGIN
  RETURN QUERY SELECT
    COUNT(*) FILTER (WHERE event_date >= CURRENT_DATE) as upcoming_events,
    COUNT(*) FILTER (WHERE workflow_status = 'Needs Review') as needs_review,
    SUM(open_slots) as open_slots
  FROM events e
  LEFT JOIN coverage_requests cr ON e.id = cr.event_id
  WHERE e.workflow_status NOT IN ('Cancelled', 'Closed');
END;
$$ LANGUAGE plpgsql;
```

## Step 9: Test Connection

1. In frontend `.env.local`, verify vars are set
2. Run: `npm run dev`
3. You should see login page
4. Login with test user credentials
5. Should see empty dashboard

## Troubleshooting

**"CORS error"**
- Check URL Configuration in Auth settings matches frontend URL

**"Permission denied" when loading data**
- Verify RLS policies in SQL Editor
- Check user role is set correctly in users table

**"Cannot connect to database"**
- Verify API keys are correct
- Check network connectivity

