# Safiri Afya - Technical Architecture

**Comprehensive System Architecture Documentation**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Design](#database-design)
6. [External Integrations](#external-integrations)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Performance & Scalability](#performance--scalability)
10. [Monitoring & Logging](#monitoring--logging)

---

## System Overview

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend Framework** | React | 18.3.1 | UI rendering |
| **Language** | TypeScript | 5.x | Type safety |
| **Build Tool** | Vite | 5.4.19 | Fast bundling |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Accessible components |
| **Routing** | React Router | 6.30.1 | Client-side routing |
| **State Management** | TanStack Query + Context API | 5.83.0 | Server & client state |
| **Backend Runtime** | Node.js | 18+ | JavaScript runtime |
| **Backend Framework** | Express | 5.1.0 | REST API server |
| **Database** | PostgreSQL | 15 | Relational database |
| **ORM** | Prisma | 6.19.0 | Type-safe queries |
| **Authentication** | JWT + bcrypt | - | Secure auth |
| **Payments** | M-Pesa Daraja API | v1 | Mobile money |
| **AI** | OpenRouter (Mistral 7B) | - | Symptom analysis |
| **Email** | SendGrid | v3 | Transactional emails |
| **Mapping** | Leaflet + OpenStreetMap | 1.9.4 | Interactive maps |

### Architecture Pattern

**Split Deployment Architecture:**
- Frontend: Static site hosted on Netlify CDN
- Backend: Serverless functions on Vercel
- Database: Managed PostgreSQL on Supabase
- **Advantages:** Scalable, cost-effective, globally distributed

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Web Browsers (Desktop, Mobile, Tablet)                    │  │
│  │  - Chrome, Firefox, Safari, Edge                           │  │
│  │  - Responsive design (320px - 2560px)                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS/TLS 1.3
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                    NETLIFY CDN (Frontend)                         │
│  https://safiriafya.netlify.app                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  React 18 Single Page Application                          │  │
│  │  ├─ Components (50+)                                       │  │
│  │  ├─ Pages (10+)                                            │  │
│  │  ├─ Context Providers (Auth, Language, Theme)             │  │
│  │  ├─ API Client (services/api.ts)                          │  │
│  │  └─ Static Assets (images, fonts, icons)                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Edge Network: 100+ global locations                             │
│  Cache-Control: Immutable assets, dynamic HTML                   │
│  Build: Vite (ESBuild + Rollup)                                 │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            │ REST API over HTTPS
                            │ Authorization: Bearer <JWT>
                            │ Content-Type: application/json
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│              VERCEL SERVERLESS (Backend API)                      │
│  https://safiri-afya.vercel.app/api                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Express.js 5 Application                                  │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Middleware Stack (Order matters!)                   │  │  │
│  │  │  ├─ 1. CORS (origin validation)                      │  │  │
│  │  │  ├─ 2. JSON body parser                              │  │  │
│  │  │  ├─ 3. Request logger                                │  │  │
│  │  │  ├─ 4. Rate limiters (per route)                     │  │  │
│  │  │  ├─ 5. JWT authentication (protected routes)         │  │  │
│  │  │  ├─ 6. Admin authorization (admin routes)            │  │  │
│  │  │  └─ 7. Zod validation (request schemas)              │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  API Routes (42+ endpoints)                          │  │  │
│  │  │  ├─ /api/auth/* (8)         - Registration, login   │  │  │
│  │  │  ├─ /api/user/* (5)         - Profile, settings     │  │  │
│  │  │  ├─ /api/clinics/* (4)      - Clinic search         │  │  │
│  │  │  ├─ /api/doctors/* (3)      - Doctor listings       │  │  │
│  │  │  ├─ /api/appointments/* (5) - Bookings              │  │  │
│  │  │  ├─ /api/symptoms/* (2)     - AI analysis           │  │  │
│  │  │  ├─ /api/bookings/* (2)     - Consultations         │  │  │
│  │  │  ├─ /api/payments/* (4)     - M-Pesa                │  │  │
│  │  │  ├─ /api/news/* (1)         - Health news           │  │  │
│  │  │  ├─ /api/admin/* (15+)      - Admin panel           │  │  │
│  │  │  └─ /api/health (1)         - Health check          │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Services Layer                                       │  │  │
│  │  │  ├─ mpesa.js        - M-Pesa integration            │  │  │
│  │  │  ├─ emailService.js - SendGrid wrapper              │  │  │
│  │  │  └─ symptomAnalysis.js - AI + keyword analysis      │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Runtime: Node.js 22                                             │
│  Functions: Auto-scaling serverless                              │
│  Cold start: ~300ms, Warm: <100ms                               │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            │ Prisma ORM
                            │ Connection pooling (pgbouncer)
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                 SUPABASE POSTGRESQL DATABASE                      │
│  Connection pooler: port 6543 (runtime queries)                  │
│  Direct connection: port 5432 (migrations)                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Database Schema (11 tables)                               │  │
│  │  ├─ users            - Authentication & profiles           │  │
│  │  ├─ clinics          - Healthcare facilities               │  │
│  │  ├─ doctors          - Medical professionals               │  │
│  │  ├─ appointments     - Doctor bookings                     │  │
│  │  ├─ bookings         - Clinic consultations                │  │
│  │  ├─ payments         - M-Pesa transactions                 │  │
│  │  ├─ symptom_history  - AI analysis logs                    │  │
│  │  ├─ password_resets  - Reset tokens                        │  │
│  │  ├─ admin_logs       - Audit trail                         │  │
│  │  ├─ system_settings  - App configuration                   │  │
│  │  └─ notifications    - User notifications                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Storage: 500MB (free tier)                                      │
│  Connections: 60 max (pgbouncer pooling)                        │
│  Backups: Daily automated (7-day retention)                      │
└──────────────────────────────────────────────────────────────────┘

External Service Integrations:
┌─────────────────────────────────────────────────────────────────┐
│  M-Pesa Daraja API     │  Payment processing (STK Push)          │
│  OpenRouter AI         │  Symptom analysis (Mistral 7B)          │
│  SendGrid API          │  Transactional emails                   │
│  OpenStreetMap/Nominatim │  Geocoding & facility data           │
│  Guardian API          │  Health news content                    │
│  WHO/MNT/Healthline RSS│  News aggregation                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Hierarchy

```
App.tsx (Root)
├─ AuthProvider (Authentication context)
├─ LanguageProvider (Bilingual support)
├─ ThemeProvider (Dark/Light mode)
└─ Router
    ├─ Public Routes
    │   ├─ / (Index - Hero + Features)
    │   ├─ /login
    │   ├─ /register
    │   └─ /forgot-password
    ├─ Protected Routes (require auth)
    │   ├─ /appointments
    │   ├─ /profile
    │   └─ /settings
    └─ Admin Routes (require admin role)
        ├─ /admin/login
        ├─ /admin/dashboard
        └─ /admin/users
```

### State Management Strategy

#### 1. Server State (TanStack Query)
```typescript
// API data caching & synchronization
const { data: clinics } = useQuery({
  queryKey: ['clinics'],
  queryFn: clinicsAPI.getAll,
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

#### 2. Global Client State (React Context)
- **AuthContext:** User authentication state, JWT token
- **LanguageContext:** English/Swahili toggle
- **ThemeContext:** Dark/Light mode preference

#### 3. Local Component State (useState)
- Form inputs, modals, UI toggles

### Routing Strategy

**Client-side routing with React Router:**
- BrowserRouter (HTML5 History API)
- Protected route wrappers check authentication
- Admin route wrappers check role-based access
- Netlify redirects all routes to index.html (SPA)

### API Client Architecture

**Centralized API client** (`src/services/api.ts`):
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL

const authFetch = async (url, options) => {
  const token = localStorage.getItem('authToken')
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

export const authAPI = {
  register: (data) => post('/auth/register', data),
  login: (data) => post('/auth/login', data),
}
```

---

## Backend Architecture

### Request Flow

```
1. Request arrives → Vercel serverless function
2. Express middleware chain:
   ├─ CORS validation
   ├─ JSON parsing
   ├─ Request logging
   ├─ Rate limiting
   ├─ JWT authentication (if protected)
   ├─ Role authorization (if admin)
   └─ Zod schema validation
3. Route handler executes
4. Service layer (if needed)
5. Database query (Prisma)
6. Response returned
```

### Middleware Stack

#### 1. CORS Middleware
```javascript
app.use(cors({
  origin(origin, callback) {
    const allowed = config.allowedOrigins
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('CORS not allowed'), false)
    }
  },
  credentials: true,
}))
```

#### 2. Authentication Middleware
```javascript
export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' })
    req.user = user
    next()
  })
}
```

#### 3. Rate Limiting
```javascript
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Stricter for auth endpoints
})
```

### Service Layer

**Separation of concerns:**
- **Routes:** HTTP handling, validation
- **Services:** Business logic
- **Prisma:** Database access

**Example - M-Pesa Service:**
```javascript
class MpesaService {
  async getAccessToken() { /* OAuth */ }
  async initiateSTKPush(phone, amount, bookingId) { /* STK */ }
  async processCallback(data) { /* Webhook */ }
}
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │──────<│ Appointment  │>──────│   Doctor    │
│             │       │              │       │             │
│ - id        │       │ - id         │       │ - id        │
│ - email     │       │ - userId     │       │ - name      │
│ - password  │       │ - doctorId   │       │ - specialty │
│ - name      │       │ - date       │       │ - available │
│ - role      │       │ - time       │       └─────────────┘
│ - isActive  │       │ - status     │
└─────────────┘       └──────────────┘
      │
      │
      │               ┌──────────────┐       ┌─────────────┐
      └──────────────<│   Booking    │>──────│   Clinic    │
                      │              │       │             │
                      │ - id         │       │ - id        │
                      │ - userId     │       │ - name      │
                      │ - facilityId │       │ - location  │
                      │ - date       │       │ - latitude  │
                      │ - status     │       │ - longitude │
                      │ - paymentStatus    │ - services  │
                      └──────┬───────┘       │ - fees      │
                             │               └─────────────┘
                             │
                             │
                      ┌──────▼───────┐
                      │   Payment    │
                      │              │
                      │ - id         │
                      │ - bookingId  │
                      │ - amount     │
                      │ - mpesaReceipt │
                      │ - status     │
                      └──────────────┘
```

### Key Tables

#### Users Table
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  role      Role     @default(USER)  // USER | ADMIN | SUPER_ADMIN
  isActive  Boolean  @default(true)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lastLogin DateTime?

  // Relations
  appointments    Appointment[]
  bookings        Booking[]
  symptomHistory  SymptomHistory[]

  @@index([email])
}
```

#### Payments Table
```prisma
model Payment {
  id                  String   @id @default(uuid())
  bookingId           String
  amount              Int      // KES amount
  phoneNumber         String   // 254XXXXXXXXX
  checkoutRequestId   String?  @unique  // M-Pesa ID
  mpesaReceiptNumber  String?  // Confirmation
  status              PaymentStatus @default(PENDING)
  developerAmount     Int?     // 15% commission
  facilityAmount      Int?     // 85% to clinic

  createdAt  DateTime @default(now())
  completedAt DateTime?

  booking Booking @relation(fields: [bookingId])

  @@index([checkoutRequestId])
  @@index([bookingId])
}
```

### Database Indexes

**Optimized for common queries:**
- Users: email (unique)
- Payments: checkoutRequestId, bookingId
- Appointments: userId, doctorId, date
- Bookings: userId, facilityId, appointmentDate

---

## External Integrations

### 1. M-Pesa Daraja API

**Flow:**
```
1. User books consultation → Backend
2. Backend calls mpesa.initiateSTKPush()
3. M-Pesa OAuth token obtained (cached 3600s)
4. STK Push request sent to M-Pesa
5. User receives prompt on phone
6. User enters M-Pesa PIN
7. M-Pesa processes payment
8. M-Pesa sends callback to /api/payments/mpesa/callback
9. Backend updates payment status
10. User sees confirmation
```

**Security:**
- Base64 encoded password (Shortcode + Passkey + Timestamp)
- OAuth 2.0 token authentication
- Callback URL verification

### 2. OpenRouter AI

**Symptom Analysis Flow:**
```
1. User enters symptoms
2. Backend sends to OpenRouter API
3. Prompt: Medical assistant, assess symptoms
4. Model: Mistral 7B Instruct
5. Response: JSON {urgency, condition, recommendations}
6. Fallback: Keyword analysis if API fails
7. Save to symptom_history table
```

### 3. SendGrid Email

**Email Types:**
1. Welcome email (registration)
2. Password reset (6-digit OTP)
3. Appointment confirmation
4. Booking confirmation

**Template:**
```html
<html>
  <body style="font-family: Arial">
    <h1>Safiri Afya</h1>
    <p>{{message}}</p>
    <a href="{{actionUrl}}">{{actionText}}</a>
  </body>
</html>
```

---

## Security Architecture

### Authentication Flow

```
1. User Registration
   ├─ Password hashed (bcrypt, 10 rounds)
   ├─ User created with role='USER'
   ├─ JWT generated (7-day expiry)
   └─ Token returned to client

2. User Login
   ├─ Email lookup
   ├─ bcrypt.compare(password, hash)
   ├─ Validate isActive flag
   ├─ Generate JWT
   └─ Update lastLogin timestamp

3. Protected Route Access
   ├─ Extract token from Authorization header
   ├─ jwt.verify(token, JWT_SECRET)
   ├─ Attach req.user = {id, email, role}
   └─ Continue to route handler

4. Admin Authorization
   ├─ Check req.user.role === 'ADMIN' || 'SUPER_ADMIN'
   ├─ Log action to admin_logs
   └─ Allow or deny
```

### Security Measures

**Input Validation:**
- Zod schemas for all API inputs
- Email format validation
- Password strength requirements (min 8 chars, uppercase, lowercase, number)

**SQL Injection Prevention:**
- Prisma ORM (parameterized queries)
- No raw SQL queries

**XSS Prevention:**
- React automatically escapes JSX
- Content-Security-Policy headers

**CORS Protection:**
- Whitelist of allowed origins
- Credentials mode enabled for JWT

**Rate Limiting:**
- General: 100 req/15min
- Auth: 5 req/15min
- Payments: 10 req/15min

**HTTPS Enforcement:**
- Automatic on Netlify & Vercel
- TLS 1.3
- HSTS headers

---

## Deployment Architecture

### CI/CD Pipeline

```
1. Developer pushes to GitHub (main branch)
2. GitHub triggers webhooks to Netlify & Vercel
3. Netlify builds frontend:
   ├─ npm install
   ├─ npm run build:frontend (Vite build)
   ├─ Output: dist/ directory
   └─ Deploy to global CDN
4. Vercel builds backend:
   ├─ cd backend && npm install
   ├─ npx prisma generate
   ├─ Create serverless functions
   └─ Deploy to Vercel edge network
5. Environment variables injected from dashboard
6. DNS updated (if custom domain)
7. Deployment complete (~2-3 minutes)
```

### Environment Variables

**Frontend (Netlify):**
- `VITE_API_URL` - Backend API URL

**Backend (Vercel):**
- `DATABASE_URL` - Supabase connection string
- `DIRECT_URL` - Supabase direct connection
- `JWT_SECRET` - JWT signing key
- `MPESA_*` - M-Pesa credentials
- `SENDGRID_API_KEY` - Email API key
- `ALLOWED_ORIGINS` - CORS whitelist

---

## Performance & Scalability

### Frontend Optimization

**Build Optimizations:**
- Code splitting (Vite automatic)
- Tree shaking (unused code removal)
- Minification (Terser)
- Compression (Gzip/Brotli)

**Runtime Optimizations:**
- Lazy loading images
- React.memo for expensive components
- Debounced search inputs
- Virtual scrolling for large lists

**Caching Strategy:**
- Static assets: Cache-Control: immutable
- API responses: TanStack Query cache (5min)
- Service Worker (future)

### Backend Scalability

**Serverless Benefits:**
- Auto-scaling based on demand
- 0 → 1000 requests/second (instant)
- No server management
- Pay per execution

**Database Connection Pooling:**
- pgbouncer (Supabase)
- Max 60 connections (free tier)
- Connection reuse

**Caching:**
- M-Pesa OAuth token (1 hour)
- Health news (30 minutes)
- Clinic data (TanStack Query)

### Load Testing Results

**Frontend:**
- First Contentful Paint: <1s
- Time to Interactive: <2s
- Lighthouse Score: 95/100

**Backend:**
- Cold start: ~300ms
- Warm response: <100ms
- Throughput: 1000+ req/s

---

## Monitoring & Logging

### Application Monitoring

**Vercel Dashboard:**
- Function invocations
- Error rates
- Response times
- Bandwidth usage

**Netlify Dashboard:**
- Build logs
- Deploy previews
- Bandwidth metrics

### Error Tracking

**Frontend:**
- Console errors logged
- React Error Boundaries
- User feedback forms

**Backend:**
- Express error handler
- Detailed error messages (dev)
- Generic errors (production)

### Logging Strategy

**Request Logging:**
```javascript
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`)
  })
  next()
})
```

**Admin Audit Logs:**
- All admin actions logged to `admin_logs` table
- Fields: userId, action, details, ipAddress, timestamp

---

## Future Architecture Enhancements

### Phase 1 (Q1 2025)
- [ ] Redis caching layer
- [ ] WebSocket for real-time updates
- [ ] Mobile apps (React Native)
- [ ] CDN for user-uploaded images

### Phase 2 (Q2 2025)
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Message queue (Bull/Redis)
- [ ] Elasticsearch for search

### Phase 3 (Q3 2025)
- [ ] Multi-region deployment
- [ ] Video streaming (telemedicine)
- [ ] Analytics dashboard (Segment/Amplitude)
- [ ] A/B testing framework

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Maintained By:** Safiri Afya Engineering Team
