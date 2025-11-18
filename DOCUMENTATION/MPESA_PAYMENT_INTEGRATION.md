# M-Pesa Payment Integration Guide

## Overview

This document describes the complete M-Pesa payment integration for the **Safiri Afya** healthcare booking system. The implementation includes:

✅ **Appointment Booking** - Patients can book consultations at nearby hospitals
✅ **M-Pesa STK Push** - Automated payment via M-Pesa
✅ **Revenue Splitting** - Automatic 15%/85% split between developer and hospital
✅ **Real-time Payment Status** - Live updates via polling and callbacks
✅ **Multi-language Support** - English & Swahili

---

## Features Implemented

### 1. Booking System
- Patient can book appointments with:
  - Patient name
  - Phone number
  - Appointment date & time
  - Symptoms/reason for visit
- **No doctor selection required** (as per requirements)
- Stores booking in database with unique ID

### 2. M-Pesa STK Push Payment
- Initiates M-Pesa payment request to patient's phone
- Shows consultation fee before payment
- Displays payment status in real-time:
  - ⏳ **Pending** - Waiting for user to enter PIN
  - ✅ **Success** - Payment completed
  - ❌ **Failed** - Payment cancelled or failed

### 3. Revenue Split (15/85)
- **15%** → Developer (0713809220)
- **85%** → Hospital
- Calculated automatically on backend
- Logged in payment records
- B2C transfers attempted (sandbox may not support)

### 4. Payment Workflow
```
1. User books appointment
2. Booking created in database (status: pending, payment: unpaid)
3. "Pay for Consultation" button appears
4. User clicks → STK Push sent to phone
5. User enters M-Pesa PIN on phone
6. Backend receives callback from M-Pesa
7. Payment status updated (completed/failed)
8. Revenue split processed
9. Booking confirmed
```

---

## Setup Instructions

### 1. Get M-Pesa Sandbox Credentials

