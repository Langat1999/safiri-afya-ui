# Authentication System Guide

This project now includes a comprehensive JWT-based authentication system integrated with your existing Node.js/Express backend and React frontend.

## Features Implemented

### Backend (Express.js)
- **User Registration** - Create new user accounts with encrypted passwords
- **User Login** - Authenticate users with email and password
- **JWT Token Authentication** - Secure token-based authentication
- **Password Hashing** - Using bcryptjs for secure password storage
- **Token Refresh** - Extend user sessions without re-login
- **Password Reset** - Three-step password reset flow with verification codes
- **Protected Routes** - Middleware to protect authenticated endpoints

### Frontend (React + TypeScript)
- **Auth Context** - Global authentication state management
- **Login Page** - Beautiful UI for user login
- **Register Page** - User-friendly registration form
- **Forgot Password Flow** - Multi-step password reset process
- **Protected Routes** - Automatic redirect for unauthenticated users
- **Navbar with Auth Status** - Shows user info and logout option
- **Appointments Page** - Protected page requiring authentication

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
npm install
```

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001/api
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Body: { "email": "user@example.com", "password": "password123", "name": "John Doe" }
Response: { "token": "jwt-token", "user": {...} }
```

#### Login
```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password123" }
Response: { "token": "jwt-token", "user": {...} }
```

#### Get Profile (Protected)
```
GET /api/user/profile
Headers: { "Authorization": "Bearer <token>" }
Response: { "id": "...", "email": "...", "name": "..." }
```

#### Refresh Token (Protected)
```
POST /api/auth/refresh
Headers: { "Authorization": "Bearer <token>" }
Response: { "token": "new-jwt-token" }
```

#### Forgot Password
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
Response: { "message": "...", "resetCode": "123456" }
```

Note: In production, the reset code should be sent via email, not returned in the response.

#### Verify Reset Code
```
POST /api/auth/verify-reset-code
Body: { "email": "user@example.com", "code": "123456" }
Response: { "message": "Code verified successfully" }
```

#### Reset Password
```
POST /api/auth/reset-password
Body: { "email": "user@example.com", "code": "123456", "newPassword": "newpassword123" }
Response: { "message": "Password reset successfully" }
```

## Using Authentication in Your App

### 1. Using the Auth Hook

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout, register } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user?.name}!</div>;
  }

  return <div>Please log in</div>;
}
```

### 2. Creating Protected Routes

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 3. Making Authenticated API Calls

The `authFetch` helper in `src/services/api.ts` automatically includes the JWT token:

```typescript
import { appointmentsAPI } from '@/services/api';

// This automatically includes the auth token
const appointments = await appointmentsAPI.getAll();
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcryptjs with 10 salt rounds
2. **JWT Tokens**: Secure token-based authentication with 7-day expiry
3. **Protected Routes**: Backend middleware validates tokens on protected endpoints
4. **Reset Code Expiry**: Password reset codes expire after 1 hour
5. **Secure Password Storage**: Passwords are never stored in plain text

## Frontend Routes

- `/` - Home page (public)
- `/login` - Login page (public)
- `/register` - Registration page (public)
- `/forgot-password` - Password reset flow (public)
- `/appointments` - User appointments (protected)

## Production Deployment Checklist

Before deploying to production:

1. **Change JWT Secret**: Generate a strong, random JWT secret
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Set up Email Service**: Replace the console.log password reset code with actual email sending (use SendGrid, AWS SES, etc.)

3. **Enable HTTPS**: Ensure all communication is over HTTPS

4. **Update CORS Settings**: Restrict CORS to your production domain

5. **Add Rate Limiting**: Implement rate limiting on auth endpoints to prevent brute force attacks

6. **Remove Debug Code**: Remove the `resetCode` from the forgot-password response

7. **Add Email Verification**: Optionally add email verification for new registrations

8. **Set Secure Cookie Flags**: If using cookies, set `httpOnly`, `secure`, and `sameSite` flags

## Customization

### Changing Token Expiry

In `backend/src/server.js`, modify the `expiresIn` option:
```javascript
const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
  expiresIn: '30d' // Change to your preferred duration
});
```

### Adding User Roles

Extend the user object in the database to include roles:
```javascript
const newUser = {
  id: uuidv4(),
  email,
  password: hashedPassword,
  name,
  role: 'user', // Add role field
  createdAt: new Date().toISOString()
};
```

Then check roles in the auth middleware:
```javascript
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

## Troubleshooting

### "Invalid or expired token" error
- Token has expired (7 days by default)
- Token was generated with a different JWT_SECRET
- User should log in again

### CORS errors
- Ensure backend CORS is configured to allow your frontend URL
- Check that the VITE_API_URL environment variable is set correctly

### Password reset code not working
- Code expires after 1 hour
- Verify the email matches the one used to request the code
- Check backend console for the generated code (demo mode)

## Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check the backend server logs
3. Verify environment variables are set correctly
4. Ensure both frontend and backend servers are running

## Next Steps

Consider implementing:
- OAuth integration (Google, Facebook, etc.) using Passport.js
- Two-factor authentication (2FA)
- Email verification on registration
- Session management and device tracking
- Refresh token rotation for enhanced security
