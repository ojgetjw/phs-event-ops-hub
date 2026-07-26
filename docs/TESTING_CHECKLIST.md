# Testing Checklist

## Unit Tests

- [ ] Database schema validates (can create tables)
- [ ] RLS policies work (users can't see other roles' data)
- [ ] Event source configs store correctly
- [ ] Arbiter scraper parses dates correctly
- [ ] Supabase auth creates users correctly

## Integration Tests

- [ ] User can log in with email/password
- [ ] User sees only appropriate data for their role
- [ ] Events sync from Arbiter without errors
- [ ] Coverage requests calculate open_slots correctly
- [ ] Assignments link to coverage requests properly

## System Tests

- [ ] Full workflow: Manual event → Coverage request → Assignment → Operationally Ready
- [ ] Dashboard shows correct KPI counts
- [ ] Arbiter sync runs every 15 mins automatically
- [ ] Real-time updates work (open assignment → see it update on dashboard)
- [ ] Soft delete workflow (mark event as Cancelled, data preserved)

## Performance

- [ ] Dashboard loads in < 2 seconds
- [ ] Events table responsive with 500+ rows
- [ ] Supabase queries complete < 500ms
- [ ] Arbiter scraper completes < 30 seconds

## Security

- [ ] Can't bypass login
- [ ] Can't see other users' emails
- [ ] Can't modify data without proper role
- [ ] Audit log records all changes
- [ ] API keys not exposed in frontend code

