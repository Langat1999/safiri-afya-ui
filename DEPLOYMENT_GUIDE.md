# 🚀 Supabase + Vercel Deployment Guide

Complete guide to deploy **Safiri Afya** using **Supabase** for both database and backend hosting.

---

## 📋 Architecture

- **Database:** Supabase PostgreSQL (500MB free tier)
- **Backend API:** Vercel Serverless Functions (100GB bandwidth free)
- **Frontend:** Netlify (100GB bandwidth free)

**Total Cost:** **FREE** for small-medium traffic! 🎉

---

## Part 1: Supabase Database Setup (5 min)

### Step 1: Create Supabase Project

1. Go to https://supabase.com/
2. Click **"Start your project"** → Sign in with GitHub
3. Click **"New Project"**
4. Configure:
   - **Organization:** Create new or select existing
   - **Name:** `safiri-afya`
   - **Database Password:** Generate strong password (**SAVE THIS!**)
   - **Region:** `Southeast Asia (Singapore)` (closest to Kenya)
   - **Pricing Plan:** Free
5. Click **"Create new project"** (wait ~2 minutes)

### Step 2: Get Database Connection Strings

1. Once project is ready, go to **Project Settings** (gear icon)
2. Click **Database** in the sidebar
3. Scroll to **Connection string** section
4. You need **TWO** connection strings:

#### A. Session Pooler (Runtime - Port 6543)
- Select **"Session"** mode in the Connection string dropdown
- Click **"URI"** tab
- Copy the connection string (looks like):
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```
- **Important:** Add `?pgbouncer=true` at the end:
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
- **Save this as:** `DATABASE_URL`

#### B. Transaction Pooler (Migrations - Port 5432)
- Select **"Transaction"** mode
- Click **"URI"** tab
- Copy the connection string:
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```
- **Save this as:** `DIRECT_URL`

**Replace `[YOUR-PASSWORD]` with your actual database password!**

### Step 3: Enable Database Extensions

1. In Supabase Dashboard, go to **Database** → **Extensions**
2. Enable these extensions (search and click toggle):
   - ✅ **uuid-ossp** - UUID generation
   - ✅ **pgcrypto** - Cryptographic functions

### Step 4: Test Database Connection (Optional)

```bash
# Add to backend/.env (temporary, for testing)
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Run migrations
cd backend
npx prisma migrate deploy

# Expected output: "All migrations have been successfully applied."
```

---

## Part 2: Vercel Backend Deployment (10 min)

### Step 1: Prepare Vercel Account

1. Go to https://vercel.com/
2. Click **"Sign Up"** → **Continue with GitHub**
3. Authorize Vercel to access your GitHub repos
4. Complete account setup (no credit card required for free tier!)

### Step 2: Deploy Backend to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select `Langat1999/safiri-afya-ui`
4. Configure project:
   - **Framework Preset:** Other
   - **Root Directory:** Leave as `./` (vercel.json handles routing)
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

5. Click **"Deploy"** (will fail - we need environment variables first)

#### Option B: Using Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 3: Add Environment Variables

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add these variables (click **"Add"** for each):

#### Required Variables

```bash
# Database (from Supabase Step 2)
DATABASE_URL
Value: postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL
Value: postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# Server
NODE_ENV
Value: production

PORT
Value: 3001

# JWT (generate 64+ character random string)
JWT_SECRET
Value: your-super-secret-jwt-key-minimum-64-characters-long-use-random-generator

# M-Pesa (from Safaricom Developer Portal)
MPESA_CONSUMER_KEY
Value: your_consumer_key_from_safaricom

MPESA_CONSUMER_SECRET
Value: your_consumer_secret_from_safaricom

MPESA_SHORTCODE
Value: 174379

MPESA_PASSKEY
Value: your_passkey_from_safaricom

MPESA_ENVIRONMENT
Value: sandbox

MPESA_CALLBACK_URL
Value: https://YOUR-VERCEL-DOMAIN.vercel.app/api/payments/mpesa/callback

MPESA_RESULT_URL
Value: https://YOUR-VERCEL-DOMAIN.vercel.app/api/payments/mpesa/result

# CORS (your Netlify frontend URL)
ALLOWED_ORIGINS
Value: https://your-netlify-site.netlify.app,http://localhost:5173
```

#### Optional Variables (Recommended)

