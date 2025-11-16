# Prisma Server.js Update Guide

## Progress: IN PROGRESS

This document tracks the migration of server.js from LowDB to Prisma ORM.

---

## ✅ COMPLETED

### 1. Prisma Helper Module Created
**File**: `backend/src/prismadb.js`

- Singleton Prisma client
- Helper functions for JSON array fields:
  - `parseClinicServices()` - Convert JSON string to array
  - `parseDoctorAvailability()` - Convert JSON string to array
  - `parseClinics()` - Batch parse clinics
  - `parseDoctors()` - Batch parse doctors
  - `prepareClinicForDB()` - Convert arrays to JSON for storage
  - `prepareDoctorForDB()` - Convert arrays to JSON for storage

### 2. Server.js Imports Updated
- ✅ Replaced LowDB import with Prisma
- ✅ Removed `initializeDatabase` and `initializeAdminUser` functions
- ✅ Added Prisma helper function imports

### 3. Authentication Endpoints Migrated

#### ✅ POST `/api/auth/register`
**Changes**:
- `db.read()` → Removed (not needed)
- `db.data.users.find()` → `prisma.user.findUnique({ where: { email } })`
- `db.data.users.push()` + `db.write()` → `prisma.user.create({ data: {...} })`
- Role changed from `'user'` → `'USER'` (Prisma enum)
- Automatic `createdAt` and `updatedAt` timestamps

#### ✅ POST `/api/auth/login`
**Changes**:
- `db.read()` → Removed
- `db.data.users.find()` → `prisma.user.findUnique({ where: { email } })`
- `user.lastLogin = ...` + `db.write()` → `prisma.user.update({ where: { id }, data: { lastLogin } })`

---

## ⏳ IN PROGRESS / TODO

### Authentication Endpoints (Remaining)

#### POST `/api/auth/forgot-password`
**Current** (LowDB):
```javascript
await db.read();
const user = db.data.users.find(u => u.email === email);
db.data.passwordResets.push({...});
await db.write();
```

**Target** (Prisma):
```javascript
const user = await prisma.user.findUnique({ where: { email } });
await prisma.passwordReset.create({
  data: {
    email,
    code: resetCode,
    expiresAt: new Date(Date.now() + 3600000)
  }
});
```

#### POST `/api/auth/verify-reset-code`
#### POST `/api/auth/reset-password`

### Profile Endpoints

#### GET `/api/user/profile`
**Changes Needed**:
```javascript
// OLD
await db.read();
const user = db.data.users.find(u => u.id === req.user.id);
const userAppointments = db.data.appointments.filter(...)

// NEW
const user = await prisma.user.findUnique({
  where: { id: req.user.id },
  include: {
    appointments: true,
    symptomHistory: true,
    bookings: true
  }
});
const stats = {
  appointmentsCount: user.appointments.length,
  symptomChecksCount: user.symptomHistory.length,
  bookingsCount: user.bookings.length
};
```

#### PUT `/api/user/profile`
#### PUT `/api/user/change-password`
#### PUT `/api/user/settings`
#### DELETE `/api/user/account`

### Appointment Endpoints

#### POST `/api/appointments`
**Changes**:
```javascript
// OLD
await db.read();
const doctor = db.data.doctors.find(d => d.id === doctorId);
const existingAppointment = db.data.appointments.find(...);
db.data.appointments.push(newAppointment);
await db.write();

// NEW
const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
const existingAppointment = await prisma.appointment.findFirst({
  where: {
    doctorId,
    date,
    time,
    status: { not: 'CANCELLED' }
  }
});
await prisma.appointment.create({
  data: {
    userId: req.user.id,
    doctorId,
    doctorName: doctor.name,
    date,
    time,
    reason,
    status: 'CONFIRMED'
  }
});
```

#### GET `/api/appointments`
#### PUT `/api/appointments/:id`
#### DELETE `/api/appointments/:id`

### Clinic & Doctor Endpoints

#### GET `/api/clinics`
**Important**: Must parse JSON services field
```javascript
const clinics = await prisma.clinic.findMany();
const parsedClinics = parseClinics(clinics); // Helper function
res.json(parsedClinics);
```

#### GET `/api/clinics/:id`
#### GET `/api/doctors`
**Important**: Must parse JSON availability field
```javascript
const doctors = await prisma.doctor.findMany();
const parsedDoctors = parseDoctors(doctors);
res.json(parsedDoctors);
```

#### GET `/api/doctors/:id`

### Booking Endpoints

#### POST `/api/bookings`
```javascript
// OLD
const facility = db.data.clinics.find(c => c.id === facilityId);
db.data.bookings.push(booking);

// NEW
const facility = await prisma.clinic.findUnique({ where: { id: facilityId } });
await prisma.booking.create({
  data: {
    userId: req.user?.id || null, // Optional
    facilityId,
    facilityName: facility.name,
    patientName,
    patientEmail,
    patientPhone,
    appointmentDate,
    appointmentTime,
    symptoms,
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    consultationFee: facility.consultationFee
  }
});
```

#### GET `/api/bookings/:id`

### Payment Endpoints

