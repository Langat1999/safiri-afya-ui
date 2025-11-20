# Safiri Afya - Project Pitch Deck

**Making Healthcare Accessible in Kenya, One Step at a Time**

---

## 🎯 Executive Summary

**Safiri Afya** (Healthcare Journey) is an AI-powered healthcare platform that bridges the gap between Kenyan patients and quality medical services. By combining artificial intelligence, mobile money integration, and real-time healthcare facility mapping, we're making healthcare accessible, affordable, and intelligent for 54 million Kenyans.

**Live Platform:** https://safiriafya.netlify.app

---

## 📊 The Problem

### Healthcare Access Crisis in Kenya

1. **Limited Access to Healthcare Facilities**
   - 47% of Kenyans live more than 5km from the nearest health facility
   - Rural areas severely underserved
   - Long waiting times at public hospitals

2. **Information Gap**
   - Limited medical information in Swahili (national language)
   - Patients unsure when symptoms require medical attention
   - No centralized platform to find healthcare facilities

3. **Financial Barriers**
   - High out-of-pocket healthcare costs
   - Limited health insurance coverage (only 20% insured)
   - Cash-based payment systems in rural areas

4. **Inefficient Booking Systems**
   - No centralized appointment booking
   - Long queues at healthcare facilities
   - Manual booking processes

### Market Statistics

- **Population:** 54 million (2024)
- **Smartphone Penetration:** 60% (~32 million users)
- **M-Pesa Users:** 30+ million (mobile money)
- **Internet Penetration:** 87%
- **Healthcare Spending:** KES 450 billion/year (~$3.5 billion)
- **Private Clinics:** 5,000+ facilities
- **Out-of-Pocket Spending:** 32% of total health expenditure

---

## 💡 The Solution

### Safiri Afya: Your Digital Healthcare Companion

A comprehensive platform that provides:

#### 1. AI-Powered Symptom Checker (Bilingual)
- **English & Swahili support** for 54M Kenyans
- **Real-time AI analysis** using OpenRouter (Mistral 7B)
- **Risk classification:** Low, Medium, High urgency
- **Age & gender-specific** recommendations
- **Emergency detection** with immediate action prompts
- **24/7 availability** - healthcare advice anytime, anywhere

#### 2. Interactive Clinic Locator
- **500+ healthcare facilities** across Kenya
- **Real-time mapping** via OpenStreetMap
- **Geolocation-based search** - find nearest facilities
- **Distance calculation** and directions
- **Facility details:** Hours, services, phone, fees
- **Google Maps integration** for navigation

#### 3. Doctor Appointment Booking
- **10+ registered doctors** across specialties
- **Online scheduling** - book instantly
- **Availability tracking** - real-time slots
- **Email notifications** - automatic confirmations
- **Specialty search** - find the right doctor

#### 4. M-Pesa Payment Integration
- **STK Push technology** - seamless payments
- **KES 1,000 - 3,000** consultation fees
- **Instant confirmation** - no waiting
- **Revenue splitting:** 85% facility, 15% platform
- **30M+ M-Pesa users** can pay instantly

#### 5. Health News & Information
- **Curated content** from WHO, Medical News Today, Healthline
- **Trusted sources** - verified health information
- **Bilingual interface** - accessible to all

---

## 🎯 How It Works

### User Journey

```
1. ASSESS SYMPTOMS
   └─> User describes symptoms in English or Swahili
   └─> AI analyzes and provides risk assessment
   └─> Recommendations: Home care, See doctor, or Emergency

2. FIND FACILITY
   └─> Use current location or search by area
   └─> View 500+ facilities on interactive map
   └─> Filter by type: Hospital, Clinic, Pharmacy
   └─> Get directions via Google Maps

3. BOOK APPOINTMENT
   └─> Select clinic or doctor
   └─> Choose date and time slot
   └─> Enter patient details

4. PAY VIA M-PESA
   └─> Initiate payment (KES 1,000)
   └─> Receive STK Push on phone
   └─> Enter M-Pesa PIN
   └─> Instant confirmation

5. ATTEND CONSULTATION
   └─> Visit facility at scheduled time
   └─> Show booking confirmation
   └─> Receive medical attention
```

### For Healthcare Providers

```
1. REGISTER FACILITY
   └─> Admin adds clinic to platform
   └─> Set consultation fees
   └─> Add services offered

2. RECEIVE BOOKINGS
   └─> Patients book online 24/7
   └─> Automatic notifications
   └─> Payment pre-collected

3. EARN REVENUE
   └─> Receive 85% of consultation fees
   └─> Platform handles payments
   └─> Automatic reconciliation
```

---

## 🚀 Technology Stack

### Modern, Scalable Architecture

