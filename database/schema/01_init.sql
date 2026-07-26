-- PHS Event Operations Hub - Complete Schema

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'kcpd_scheduler', 'security_lead', 'viewer');
CREATE TYPE event_status AS ENUM ('Imported', 'Needs Review', 'Coverage Determined', 'Coverage Requested', 'Partially Assigned', 'Fully Assigned', 'Operationally Ready', 'Completed', 'Cancelled', 'Closed');
CREATE TYPE event_source AS ENUM ('arbiter_live', 'google_calendar', 'manual', 'other');
CREATE TYPE coverage_provider AS ENUM ('KCPD', 'Contract Security');
CREATE TYPE coverage_status AS ENUM ('Open', 'Partial', 'Full', 'Confirmed');
CREATE TYPE assignment_status AS ENUM ('Proposed', 'Confirmed', 'Completed', 'Cancelled');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event sources (where events come from)
CREATE TABLE event_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  source_type event_source NOT NULL,
  import_enabled BOOLEAN DEFAULT FALSE,
  config JSONB DEFAULT '{}', -- For API keys, calendar IDs, etc.
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events (master event registry)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL, -- External ID for deduplication
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., "Athletics", "Academics", "Community"
  department TEXT,
  campus TEXT, -- e.g., "Upper", "Lower"
  venue TEXT, -- e.g., "Stadium - Hicks Field", "Gymnasium"
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  expected_attendance INTEGER,
  notes TEXT,
  
  -- Security/staffing
  kcpd_needed INTEGER DEFAULT 0,
  contract_security_needed INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10,2),
  
  -- Source tracking
  source event_source NOT NULL,
  source_id TEXT, -- External ID from source
  
  -- Workflow
  workflow_status event_status NOT NULL DEFAULT 'Imported',
  last_status_change TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  INDEX idx_event_date (event_date),
  INDEX idx_source (source),
  INDEX idx_status (workflow_status)
);

-- Coverage requests (what's needed for an event)
CREATE TABLE coverage_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  provider coverage_provider NOT NULL,
  officers_required INTEGER NOT NULL,
  assigned_count INTEGER DEFAULT 0,
  open_slots INTEGER GENERATED ALWAYS AS (officers_required - COALESCE(assigned_count, 0)) STORED,
  shift_start TIME,
  shift_end TIME,
  request_status coverage_status NOT NULL DEFAULT 'Open',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, provider),
  INDEX idx_status (request_status),
  INDEX idx_event (event_id)
);

-- Assignments (individual person to event)
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coverage_request_id UUID NOT NULL REFERENCES coverage_requests(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  person_id TEXT, -- Badge number, officer ID, etc.
  provider coverage_provider NOT NULL,
  shift_start TIME,
  shift_end TIME,
  assignment_status assignment_status NOT NULL DEFAULT 'Proposed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  
  INDEX idx_coverage_request (coverage_request_id),
  INDEX idx_event (event_id),
  INDEX idx_status (assignment_status)
);

-- Audit log (track all changes)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  changes JSONB, -- What changed
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_table_record (table_name, record_id),
  INDEX idx_timestamp (changed_at)
);

-- Row-level security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own record
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Admins see everything
CREATE POLICY "Admins see all events" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
  );

-- KCPD/Security see all events
CREATE POLICY "Schedulers see all events" ON events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('kcpd_scheduler', 'security_lead', 'admin'))
  );

-- Similar for coverage_requests and assignments
CREATE POLICY "Users see all coverage requests" ON coverage_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('admin', 'kcpd_scheduler', 'security_lead'))
  );

CREATE POLICY "Users see all assignments" ON assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('admin', 'kcpd_scheduler', 'security_lead'))
  );

-- Audit log (readable by admins only)
CREATE POLICY "Admins read audit log" ON audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
  );

