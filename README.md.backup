# Safiri Afya (Afya Karibu Kenya)

**AI-Powered Healthcare Platform for Kenya**

Full-stack healthcare platform connecting Kenyans to quality medical services. Features AI symptom checking (English + Swahili), clinic locator, appointment booking, and M-Pesa payments.

---

## 🚀 Quick Deploy on Vercel (10 Minutes) - 100% FREE!

### Architecture
```
┌────────────────────────────┐
│   Vercel (Same Domain)     │
│   ├─ Frontend (React)      │
│   └─ Backend API (Node.js) │
└───────────┬────────────────┘
            │
            ▼
     ┌─────────────┐
     │  Supabase   │
     │  PostgreSQL │
     └─────────────┘
```

**Benefits:** No CORS issues, faster API calls, single platform, 100% free!

### Prerequisites
- GitHub account
- [Supabase account](https://supabase.com/) (free tier: 500MB database)
- [Vercel account](https://vercel.com/) (free tier: 100GB bandwidth)
- M-Pesa sandbox credentials from [Safaricom](https://developer.safaricom.co.ke/)

### Step 1: Create Supabase Database (3 min)

1. Go to https://supabase.com/ → **"New Project"**
2. **Name:** safiri-afya | **Region:** Southeast Asia (Singapore) or EU West (Ireland)
3. Generate strong **database password** (save it!)
4. Go to **Settings → Database** → Copy TWO connection strings:
   - **Session mode (port 6543):** Add `?pgbouncer=true` → Save as `DATABASE_URL`
   - **Transaction mode (port 5432):** Save as `DIRECT_URL`

### Step 2: Deploy on Vercel (5 min)

1. Go to https://vercel.com/new → **"Import Git Repository"**
2. Select `Langat1999/safiri-afya-ui` → **Deploy**
3. Go to **Settings → Environment Variables** and add all variables from [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

**Key Variables:**
```bash
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@...pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxxx:[PASSWORD]@...pooler.supabase.com:5432/postgres
NODE_ENV=production
JWT_SECRET=your-64-char-secret
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://YOUR-VERCEL-DOMAIN.vercel.app/api/payments/mpesa/callback
MPESA_RESULT_URL=https://YOUR-VERCEL-DOMAIN.vercel.app/api/payments/mpesa/result
ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN.vercel.app
APP_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
```

4. **Deployments → Redeploy**

### Step 3: Seed Database (2 min)

```bash
# Local terminal
cd backend
DIRECT_URL="your-supabase-direct-url" npm run seed
```

Adds: 8 clinics + 10 doctors + admin (admin@safiriafya.com / Admin@123456)

### Step 4: Test Your Deployment

```bash
# Test backend
curl https://YOUR-VERCEL-DOMAIN.vercel.app/api/health

# Open frontend
# Visit: https://YOUR-VERCEL-DOMAIN.vercel.app
```

**Done! 🎉** Your healthcare platform is live!

📖 **Full Guide:** [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Complete setup with troubleshooting

---

## 📋 Features

- **AI Symptom Checker** - Bilingual (English/Swahili)
- **Clinic Locator** - Interactive map, nearby search
- **Appointment Booking** - Book doctors instantly
- **M-Pesa Payments** - Secure STK Push integration
- **Admin Dashboard** - Manage bookings, users, revenue
- **Health News** - Curated from WHO, Medical News Today
- **User Profiles** - Appointments, payments, settings

---

## 🛠️ Tech Stack

**Frontend:** React 18 + TypeScript + Vite + Tailwind + shadcn/ui
**Backend:** Node.js 18 + Express 5 + Vercel Serverless
**Database:** Supabase PostgreSQL (free tier: 500MB)
**Services:** M-Pesa Daraja, SendGrid, OpenRouter AI
**Deploy:** **Vercel** (Frontend + Backend) + **Supabase** (Database) - **100% FREE!**

---

## 💻 Local Development

```bash
# Clone
git clone https://github.com/Langat1999/safiri-afya-ui.git
cd safiri-afya-ui

# Install
npm install
cd backend && npm install

# Configure
cp .env.example .env
cp backend/.env.example backend/.env
# Edit both .env files:
# - .env: VITE_API_URL=http://localhost:3001/api
# - backend/.env: Add your Supabase connection strings

# Setup DB
cd backend
npx prisma migrate dev
npm run seed

# Run (open 2 terminals)
# Terminal 1 - Frontend:
npm run dev          # http://localhost:8080

# Terminal 2 - Backend:
npm run backend:dev  # http://localhost:3001
```

---

## 🗄️ API Endpoints (42+)

- `/api/auth/*` - Authentication (8)
- `/api/clinics/*` - Clinics (4)
- `/api/doctors/*` - Doctors (3)
- `/api/appointments/*` - Appointments (5)
- `/api/symptoms/*` - Symptom checker (2)
- `/api/payments/*` - M-Pesa payments (4)
- `/api/admin/*` - Admin dashboard (15+)
- `/api/health` - Health check

**Frontend Routes:** All non-API routes serve the React SPA
**Backend Routes:** All `/api/*` routes go to Express backend

---

## 🔐 Environment Variables

### Production (Vercel Dashboard)
All variables must be added in Vercel Dashboard → Settings → Environment Variables

**Required:**
```bash
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
NODE_ENV=production
PORT=3001
JWT_SECRET=64-char-secret
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://YOUR-DOMAIN.vercel.app/api/payments/mpesa/callback
MPESA_RESULT_URL=https://YOUR-DOMAIN.vercel.app/api/payments/mpesa/result
ALLOWED_ORIGINS=https://YOUR-DOMAIN.vercel.app
APP_URL=https://YOUR-DOMAIN.vercel.app
```

**Optional (Recommended):**
```bash
OPENROUTER_API_KEY=...      # AI symptom checker
GUARDIAN_API_KEY=...        # Health news
SENDGRID_API_KEY=...        # Email service
FROM_EMAIL=noreply@safiriafya.com
DEVELOPER_MPESA_NUMBER=254XXXXXXXXX
DEVELOPER_COMMISSION_PERCENTAGE=15
```

### Local Development
Create `.env` in project root:
```bash
VITE_API_URL=http://localhost:3001/api
```

Backend already has `backend/.env` with all required variables.

---

## 📚 Project Structure

```
safiri-afya-ui/
├── src/                    # Frontend React app
├── backend/                # Backend Node.js API
│   ├── src/
│   │   ├── server.js      # Main API entry (deployed to Vercel)
│   │   ├── middleware/    # Auth, validation
│   │   ├── services/      # M-Pesa, email
│   │   └── prismadb.js    # Database client
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/    # Database migrations
│   └── package.json
├── dist/                   # Frontend build output (deployed to Vercel)
├── vercel.json            # Vercel configuration
└── package.json           # Frontend dependencies
```

---

## 🚀 Deployment

### Automatic (Recommended)
Push to `main` branch → Vercel auto-deploys

### Manual
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🔧 Configuration Files

### vercel.json
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

Routes:
- `/api/*` → Backend serverless functions
- Everything else → Frontend React SPA

### .env.production
```bash
VITE_API_URL=/api  # Relative path (same domain)
```

---

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Test backend API
npm run backend:dev
curl http://localhost:3001/api/health

# Test database connection
curl http://localhost:3001/api/clinics
```

---

## 📊 Database Schema

**11 Models:**
- User - Authentication & profiles
- Clinic - Healthcare facilities
- Doctor - Medical professionals
- Appointment - Bookings
- Booking - Confirmed visits
- Payment - M-Pesa transactions
- SymptomHistory - AI analysis logs
- PasswordReset - Reset tokens
- AdminLog - Audit trail
- SystemSetting - App configuration

**See:** [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

---

## 🛠️ Troubleshooting

### API returns 404
- Ensure environment variables are set in Vercel
- Check deployment logs for errors
- Verify `vercel.json` routes configuration

### CORS errors
- Add your Vercel domain to `ALLOWED_ORIGINS`
- Redeploy after updating environment variables

### Database connection errors
- Verify `DATABASE_URL` and `DIRECT_URL` in Vercel
- Check Supabase dashboard for connection string format
- Ensure password is URL-encoded (# → %23)

### Build fails
- Check Vercel build logs
- Verify `package.json` scripts are correct
- Ensure Prisma client generation succeeds

**Full troubleshooting guide:** [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

---

## 💰 Cost (Free Tier)

| Service | Free Tier | Monthly Limit |
|---------|-----------|---------------|
| **Vercel** | 100GB bandwidth | Unlimited requests |
| **Supabase** | 500MB database | 2GB bandwidth |
| **Total** | **$0/month** | Supports 10K-50K users |

---

## 📈 Performance

- **Frontend:** Global CDN (Vercel Edge)
- **Backend:** Serverless functions (auto-scaling)
- **Database:** Connection pooling (pgbouncer)
- **API Response:** < 200ms (same-origin requests)

---

## 🔒 Security

- JWT authentication (7-day expiry)
- Password hashing (bcrypt)
- CORS protection
- Input validation (Zod)
- SQL injection prevention (Prisma ORM)
- Environment variable secrets
- HTTPS enforced (Vercel)

---

## 📖 Documentation

- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Complete deployment guide
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma) - Database schema
- [vercel.json](vercel.json) - Deployment configuration

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🆘 Support

- **Issues:** https://github.com/Langat1999/safiri-afya-ui/issues
- **Email:** info@safiriafya.com
- **Docs:** [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

---

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] M-Pesa switched to production mode
- [ ] Custom domain configured (optional)
- [ ] Database backed up
- [ ] SSL/HTTPS enabled (automatic)
- [ ] Error tracking configured (Sentry)
- [ ] Test all features end-to-end
- [ ] Update M-Pesa callback URLs in Safaricom portal

---

**Built with ❤️ for Kenya 🇰🇪**

Empowering healthcare access through technology.