```bash
# Email Service (SendGrid)
SENDGRID_API_KEY
Value: your_sendgrid_api_key

FROM_EMAIL
Value: noreply@safiriafya.com

# AI Symptom Checker
OPENROUTER_API_KEY
Value: sk-or-v1-your-openrouter-key

# Health News
GUARDIAN_API_KEY
Value: your_guardian_api_key

# Revenue Split
DEVELOPER_MPESA_NUMBER
Value: 254XXXXXXXXX

DEVELOPER_COMMISSION_PERCENTAGE
Value: 15

# Frontend URL
APP_URL
Value: https://your-netlify-site.netlify.app
```

3. Select **Production**, **Preview**, and **Development** for each variable
4. Click **"Save"**

### Step 4: Get Vercel Domain & Update Callbacks

1. Go to **Settings** → **Domains**
2. Your default domain: `your-project-name.vercel.app`
3. Copy this domain
4. **Update these environment variables** with your Vercel domain:
   - `MPESA_CALLBACK_URL`: `https://YOUR-DOMAIN.vercel.app/api/payments/mpesa/callback`
   - `MPESA_RESULT_URL`: `https://YOUR-DOMAIN.vercel.app/api/payments/mpesa/result`

### Step 5: Redeploy with Environment Variables

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Check **"Use existing Build Cache"** → Click **"Redeploy"**
4. Wait for deployment to complete (~2-3 minutes)

---

## Part 3: Run Database Migrations & Seed (5 min)

### Option A: Local Seeding (Recommended)

```bash
# In your local terminal
cd backend

# Set Supabase connection (temporary)
export DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Or on Windows:
set DIRECT_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# Run migrations
npx prisma migrate deploy

# Seed database
DIRECT_URL="your-supabase-direct-url" npm run seed
```

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Link to your project
vercel link

# Run seed command
vercel env pull .env.production
cd backend
npm run seed
```

### Verify Seed Data

Seed script adds:
- ✅ **8 Nairobi clinics** (Aga Khan, Kenyatta, Mater, Nairobi Women's Hospital, etc.)
- ✅ **10 doctors** (GP, Pediatrics, Cardiology, Dermatology, etc.)
- ✅ **1 admin user:**
  - Email: `admin@safiriafya.com`
  - Password: `Admin@123456`

---

## Part 4: Update Frontend (2 min)

### Update Netlify Environment Variables

1. Go to Netlify → Your site → **Site configuration** → **Environment variables**
2. Update or add:
```bash
VITE_API_URL
Value: https://YOUR-VERCEL-DOMAIN.vercel.app/api
```
3. Click **"Save"**
4. Go to **Deploys** → **"Trigger deploy"** → **"Clear cache and deploy"**

---

## ✅ Verify Deployment

### 1. Test Backend Health

```bash
curl https://YOUR-VERCEL-DOMAIN.vercel.app/api/health
```
**Expected:**
```json
{"status":"healthy"}
```

### 2. Test Database Connection

```bash
curl https://YOUR-VERCEL-DOMAIN.vercel.app/api/clinics
```
**Expected:** Array of 8 clinics with details

### 3. Test Frontend

1. Open your Netlify site: `https://your-site.netlify.app`
2. Try these features:
   - ✅ View clinics on map
   - ✅ AI symptom checker
   - ✅ Register new account
   - ✅ Login with admin: `admin@safiriafya.com` / `Admin@123456`
   - ✅ Book appointment
   - ✅ Admin dashboard (if logged in as admin)

---

## 📊 Cost Breakdown

| Service | Free Tier | Monthly Limit | Upgrade Cost |
|---------|-----------|---------------|--------------|
| **Supabase** | 500MB DB, 2GB bandwidth | Unlimited API requests | $25/month (Pro) |
| **Vercel** | 100GB bandwidth, 100 serverless invocations/day | 6000 build minutes | $20/month (Pro) |
| **Netlify** | 100GB bandwidth, 300 build minutes | Unlimited sites | Free for most use cases |
| **Total** | **FREE** | Sufficient for 10,000+ monthly users | **~$45/month** at scale |

**Free tier is enough for:**
- 10,000-50,000 monthly users
- 1M+ API requests/month
- 500MB database storage (~100,000 records)

---

## 🔧 Troubleshooting

### Issue 1: "FUNCTION_INVOCATION_FAILED"
**Cause:** Environment variables not set correctly
**Solution:**
- Verify all variables in Vercel → Settings → Environment Variables
- Ensure `DATABASE_URL` and `DIRECT_URL` are correct
- Redeploy after adding variables

### Issue 2: "Prisma Client not found"
**Cause:** Build didn't generate Prisma Client
**Solution:**
- Check `vercel.json` has correct build path
- Ensure `npm run build` runs `prisma generate`
- Check Vercel build logs for errors

