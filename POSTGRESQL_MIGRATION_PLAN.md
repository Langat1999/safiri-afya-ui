# PostgreSQL Migration Plan with Prisma

## Date: 2025-11-16

This document outlines the complete migration strategy from LowDB (file-based JSON) to PostgreSQL with Prisma ORM.

---

## 📊 CURRENT DATABASE ANALYSIS

### Current System: LowDB
**File**: `backend/src/database.js`
**Storage**: `backend/data/db.json`

### Current Collections:

1. **users** - User accounts and authentication
2. **clinics** - Healthcare facilities
3. **doctors** - Medical professionals
4. **appointments** - Doctor appointments
5. **symptomHistory** - Symptom checker logs
6. **bookings** - Hospital/clinic bookings
7. **payments** - M-Pesa payment transactions
8. **adminLogs** - Admin activity logs
9. **systemSettings** - Application configuration
10. **passwordResets** - Password reset codes (used in server.js)

---

## 🎯 MIGRATION GOALS

### Why PostgreSQL?

**Current Issues with LowDB**:
- ❌ Not production-ready (file-based)
- ❌ No concurrent write support
- ❌ No ACID transactions
- ❌ Limited query capabilities
- ❌ No indexing or optimization
- ❌ No data integrity constraints
- ❌ File corruption risk
- ❌ Poor scalability

**Benefits of PostgreSQL**:
- ✅ Production-grade reliability
- ✅ ACID transactions
- ✅ Advanced querying (JOINs, aggregations)
- ✅ Indexing for performance
- ✅ Foreign key constraints
- ✅ Horizontal scaling support
- ✅ Backup and recovery tools
- ✅ Free and open source

**Benefits of Prisma ORM**:
- ✅ Type-safe database client
- ✅ Auto-generated TypeScript types
- ✅ Database migrations
- ✅ Visual database browser (Prisma Studio)
- ✅ Connection pooling
- ✅ Query optimization
- ✅ Cross-database support (easy to switch DBs)

---

## 📐 DATABASE SCHEMA DESIGN

### Entity-Relationship Diagram:

```
┌─────────────┐
│    Users    │
├─────────────┤
│ id (PK)     │──┐
│ email       │  │
│ password    │  │
│ name        │  │
│ role        │  │
│ isActive    │  │
│ lastLogin   │  │
│ createdAt   │  │
└─────────────┘  │
                 │
       ┌─────────┴─────────────────────────────┐
       │                                       │
       ▼                                       ▼
┌─────────────┐                        ┌──────────────┐
│Appointments │                        │   Bookings   │
├─────────────┤                        ├──────────────┤
│ id (PK)     │                        │ id (PK)      │
│ userId (FK) │                        │ userId (FK)? │
│ doctorId(FK)│                        │ facilityId(FK)│
│ date        │                        │ date         │
│ time        │                        │ time         │
│ reason      │                        │ symptoms     │
│ status      │                        │ status       │
│ createdAt   │                        │ paymentStatus│
└─────────────┘                        │ fee          │
                                       │ createdAt    │
       ┌─────────────┐                 └──────────────┘
       │   Doctors   │
       ├─────────────┤                        │
       │ id (PK)     │◄───────────────────────┘
       │ name        │
       │ specialty   │                 ┌──────────────┐
       │ availability│                 │   Payments   │
       │ createdAt   │                 ├──────────────┤
       └─────────────┘                 │ id (PK)      │
                                       │ bookingId(FK)│
┌─────────────┐                        │ amount       │
│   Clinics   │◄───────────────────────│ phoneNumber  │
├─────────────┤                        │ status       │
│ id (PK)     │                        │ mpesaRef     │
│ name        │                        │ createdAt    │
│ location    │                        └──────────────┘
│ coordinates │
│ services    │                 ┌──────────────────┐
│ hours       │                 │ PasswordResets   │
│ phone       │                 ├──────────────────┤
│ fee         │                 │ id (PK)          │
│ rating      │                 │ email            │
│ createdAt   │                 │ code             │
└─────────────┘                 │ expiresAt        │
                                │ createdAt        │
┌──────────────────┐            └──────────────────┘
│  SymptomHistory  │
├──────────────────┤
│ id (PK)          │            ┌──────────────┐
│ userId (FK)?     │            │  AdminLogs   │
│ symptoms         │            ├──────────────┤
│ analysis         │            │ id (PK)      │
│ riskLevel        │            │ adminId (FK) │
│ recommendations  │            │ action       │
│ createdAt        │            │ details      │
└──────────────────┘            │ timestamp    │
                                └──────────────┘
┌──────────────────┐
│  SystemSettings  │
├──────────────────┤
│ id (PK)          │
│ key              │
│ value            │
│ updatedAt        │
└──────────────────┘
```

