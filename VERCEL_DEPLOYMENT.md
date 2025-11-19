# 🚀 Vercel Deployment Guide - Complete Platform on Vercel

**Safiri Afya** is now deployed entirely on **Vercel** with **Supabase PostgreSQL** as the database.

---

## 📋 Architecture Overview

```
┌──────────────────────────────────────────┐
│         Vercel (Single Platform)         │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Frontend (React + Vite)           │ │
│  │  Routes: /, /login, /dashboard etc │ │
│  └────────────────┬───────────────────┘ │
│                   │                      │
│                   ▼ (same domain)        │
│  ┌────────────────────────────────────┐ │
│  │  Backend API (Express + Node.js)   │ │
│  │  Routes: /api/*                    │ │
│  └────────────────┬───────────────────┘ │
│                   │                      │
└───────────────────┼──────────────────────┘
                    │
                    ▼
       ┌────────────────────────┐
       │   Supabase PostgreSQL   │
       │   (Database)            │
       └────────────────────────┘
```

**Benefits:**
- ✅ **No CORS issues** - Frontend and backend on same domain
- ✅ **Faster API calls** - No cross-domain requests
- ✅ **Single deployment** - One platform to manage
- ✅ **Edge network** - Global CDN for both frontend and API
- ✅ **Simpler environment variables** - Relative paths (/api instead of full URLs)

---

## 🎯 Quick Deployment (10 Minutes)

### Step 1: Ensure Vercel Project Exists

Your Vercel project is already set up at:
- **URL:** https://safiri-afya-ui.vercel.app
- **Dashboard:** https://vercel.com/mutisojackson55-8081s-projects/safiri-afya-ui

### Step 2: Add Environment Variables to Vercel

Go to: **Vercel Dashboard → Settings → Environment Variables**

Add these variables (select **Production**, **Preview**, and **Development** for each):

#### Database (Supabase)
```bash
DATABASE_URL=postgresql://postgres.vixtrsbooqqxidqzpxza:%23Mutisojackson55@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.vixtrsbooqqxidqzpxza:%23Mutisojackson55@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

#### Server Configuration
```bash
NODE_ENV=production

PORT=3001
```

#### Authentication
```bash
JWT_SECRET=6742680a3437944e6e100f6f39bf618b889c89aab83e1a69570d656a75f742d26163e738d38bd006dc3151411b6a9bf0fdcb6743c222b1bd7907a7a75afd82c2
```

#### M-Pesa Integration
```bash
MPESA_ENVIRONMENT=sandbox

MPESA_CONSUMER_KEY=PAW87o1bIJEU3hAyhauUAXuZnwpDNANnLS7vFrA9UUGZXmSR

MPESA_CONSUMER_SECRET=mmDn4f8Hy0hnHvzUXxGnJ8uUoKuB10yL8pP5uQj4KTGWwDmF7zD4ttPShaUheoJc

MPESA_SHORTCODE=174379

MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

MPESA_INITIATOR_NAME=testapi

MPESA_SECURITY_CREDENTIAL=Safaricom999!*!

MPESA_CALLBACK_URL=https://safiri-afya-ui.vercel.app/api/payments/mpesa/callback

MPESA_RESULT_URL=https://safiri-afya-ui.vercel.app/api/payments/mpesa/result

DEVELOPER_MPESA_NUMBER=254713809220

DEVELOPER_COMMISSION_PERCENTAGE=15
```

#### CORS Configuration
```bash
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173,https://safiri-afya-ui.vercel.app
```

#### Frontend URL
```bash
APP_URL=https://safiri-afya-ui.vercel.app
```

#### Optional Services
```bash
OPENROUTER_API_KEY=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

GUARDIAN_API_KEY=7dbc521f-3149-4416-b103-de0ff728e4ce

FROM_EMAIL=noreply@safiriafya.com

SENDGRID_API_KEY=(leave empty if not using SendGrid)

