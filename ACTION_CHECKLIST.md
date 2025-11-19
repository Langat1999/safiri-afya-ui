# 🔐 Security Action Checklist

## ✅ Completed (Just Now)

- [x] Created `.env.example` templates for frontend and backend
- [x] Generated new JWT_SECRET (128 characters, cryptographically secure)
- [x] Updated local `backend/.env` with new JWT_SECRET
- [x] Verified `.env` files are in `.gitignore` (they are!)
- [x] Verified `.env` files are NOT tracked by git (confirmed!)
- [x] Created comprehensive security documentation

## ⚠️ ACTION REQUIRED (Do These Next)

### 1. Get SendGrid API Key (15 minutes)
- [ ] Sign up at https://signup.sendgrid.com/
- [ ] Create API key: Settings → API Keys → Create
- [ ] Copy the key (starts with `SG.`)
- [ ] Add to `backend/.env`: `SENDGRID_API_KEY=SG.your_key`
- [ ] Verify sender email: noreply@safiriafya.com

### 2. Rotate Supabase Database Password (10 minutes)
- [ ] Login to https://app.supabase.com/
- [ ] Go to: Settings → Database
- [ ] Click "Reset database password"
- [ ] Copy new password
- [ ] Update `backend/.env` DATABASE_URL with new password
- [ ] Update `backend/.env` DIRECT_URL with new password

### 3. Configure Vercel Environment Variables (20 minutes)
- [ ] Open https://vercel.com/dashboard
- [ ] Select your project
- [ ] Go to: Settings → Environment Variables
- [ ] Copy all variables from `VERCEL_ENV_SETUP.txt`
- [ ] Replace placeholders:
  - NEW_PASSWORD → Your new Supabase password
  - SG.YOUR_KEY_HERE → Your SendGrid API key
  - your-app.vercel.app → Your actual domain
- [ ] Save all variables

### 4. Test & Deploy (10 minutes)
- [ ] Test locally:
  ```bash
  cd backend && npm start
  # In new terminal:
  npm run dev
  ```
- [ ] Visit http://localhost:5173 and test login
- [ ] Commit and push:
  ```bash
  git add .
  git commit -m "Add .env.example templates and security docs"
  git push
  ```
- [ ] Wait for Vercel deployment
- [ ] Test production site

## 📋 Optional (But Recommended)

### 5. Get Production M-Pesa Credentials
- [ ] Apply at https://developer.safaricom.co.ke/
- [ ] Complete business verification
- [ ] Get production credentials
- [ ] Update Vercel env vars for production environment only
- [ ] Keep sandbox for development/preview

### 6. Change Admin Password
- [ ] Login to admin panel
- [ ] Change password from default `Admin@123456`
- [ ] Use strong password (12+ characters)

### 7. Set Up Monitoring
- [ ] Add Vercel Analytics (free)
- [ ] Consider Sentry for error tracking
- [ ] Set up uptime monitoring

## 📂 Files Created

1. `.env.example` - Frontend environment template
2. `backend/.env.example` - Backend environment template
3. `SECURITY_SETUP.md` - Detailed security guide
4. `VERCEL_ENV_SETUP.txt` - Quick reference for Vercel
5. `ACTION_CHECKLIST.md` - This file

## 🎯 Priority Order

**Do TODAY:**
1. ✅ Get SendGrid API key (emails won't work without this)
2. ✅ Rotate database password (security critical)
3. ✅ Add all env vars to Vercel
4. ✅ Test and deploy

**Do THIS WEEK:**
- Get production M-Pesa credentials
- Change admin password
- Set up monitoring

## ⚡ Quick Commands

Generate new JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Check what's tracked by git:
```bash
git status --short
```

Test backend:
```bash
cd backend && npm start
```

Deploy:
```bash
git add . && git commit -m "Security updates" && git push
```

---

**Current Status:** Local environment secured ✅
**Next Step:** Add credentials to Vercel dashboard
**Est. Time:** 30-45 minutes total

See `SECURITY_SETUP.md` for detailed instructions.
