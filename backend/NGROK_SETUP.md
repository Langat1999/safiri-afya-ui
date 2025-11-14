# ngrok Setup for M-Pesa Testing

## Step 1: Start ngrok

Open a **new terminal window** and run:

```bash
ngrok http 3001
```

You'll see output like this:
```
Session Status                online
Account                       your-account (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abcd-1234-5678.ngrok-free.app -> http://localhost:3001
```

## Step 2: Copy the HTTPS URL

Copy the **https://** URL (e.g., `https://abcd-1234-5678.ngrok-free.app`)

## Step 3: Update .env File

Open `backend/.env` and update these lines:

```env
# Replace with your ngrok URL
MPESA_CALLBACK_URL=https://YOUR-NGROK-URL.ngrok-free.app/api/payments/mpesa/callback
MPESA_RESULT_URL=https://YOUR-NGROK-URL.ngrok-free.app/api/payments/mpesa/result
```

## Step 4: Restart Backend Server

Stop the backend (Ctrl+C) and restart it:

```bash
cd backend
npm run dev
```

## Step 5: Test M-Pesa Payment

1. Go to your frontend: http://localhost:8081
2. Find a nearby hospital
3. Click "Book Appointment"
4. Fill in the booking form
5. Enter your M-Pesa number (Kenyan number: 07XXXXXXXX)
6. Check your phone for the STK push prompt
7. Enter your M-Pesa PIN
8. The payment should complete and update automatically!

## Important Notes

- **Keep ngrok running** while testing - if you close it, the URL changes
- Each time you restart ngrok, you get a **new URL** - update .env again
- ngrok Free tier URLs expire after 2 hours
- For production, deploy to a real server (Heroku, Railway, etc.)

## Troubleshooting

If payment doesn't complete:
1. Check ngrok is still running
2. Check backend console for callback logs
3. Visit http://localhost:4040 to see ngrok request inspector
4. Verify .env has the correct ngrok URL
