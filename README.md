# Safiri Afya (Afya Karibu Kenya)

**AI-Powered Healthcare Platform for Kenya**

Full-stack healthcare platform connecting Kenyans to quality medical services. Features AI symptom checking (English + Swahili), clinic locator, appointment booking, and M-Pesa payments.

---

## 🚀 Quick Deploy (15 Minutes) - 100% FREE!

### Prerequisites
- GitHub account
- [Supabase account](https://supabase.com/) (free tier: 500MB database)
- [Vercel account](https://vercel.com/) (free tier: 100GB bandwidth)
- M-Pesa sandbox credentials from [Safaricom](https://developer.safaricom.co.ke/)

### Step 1: Create Supabase Database (3 min)

1. Go to https://supabase.com/ → **"New Project"**
2. **Name:** safiri-afya | **Region:** Southeast Asia (Singapore)
3. Generate strong **database password** (save it!)
4. Go to **Settings → Database** → Copy TWO connection strings:
   - **Session mode (port 6543):** Add `?pgbouncer=true` → Save as `DATABASE_URL`
   - **Transaction mode (port 5432):** Save as `DIRECT_URL`

### Step 2: Deploy Backend on Vercel (7 min)

1. Go to https://vercel.com/new → **"Import Git Repository"**
2. Select `Langat1999/safiri-afya-ui` → **Deploy**
3. Go to **Settings → Environment Variables** and add:

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
ALLOWED_ORIGINS=https://your-netlify-url.netlify.app
```

4. Copy your Vercel domain from **Settings → Domains**
5. Update `MPESA_CALLBACK_URL` with your Vercel domain
6. **Deployments → Redeploy**

### Step 3: Seed Database (2 min)

```bash
# Local terminal
cd backend
DIRECT_URL="your-supabase-direct-url" npm run seed
```

Adds: 8 clinics + 10 doctors + admin (admin@safiriafya.com / Admin@123456)

### Step 4: Connect Frontend (2 min)

Netlify → **Environment variables:**
```bash
VITE_API_URL=https://YOUR-VERCEL-DOMAIN.vercel.app/api
```

**Trigger deploy** → Done! 🎉

📖 **Full Guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete setup with troubleshooting

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
**Deploy:** Supabase (DB) + Vercel (API) + Netlify (Frontend) - **100% FREE!**

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
# Edit both .env files

# Setup DB
cd backend
npx prisma migrate dev
npm run seed

# Run
npm run dev          # Frontend: http://localhost:5173
cd backend && npm run dev  # Backend: http://localhost:3001
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

---

## 🔐 Environment Variables

### Backend Required
```bash
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=3001
JWT_SECRET=64-char-secret
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://...
ALLOWED_ORIGINS=https://...
```

### Frontend
```bash
VITE_API_URL=https://your-vercel-domain.vercel.app/api
```

---

## 📁 Project Structure

```
├── src/              # React frontend
├── backend/          # Node.js backend
│   ├── src/
│   │   ├── server.js      # 42+ API endpoints
│   │   ├── seed.js        # Database seeding
│   │   ├── middleware/    # Auth, validation
│   │   └── services/      # M-Pesa, email
│   └── prisma/
│       ├── schema.prisma  # Database schema (Supabase PostgreSQL)
│       └── migrations/    # DB migrations
├── vercel.json       # Vercel serverless config
├── DEPLOYMENT_GUIDE.md  # Complete deployment guide
└── package.json      # Dependencies
```

---

## 🚢 Deployment (100% FREE Tiers!)

**Supabase (Database):**
- Free: 500MB PostgreSQL database
- 2GB bandwidth/month
- Connection pooling (pgbouncer)
- Get connection strings: Settings → Database
- Upgrade: $25/month for backups

**Vercel (Backend API):**
- Free: 100GB bandwidth/month
- Serverless Functions (10s timeout)
- Auto-deploy from GitHub
- Environment variables via dashboard
- Build: `npm install && npm run build`
- Upgrade: $20/month for 60s timeout

**Netlify (Frontend):**
- Free: 100GB bandwidth/month
- Auto-deploy from GitHub
- Build: `npm run build`
- Publish: `dist/`
- Configure: `VITE_API_URL` environment variable

**Total Cost:** **FREE** for 10,000-50,000 monthly users!

**Full Guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Step-by-step with troubleshooting

---

## 📊 Database

**13 Models:** User, Clinic, Doctor, Appointment, Booking, Payment, SymptomHistory, PasswordReset, AdminLog, SystemSetting, etc.

**Seed Data:**
- 8 Nairobi clinics (Aga Khan, Kenyatta, Mater, etc.)
- 10 doctors (GP, Pediatrics, Cardiology, etc.)
- 1 admin user

---

## 🔒 Security

- JWT authentication (7-day expiry)
- bcrypt password hashing
- Rate limiting (5-100 req/15min)
- CORS whitelist
- Input validation (Zod)
- Prisma ORM (SQL injection prevention)

---

## 🎯 Roadmap

**Phase 1 (Done ✅):**
Authentication, AI symptom checker, clinic locator, booking, M-Pesa, admin dashboard

**Phase 2 (Next 3mo):**
Mobile apps, telemedicine, pharmacy, NHIF insurance, notifications

**Phase 3 (6-12mo):**
Health records, lab tests, prescriptions, regional expansion

---

## 🤝 Contributing

1. Fork repo
2. Create feature branch
3. Commit changes
4. Push and open PR

---

## 📝 License

MIT License

---

## 📞 Support

- GitHub Issues
- Email: info@safiriafya.com

---

**Made with ❤️ in Kenya**

🚀 Deploy now: https://dashboard.render.com/