1. Visit [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create account and login
3. Go to **My Apps** → **Create New App**
4. Select **Lipa Na M-Pesa Online** (STK Push)
5. Copy your credentials:
   - Consumer Key
   - Consumer Secret
   - Shortcode (Test: 174379)
   - Passkey

### 2. Configure Backend Environment

Update `backend/.env`:

```env
# M-Pesa Sandbox Credentials
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_INITIATOR_NAME=testapi
MPESA_SECURITY_CREDENTIAL=your_security_credential_here
MPESA_CALLBACK_URL=http://localhost:3001/api/payments/mpesa/callback
MPESA_RESULT_URL=http://localhost:3001/api/payments/mpesa/result

# Revenue Split Configuration
DEVELOPER_MPESA_NUMBER=254713809220
DEVELOPER_COMMISSION_PERCENTAGE=15
```

### 3. Expose Local Server (for Callbacks)

M-Pesa needs to send callbacks to your server. Use **ngrok** or similar:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 3001
ngrok http 3001
```

Update callback URL in `.env`:
```env
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/payments/mpesa/callback
```

**Also update in Safaricom Developer Portal:**
- Go to your app
- Update **Callback URL** to your ngrok URL

---

## File Structure

```
backend/
├── src/
│   ├── services/
│   │   └── mpesa.js              # M-Pesa service (STK Push, B2C, tokens)
│   ├── server.js                 # API endpoints (bookings, payments, callbacks)
│   └── database.js               # Database schema (bookings, payments)
└── .env                          # M-Pesa credentials

frontend/
├── src/
│   ├── components/
│   │   ├── BookingModal.tsx      # Appointment booking form
│   │   ├── PaymentModal.tsx      # M-Pesa payment UI
│   │   └── ClinicLocator.tsx     # Hospital list with booking buttons
│   └── services/
│       └── api.ts                # API calls (bookings, payments)
```

---

## API Endpoints

### Bookings

**POST** `/api/bookings`
```json
{
  "facilityId": "1",
  "patientName": "John Doe",
  "patientPhone": "0712345678",
  "appointmentDate": "2025-11-15",
  "appointmentTime": "10:00",
  "symptoms": "Headache and fever"
}
```

**Response:**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": "uuid",
    "facilityId": "1",
    "facilityName": "Nairobi Central Hospital",
    "patientName": "John Doe",
    "patientPhone": "0712345678",
    "appointmentDate": "2025-11-15",
    "appointmentTime": "10:00",
    "symptoms": "Headache and fever",
    "status": "pending",
    "paymentStatus": "unpaid",
    "consultationFee": 1000,
    "createdAt": "2025-11-14T10:00:00Z"
  }
}
```

---

### Payments

**POST** `/api/payments/initiate`
```json
{
  "bookingId": "booking-uuid",
  "phoneNumber": "0712345678"
}
```

**Response:**
```json
{
  "message": "STK Push initiated successfully",
  "payment": {
    "id": "payment-uuid",
    "checkoutRequestId": "ws_CO_14112025...",
    "amount": 1000,
    "status": "pending"
  },
  "instructions": "Please check your phone and enter your M-Pesa PIN"
}
```

**GET** `/api/payments/:id/status`

**Response:**
```json
{
  "id": "payment-uuid",
  "status": "completed",
  "amount": 1000,
  "mpesaReceiptNumber": "RKC12345",
  "completedAt": "2025-11-14T10:05:00Z",
  "splitProcessed": true
}
```

---

### M-Pesa Callback (Internal)

**POST** `/api/payments/mpesa/callback`

Receives callback from M-Pesa when payment is completed/failed.

```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "...",
      "CheckoutRequestID": "ws_CO_14112025...",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 1000 },
          { "Name": "MpesaReceiptNumber", "Value": "RKC12345" },
          { "Name": "PhoneNumber", "Value": "254712345678" }
        ]
      }
    }
  }
}
```

- `ResultCode: 0` = Success
- `ResultCode: 1032` = User cancelled
- Other codes = Various errors

---

## Revenue Split Logic

Located in: `backend/src/services/mpesa.js`

```javascript
calculateRevenueSplit(1000) {
  // Returns:
  {
    total: 1000,
    developerAmount: 150,    // 15%
    hospitalAmount: 850,     // 85%
    developerPercentage: 15,
    hospitalPercentage: 85
  }
}
```

After successful payment:
1. Calculate split amounts
2. Attempt B2C transfer to developer (254713809220)
3. Attempt B2C transfer to hospital
4. Log results in payment record

**Note**: B2C may not work in sandbox without approval.

---

## Frontend Components

### 1. BookingModal

**Location**: `src/components/BookingModal.tsx`

**Features**:
- Form with patient details
- Date/time pickers
- Symptoms textarea
- Shows consultation fee
- Creates booking on submission
- Opens PaymentModal after booking created

**Usage**:
```tsx
<BookingModal
  open={bookingModalOpen}
  onOpenChange={setBookingModalOpen}
  facility={{
    id: "1",
    name: "Nairobi Central Hospital",
    consultationFee: 1000,
  }}
  language="en"
  onBookingCreated={(booking) => {
    // Open payment modal with booking
  }}
/>
```

### 2. PaymentModal

**Location**: `src/components/PaymentModal.tsx`

**Features**:
- Shows booking details and consultation fee
- Displays revenue split (15% / 85%)
- Phone number input for M-Pesa
- Initiates STK Push
- Real-time payment status polling
- Success/failure UI with M-Pesa receipt

**States**:
- `idle` - Ready to pay
- `initiating` - Sending STK Push
- `pending` - Waiting for PIN entry
- `completed` - Payment successful
- `failed` - Payment failed

**Usage**:
```tsx
<PaymentModal
  open={paymentModalOpen}
  onOpenChange={setPaymentModalOpen}
  booking={{
    id: "booking-uuid",
    facilityName: "Nairobi Central Hospital",
    consultationFee: 1000,
    patientPhone: "0712345678",
  }}
  language="en"
  onPaymentSuccess={() => {
    // Booking confirmed!
  }}
/>
```

### 3. Updated ClinicLocator

**Changes**:
- Added "Book Appointment" button for hospitals with `consultationFee`
- Shows consultation fee in facility card
- Integrates BookingModal and PaymentModal
- Merges data from backend and OpenStreetMap

---

## Testing the Payment Flow

### Sandbox Testing (Free)

1. **Book an Appointment**:
   - Go to http://localhost:8080/
   - Scroll to "Find Nearby Healthcare Facilities"
   - Find a facility with "Book Appointment" button (backend clinics)
   - Click "Book Appointment"
   - Fill in the form
   - Click "Book Appointment"

2. **Pay for Consultation**:
   - Payment modal appears automatically
   - Enter M-Pesa phone number (sandbox: any Kenyan number)
   - Click "Pay with M-Pesa"

3. **Sandbox Behavior**:
   - STK Push will be sent
   - In sandbox, it may auto-complete or timeout
   - Check backend logs for callback data

4. **Check Results**:
   - Payment status updates in UI
   - M-Pesa receipt shown if successful
   - Booking status changes to "confirmed"

### Test Phone Numbers (Sandbox)

Safaricom provides test numbers:
- `254708374149` - Always succeeds
- `254708374148` - Always fails
- Others - May timeout or succeed randomly

---

## Database Schema

### Bookings Table

```json
{
  "id": "uuid",
  "facilityId": "1",
  "facilityName": "Nairobi Central Hospital",
  "patientName": "John Doe",
  "patientPhone": "0712345678",
  "appointmentDate": "2025-11-15",
  "appointmentTime": "10:00",
  "symptoms": "Headache and fever",
  "status": "pending | confirmed | cancelled | completed",
  "paymentStatus": "unpaid | pending | paid | failed",
  "consultationFee": 1000,
  "createdAt": "2025-11-14T10:00:00Z"
}
```

### Payments Table

```json
{
  "id": "uuid",
  "bookingId": "booking-uuid",
  "amount": 1000,
  "phoneNumber": "254712345678",
  "facilityPhone": "254712345678",
  "checkoutRequestId": "ws_CO_14112025...",
  "merchantRequestId": "29115-34620561-1",
  "status": "pending | completed | failed",
  "mpesaReceiptNumber": "RKC12345",
  "revenueSplit": {
    "total": 1000,
    "developerAmount": 150,
    "hospitalAmount": 850
  },
  "splitProcessed": true,
  "createdAt": "2025-11-14T10:00:00Z",
  "completedAt": "2025-11-14T10:05:00Z"
}
```

---

## Production Deployment

### 1. Switch to Production M-Pesa

Update `.env`:
```env
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=production_key
MPESA_CONSUMER_SECRET=production_secret
MPESA_SHORTCODE=your_production_shortcode
MPESA_PASSKEY=your_production_passkey
```

### 2. Use Public Domain

Replace `localhost` with your domain:
```env
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa/callback
```

Update in Safaricom Developer Portal.

### 3. Enable B2C (Optional)

1. Request B2C approval from Safaricom
2. Get security credential
3. Update `.env` with B2C credentials
4. Revenue split will work automatically

---

## Troubleshooting

### STK Push Not Received

- ✅ Check phone number format (254XXXXXXXXX)
- ✅ Verify M-Pesa credentials in `.env`
- ✅ Ensure callback URL is accessible (use ngrok)
- ✅ Check backend logs for errors

### Payment Stuck on Pending

- ✅ Check if callback URL is reachable
- ✅ Verify M-Pesa sent callback (check logs)
- ✅ Try manual status check via `/api/payments/:id/status`

### Revenue Split Not Working

- ✅ B2C requires approval from Safaricom
- ✅ In sandbox, B2C may not work
- ✅ Check `splitProcessed` and `splitResult` in payment record
- ✅ Revenue split is logged even if B2C fails

### Database Not Updating

- ✅ Check `backend/data/db.json` exists
- ✅ Verify database initialized on server start
- ✅ Check file permissions

---

## Security Best Practices

✅ **Environment Variables** - Never commit `.env` to git
✅ **HTTPS Required** - M-Pesa requires HTTPS in production
✅ **Validate Callbacks** - Verify callback source (IP whitelisting)
✅ **Rate Limiting** - Prevent payment spam
✅ **Logging** - Log all payment attempts for audit
✅ **Error Handling** - Graceful failures with user-friendly messages

---

## Cost & Limits

### M-Pesa Sandbox (FREE)
- ✅ Unlimited test transactions
- ✅ No cost
- ❌ B2C may not work
- ❌ Not for real transactions

### M-Pesa Production
- Transaction Fee: ~KES 1-3 per transaction
- Minimum: KES 10
- Maximum: KES 150,000 per transaction
- B2C Fee: Variable based on amount

---

## Summary

You now have a **complete M-Pesa payment system** with:

✅ **Booking System** - Patients book consultations
✅ **STK Push Integration** - Automated M-Pesa payments
✅ **Revenue Splitting** - 15% developer, 85% hospital
✅ **Real-time Status** - Live payment updates
✅ **Multi-language** - English & Swahili support
✅ **Production Ready** - Just need production credentials

**Total Cost**: KES 0 in sandbox, ~KES 1-3 per transaction in production

**Ready to test**: http://localhost:8080/ 🎉

---

## Support Resources

- [M-Pesa Developer Portal](https://developer.safaricom.co.ke/)
- [Daraja API Documentation](https://developer.safaricom.co.ke/Documentation)
- [M-Pesa Integration Guide](https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate)
- [Ngrok Documentation](https://ngrok.com/docs)