---

## 🗄️ PRISMA SCHEMA

### File: `backend/prisma/schema.prisma`

```prisma
// Prisma Schema for Safiri Afya

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============= USER MANAGEMENT =============

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Profile information
  phone         String?
  dateOfBirth   DateTime?
  gender        Gender?
  location      String?

  // Preferences
  language      String    @default("en")
  theme         String    @default("light")
  timezone      String    @default("Africa/Nairobi")

  // Notification settings
  emailNotifications  Boolean @default(true)
  smsNotifications    Boolean @default(true)
  pushNotifications   Boolean @default(true)

  // Privacy settings
  dataSharing         DataSharingLevel @default(MINIMAL)

  // Relations
  appointments    Appointment[]
  symptomHistory  SymptomHistory[]
  bookings        Booking[]
  adminLogs       AdminLog[]

  @@index([email])
  @@index([role])
  @@map("users")
}

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum DataSharingLevel {
  NONE
  MINIMAL
  FULL
}

// ============= HEALTHCARE FACILITIES =============

model Clinic {
  id              String   @id @default(uuid())
  name            String
  location        String
  latitude        Float
  longitude       Float
  distance        String?
  rating          Float    @default(0)
  services        String[] // Array of services
  hours           String
  phone           String
  mpesaNumber     String?
  consultationFee Int      @default(1000)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  bookings Booking[]

  @@index([latitude, longitude])
  @@index([rating])
  @@map("clinics")
}

model Doctor {
  id           String   @id @default(uuid())
  name         String
  specialty    String
  availability String[] // Array of days
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  appointments Appointment[]

  @@index([specialty])
  @@map("doctors")
}

// ============= APPOINTMENTS & BOOKINGS =============

model Appointment {
  id         String            @id @default(uuid())
  userId     String
  doctorId   String
  doctorName String
  date       String // Format: YYYY-MM-DD
  time       String // Format: HH:MM
  reason     String
  name       String
  email      String
  phone      String
  status     AppointmentStatus @default(CONFIRMED)
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt

  // Relations
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  doctor Doctor @relation(fields: [doctorId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([doctorId])
  @@index([date, time])
  @@index([status])
  @@map("appointments")
}

enum AppointmentStatus {
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

model Booking {
  id              String        @id @default(uuid())
  userId          String?       // Optional - can book without account
  facilityId      String
  facilityName    String
  patientName     String
  patientEmail    String?
  patientPhone    String
  appointmentDate String // Format: YYYY-MM-DD
  appointmentTime String // Format: HH:MM
  symptoms        String
  status          BookingStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  consultationFee Int           @default(1000)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  user     User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  clinic   Clinic    @relation(fields: [facilityId], references: [id], onDelete: Cascade)
  payments Payment[]

  @@index([userId])
  @@index([facilityId])
  @@index([status])
  @@index([paymentStatus])
  @@index([appointmentDate, appointmentTime])
  @@map("bookings")
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum PaymentStatus {
  UNPAID
  PENDING
  PAID
  FAILED
  REFUNDED
}

// ============= PAYMENTS =============

model Payment {
  id                 String        @id @default(uuid())
  bookingId          String
  amount             Int
  phoneNumber        String
  mpesaReceiptNumber String?
  transactionId      String?
  status             PaymentStatus @default(PENDING)
  developerAmount    Int?          // Commission amount
  facilityAmount     Int?          // Amount to facility
  errorMessage       String?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  // Relations
  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([bookingId])
  @@index([status])
  @@index([transactionId])
  @@map("payments")
}

// ============= SYMPTOM CHECKER =============

model SymptomHistory {
  id              String   @id @default(uuid())
  userId          String?  // Optional - can use without account
  symptoms        String
  analysis        String?
  riskLevel       String?
  recommendations String?
  ageRange        String?
  gender          String?
  createdAt       DateTime @default(now())

  // Relations
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([riskLevel])
  @@index([createdAt])
  @@map("symptom_history")
}

// ============= ADMIN & SECURITY =============

model PasswordReset {
  id        String   @id @default(uuid())
  email     String
  code      String
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([email])
  @@index([code])
  @@index([expiresAt])
  @@map("password_resets")
}

model AdminLog {
  id        String   @id @default(uuid())
  adminId   String
  action    String
  details   String?
  timestamp DateTime @default(now())

  // Relations
  admin User @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@index([adminId])
  @@index([timestamp])
  @@map("admin_logs")
}

model SystemSetting {
  id        String   @id @default(uuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt

  @@map("system_settings")
}
```