#### POST `/api/payments/initiate`
```javascript
// OLD
const booking = db.data.bookings.find(b => b.id === bookingId);
db.data.payments.push(payment);

// NEW
const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
await prisma.payment.create({
  data: {
    bookingId,
    amount,
    phoneNumber,
    status: 'PENDING'
  }
});
```

#### POST `/api/payments/mpesa/callback`
**Update payment status**:
```javascript
// OLD
const payment = db.data.payments.find(...);
payment.status = 'PAID';
const booking = db.data.bookings.find(...);
booking.paymentStatus = 'paid';

// NEW
await prisma.payment.update({
  where: { id: paymentId },
  data: {
    status: 'PAID',
    mpesaReceiptNumber: receipt,
    transactionId: txId
  }
});
await prisma.booking.update({
  where: { id: bookingId },
  data: { paymentStatus: 'PAID' }
});
```

### Symptom Checker Endpoints

#### POST `/api/symptoms/analyze`
**Note**: Recommendations must be stored as JSON string
```javascript
await prisma.symptomHistory.create({
  data: {
    userId: req.user?.id || 'anonymous',
    symptoms,
    analysis,
    riskLevel,
    recommendations: JSON.stringify(recommendationsArray), // Convert to JSON
    ageRange,
    gender
  }
});
```

#### GET `/api/symptoms/history`

### Admin Endpoints

#### GET `/api/admin/stats`
**Use aggregation**:
```javascript
const userCount = await prisma.user.count();
const clinicCount = await prisma.clinic.count();
const appointmentCount = await prisma.appointment.count();
const bookingCount = await prisma.booking.count();
```

#### GET `/api/admin/users`
#### PUT `/api/admin/users/:id`
#### DELETE `/api/admin/users/:id`
#### POST `/api/admin/clinics`
**Important**: Stringify services array
```javascript
await prisma.clinic.create({
  data: prepareClinicForDB({
    name,
    location,
    latitude,
    longitude,
    services, // Will be stringified by helper
    hours,
    phone
  })
});
```

#### PUT `/api/admin/clinics/:id`
#### DELETE `/api/admin/clinics/:id`
#### GET `/api/admin/logs`

---

## 🔄 CONVERSION PATTERNS

### Pattern 1: Find Single Record
```javascript
// LowDB
await db.read();
const user = db.data.users.find(u => u.id === userId);

// Prisma
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

### Pattern 2: Find Multiple Records
```javascript
// LowDB
await db.read();
const appointments = db.data.appointments.filter(a => a.userId === userId);

// Prisma
const appointments = await prisma.appointment.findMany({
  where: { userId }
});
```

### Pattern 3: Create Record
```javascript
// LowDB
const newUser = { id: uuidv4(), ...data };
db.data.users.push(newUser);
await db.write();

// Prisma
const newUser = await prisma.user.create({
  data: { ...data }
  // id and timestamps auto-generated
});
```

### Pattern 4: Update Record
```javascript
// LowDB
const user = db.data.users.find(u => u.id === userId);
user.name = newName;
await db.write();

// Prisma
await prisma.user.update({
  where: { id: userId },
  data: { name: newName }
});
```

### Pattern 5: Delete Record
```javascript
// LowDB
db.data.users = db.data.users.filter(u => u.id !== userId);
await db.write();

// Prisma
await prisma.user.delete({
  where: { id: userId }
});
```

### Pattern 6: With Relations
```javascript
// LowDB (manual joins)
const user = db.data.users.find(u => u.id === userId);
const appointments = db.data.appointments.filter(a => a.userId === userId);

// Prisma (automatic joins)
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    appointments: true,
    bookings: true
  }
});
```

### Pattern 7: Enum Values
```javascript
// LowDB (lowercase strings)
role: 'user'
status: 'confirmed'

// Prisma (uppercase enum values)
role: 'USER'
status: 'CONFIRMED'
```

### Pattern 8: Array Fields (SQLite only)
```javascript
// Writing to DB
const clinicData = {
  services: ['General Practice', 'Emergency']
};
await prisma.clinic.create({
  data: prepareClinicForDB(clinicData) // Converts array to JSON string
});