**Frontend (Netlify)**
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS + shadcn/ui
- 100GB free CDN bandwidth

**Backend (Vercel)**
- Node.js + Express
- Serverless functions
- Auto-scaling
- 100GB free bandwidth

**Database (Supabase)**
- PostgreSQL 15
- 500MB free tier
- Connection pooling
- Real-time capabilities

**External Integrations**
- M-Pesa Daraja API (Safaricom)
- OpenRouter AI (Mistral 7B)
- SendGrid (Email)
- OpenStreetMap (Mapping)

### Why This Stack?

✅ **100% Free Tier** - $0/month operational cost
✅ **Serverless** - Auto-scales with demand
✅ **Fast** - Global CDN, <200ms API response
✅ **Secure** - HTTPS, JWT auth, encrypted data
✅ **Reliable** - 99.9% uptime SLA

---

## 📈 Market Opportunity

### Target Market

**Primary Users** (TAM: 15-20 million)
1. **Urban Kenyans** (40% of population)
   - 21.6 million people in cities
   - High smartphone penetration (80%)
   - Active M-Pesa users
   - Seeking convenient healthcare

2. **Middle-Class Families** (8 million households)
   - Willing to pay for quality healthcare
   - Value time and convenience
   - Tech-savvy

3. **Young Professionals** (18-35 years)
   - 35% of population (~19 million)
   - High internet usage
   - Health-conscious
   - Early adopters of digital services

**Secondary Users**
- Rural population with smartphone access
- Healthcare facilities seeking online presence
- Insurance companies (future partnership)

### Market Size

| Segment | Size | Conversion Rate | Revenue Potential |
|---------|------|-----------------|-------------------|
| **Total Addressable Market (TAM)** | 32M smartphone users | - | - |
| **Serviceable Available Market (SAM)** | 15M urban + middle class | - | - |
| **Serviceable Obtainable Market (SOM)** | 500K users (Year 1) | 3.3% | KES 75M ($580K) |
| **Year 2 Target** | 2M users | 13% | KES 300M ($2.3M) |
| **Year 3 Target** | 5M users | 33% | KES 750M ($5.8M) |

**Assumptions:**
- Average 2 consultations/user/year
- KES 1,000 average consultation fee
- 15% platform commission
- KES 300 revenue/user/year

---

## 💰 Business Model

### Revenue Streams

#### 1. Consultation Booking Fees (Primary)
- **15% commission** on all bookings
- **Example:** KES 1,000 consultation
  - Facility receives: KES 850
  - Platform earns: KES 150
- **Projected:** KES 75M Year 1 (500K users × 2 visits × KES 150)

#### 2. Premium Features (Future)
- **Telemedicine:** Video consultations (KES 500/session)
- **Health Records:** Digital storage (KES 200/month subscription)
- **Priority Booking:** Jump the queue (KES 100/booking)
- **Family Accounts:** Multi-user plans (KES 500/month)

#### 3. Healthcare Provider Subscriptions (Future)
- **Basic Listing:** Free
- **Featured Listing:** KES 5,000/month (top search results)
- **Premium Profile:** KES 10,000/month (analytics, marketing tools)
- **Enterprise:** KES 50,000/month (hospital networks)

#### 4. Insurance Partnerships (Future)
- **Referral Fees:** KES 500 per insurance policy sold
- **Data Analytics:** Anonymized health trends to insurers
- **Corporate Wellness:** B2B packages

#### 5. Pharmaceutical Partnerships (Future)
- **Prescription Delivery:** Commission on medicine orders
- **Pharmacy Network:** Partner with licensed pharmacies

### Unit Economics

**Per User (Year 1):**
- Acquisition Cost (CAC): KES 200 (digital marketing)
- Annual Revenue: KES 300 (2 visits × KES 150)
- Gross Margin: 90% (software business)
- Net Revenue: KES 270
- **Payback Period:** <1 month
- **LTV:CAC Ratio:** 4.5:1 (excellent)

---

## 🎯 Go-To-Market Strategy

### Phase 1: Launch & Validate (Months 1-6)

**Target:** 10,000 users | 50 clinics | KES 1.5M revenue

**Tactics:**
1. **Social Media Marketing**
   - Facebook, Instagram, Twitter, TikTok
   - Health tips in English & Swahili
   - Influencer partnerships
   - Budget: KES 500K

2. **Healthcare Provider Outreach**
   - Direct sales to private clinics
   - Partnership with 50 clinics (Nairobi, Mombasa, Kisumu)
   - Free onboarding + training

3. **PR & Media**
   - Tech blogs (TechCabal, Disrupt Africa)
   - Health podcasts
   - Local TV interviews

4. **Community Engagement**
   - Free health camps
   - University partnerships
   - Corporate wellness talks

