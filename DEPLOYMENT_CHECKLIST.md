# 🚀 PHS Event Operations Hub - Deployment Checklist

**Follow this checklist to deploy the system step-by-step.**

---

## ✅ Pre-Deployment (Already Done)

- [x] Database schema designed
- [x] React frontend built
- [x] Supabase backend configured
- [x] Arbiter scraper implemented
- [x] GitHub Actions workflow created
- [x] Complete documentation written

---

## 📋 Deployment Steps (Follow in Order)

### Step 1: Supabase Setup (20 mins)
- [ ] Create Supabase project
- [ ] Apply schema (copy `database/schema/01_init.sql` to SQL editor)
- [ ] Create test users (admin, kcpd, security)
- [ ] Set user roles
- [ ] Note API keys and service key
- **Guide:** See `docs/SUPABASE_SETUP.md`

### Step 2: GitHub Repository (10 mins)
- [ ] Create GitHub repo
- [ ] Push code to main branch
- [ ] Verify all files are there
- **Command:**
  ```bash
  git clone https://github.com/YOUR_USERNAME/phs-event-ops-hub.git
  cd phs-event-ops-hub
  git add .
  git commit -m "Initial commit"
  git push
  ```

### Step 3: GitHub Actions Secrets (5 mins)
- [ ] Go to repo → Settings → Secrets and variables → Actions
- [ ] Create `SUPABASE_URL` secret
- [ ] Create `SUPABASE_SERVICE_KEY` secret
- [ ] Test workflow manually (should complete without errors)

### Step 4: Vercel Deployment (15 mins)
- [ ] Connect GitHub account to Vercel
- [ ] Create project from repo
- [ ] Framework: React
- [ ] Root Directory: `frontend`
- [ ] Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy
- [ ] Copy deployment URL
- **Result:** Your frontend is live at `.vercel.app` domain

### Step 5: Update Supabase Auth URLs (5 mins)
- [ ] Go to Supabase → Authentication → URL Configuration
- [ ] Add your Vercel production URL
- [ ] Save

### Step 6: Test Everything (30 mins)
- [ ] Visit Vercel URL in browser
- [ ] Login with test user
- [ ] See empty dashboard (no errors)
- [ ] Trigger GitHub Actions workflow manually
- [ ] Wait 30 seconds for completion
- [ ] Refresh browser
- [ ] See games in Events section
- **Troubleshooting:** See `docs/DEPLOYMENT_GUIDE.md`

### Step 7: Invite Real Users (15 mins)
- [ ] Go to Supabase → Authentication → Users
- [ ] Create actual user accounts:
  - KCPD Scheduler email
  - Security Lead email
  - Additional admins if needed
- [ ] Send login credentials securely
- [ ] Each user changes password on first login

### Step 8: Configure Event Sources (10 mins)
- [ ] Go to Supabase → Table Editor → event_sources
- [ ] Verify "PHS Athletics (Arbiter)" is enabled
- [ ] Add any other Google Calendars if needed
- [ ] Set `import_enabled = true` for each source

---

## 🎯 Post-Deployment (Ongoing)

- [ ] GitHub Actions runs every 15 minutes (automatic)
- [ ] Monitor Actions tab for errors
- [ ] Users can log in and see dashboard
- [ ] Events update automatically
- [ ] Train users on staffing workflow

---

## 📞 Support

**If something breaks:**
1. Check `docs/DEPLOYMENT_GUIDE.md` troubleshooting section
2. Check GitHub Actions logs for scraper errors
3. Check Supabase for data integrity
4. Check browser console for frontend errors

---

## 📊 Monitoring

| Component | Monitoring |
|-----------|-----------|
| Arbiter Scraper | GitHub Actions runs every 15 min |
| Frontend | Vercel Analytics (see build logs) |
| Database | Supabase dashboard (check connections) |
| Authentication | Supabase Auth logs |
| Real-time data | Supabase replication monitor |

---

## 🎉 Done!

System is production-ready and live. Users can now:
- View all events (athletics + others)
- Request coverage
- Assign staff
- Track workflow status
- See real-time KPIs on dashboard