// Reading from DB
const clinic = await prisma.clinic.findUnique({ where: { id } });
const parsed = parseClinicServices(clinic); // Converts JSON string to array
```

---

## 📋 ENDPOINT STATUS CHECKLIST

### Authentication (5 endpoints)
- [x] POST `/api/auth/register`
- [x] POST `/api/auth/login`
- [ ] POST `/api/auth/forgot-password`
- [ ] POST `/api/auth/verify-reset-code`
- [ ] POST `/api/auth/reset-password`

### User Profile (5 endpoints)
- [ ] GET `/api/user/profile`
- [ ] PUT `/api/user/profile`
- [ ] PUT `/api/user/change-password`
- [ ] PUT `/api/user/settings`
- [ ] DELETE `/api/user/account`

### Appointments (4 endpoints)
- [ ] POST `/api/appointments`
- [ ] GET `/api/appointments`
- [ ] PUT `/api/appointments/:id`
- [ ] DELETE `/api/appointments/:id`

### Clinics & Doctors (4 endpoints)
- [ ] GET `/api/clinics`
- [ ] GET `/api/clinics/:id`
- [ ] GET `/api/doctors`
- [ ] GET `/api/doctors/:id`

### Bookings (2 endpoints)
- [ ] POST `/api/bookings`
- [ ] GET `/api/bookings/:id`

### Payments (3 endpoints)
- [ ] POST `/api/payments/initiate`
- [ ] POST `/api/payments/mpesa/callback`
- [ ] POST `/api/payments/mpesa/result`

### Symptom Checker (2 endpoints)
- [ ] POST `/api/symptoms/analyze`
- [ ] GET `/api/symptoms/history`

### Health News (1 endpoint)
- [ ] GET `/api/health-news` (no DB access)

### Admin (10+ endpoints)
- [ ] GET `/api/admin/stats`
- [ ] GET `/api/admin/users`
- [ ] PUT `/api/admin/users/:id`
- [ ] DELETE `/api/admin/users/:id`
- [ ] POST `/api/admin/clinics`
- [ ] PUT `/api/admin/clinics/:id`
- [ ] DELETE `/api/admin/clinics/:id`
- [ ] GET `/api/admin/logs`
- [ ] GET `/api/admin/appointments`
- [ ] GET `/api/admin/bookings`
- [ ] PUT `/api/admin/settings`

**Total**: 40+ endpoints
**Completed**: 2 endpoints
**Remaining**: 38+ endpoints

---

## ⚠️ IMPORTANT NOTES

### 1. Role Enum Values
Prisma uses uppercase enum values:
- `'user'` → `'USER'`
- `'admin'` → `'ADMIN'`
- `'super_admin'` → `'SUPER_ADMIN'`

### 2. Status Enum Values
- `'confirmed'` → `'CONFIRMED'`
- `'cancelled'` → `'CANCELLED'`
- `'pending'` → `'PENDING'`
- `'paid'` → `'PAID'`

### 3. Array Fields (SQLite)
Must convert to/from JSON strings:
- `services` in Clinic model
- `availability` in Doctor model
- `recommendations` in SymptomHistory model

Always use helper functions:
- Writing: `prepareClinicForDB()`, `prepareDoctorForDB()`
- Reading: `parseClinicServices()`, `parseDoctorAvailability()`

### 4. Automatic Fields
Prisma auto-generates:
- `id` (UUID)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

Don't manually set these!

### 5. Timestamps
Prisma expects Date objects:
```javascript
// LowDB
createdAt: new Date().toISOString()

// Prisma
createdAt: new Date() // Or just omit - auto-generated
```

### 6. Optional User Relations
For bookings and symptom history that can be used without login:
```javascript
userId: req.user?.id || null // Null for anonymous users
```

---

## 🧪 TESTING PLAN

After each endpoint migration:

1. **Test the endpoint** with curl or Postman
2. **Verify database** with `npx prisma studio`
3. **Check logs** for errors
4. **Test relations** if the endpoint uses includes

### Example Test Commands:

**Register**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@test.com","password":"Test@1234","name":"Test User"}'
```

**Login**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@test.com","password":"Test@1234"}'
```

**Get Profile** (with token):
```bash
curl -X GET http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🚀 NEXT STEPS

### Immediate (This Session):
1. Complete password reset endpoints (3 endpoints)
2. Complete profile endpoints (5 endpoints)
3. Test authentication flow end-to-end

### Short-term (Next Session):
4. Complete appointment endpoints (4 endpoints)
5. Complete clinic/doctor endpoints (4 endpoints)
6. Complete booking endpoints (2 endpoints)
7. Complete payment endpoints (3 endpoints)

### Medium-term:
8. Complete symptom checker (2 endpoints)
9. Complete admin endpoints (10+ endpoints)
10. Comprehensive testing
11. Performance optimization

---

## 📊 ESTIMATED TIME

- Password reset endpoints: 30 minutes
- Profile endpoints: 1 hour
- Appointment endpoints: 1 hour
- Clinic/doctor endpoints: 45 minutes
- Booking endpoints: 45 minutes
- Payment endpoints: 1 hour
- Symptom checker: 30 minutes
- Admin endpoints: 2 hours
- Testing: 2 hours

**Total Remaining**: 8-10 hours

---

## 💡 TIPS

1. **Work systematically**: Complete one section at a time
2. **Test frequently**: Test each endpoint after migrating
3. **Use Prisma Studio**: Visual database browser helps debug
4. **Keep patterns consistent**: Use the conversion patterns above
5. **Handle errors**: Prisma throws different errors than LowDB
6. **Use transactions**: For operations that update multiple tables

### Example Transaction:
```javascript
await prisma.$transaction(async (tx) => {
  // Update payment
  await tx.payment.update({
    where: { id: paymentId },
    data: { status: 'PAID' }
  });

  // Update booking
  await tx.booking.update({
    where: { id: bookingId },
    data: { paymentStatus: 'PAID' }
  });
});
```

---

**Status**: 🟡 IN PROGRESS (2/40 endpoints complete)
**Next**: Complete password reset endpoints