### Phase 2: Scale (Months 7-12)

**Target:** 100,000 users | 200 clinics | KES 15M revenue

**Tactics:**
1. **Referral Program**
   - KES 100 credit for each referral
   - Viral growth loop

2. **County Expansion**
   - All 47 counties in Kenya
   - Local language support (Kikuyu, Luo, Kalenjin)

3. **Partnerships**
   - M-Pesa in-app promotion
   - Safaricom partnership
   - Insurance companies

4. **Content Marketing**
   - Health blog (SEO)
   - YouTube channel
   - Weekly health newsletter

### Phase 3: Dominate (Year 2-3)

**Target:** 500K-2M users | 1,000+ clinics

**Tactics:**
1. **TV & Radio**
   - National advertising campaigns
   - Radio jingles in multiple languages

2. **B2B Sales**
   - Corporate packages (employee healthcare)
   - School health programs
   - Government partnerships

3. **Product Expansion**
   - Mobile apps (iOS & Android)
   - Telemedicine launch
   - Lab test booking
   - Pharmacy delivery

---

## 📊 Traction & Milestones

### Current Status (MVP Launched)

✅ **Platform Live:** https://safiriafya.netlify.app
✅ **Backend API:** https://safiri-afya.vercel.app
✅ **Healthcare Facilities:** 8 onboarded (with online booking)
✅ **Doctors Registered:** 10 across specialties
✅ **AI Symptom Analyses:** 100+ completed
✅ **M-Pesa Integration:** Fully functional (sandbox)
✅ **Technology Stack:** Production-ready, 100% free tier
✅ **Mobile Responsive:** Works on all devices
✅ **Languages:** English & Swahili

### Achievements

- 🏆 **Production Deployment:** Live and accessible
- 🏆 **Zero Infrastructure Cost:** Leveraging free tiers
- 🏆 **Bilingual Platform:** English & Swahili support
- 🏆 **500+ Facilities:** OpenStreetMap integration
- 🏆 **AI Integration:** OpenRouter symptom analysis
- 🏆 **Payment Ready:** M-Pesa STK Push working

### Roadmap

#### Q1 2025
- [ ] Beta launch with 50 clinics
- [ ] Acquire 10,000 users
- [ ] Generate KES 1.5M revenue
- [ ] Launch mobile app beta (React Native)
- [ ] Onboard 5 insurance providers

#### Q2 2025
- [ ] Telemedicine MVP (video consultations)
- [ ] 100,000 registered users
- [ ] 200 healthcare facilities
- [ ] KES 15M revenue
- [ ] Expand to Mombasa & Kisumu

#### Q3 2025
- [ ] Mobile apps launch (iOS & Android)
- [ ] Wearable device integration
- [ ] Lab test booking feature
- [ ] 500,000 users
- [ ] KES 75M revenue

#### Q4 2025
- [ ] Pharmacy delivery integration
- [ ] 1,000+ healthcare facilities
- [ ] 2M users
- [ ] KES 300M revenue
- [ ] Expansion to Uganda & Tanzania

---

## 👥 Team

### Core Team (Required)

**Founder & CEO**
- Healthcare tech vision
- Business development
- Fundraising
- Stakeholder management

**CTO / Lead Developer**
- Full-stack development (React, Node.js)
- System architecture
- DevOps & deployment
- AI integration

**Head of Partnerships**
- Healthcare provider onboarding
- Insurance partnerships
- Government relations
- M-Pesa/Safaricom partnerships

**Marketing Manager**
- Digital marketing campaigns
- Social media management
- Content creation
- Community building

### Advisory Board (Needed)

- **Medical Advisor:** Licensed doctor (regulatory compliance)
- **Tech Advisor:** Healthcare tech expert
- **Business Advisor:** Kenyan startup ecosystem expert
- **Legal Advisor:** Healthcare law & data privacy

---

## 🏆 Competitive Advantage

### Why Safiri Afya Will Win

#### 1. **First-Mover Advantage**
- No comprehensive healthcare platform in Kenya
- Early market entry before competition

#### 2. **M-Pesa Integration**
- 30M+ users can pay instantly
- No credit card required
- Mobile-first approach

#### 3. **Bilingual AI**
- English & Swahili symptom checker
- Culturally appropriate recommendations
- Accessible to all Kenyans

#### 4. **Technology Moat**
- Advanced AI integration
- Real-time mapping
- Serverless architecture (scales infinitely)
- 100% uptime

#### 5. **Network Effects**
- More clinics → More users
- More users → More clinics
- Data flywheel → Better AI

#### 6. **Cost Structure**
- $0/month infrastructure cost
- High gross margins (90%)
- Scalable without proportional cost increase

### Competitive Landscape

