# Render Backend Deployment Guide

**Your Current Setup:**
- ✅ PostgreSQL Database: Running on Render
- ✅ Frontend: Deployed on Netlify
- ⏳ Backend: Ready to deploy on Render

---

## Quick Deployment (5 Steps)

### Step 1: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Select **"Build and deploy from a Git repository"**
4. Connect to your GitHub repository: `Langat1999/safiri-afya-ui`
5. Click **Connect**

### Step 2: Configure Service

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `safiri-afya-backend` |
| **Region** | Frankfurt (or same as your database) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run deploy` |
| **Instance Type** | **Free** (for testing) or **Starter** ($7/mo for production) |

### Step 3: Add Environment Variables

Click **Advanced** → **Add Environment Variable** and add these:

#### Required Variables (Backend will not start without these):

```bash
# Database (Copy from your Render PostgreSQL dashboard)
DATABASE_URL
# Value: postgres://safiri_afya_user:password@dpg-xxxxx.oregon-postgres.render.com/safiri_afya
# Get this from: Render Dashboard → Your PostgreSQL → "Internal Database URL"

# Server Configuration
NODE_ENV=production
PORT=3001

# Authentication (Generate a secure secret)
JWT_SECRET
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Result should be a 128-character string

# CORS (Replace with your actual Netlify URL)
ALLOWED_ORIGINS
# Value: https://your-netlify-site.netlify.app
# Important: No trailing slash, must be exact URL
```

#### M-Pesa Payment Variables (Required for payments):

```bash
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your-consumer-key-from-safaricom
MPESA_CONSUMER_SECRET=your-consumer-secret-from-safaricom
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-passkey-from-safaricom

# IMPORTANT: Update these after deployment with your actual Render URL
MPESA_CALLBACK_URL=https://safiri-afya-backend.onrender.com/api/payments/mpesa/callback
MPESA_RESULT_URL=https://safiri-afya-backend.onrender.com/api/payments/mpesa/result

# Revenue Split (Optional)
DEVELOPER_MPESA_NUMBER=254713809220
DEVELOPER_COMMISSION_PERCENTAGE=15
```

#### Optional Variables (Enhance features):

```bash
# Email Service (Recommended)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@safiriafya.com
APP_URL=https://your-netlify-site.netlify.app

# AI Symptom Checker Enhancement
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Deploy

1. Click **Create Web Service**
2. Wait 5-10 minutes for deployment
3. Watch the logs for:
   ```
   ✓ Prisma client generated
   ✓ Migrations applied
   ✓ Server running on port 3001
   ```

### Step 5: Verify Deployment

Once status shows **"Live"**:

1. **Copy your Render URL** (e.g., `https://safiri-afya-backend.onrender.com`)
2. **Test health endpoint** in browser:
   ```
   https://safiri-afya-backend.onrender.com/api/health
   ```
3. **Expected response:**
   ```json
   {
     "status": "healthy",
     "message": "Safiri Afya Backend API is running",
     "timestamp": "2024-11-18T..."
   }
   ```

✅ **Backend is deployed!**

---

## Connect Frontend to Backend

### Update Netlify Configuration

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to **Site Settings** → **Environment variables**
4. Add or update:
   ```
   Key: VITE_API_URL
   Value: https://safiri-afya-backend.onrender.com/api
   ```
5. **Important:** No trailing slash!

### Update CORS on Render

1. Go back to Render Dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Find **ALLOWED_ORIGINS** variable
5. Update with your **exact Netlify URL**:
   ```
   https://your-actual-site.netlify.app
   ```
6. Save (Render will auto-redeploy)

### Trigger Frontend Rebuild

1. In Netlify, go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for build to complete

### Test Integration

1. Open your Netlify site
2. Press **F12** to open DevTools → **Network** tab
3. Try any feature (e.g., view clinics)
4. Verify:
   - ✅ API calls go to `https://safiri-afya-backend.onrender.com/api/...`
   - ✅ Status 200 responses
   - ✅ No CORS errors

