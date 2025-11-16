# 🚀 Safiri Afya Deployment Guide

## ✅ Completed Steps

### Backend Setup (Render)
- [x] Switched Prisma from SQLite → PostgreSQL
- [x] Added `npm start` script with automatic migrations
- [x] Updated backend/.env with production URLs
- [x] Committed and pushed all changes to GitHub

### Frontend Setup (Netlify)
- [x] Created .env.production with Render API URL
- [x] Rebuilt production bundle (dist/)
- [x] Added GitHub Actions Netlify deploy workflow

---

## 🔧 Manual Steps Required

### Step 1: Deploy Backend to Render ⚠️ (YOU MUST DO THIS)

1. Go to **Render Dashboard** → **New** → **Web Service**
2. Connect `Langat1999/safiri-afya-ui` repository
3. Set **Root Directory** to `backend`
4. Configure:
   - **Build Command:** `npm ci`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add Environment Variables from `backend/.env`:
   ```
   PORT=3001
   JWT_SECRET=6742680a3437944e6e100f6f39bf618b889c89aab83e1a69570d656a75f742d26163e738d38bd006dc3151411b6a9bf0fdcb6743c222b1bd7907a7a75afd82c2
   NODE_ENV=production
   DATABASE_URL=dpg-d4comtk9c44c738uphe0-a
   OPENROUTER_API_KEY=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
   ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
   MPESA_ENVIRONMENT=sandbox
   MPESA_CONSUMER_KEY=PAW87o1bIJEU3hAyhauUAXuZnwpDNANnLS7vFrA9UUGZXmSR
   MPESA_CONSUMER_SECRET=mmDn4f8Hy0hnHvzUXxGnJ8uUoKuB10yL8pP5uQj4KTGWwDmF7zD4ttPShaUheoJc
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
   MPESA_INITIATOR_NAME=testapi
   SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY
   EMAIL_FROM=noreply@safiri-afya.com
   ```
6. Click **Deploy** and wait for **Live** status ✅

### Step 2: Get Render Backend URL

Once deployed, Render will show you a URL like:
```
https://safiri-afya-backend.onrender.com
```

**Copy this URL** for the next step.

### Step 3: Add GitHub Secrets for Netlify Deploy

1. Go to GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Add two secrets:
   - `NETLIFY_AUTH_TOKEN` = your Netlify personal access token
   - `NETLIFY_SITE_ID` = your Netlify site ID

(See `NETLIFY_SETUP.md` for how to get these)

### Step 4: Update Netlify Environment Variables

1. Go to **Netlify** → Your site → **Site settings** → **Build & deploy** → **Environment**
2. Add/update:
   - `VITE_API_URL=https://safiri-afya-backend.onrender.com/api` (replace with your actual Render URL)
3. Save and trigger **Redeploy** (or push any commit to main)

---

## 📊 Current Status

| Component | Status | Location |
|-----------|--------|----------|
| Backend Code | ✅ Ready | GitHub (`backend/` folder) |
| Backend Database | ✅ Ready | Render PostgreSQL |
| Frontend Code | ✅ Ready | GitHub (`src/` folder) |
| Frontend Build | ✅ Ready | `dist/` folder |
| GitHub Actions | ✅ Configured | `.github/workflows/` |
| Render Deployment | ⏳ Pending | You must create Web Service |
| Netlify Deployment | ⏳ Pending | Needs Render URL + GitHub secrets |

---

## 🔗 Environment Variables Summary

### Backend (.env)
- `DATABASE_URL` = Render PostgreSQL connection
- `PORT` = 3001
- `JWT_SECRET` = Already set
- `ALLOWED_ORIGINS` = Include your Netlify site URL

### Frontend (.env.production)
- `VITE_API_URL` = Your Render backend URL + `/api`

---

## ⚠️ Important Notes

1. **Do NOT commit `.env` files** — they're in `.gitignore` for security
2. **Migrations run automatically** — `npm start` runs `prisma migrate deploy`
3. **CORS must include** your Netlify URL in `ALLOWED_ORIGINS`
4. **First deploy takes longer** — Render provisions resources and runs migrations

---

## 🧪 Testing

After all steps are complete:

1. Open your Netlify site URL
2. Open DevTools → **Network** tab
3. Check API calls go to `https://your-render-backend.onrender.com/api`
4. Should return 200 status codes

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Render deploy fails | Check build logs: ensure `npm start` exists in package.json |
| API calls fail (CORS) | Update `ALLOWED_ORIGINS` in Render environment to include Netlify URL |
| Migrations fail | Ensure `DATABASE_URL` is correct Render PostgreSQL URL |
| Frontend shows blank | Check DevTools console for API errors; verify `VITE_API_URL` is set |

