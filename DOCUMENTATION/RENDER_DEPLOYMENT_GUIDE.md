# Render Deployment Guide - Safiri Afya Backend

Complete guide to deploy the Safiri Afya backend API to Render with PostgreSQL database.

---

## Prerequisites

- GitHub account with the repository pushed
- Render account (sign up at https://render.com - free tier available)
- All environment variables ready (SendGrid API key, M-Pesa credentials, JWT secret, etc.)

---

## Step 1: Create PostgreSQL Database on Render

### 1.1 Navigate to Render Dashboard

1. Go to https://dashboard.render.com
2. Click **"New +"** button in the top right
3. Select **"PostgreSQL"**

### 1.2 Configure PostgreSQL Database

Fill in the following:

- **Name**: `safiri-afya-db` (or any name you prefer)
- **Database**: `safiri_afya` (database name)
- **User**: `safiri_afya_user` (or leave default)
- **Region**: Choose closest to your users
  - **Recommended for Kenya**: `Frankfurt (EU Central)` or `Singapore`
- **PostgreSQL Version**: `16` (latest)
- **Plan**:
  - **Free** ($0/month) - 90 days free, then deleted
  - **Starter** ($7/month) - Recommended for production
  - **Standard** ($20/month) - For high traffic

**Important**: Free databases are deleted after 90 days of inactivity!

### 1.3 Create Database

1. Click **"Create Database"**
2. Wait 2-3 minutes for provisioning
3. Once created, you'll see the database dashboard

### 1.4 Copy Database Connection Details

You'll need these for the web service:

- **Internal Database URL**: `postgresql://user:pass@host:5432/dbname`
- **External Database URL**: `postgresql://user:pass@external-host:5432/dbname`

**Important**: Use the **Internal Database URL** for better performance and security!

Copy the **Internal Database URL** - you'll use this as `DATABASE_URL`

---

## Step 2: Create Web Service on Render

### 2.1 Navigate to New Web Service

1. Click **"New +"** button again
2. Select **"Web Service"**

### 2.2 Connect GitHub Repository

1. Click **"Connect account"** if not already connected
2. Search for `safiri-afya-ui` repository
3. Click **"Connect"**

### 2.3 Configure Web Service

Fill in the following:

**Basic Settings:**

- **Name**: `safiri-afya-api` (will be your subdomain)
- **Region**: **Same as database** (Frankfurt or Singapore)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run deploy`

**Plan:**

- **Free** ($0/month) - Spins down after 15 min inactivity
- **Starter** ($7/month) - Recommended for production, always running
- **Standard** ($25/month) - For high traffic

### 2.4 Configure Environment Variables

Click **"Advanced"** > **"Add Environment Variable"**

Add the following variables:

#### Required Variables:

```bash
# Database
DATABASE_URL=<paste-internal-database-url-from-step-1.4>

# Server
PORT=3001
NODE_ENV=production

# JWT Authentication
JWT_SECRET=<generate-strong-random-string-min-32-chars>

# M-Pesa Credentials (from Safaricom Daraja)
MPESA_CONSUMER_KEY=<your-mpesa-consumer-key>
MPESA_CONSUMER_SECRET=<your-mpesa-consumer-secret>
MPESA_SHORTCODE=<your-business-shortcode>
MPESA_PASSKEY=<your-lipa-na-mpesa-passkey>
MPESA_CALLBACK_URL=https://safiri-afya-api.onrender.com/api/payments/mpesa/callback

# SendGrid Email (optional but recommended)
SENDGRID_API_KEY=<your-sendgrid-api-key>
FROM_EMAIL=noreply@safiriafya.com

# OpenRouter AI (optional for symptom checker)
OPENROUTER_API_KEY=<your-openrouter-api-key>
```

#### How to Generate JWT_SECRET:

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/64
```

**Security Note**: Never commit these secrets to GitHub!

### 2.5 Create Web Service

1. Click **"Create Web Service"**
2. Render will start building your application
3. Watch the build logs for any errors

---

## Step 3: Run Database Migration

After the web service is created and running:

### 3.1 Open Shell

1. Go to your web service dashboard
2. Click **"Shell"** tab in the top menu
3. A terminal will open

### 3.2 Run Migration

In the shell, run:

```bash
npx prisma migrate deploy
```

This will:
- Create all database tables
- Set up indexes
- Configure foreign keys

**Expected output:**
```
Applying migration `20251116061609_initial_migration`
✔ Migration applied successfully
```

### 3.3 Verify Database

```bash
npx prisma studio
```

This opens Prisma Studio to view your database (accessible via tunnel).

Alternatively, use Render's built-in PostgreSQL client:
1. Go to your PostgreSQL database dashboard
2. Click **"Connect"** > **"External Connection"**
3. Use any PostgreSQL client (e.g., TablePlus, pgAdmin)

---

## Step 4: Test Your Deployment

### 4.1 Get Your API URL

Your API will be available at:
```
https://safiri-afya-api.onrender.com
```

(Replace `safiri-afya-api` with your actual service name)

### 4.2 Test Endpoints

**Health Check:**
```bash
curl https://safiri-afya-api.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-16T..."
}
```

**Register User:**
```bash
curl -X POST https://safiri-afya-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "name": "Test User"
  }'
```

**Get Clinics:**
```bash
curl https://safiri-afya-api.onrender.com/api/clinics
```

### 4.3 Check Logs

If something fails:

1. Go to web service dashboard
2. Click **"Logs"** tab
3. Look for errors in real-time

---

## Step 5: Seed Initial Data (Optional)

Your database will be empty. To add initial clinics and doctors:

### Option 1: Via Shell

1. Open Shell on Render
2. Create a seed script or run Prisma Studio
3. Manually add data through the UI

### Option 2: Via API (Recommended)

Create an admin user first:

```bash
# 1. Register admin via API
curl -X POST https://safiri-afya-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@safiriafya.com",
    "password": "AdminPassword123!",
    "name": "Admin User"
  }'

# 2. Promote to admin via Shell
# In Render Shell:
npx prisma studio
# Then manually change role to SUPER_ADMIN
```

Or create a seed script:

```javascript
// backend/src/seed.js
import { prisma } from './prismadb.js';

async function seed() {
  // Create admin
  await prisma.user.create({
    data: {
      email: 'admin@safiriafya.com',
      password: '$2a$10$...', // bcrypt hash of password
      name: 'Admin',
      role: 'SUPER_ADMIN'
    }
  });

  // Create sample clinics
  await prisma.clinic.createMany({
    data: [
      {
        name: 'Nairobi Hospital',
        location: 'Upper Hill, Nairobi',
        latitude: -1.2876,
        longitude: 36.8154,
        rating: 4.5,
        services: ['Emergency', 'Surgery', 'Maternity'],
        hours: '24/7',
        phone: '+254-20-2845000',
        consultationFee: 2000
      }
      // Add more...
    ]
  });

  console.log('✅ Seed completed!');
}

seed();
```

Run in Shell:
```bash
node src/seed.js
```

---

## Step 6: Configure Custom Domain (Optional)

### 6.1 Add Custom Domain

1. Go to web service dashboard
2. Click **"Settings"**
3. Scroll to **"Custom Domain"**
4. Click **"Add Custom Domain"**
5. Enter your domain: `api.safiriafya.com`

### 6.2 Configure DNS

Add a CNAME record in your DNS provider:

```
Type: CNAME
Name: api
Value: safiri-afya-api.onrender.com
TTL: 3600
```

### 6.3 Enable HTTPS

Render automatically provisions SSL certificates via Let's Encrypt.

Wait 5-10 minutes for SSL to activate.

---

## Step 7: Update Frontend Configuration

Update your frontend API URL to point to Render:

**File**: `src/services/api.ts`

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://safiri-afya-api.onrender.com';
```

**Environment Variable** (Lovable or Vercel):
```bash
VITE_API_URL=https://safiri-afya-api.onrender.com
```

---

## Step 8: Configure Auto-Deploy (CI/CD)

Render automatically deploys when you push to GitHub!

### 8.1 Enable Auto-Deploy

1. Go to web service **"Settings"**
2. Scroll to **"Build & Deploy"**
3. **Auto-Deploy**: Should be **"Yes"** by default

Now every push to `main` branch will trigger a new deployment.

### 8.2 Disable Auto-Deploy (if needed)

If you want manual deploys only:
1. Set **Auto-Deploy** to **"No"**
2. Click **"Manual Deploy"** > **"Deploy latest commit"** when ready

---

## Step 9: Monitoring & Scaling

### 9.1 View Metrics

Render provides:
- CPU usage
- Memory usage
- Request count
- Response time
- Error rate

Access via **"Metrics"** tab.

### 9.2 Set Up Alerts (Paid Plans)

1. Go to **"Settings"** > **"Notifications"**
2. Add email or Slack for alerts
3. Configure thresholds

### 9.3 Scale Your Service

**Vertical Scaling** (upgrade plan):
- Starter: 512 MB RAM, 0.5 CPU
- Standard: 2 GB RAM, 1 CPU
- Pro: 4 GB RAM, 2 CPU

**Horizontal Scaling** (multiple instances):
- Available on Pro plan and above
- Automatically handles load balancing

### 9.4 Database Scaling

**Upgrade PostgreSQL plan**:
- Free: Shared CPU, 256 MB RAM, 1 GB storage
- Starter: Shared CPU, 1 GB RAM, 10 GB storage
- Standard: 1 CPU, 4 GB RAM, 50 GB storage
- Pro: 2 CPU, 8 GB RAM, 100 GB storage

---

## Troubleshooting

### Issue 1: Build Fails

**Error**: `Cannot find module`

**Solution**:
```bash
# Make sure all dependencies are in package.json
npm install --save <missing-package>
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

### Issue 2: Database Connection Error

**Error**: `Can't reach database server`

**Solution**:
- Verify `DATABASE_URL` is correct
- Use **Internal Database URL** (not external)
- Check database is in same region as web service
- Ensure database is running (check database dashboard)

### Issue 3: Prisma Client Not Generated

**Error**: `@prisma/client did not initialize yet`

**Solution**:
Add `postinstall` script to package.json:
```json
"scripts": {
  "postinstall": "npx prisma generate"
}
```

### Issue 4: Migration Fails

**Error**: `Migration failed to apply`

**Solution**:
```bash
# In Render Shell:
npx prisma migrate reset
npx prisma migrate deploy
```

**Warning**: This deletes all data!

### Issue 5: M-Pesa Callback Fails

**Error**: `Callback URL unreachable`

**Solution**:
- Verify `MPESA_CALLBACK_URL` matches your Render URL
- Check Render service is running (free tier spins down)
- Use paid plan to keep service always running
- Update callback URL in Safaricom Daraja dashboard

### Issue 6: Free Tier Spin Down

**Issue**: API is slow on first request after inactivity

**Explanation**: Free tier spins down after 15 minutes of inactivity

**Solutions**:
1. **Upgrade to Starter plan** ($7/month) - recommended
2. **Use a cron job** to ping your API every 10 minutes:
   - UptimeRobot (free)
   - Cron-job.org (free)
3. **Accept the limitation** for development/testing

---

## Cost Estimates

### Minimal Setup (Free):
- PostgreSQL: Free (90 days, then deleted)
- Web Service: Free (spins down after 15 min)
- **Total**: $0/month

**Limitations**:
- Database deleted after 90 days
- Service spins down (slow first request)
- Not suitable for production

### Recommended Setup (Production):
- PostgreSQL Starter: $7/month
- Web Service Starter: $7/month
- **Total**: $14/month

**Benefits**:
- Always running (no spin down)
- Persistent database
- 512 MB RAM, shared CPU
- Suitable for low-medium traffic

### High-Traffic Setup:
- PostgreSQL Standard: $20/month
- Web Service Standard: $25/month
- **Total**: $45/month

**Benefits**:
- 2 GB RAM, 1 CPU for web service
- 4 GB RAM for database
- Suitable for production with high traffic

---

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit secrets to GitHub
- ✅ Use strong JWT_SECRET (64+ characters)
- ✅ Rotate secrets regularly

### 2. Database Access
- ✅ Use internal database URL
- ✅ Don't expose external URL publicly
- ✅ Enable connection pooling (Prisma does this)

### 3. HTTPS Only
- ✅ Render provides free SSL
- ✅ Force HTTPS in production
- ✅ Set secure cookies

### 4. Rate Limiting
- ✅ Already implemented in code
- ✅ Consider adding Cloudflare for DDoS protection

### 5. Monitoring
- ✅ Enable error tracking (Sentry)
- ✅ Monitor logs regularly
- ✅ Set up uptime monitoring

---

## Next Steps After Deployment

1. **Test all features thoroughly**
   - User registration/login
   - Appointment booking
   - Hospital booking
   - M-Pesa payments
   - Symptom checker
   - Admin panel

2. **Set up monitoring**
   - Sentry for error tracking
   - UptimeRobot for uptime monitoring
   - Render metrics dashboard

3. **Optimize performance**
   - Add database indexes for slow queries
   - Implement caching (Redis)
   - Enable CDN for static assets

4. **Backup strategy**
   - Render takes daily backups (paid plans)
   - Set up additional backup to S3/Google Cloud
   - Test restore process

5. **Documentation**
   - Create API documentation (Swagger/OpenAPI)
   - Write admin user guide
   - Document troubleshooting steps

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

### Getting Help

1. **Render Community**: https://community.render.com
2. **Render Support**: Available on paid plans
3. **GitHub Issues**: For code-related issues

---

## Checklist

Before going live, verify:

- [ ] PostgreSQL database created and running
- [ ] Web service deployed successfully
- [ ] All environment variables configured
- [ ] Database migration completed
- [ ] Initial data seeded (clinics, doctors)
- [ ] All endpoints tested and working
- [ ] M-Pesa callback URL updated
- [ ] SendGrid email verified
- [ ] Frontend connected to backend URL
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Error tracking enabled
- [ ] Load testing completed
- [ ] Security audit done
- [ ] Documentation updated

---

**Deployment Status**: Ready for production! 🚀

**Estimated deployment time**: 30-45 minutes

**Last updated**: 2025-11-16