---

## Populate Database with Initial Data

Your database is currently empty. Add some clinics and doctors:

### Option 1: Use Admin Dashboard

1. Register an admin user via API:
   ```bash
   POST https://safiri-afya-backend.onrender.com/api/auth/register
   Body: {
     "name": "Admin User",
     "email": "admin@safiriafya.com",
     "password": "SecurePassword123!",
     "phone": "254712345678"
   }
   ```

2. Update user role in database (via Prisma Studio or direct query)

3. Use admin endpoints to add clinics/doctors

### Option 2: Use Prisma Studio (Local)

1. In your local project:
   ```bash
   cd backend
   # Add DATABASE_URL to backend/.env temporarily
   DATABASE_URL="postgres://safiri_afya_user:password@dpg-xxxxx.oregon-postgres.render.com/safiri_afya"

   npx prisma studio
   ```

2. Add clinics and doctors through the UI

3. **Remove DATABASE_URL from local .env** after done

### Option 3: Import Sample Data (Recommended)

Create a seed file with sample Kenyan clinics and doctors. I can help create this if needed.

---

## Troubleshooting

### Issue: "Application failed to respond"

**Cause:** Backend didn't start properly

**Solution:**
1. Check Render logs: Service → Logs tab
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Database connection failed
   - Port already in use

### Issue: CORS Errors in Browser

**Symptoms:**
```
Access to fetch at 'https://safiri-afya-backend.onrender.com/api/clinics'
from origin 'https://your-site.netlify.app' has been blocked by CORS policy
```

**Solution:**
1. Verify `ALLOWED_ORIGINS` on Render includes exact Netlify URL
2. Check for typos (https vs http, trailing slashes)
3. Trigger manual redeploy on Render
4. Hard refresh browser (Ctrl+Shift+R)

### Issue: Database Connection Error

**Symptoms:** Logs show `P1001: Can't reach database`

**Solution:**
1. Copy **Internal Database URL** from PostgreSQL dashboard (not external)
2. Verify `DATABASE_URL` format:
   ```
   postgres://user:password@host:5432/database
   ```
3. Ensure database is in same region as web service

### Issue: Payment Callbacks Not Working

**Symptoms:** M-Pesa payments initiated but status never updates

**Solution:**
1. Verify `MPESA_CALLBACK_URL` uses actual Render URL
2. Check Render logs during payment
3. Test callback endpoint manually:
   ```bash
   curl -X POST https://safiri-afya-backend.onrender.com/api/payments/mpesa/callback
   ```

### Issue: Free Tier Cold Starts

**Symptoms:** First request takes 30-60 seconds

**Explanation:** Free tier services spin down after 15 minutes of inactivity

**Solutions:**
- Upgrade to Starter plan ($7/mo) for always-on
- Use a service like UptimeRobot to ping every 10 minutes
- Accept cold starts for MVP/testing

---

## Environment Variables Reference

### Complete List with Descriptions

```bash
# === REQUIRED ===
DATABASE_URL                    # PostgreSQL connection string from Render
JWT_SECRET                      # 128-char random string for JWT signing
NODE_ENV                        # Set to "production"
PORT                           # Set to 3001

# === REQUIRED FOR PAYMENTS ===
MPESA_ENVIRONMENT              # "sandbox" or "production"
MPESA_CONSUMER_KEY             # From Safaricom Developer Portal
MPESA_CONSUMER_SECRET          # From Safaricom Developer Portal
MPESA_SHORTCODE                # Your M-Pesa business shortcode
MPESA_PASSKEY                  # From Safaricom Developer Portal
MPESA_CALLBACK_URL             # Your Render URL + /api/payments/mpesa/callback
MPESA_RESULT_URL               # Your Render URL + /api/payments/mpesa/result

# === REQUIRED FOR FRONTEND ===
ALLOWED_ORIGINS                # Your Netlify URL (comma-separated if multiple)

# === OPTIONAL BUT RECOMMENDED ===
SENDGRID_API_KEY               # For email notifications
FROM_EMAIL                     # Sender email address
APP_URL                        # Your Netlify URL for email links

# === OPTIONAL (FEATURES) ===
OPENROUTER_API_KEY             # For enhanced AI symptom checker
DEVELOPER_MPESA_NUMBER         # Your M-Pesa number for revenue split
DEVELOPER_COMMISSION_PERCENTAGE # Default: 15
```

