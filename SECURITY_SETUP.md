# Security Setup Guide - Safiri Afya

## CRITICAL: Complete These Steps Immediately

This guide will help you secure your application by rotating credentials and properly configuring environment variables.

---

## Step 1: Rotate Database Credentials (Supabase)

1. Login to Supabase Dashboard: https://app.supabase.com/
2. Select your project: vixtrsbooqqxidqzpxza
3. Navigate to: Settings → Database
4. Click "Reset database password"
5. Copy the new password
6. Get new connection strings from Settings → Database → Connection String

You need TWO URLs:
- Session Pooler (port 6543) with ?pgbouncer=true
- Transaction Pooler (port 5432) for migrations

---

## Step 2: Generate New JWT Secret

Your new JWT Secret has been generated:

ca38f5861535635ec316bb737b650e61d360f9ce80ff44b885e56011bc9cbb7360c8b980cf45b992a3dce5be19b710b232b0927365e47b670e251734fcc7510b

---

## Step 3: Get Production M-Pesa Credentials

Current Status: Using Sandbox Credentials (testing only)

For production:
1. Go to: https://developer.safaricom.co.ke/
2. Create account and apply for production access
3. Get your production credentials:
   - Consumer Key
   - Consumer Secret
   - Business Shortcode
   - Passkey

---

## Step 4: Get SendGrid API Key

1. Sign up: https://signup.sendgrid.com/
2. Create API Key: Settings → API Keys
3. Name: "Safiri Afya Production"
4. Copy the key (starts with SG.)
5. Verify sender email: noreply@safiriafya.com

---

## Step 5: Configure Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project: safiri-afya-ui
3. Click: Settings → Environment Variables
4. Add ALL variables listed in backend/.env.example
5. Replace placeholders with your actual credentials

Critical variables:
- DATABASE_URL (with NEW password)
- DIRECT_URL (with NEW password)
- JWT_SECRET (use the new one above)
- SENDGRID_API_KEY
- MPESA credentials (production or sandbox)

---

## Step 6: Update Local .env Files

Frontend:
cp .env.example .env

Backend:
cp backend/.env.example backend/.env

Then edit both files with your credentials.

---

## Step 7: Test Everything

Local test:
1. cd backend && npm start
2. npm run dev (in another terminal)
3. Visit http://localhost:5173
4. Test login with: admin@safiriafya.com / Admin@123456

Deploy:
1. git add .
2. git commit -m "Add .env.example templates"
3. git push
4. Test production URL

---

## Security Checklist

- [x] .env files in .gitignore
- [x] .env files NOT tracked by git
- [x] New JWT_SECRET generated
- [ ] Database password rotated
- [ ] SendGrid API key configured
- [ ] Production M-Pesa credentials (or keep sandbox)
- [ ] All variables in Vercel dashboard
- [x] .env.example templates created

---

Status: Ready for secure deployment!