### Issue 3: "connect ECONNREFUSED" (Database)
**Cause:** Wrong connection string or IP blocked
**Solution:**
- Verify connection strings from Supabase dashboard
- Check Supabase → Settings → Database → **Connection Pooling** is enabled
- Ensure password is correct and URL-encoded (special chars need encoding)

### Issue 4: CORS errors on frontend
**Cause:** Frontend URL not in `ALLOWED_ORIGINS`
**Solution:**
- Add Netlify URL to `ALLOWED_ORIGINS` in Vercel env vars
- Format: `https://your-site.netlify.app,http://localhost:5173`
- Redeploy Vercel backend

### Issue 5: M-Pesa callback not working
**Cause:** Callback URL incorrect or not accessible
**Solution:**
- Verify `MPESA_CALLBACK_URL` points to Vercel domain
- Test endpoint: `curl https://YOUR-DOMAIN.vercel.app/api/payments/mpesa/callback`
- Check Safaricom Developer Portal → C2B → Register URLs

### Issue 6: Serverless function timeout (10s limit)
**Cause:** Vercel free tier has 10s timeout
**Solution:**
- Upgrade to Vercel Pro ($20/month) for 60s timeout
- Or optimize slow queries/operations
- Or move long-running tasks to background jobs

---

## 🎯 Advanced Configuration

### Custom Domain (Optional)

#### For Backend (Vercel):
1. Vercel → Settings → Domains → **Add Domain**
2. Add: `api.yourdomain.com`
3. Configure DNS:
   - Type: `CNAME`
   - Name: `api`
   - Value: `cname.vercel-dns.com`
4. Update `MPESA_CALLBACK_URL` and frontend `VITE_API_URL`

#### For Frontend (Netlify):
1. Netlify → Domain settings → **Add custom domain**
2. Add: `yourdomain.com`
3. Configure DNS (follow Netlify instructions)
4. Enable HTTPS (automatic with Netlify)

### Database Backups

**Supabase Free Tier:** No automatic backups

**Manual Backup:**
```bash
# Export database
pg_dump "postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" > backup.sql

# Restore database
psql "postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" < backup.sql
```

**Automated Backups:** Upgrade to Supabase Pro ($25/month)

### Monitoring & Logs

**Vercel:**
- Dashboard → Deployments → Click deployment → **Runtime Logs**
- Real-time function invocation logs
- Error tracking and performance metrics

**Supabase:**
- Dashboard → Database → **Logs**
- Query performance
- Connection pool status

**Recommended Tools (Free tiers):**
- **Sentry** (error tracking): 5,000 events/month free
- **LogRocket** (session replay): 1,000 sessions/month free
- **Better Uptime** (uptime monitoring): 1 monitor free

### Production Checklist

Before going live:

- [ ] Switch M-Pesa from sandbox to production
- [ ] Enable HTTPS on all domains
- [ ] Set up error tracking (Sentry)
- [ ] Configure database backups
- [ ] Test payment flow end-to-end
- [ ] Set up uptime monitoring
- [ ] Review and secure environment variables
- [ ] Test on mobile devices
- [ ] Configure SendGrid email templates
- [ ] Set up Google Analytics (optional)

---

## 🔄 CI/CD (Auto-Deploy on Git Push)

Both Vercel and Netlify auto-deploy when you push to GitHub:

**Backend (Vercel):**
- Push to `main` branch → Auto-deploys to production
- Push to other branches → Creates preview deployments
- Configure: Vercel → Settings → Git → Production Branch

**Frontend (Netlify):**
- Push to `main` → Auto-deploys to production
- Pull requests → Preview deployments
- Configure: Netlify → Site settings → Build & deploy

---

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Prisma + Supabase:** https://www.prisma.io/docs/guides/database/supabase
- **M-Pesa Daraja API:** https://developer.safaricom.co.ke/docs
- **Vercel Serverless Limits:** https://vercel.com/docs/concepts/limits/overview

---

## 🆘 Support

**Issues?**
- GitHub Issues: https://github.com/Langat1999/safiri-afya-ui/issues
- Email: info@safiriafya.com

**Community:**
- Supabase Discord: https://discord.supabase.com/
- Vercel Discord: https://vercel.com/discord

---

**Congratulations!** 🎉

Your Safiri Afya platform is now live on:
- ✅ **Database:** Supabase PostgreSQL
- ✅ **Backend:** Vercel Serverless
- ✅ **Frontend:** Netlify

**All running on FREE tiers!** 🚀