SUPABASE_URL=https://vixtrsbooqqxidqzpxza.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHRyc2Jvb3FxeGlkcXpweHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NjUxNjYsImV4cCI6MjA3OTA0MTE2Nn0.C6ioXnyqkK6hvtR_uQczW4bdsixmmnszlb48HnJI2Zs
```

### Step 3: Deploy

Vercel auto-deploys on every git push to `main`. The latest push will trigger:

1. **Frontend Build:** `npm run build` (Vite builds React app → `dist/`)
2. **Backend Build:** `cd backend && npm install && npm run build` (Prisma generates client)
3. **Deploy:** Both frontend and backend go live together

**Monitor deployment:**
https://vercel.com/mutisojackson55-8081s-projects/safiri-afya-ui/deployments

---

## ✅ Verify Deployment

### Test Backend API

```bash
curl https://safiri-afya-ui.vercel.app/api/health
```

**Expected Response:**
```json
{"status":"healthy"}
```

### Test Database Connection

```bash
curl https://safiri-afya-ui.vercel.app/api/clinics
```

**Expected:** Array of 8 clinics with full details

### Test Frontend

Open: https://safiri-afya-ui.vercel.app

Test these features:
- ✅ Homepage loads
- ✅ Clinic map displays
- ✅ Register new account
- ✅ Login with admin credentials:
  - Email: `admin@safiriafya.com`
  - Password: `Admin@123456`
- ✅ AI symptom checker works
- ✅ Book appointment
- ✅ Admin dashboard (when logged in as admin)

---

## 🔧 How It Works

### Frontend Routes
All non-API routes serve the React SPA:
```
/ → index.html
/login → index.html
/dashboard → index.html
/clinics → index.html
(etc...)
```

### Backend API Routes
All `/api/*` routes go to Express backend:
```
/api/health → backend/src/server.js
/api/auth/register → backend/src/server.js
/api/clinics → backend/src/server.js
(etc...)
```

### Configuration Files

**vercel.json:**
```json
{
  "buildCommand": "npm run build && cd backend && npm install && npm run build",
  "outputDirectory": "dist",
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/src/server.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**.env.production:**
```bash
VITE_API_URL=/api
```
*Note: Relative path since frontend and backend are on same domain*

---

## 📊 Database (Supabase)

**Project:** vixtrsbooqqxidqzpxza
**Region:** EU West (Ireland)
**Connection:** PostgreSQL with connection pooling

**Seeded Data:**
- ✅ 8 Nairobi clinics
- ✅ 10 doctors (various specialties)
- ✅ 1 admin user (admin@safiriafya.com)

**No migrations needed** - Database is already set up and seeded.

---

## 🛠️ Local Development

### Frontend Only (Port 8080)
```bash
npm run dev
```
This runs Vite dev server. API calls go to `http://localhost:3001/api` (backend must be running separately).

### Backend Only (Port 3001)
```bash
npm run backend:dev
```

### Both Together (Recommended)
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run backend:dev
```

Access app at: `http://localhost:8080`

---

## 🔐 Environment Variables

### Production (Vercel Dashboard)
All variables must be added manually in Vercel dashboard as they are NOT committed to git.

### Local Development
Create `.env` in project root:
```bash
VITE_API_URL=http://localhost:3001/api
```

Backend already has `backend/.env` with all required variables.

---

## 🚨 Troubleshooting

### Issue 1: API calls return 404
**Cause:** Frontend trying to call `/api/*` but backend not deployed
**Solution:** Ensure environment variables are set in Vercel and deployment completed successfully

### Issue 2: CORS errors
**Cause:** `ALLOWED_ORIGINS` doesn't include your Vercel domain
**Solution:** Add `https://safiri-afya-ui.vercel.app` to `ALLOWED_ORIGINS` environment variable

### Issue 3: Database connection errors
**Cause:** `DATABASE_URL` or `DIRECT_URL` not set correctly
**Solution:** Verify connection strings in Vercel environment variables match Supabase dashboard

### Issue 4: Build fails with "Prisma Client not found"
**Cause:** Prisma client not generated during build
**Solution:** Check `vercel.json` has correct `buildCommand` that includes `npm run build` for backend

### Issue 5: Frontend loads but no data
**Cause:** Backend serverless function cold start or database connection issue
**Solution:** Check Vercel Runtime Logs for backend errors

---

## 📈 Monitoring & Logs

### View Runtime Logs (Backend)
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** → Select latest deployment
3. Click **Runtime Logs** tab
4. See real-time backend API logs

### View Build Logs
1. Go to **Deployments** → Select deployment
2. Click **Build Logs** tab
3. See frontend and backend build output

### Database Monitoring
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/vixtrsbooqqxidqzpxza
2. Click **Database** → **Logs**
3. Monitor queries and connections

---

## 💰 Cost Breakdown

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| **Vercel** | 100GB bandwidth, 100 serverless hours | Frontend + Backend | **FREE** |
| **Supabase** | 500MB database, 2GB bandwidth | PostgreSQL database | **FREE** |
| **Total** | - | - | **$0/month** |

**Free tier supports:**
- 10,000-50,000 monthly users
- 1M+ API requests/month
- 500MB database (~100,000 records)

---

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables added to Vercel
- [ ] M-Pesa switched from sandbox to production (update credentials)
- [ ] Custom domain added (optional): `yourdomain.com`
- [ ] SSL/HTTPS enabled (automatic with Vercel)
- [ ] Database backed up (Supabase Pro or manual pg_dump)
- [ ] Error tracking set up (Sentry, LogRocket, etc.)
- [ ] Test all major features end-to-end
- [ ] Update M-Pesa callback URLs in Safaricom portal
- [ ] Configure SendGrid for email (if using)
- [ ] Test payment flow with real M-Pesa account

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **M-Pesa Daraja API:** https://developer.safaricom.co.ke/docs
- **GitHub Repository:** https://github.com/Langat1999/safiri-afya-ui

---

## 🆘 Support

**Issues:** https://github.com/Langat1999/safiri-afya-ui/issues
**Email:** info@safiriafya.com

---

**Congratulations!** 🎉

Your complete healthcare platform is now running on Vercel with Supabase PostgreSQL!

- ✅ Frontend: React + Vite
- ✅ Backend: Express + Node.js
- ✅ Database: Supabase PostgreSQL
- ✅ All on Vercel's edge network
- ✅ 100% FREE tier!