| Competitor | Focus | Weakness |
|------------|-------|----------|
| **Afya Pap** | Clinic directory | No booking, no payments |
| **mDoc** | Telemedicine | Limited to telemedicine only |
| **Hello Doctor** | Symptom checker | No facility booking |
| **M-TIBA** | Health wallet | Insurance-focused, limited clinics |

**Safiri Afya** = **All-in-one solution** (Symptom checker + Facility finder + Booking + Payment)

---

## 💵 Funding Ask

### Seeking: $100,000 Seed Round

### Use of Funds

| Category | Amount | Percentage | Purpose |
|----------|--------|------------|---------|
| **Marketing** | $40,000 | 40% | User acquisition, social media, PR |
| **Team** | $30,000 | 30% | Hire 2 developers, 1 marketer |
| **Clinic Onboarding** | $15,000 | 15% | Sales team, training, partnerships |
| **Infrastructure** | $10,000 | 10% | Upgrade to paid tiers, monitoring |
| **Legal & Compliance** | $5,000 | 5% | Licenses, data privacy, contracts |

### Milestones with Funding

**Month 3:**
- 50 clinics onboarded
- 10,000 users acquired
- Mobile app beta launch

**Month 6:**
- 100 clinics
- 50,000 users
- KES 7.5M revenue
- Telemedicine MVP

**Month 12:**
- 200 clinics
- 100,000 users
- KES 15M revenue ($115K)
- Positive unit economics
- Ready for Series A

### Exit Strategy

**Option 1: Acquisition** (3-5 years)
- Target acquirers: Safaricom, mPesa, regional health tech players
- Valuation target: $10-50M

**Option 2: IPO** (7-10 years)
- Regional expansion (East Africa)
- Multi-million user base
- Profitable operations

**Option 3: Strategic Partnership**
- Merge with insurance provider
- White-label for governments

---

## 📊 Financial Projections

### 3-Year Forecast

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Users** | 100,000 | 500,000 | 2,000,000 |
| **Clinics** | 200 | 500 | 1,000 |
| **Consultations** | 200,000 | 1,000,000 | 4,000,000 |
| **Revenue** | KES 30M | KES 150M | KES 600M |
| **Revenue (USD)** | $231K | $1.15M | $4.6M |
| **Gross Margin** | 90% | 90% | 90% |
| **Operating Expenses** | KES 40M | KES 100M | KES 300M |
| **Net Profit/(Loss)** | (KES 10M) | KES 50M | KES 300M |
| **Breakeven** | Month 8 | - | - |

**Assumptions:**
- Average 2 consultations/user/year
- KES 1,000 average fee
- 15% commission = KES 150/consultation
- Growth rate: 5x Year 1→2, 4x Year 2→3

---

## 🎯 Key Metrics (KPIs)

### North Star Metric
**Monthly Active Users (MAU)** - Users using platform each month

### Supporting Metrics

**Acquisition:**
- New user signups
- Cost per acquisition (CPA)
- Organic vs. paid growth

**Activation:**
- Users who complete symptom check
- Users who search for clinics
- Users who book appointments

**Retention:**
- Monthly Active Users (MAU)
- User retention rate (Month 1 → Month 3)
- Churn rate

**Revenue:**
- Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Gross Merchandise Value (GMV)

**Referral:**
- Viral coefficient
- Net Promoter Score (NPS)

---

## 🚀 Why Now?

### Perfect Timing

1. **COVID-19 Accelerated Digital Health Adoption**
   - 200% increase in telehealth usage
   - Patients comfortable with digital healthcare
   - Providers open to technology

2. **M-Pesa Ubiquity**
   - 30M+ users
   - Trusted payment method
   - No credit card barriers

3. **Smartphone Penetration**
   - 60% and growing
   - Affordable Android devices
   - 4G coverage expanding

4. **Government Support**
   - Digital health strategy 2024-2028
   - Universal Health Coverage push
   - Public-private partnerships encouraged

5. **AI Breakthroughs**
   - Free AI models (OpenRouter)
   - Bilingual capabilities
   - Accurate medical analysis

---

## 📞 Call to Action

### Let's Make Healthcare Accessible Together

**Investment Opportunity:**
- $100K seed investment
- 10-15% equity
- Board seat
- Advisory role

**Next Steps:**
1. Review pitch deck
2. Schedule follow-up meeting
3. Product demo & Q&A
4. Due diligence
5. Term sheet

### Contact

**Safiri Afya**
- Website: https://safiriafya.netlify.app
- Email: info@safiriafya.com
- Phone: +254 XXX XXX XXX
- Location: Nairobi, Kenya

---

**Making Healthcare Accessible, One Step at a Time** 🇰🇪

*Empowering 54 million Kenyans with intelligent, accessible healthcare*
