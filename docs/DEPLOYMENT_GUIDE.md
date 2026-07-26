# PHS Event Operations Hub - Deployment Guide

**Complete end-to-end deployment to production.**

## Prerequisites

- GitHub account (free)
- Vercel account (free, linked to GitHub)
- Supabase account (free)

## Phase 1: Supabase Setup (15 mins)

Follow `docs/SUPABASE_SETUP.md` completely.

**Verify:** You have noted these values:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` (for GitHub Actions)

## Phase 2: GitHub Repository (5 mins)

1. Create new GitHub repository:
   - Name: `phs-event-ops-hub`
   - Private or Public (up to you)
   - Initialize with README (no)

2. Clone and push this code:
   ```bash
   git clone https://github.com/YOUR_USERNAME/phs-event-ops-hub.git
   cd phs-event-ops-hub
   # Copy all files from this project
   git add .
   git commit -m "Initial commit: Event Operations Hub"
   git push -u origin main
   ```

## Phase 3: GitHub Actions Secrets (5 mins)

GitHub Actions will run the Arbiter scraper automatically every 15 minutes.

1. Go to GitHub repo → **Settings → Secrets and variables → Actions**
2. Create these secrets:
   - `SUPABASE_URL` (from Phase 1)
   - `SUPABASE_SERVICE_KEY` (from Phase 1)

3. Test: Go to **Actions** tab, click **"Sync Arbiter Live Games"**, click **"Run workflow"**
4. Should complete in ~30 seconds

## Phase 4: Vercel Deployment (10 mins)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New" → "Project"**
3. Select your GitHub repo
4. **Framework**: React
5. **Root Directory**: `frontend`
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`

8. Environment Variables - Add these:
   - `VITE_SUPABASE_URL` = (from Phase 1)
   - `VITE_SUPABASE_ANON_KEY` = (from Phase 1)

9. Click **"Deploy"**
10. Wait 2-3 mins for deployment

**Your site is now live!** Copy the `.vercel.app` URL

## Phase 5: Update Supabase Auth URLs (5 mins)

1. Go back to Supabase → **Authentication → URL Configuration**
2. Add your Vercel production URL:
   - `https://your-project.vercel.app`

## Phase 6: Manual Testing (20 mins)

1. **Test Login:**
   - Go to your Vercel URL
   - Login with test user from Phase 1
   - Should see empty dashboard

2. **Test Arbiter Sync:**
   - Go to GitHub → **Actions**
   - Click **"Sync Arbiter Live Games"**
   - Click **"Run workflow"**
   - Wait for completion
   - Go back to your Vercel site
   - Refresh browser
   - Should see games populated in Events section

3. **Test Coverage Requests:**
   - Click **"Coverage Requests"** tab
   - Should see entries for each game

## Phase 7: Live Monitoring (ongoing)

1. **GitHub Actions** runs every 15 minutes automatically
2. Monitor runs in **Actions** tab
3. If a run fails, check logs for errors
4. Common issues:
   - Supabase service key wrong → Check secrets
   - Arbiter site structure changed → Update parser
   - Network timeout → Usually temporary, will retry

## Troubleshooting

### "Cannot connect to Supabase"
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel env vars
- Check Supabase project is active (not paused)

### "No games appearing"
- Check GitHub Actions ran successfully
- Go to Supabase → Table Editor → events
- Should have rows with `source='arbiter_live'`
- If empty, check GitHub Actions logs

### "Login not working"
- Check URL Configuration in Supabase Auth includes your Vercel URL
- Clear browser cache and try again

### "RLS permission errors"
- Verify user role is set in users table
- Check RLS policies are applied (should be from 01_init.sql)

## Cost

- **Supabase Free:** Up to 500K requests/month ✅ (plenty)
- **Vercel Free:** Unlimited deployments ✅
- **GitHub Actions Free:** 2,000 minutes/month ✅ (this uses ~30/month)
- **Total: $0/month**

## Next Steps (After Deployment)

1. **Invite actual users:** Send login credentials to KCPD scheduler, security lead
2. **Configure event sources:** Add other Google Calendars if needed
3. **Test staffing workflow:** Create test events, request coverage, assign staff
4. **Train users:** Walkthroughs for different roles

