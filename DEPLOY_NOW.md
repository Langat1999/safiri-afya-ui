# 🚀 AUTOMATED DEPLOYMENT INSTRUCTIONS

Everything is configured and ready! Follow these simple steps to deploy.

---

## ✅ What's Been Automated

- ✅ **Database seed script** created with 8 clinics + 10 doctors
- ✅ **Backend .env** configured with your database
- ✅ **Frontend .env.production** configured
- ✅ **render.yaml** updated to Oregon region (matches your database)
- ✅ All changes committed and pushed to GitHub

---

## 🎯 DEPLOY IN 3 STEPS

### **STEP 1: Deploy Backend with Blueprint (5 minutes)**

1. Go to: **https://dashboard.render.com/**
2. Click **"New +"** → **"Blueprint"**
3. Select repository: `Langat1999/safiri-afya-ui`
4. Click **"Connect"**
5. Click **"Apply"**

Render will create:
- ✅ Web service: `safiri-afya-api`
- ✅ Auto-link to your existing database

### **STEP 2: Add Environment Variables (2 minutes)**

After Blueprint completes, go to `safiri-afya-api` service → **Environment** tab.

Add these variables (copy-paste):

```bash
MPESA_CONSUMER_KEY=PAW87o1bIJEU3hAyhauUAXuZnwpDNANnLS7vFrA9UUGZXmSR
MPESA_CONSUMER_SECRET=mmDn4f8Hy0hnHvzUXxGnJ8uUoKuB10yL8pP5uQj4KTGWwDmF7zD4ttPShaUheoJc
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_SHORTCODE=174379
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://safiri-afya-api.onrender.com/api/payments/mpesa/callback
MPESA_RESULT_URL=https://safiri-afya-api.onrender.com/api/payments/mpesa/result
DEVELOPER_MPESA_NUMBER=254713809220
DEVELOPER_COMMISSION_PERCENTAGE=15
OPENROUTER_API_KEY=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
GUARDIAN_API_KEY=7dbc521f-3149-4416-b103-de0ff728e4ce
FROM_EMAIL=noreply@safiriafya.com
ALLOWED_ORIGINS=https://69197ed441d3be0b8425131f--afyakaribukenya.netlify.app
```

Click **"Save Changes"**

### **STEP 3: Populate Database (1 minute)**

Once backend is deployed and healthy:

1. Go to your web service → **Shell** tab
2. Run these commands:
   ```bash
   cd backend
   npm run seed
   ```

This will add:
- ✅ 8 major clinics in Nairobi
- ✅ 10 doctors across specialties
- ✅ 1 admin user (admin@safiriafya.com / Admin@123456)

---

## 🎉 That's It!

Your backend will be live at: **https://safiri-afya-api.onrender.com**

---

## 🔍 Verify Deployment

### **Test Health Endpoint:**
```
https://safiri-afya-api.onrender.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "message": "Safiri Afya Backend API is running",
  "timestamp": "..."
}
```

### **Test Clinics API:**
```
https://safiri-afya-api.onrender.com/api/clinics
```

Should return 8 clinics!

---

## 🌐 Connect Frontend (Already Done!)

Your Netlify site: **https://69197ed441d3be0b8425131f--afyakaribukenya.netlify.app**

Just update environment variable on Netlify:

1. Go to Netlify Dashboard → Your site → **Environment variables**
2. Add/Update:
   ```
   VITE_API_URL=https://safiri-afya-api.onrender.com/api
   ```
3. **Trigger deploy** → **Clear cache and deploy**

---

## 📊 What's Seeded in Database

### **8 Clinics:**
1. Nairobi Women's Hospital - Hurlingham
2. Aga Khan University Hospital
3. Kenyatta National Hospital
4. MP Shah Hospital
5. Mater Hospital
6. Avenue Healthcare
7. Bliss Healthcare
8. Gertrude's Children's Hospital

### **10 Doctors:**
1. Dr. James Mwangi - General Practitioner
2. Dr. Mary Wanjiru - Pediatrician
3. Dr. Ahmed Hassan - Cardiologist
4. Dr. Grace Achieng - OB/GYN
5. Dr. Peter Kamau - Orthopedic Surgeon
6. Dr. Sarah Njeri - Dermatologist
7. Dr. Daniel Ochieng - Dentist
8. Dr. Lucy Wambui - Psychiatrist
9. Dr. John Kiplagat - Ophthalmologist
10. Dr. Faith Wangari - General Practitioner

### **1 Admin User:**
- Email: `admin@safiriafya.com`
- Password: `Admin@123456`
- Role: SUPER_ADMIN

---

## 🎯 Your Deployment Checklist

- [ ] Step 1: Create Blueprint on Render ✓
- [ ] Step 2: Add environment variables ✓
- [ ] Step 3: Run seed script ✓
- [ ] Verify health endpoint works ✓
- [ ] Verify clinics API returns data ✓
- [ ] Update Netlify environment variables ✓
- [ ] Test frontend-backend integration ✓
- [ ] Login as admin and explore dashboard ✓

---

## 🚨 If Something Fails

### **Build fails:**
- Check Render logs for specific error
- Verify DATABASE_URL is set correctly

### **Deployment times out:**
- Increase health check grace period to 300 seconds
- Check if migrations are taking too long

### **Seed script fails:**
- Make sure migrations ran first
- Check database connection
- Try running seed again (it clears data first)

### **Frontend can't connect:**
- Verify ALLOWED_ORIGINS includes your Netlify URL
- Check CORS errors in browser console
- Update VITE_API_URL on Netlify

---

## 📞 Need Help?

Check these guides:
- [RENDER_BACKEND_DEPLOYMENT.md](RENDER_BACKEND_DEPLOYMENT.md) - Detailed deployment guide
- [NEXT_STEPS.md](NEXT_STEPS.md) - What to do after deployment
- [DOCUMENTATION/](DOCUMENTATION/) - All technical docs

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ **Backend API** running on Render
- ✅ **PostgreSQL Database** with real data
- ✅ **8 clinics** users can browse
- ✅ **10 doctors** available for booking
- ✅ **Admin dashboard** ready to use
- ✅ **M-Pesa payments** configured (sandbox)
- ✅ **AI symptom checker** working
- ✅ **Frontend** connected to backend

**Your healthcare platform is LIVE!** 🚀

---

**Time to complete:** 10-15 minutes total

**Questions?** Check the troubleshooting section above or review the deployment logs.

**Ready to launch?** Start with Step 1! 👆