---

## 🚀 MIGRATION STEPS

### Phase 1: Setup (30 minutes)

#### 1.1 Install Dependencies
```bash
cd backend
npm install prisma @prisma/client
npm install -D prisma
```

#### 1.2 Initialize Prisma
```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema
- `.env` update with `DATABASE_URL`

#### 1.3 Setup PostgreSQL

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (Windows)
# Download from: https://www.postgresql.org/download/windows/

# Create database
psql -U postgres
CREATE DATABASE safiri_afya;
CREATE USER safiri_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE safiri_afya TO safiri_user;
\q
```

**Option B: Cloud PostgreSQL (Recommended)**

**Heroku Postgres** (Free tier):
```bash
heroku addons:create heroku-postgresql:mini
heroku config:get DATABASE_URL
```

**Supabase** (Free tier):
1. Sign up at https://supabase.com
2. Create new project
3. Copy connection string from Settings → Database

**Railway.app** (Free tier):
1. Sign up at https://railway.app
2. New Project → Provision PostgreSQL
3. Copy connection string

**Neon** (Free tier - Recommended):
1. Sign up at https://neon.tech
2. Create new project
3. Copy connection string

#### 1.4 Configure Database URL

Add to `.env`:
```bash
# PostgreSQL Database
DATABASE_URL="postgresql://user:password@localhost:5432/safiri_afya"

# Example cloud URLs:
# Supabase: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
# Railway: postgresql://postgres:[password]@containers-us-west-xxx.railway.app:6543/railway
# Neon: postgresql://[user]:[password]@ep-xxx.us-east-2.aws.neon.tech/neondb
```

---

### Phase 2: Schema Migration (1 hour)

#### 2.1 Copy Prisma Schema
Copy the schema above into `backend/prisma/schema.prisma`

#### 2.2 Generate Prisma Client
```bash
npx prisma generate
```

This creates type-safe client in `node_modules/@prisma/client`

#### 2.3 Create Migration
```bash
npx prisma migrate dev --name initial_migration
```

This:
- Creates SQL migration files
- Applies migration to database
- Generates Prisma Client

#### 2.4 Verify Database
```bash
npx prisma studio
```

Opens visual database browser at http://localhost:5555

---

### Phase 3: Data Migration (2 hours)

#### 3.1 Create Migration Script

**File**: `backend/src/migrate-to-postgres.js`