### How to Get Each Variable

**DATABASE_URL:**
1. Render Dashboard → Your PostgreSQL database
2. Copy "Internal Database URL"

**JWT_SECRET:**
```bash
# Run in terminal:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**M-Pesa Credentials:**
1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create an app (Sandbox for testing)
3. Get Consumer Key, Consumer Secret, and Passkey
4. Use shortcode 174379 for sandbox

**SENDGRID_API_KEY:**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create API key in Settings → API Keys
3. Free tier: 100 emails/day

**OPENROUTER_API_KEY:**
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get API key from dashboard
3. Has free tier for testing

---

## Post-Deployment Checklist

- [ ] Backend health check returns 200
- [ ] Database migrations applied successfully
- [ ] Frontend can fetch data from backend
- [ ] No CORS errors in browser console
- [ ] User registration works
- [ ] User login works
- [ ] Clinics and doctors display (after adding data)
- [ ] Symptom checker works
- [ ] Appointment booking works
- [ ] M-Pesa payment initiates (if configured)
- [ ] Email notifications send (if SendGrid configured)
- [ ] Check Render logs for any errors
- [ ] Set up monitoring/alerts

---

## Free Tier Optimization

If using Render's free tier:

### Reduce Cold Start Impact

1. **Keep Service Warm (10-minute ping):**
   - Use [UptimeRobot](https://uptimerobot.com/) (free)
   - Ping: `https://safiri-afya-backend.onrender.com/api/health`
   - Interval: Every 10 minutes

2. **Show Loading State:**
   - Add "Waking up server..." message on first request
   - Expected delay: 30-60 seconds

3. **Consider Upgrading:**
   - **Starter plan ($7/mo)** eliminates cold starts
   - Always-on, faster response times
   - Recommended for production

### Alternative: Use Railway or Fly.io

Both offer generous free tiers:
- **Railway:** $5 free credit monthly
- **Fly.io:** 3 free VMs, 160GB transfer

---

## Next Steps After Deployment

1. **Add Initial Data:**
   - Create seed script or manually add clinics/doctors
   - Populate with Kenyan healthcare facilities

2. **Test All Features:**
   - Go through user journey end-to-end
   - Test each API endpoint
   - Verify payments in sandbox mode

3. **Monitor Performance:**
   - Check Render metrics
   - Monitor error logs
   - Set up alerts for downtime

4. **Secure Production:**
   - Use production M-Pesa credentials (when ready)
   - Enable 2FA on Render account
   - Regular backup database

5. **Optimize:**
   - Add caching for frequently accessed data
   - Optimize database queries
   - Add CDN for static assets

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **M-Pesa API:** https://developer.safaricom.co.ke/docs
- **Project Issues:** Create issue in your GitHub repo

---

## Cost Summary (Monthly)

### Minimum (Free Tier)
- Render Backend: $0 (with limitations)
- Render PostgreSQL: $0 (256MB RAM, shared)
- Netlify Frontend: $0
- **Total: $0/month**

### Recommended (Starter)
- Render Backend: $7 (always-on)
- Render PostgreSQL: $7 (512MB RAM)
- Netlify Frontend: $0
- SendGrid: $0 (100 emails/day)
- **Total: $14/month**

### Production Ready
- Render Backend: $25 (Standard - 2GB RAM)
- Render PostgreSQL: $25 (4GB RAM)
- Netlify Frontend: $0-$19
- SendGrid: $14.95 (40K emails/month)
- **Total: ~$65-84/month**

---

**Last Updated:** November 18, 2024

**Questions?** Check troubleshooting section or create an issue in the repository.
