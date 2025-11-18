# Render Quick Start Guide

Quick reference for deploying Safiri Afya backend to Render.

---

## Prerequisites

- GitHub repo pushed with latest changes
- Render account (https://render.com)
- PostgreSQL database created on Render
- Environment variables ready

---

## 1. Create PostgreSQL Database (if not done)

1. Render Dashboard > **New +** > **PostgreSQL**
2. Name: `safiri-afya-db`
3. Database: `safiri_afya_db`
4. Region: **Oregon** (or Frankfurt for Kenya users)
5. Plan: **Free** (testing) or **Starter** ($7/month)
6. Click **Create Database**
7. Copy **Internal Database URL** (looks like `postgresql://user:pass@host/db`)

---

## 2. Create Web Service

1. Render Dashboard > **New +** > **Web Service**
2. Connect repository: `safiri-afya-ui`
3. Configure:
   - **Name**: `safiri-afya-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave blank (builds from root)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run backend:deploy`
   - **Plan**: **Free** (testing) or **Starter** ($7/month)

---

## 3. Environment Variables

Click **Advanced** > Add these variables:

```bash
# Required
DATABASE_URL=postgresql://safiri_afya_db_user:lfSPapZgJycyV8GbGR7fLaPXQnXkg4WJ@dpg-d4comtk9c44c738uphe0-a/safiri_afya_db
NODE_ENV=production
PORT=3001
JWT_SECRET=<your-64-char-secret>

# M-Pesa Sandbox
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=<your-key>
MPESA_CONSUMER_SECRET=<your-secret>
MPESA_SHORTCODE=174379
MPESA_PASSKEY=<your-passkey>
MPESA_CALLBACK_URL=https://safiri-afya-backend.onrender.com/api/payments/mpesa/callback

# Optional
SENDGRID_API_KEY=<your-sendgrid-key>
EMAIL_FROM=noreply@safiri-afya.com
OPENROUTER_API_KEY=<your-openrouter-key>
```

Click **Create Web Service**

---

## 4. Wait for Build

Watch the **Logs** tab. Build should complete in 2-5 minutes.

If build fails:
- Check logs for specific error
- Verify `DATABASE_URL` is the full connection string
- Ensure all required env vars are set

---

## 5. Run Migration (IMPORTANT!)

After successful build:

1. Go to **Shell** tab
2. Run:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

This creates all database tables.

---

## 6. Test Your API

```bash
# Health check
curl https://safiri-afya-backend.onrender.com/health

# Register user
curl -X POST https://safiri-afya-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@1234","name":"Test"}'
```

---

## Troubleshooting

### Build fails with "Missing script: start"
- Ensure root `package.json` has `start` and `build` scripts
- Check `buildCommand` is set to `npm run build`
- Check `startCommand` is set to `npm run backend:deploy`

### Database connection error
- Verify `DATABASE_URL` is the **Internal Database URL** (not External)
- Check database status is "available" (green)
- Ensure database and web service are in same region

### Migration fails
- Check `DATABASE_URL` is correct
- Run `cd backend && npx prisma migrate reset` (deletes data!)
- Then run `npx prisma migrate deploy`

---

## After Deployment

1. **Update frontend**: Set `VITE_API_URL=https://safiri-afya-backend.onrender.com`
2. **Seed data**: Create admin user and initial clinics
3. **Monitor**: Check Render dashboard for metrics
4. **Upgrade before expiry**: Free database expires in 90 days

---

## Cost

- **Free**: Database + Web Service = $0 (90 day limit, spins down)
- **Starter**: $7 + $7 = **$14/month** (recommended for production)
- **Standard**: $20 + $25 = **$45/month** (high traffic)

---

## Manual Deploy

To deploy manually after code changes:

1. Push to GitHub: `git push origin main`
2. Render auto-deploys (if enabled)
3. Or: Manual Deploy > Deploy latest commit

---

## Useful Commands (in Render Shell)

```bash
# Navigate to backend
cd backend

# Run migration
npx prisma migrate deploy

# View database
npx prisma studio

# Check Node version
node --version

# Check environment
env | grep DATABASE_URL
```

---

**Your Database URL:**
```
postgresql://safiri_afya_db_user:lfSPapZgJycyV8GbGR7fLaPXQnXkg4WJ@dpg-d4comtk9c44c738uphe0-a/safiri_afya_db
```

**Status:** Ready to deploy! 🚀