```javascript
import { PrismaClient } from '@prisma/client';
import db from './database.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function migrateData() {
  console.log('🚀 Starting data migration from LowDB to PostgreSQL...\n');

  try {
    // Read current data
    await db.read();

    // 1. Migrate Users
    console.log('👤 Migrating users...');
    for (const user of db.data.users || []) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role.toUpperCase(),
          isActive: user.isActive ?? true,
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        },
      });
    }
    console.log(`✅ Migrated ${db.data.users?.length || 0} users\n`);

    // 2. Migrate Clinics
    console.log('🏥 Migrating clinics...');
    for (const clinic of db.data.clinics || []) {
      await prisma.clinic.upsert({
        where: { id: clinic.id },
        update: {},
        create: {
          id: clinic.id,
          name: clinic.name,
          location: clinic.location,
          latitude: clinic.coordinates?.lat || 0,
          longitude: clinic.coordinates?.lng || 0,
          distance: clinic.distance,
          rating: clinic.rating || 0,
          services: clinic.services || [],
          hours: clinic.hours,
          phone: clinic.phone,
          mpesaNumber: clinic.mpesaNumber,
          consultationFee: clinic.consultationFee || 1000,
        },
      });
    }
    console.log(`✅ Migrated ${db.data.clinics?.length || 0} clinics\n`);

    // 3. Migrate Doctors
    console.log('👨‍⚕️ Migrating doctors...');
    for (const doctor of db.data.doctors || []) {
      await prisma.doctor.upsert({
        where: { id: doctor.id },
        update: {},
        create: {
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialty,
          availability: doctor.availability || [],
        },
      });
    }
    console.log(`✅ Migrated ${db.data.doctors?.length || 0} doctors\n`);

    // 4. Migrate Appointments
    console.log('📅 Migrating appointments...');
    for (const appointment of db.data.appointments || []) {
      // Verify foreign keys exist
      const userExists = await prisma.user.findUnique({ where: { id: appointment.userId } });
      const doctorExists = await prisma.doctor.findUnique({ where: { id: appointment.doctorId } });

      if (userExists && doctorExists) {
        await prisma.appointment.create({
          data: {
            id: appointment.id,
            userId: appointment.userId,
            doctorId: appointment.doctorId,
            doctorName: appointment.doctorName,
            date: appointment.date,
            time: appointment.time,
            reason: appointment.reason,
            name: appointment.name,
            email: appointment.email,
            phone: appointment.phone,
            status: appointment.status?.toUpperCase() || 'CONFIRMED',
            createdAt: appointment.createdAt ? new Date(appointment.createdAt) : new Date(),
          },
        });
      }
    }
    console.log(`✅ Migrated ${db.data.appointments?.length || 0} appointments\n`);

    // 5. Migrate Bookings
    console.log('📋 Migrating bookings...');
    for (const booking of db.data.bookings || []) {
      const clinicExists = await prisma.clinic.findUnique({ where: { id: booking.facilityId } });

      if (clinicExists) {
        await prisma.booking.create({
          data: {
            id: booking.id,
            userId: booking.userId || null,
            facilityId: booking.facilityId,
            facilityName: booking.facilityName,
            patientName: booking.patientName,
            patientEmail: booking.patientEmail,
            patientPhone: booking.patientPhone,
            appointmentDate: booking.appointmentDate,
            appointmentTime: booking.appointmentTime,
            symptoms: booking.symptoms,
            status: booking.status?.toUpperCase() || 'PENDING',
            paymentStatus: booking.paymentStatus?.toUpperCase() || 'UNPAID',
            consultationFee: booking.consultationFee || 1000,
            createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
          },
        });
      }
    }
    console.log(`✅ Migrated ${db.data.bookings?.length || 0} bookings\n`);

    // 6. Migrate Payments
    console.log('💳 Migrating payments...');
    for (const payment of db.data.payments || []) {
      const bookingExists = await prisma.booking.findUnique({ where: { id: payment.bookingId } });

      if (bookingExists) {
        await prisma.payment.create({
          data: {
            id: payment.id,
            bookingId: payment.bookingId,
            amount: payment.amount,
            phoneNumber: payment.phoneNumber,
            mpesaReceiptNumber: payment.mpesaReceiptNumber,
            transactionId: payment.transactionId,
            status: payment.status?.toUpperCase() || 'PENDING',
            developerAmount: payment.developerAmount,
            facilityAmount: payment.facilityAmount,
            errorMessage: payment.errorMessage,
            createdAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
          },
        });
      }
    }
    console.log(`✅ Migrated ${db.data.payments?.length || 0} payments\n`);

    // 7. Migrate Symptom History
    console.log('🩺 Migrating symptom history...');
    for (const symptom of db.data.symptomHistory || []) {
      await prisma.symptomHistory.create({
        data: {
          id: symptom.id,
          userId: symptom.userId || null,
          symptoms: symptom.symptoms,
          analysis: symptom.analysis,
          riskLevel: symptom.riskLevel,
          recommendations: symptom.recommendations,
          ageRange: symptom.ageRange,
          gender: symptom.gender,
          createdAt: symptom.createdAt ? new Date(symptom.createdAt) : new Date(),
        },
      });
    }
    console.log(`✅ Migrated ${db.data.symptomHistory?.length || 0} symptom records\n`);

    // 8. Migrate Admin Logs
    console.log('📊 Migrating admin logs...');
    for (const log of db.data.adminLogs || []) {
      const adminExists = await prisma.user.findUnique({ where: { id: log.adminId } });

      if (adminExists) {
        await prisma.adminLog.create({
          data: {
            id: log.id || undefined,
            adminId: log.adminId,
            action: log.action,
            details: log.details,
            timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
          },
        });
      }
    }
    console.log(`✅ Migrated ${db.data.adminLogs?.length || 0} admin logs\n`);

    // 9. Migrate System Settings
    console.log('⚙️  Migrating system settings...');
    if (db.data.systemSettings) {
      const settings = db.data.systemSettings;
      const settingsToMigrate = [
        { key: 'maintenanceMode', value: String(settings.maintenanceMode) },
        { key: 'allowNewRegistrations', value: String(settings.allowNewRegistrations) },
        { key: 'mpesaEnabled', value: String(settings.mpesaEnabled) },
        { key: 'newsEnabled', value: String(settings.newsEnabled) },
        { key: 'symptomCheckerEnabled', value: String(settings.symptomCheckerEnabled) },
        { key: 'appVersion', value: settings.appVersion },
      ];

      for (const setting of settingsToMigrate) {
        await prisma.systemSetting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: setting,
        });
      }
    }
    console.log(`✅ Migrated system settings\n`);

    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${await prisma.user.count()}`);
    console.log(`   Clinics: ${await prisma.clinic.count()}`);
    console.log(`   Doctors: ${await prisma.doctor.count()}`);
    console.log(`   Appointments: ${await prisma.appointment.count()}`);
    console.log(`   Bookings: ${await prisma.booking.count()}`);
    console.log(`   Payments: ${await prisma.payment.count()}`);
    console.log(`   Symptom Records: ${await prisma.symptomHistory.count()}`);
    console.log(`   Admin Logs: ${await prisma.adminLog.count()}`);
    console.log(`   System Settings: ${await prisma.systemSetting.count()}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
```

#### 3.2 Run Migration
```bash
node src/migrate-to-postgres.js
```

---

### Phase 4: Code Updates (3 hours)

#### 4.1 Create New Database Module

**File**: `backend/src/prismadb.js`

```javascript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

#### 4.2 Update server.js

Replace all `db.read()`, `db.write()`, and database operations with Prisma queries.

**Example conversions**:

**Before (LowDB)**:
```javascript
await db.read();
const user = db.data.users.find(u => u.email === email);
```

**After (Prisma)**:
```javascript
const user = await prisma.user.findUnique({
  where: { email }
});
```

**Before**:
```javascript
db.data.users.push(newUser);
await db.write();
```

**After**:
```javascript
const user = await prisma.user.create({
  data: newUser
});
```

---

## 📋 DETAILED CONVERSION GUIDE

### User Operations

| LowDB | Prisma |
|-------|--------|
| `db.data.users.find(u => u.email === email)` | `prisma.user.findUnique({ where: { email } })` |
| `db.data.users.push(newUser); await db.write()` | `prisma.user.create({ data: newUser })` |
| `user.name = newName; await db.write()` | `prisma.user.update({ where: { id }, data: { name: newName } })` |
| `db.data.users = db.data.users.filter(...)` | `prisma.user.delete({ where: { id } })` |

### Query Examples

**Get all user appointments**:
```javascript
const appointments = await prisma.appointment.findMany({
  where: { userId: req.user.id },
  include: {
    doctor: true,  // Include doctor details
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

**Create booking with payment**:
```javascript
const booking = await prisma.booking.create({
  data: {
    facilityId,
    patientName,
    patientPhone,
    appointmentDate,
    appointmentTime,
    symptoms,
    user: {
      connect: { id: userId }  // Optional connection
    }
  },
  include: {
    clinic: true,  // Include facility details
  }
});
```

**Complex query (with relations)**:
```javascript
const bookingsWithPayments = await prisma.booking.findMany({
  where: {
    userId: req.user.id,
    status: 'CONFIRMED'
  },
  include: {
    clinic: true,
    payments: {
      where: {
        status: 'PAID'
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

---

## ✅ TESTING PLAN

### 1. Unit Tests
- Test each Prisma model CRUD operation
- Test complex queries with relations
- Test transaction handling

### 2. Integration Tests
- Test all API endpoints with PostgreSQL
- Verify data integrity
- Test concurrent operations

### 3. Performance Tests
- Compare query performance (LowDB vs PostgreSQL)
- Test with large datasets
- Verify indexing effectiveness

### 4. Migration Tests
- Run migration script multiple times (should be idempotent)
- Verify data count matches
- Verify data integrity (foreign keys, constraints)

---

## 🔄 ROLLBACK PLAN

If migration fails:

1. **Keep LowDB**: Don't delete `backend/data/db.json` until fully tested
2. **Backup**: Create backup before migration
   ```bash
   cp backend/data/db.json backend/data/db.json.backup
   ```
3. **Revert Code**: Use git to revert changes
   ```bash
   git checkout -- .
   ```
4. **Drop Database**: Clear PostgreSQL if needed
   ```bash
   npx prisma migrate reset
   ```

---

## 📅 TIMELINE

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Setup PostgreSQL & Prisma | 30 min | ⏳ Pending |
| 2 | Schema Migration | 1 hour | ⏳ Pending |
| 3 | Data Migration | 2 hours | ⏳ Pending |
| 4 | Code Updates | 3 hours | ⏳ Pending |
| 5 | Testing | 2 hours | ⏳ Pending |
| 6 | Deployment | 1 hour | ⏳ Pending |

**Total Estimated Time**: 8-10 hours

---

## 🎯 SUCCESS CRITERIA

- ✅ All data migrated successfully
- ✅ All API endpoints working with PostgreSQL
- ✅ Performance improved over LowDB
- ✅ No data loss
- ✅ All tests passing
- ✅ Production deployment successful

---

## 📚 RESOURCES

- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Prisma Studio: https://www.prisma.io/studio
- Database Hosting:
  - Neon: https://neon.tech (Recommended - Free tier)
  - Supabase: https://supabase.com
  - Railway: https://railway.app
  - Heroku Postgres: https://heroku.com/postgres

---

## ⚠️ IMPORTANT NOTES

1. **Environment Variables**: Update .env with `DATABASE_URL`
2. **Backup**: Always backup data before migration
3. **Testing**: Test thoroughly in development before production
4. **Connection Pooling**: Prisma handles this automatically
5. **Migrations**: Keep all migration files in version control
6. **Security**: Never commit DATABASE_URL to git

---

**Next Step**: Execute Phase 1 - Setup PostgreSQL & Prisma
