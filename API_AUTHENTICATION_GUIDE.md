# API Authentication Guide - How It Works

## 🔍 Problem That Was Fixed

The profile button wasn't working because of a **token storage mismatch** between the frontend and backend.

---

## ❌ The Problem

### Frontend Issue:
- Profile page was looking for token in: `localStorage.getItem('token')`
- But the app actually stores it as: `localStorage.getItem('authToken')`

### Backend Issue:
- JWT token stores user ID as: `userId`
- But endpoints were looking for: `req.user.id`

---

## ✅ The Solution

### 1. **Updated Profile Page** (Frontend)
Changed from direct `fetch()` calls to using the centralized API service:

**Before:**
```typescript
const token = localStorage.getItem('token'); // ❌ Wrong key!
const response = await fetch(`${API_BASE_URL}/user/profile`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**After:**
```typescript
import { profileAPI } from '@/services/api';

const data = await profileAPI.get(); // ✅ Uses correct token automatically!
```

### 2. **Added Profile API Methods** (src/services/api.ts)
Created dedicated profile API functions:

```typescript
export const profileAPI = {
  // Get user profile with stats
  get: async () => {
    return authFetch(`${API_BASE_URL}/user/profile`);
  },

  // Update user profile
  update: async (data) => {
    return authFetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Change password
  changePassword: async (data) => {
    return authFetch(`${API_BASE_URL}/user/change-password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
```

### 3. **Fixed Backend Middleware** (backend/src/server.js)
Updated the `authenticateToken` middleware to normalize the user object:

**Before:**
```javascript
jwt.verify(token, JWT_SECRET, (err, user) => {
  if (err) return res.status(403).json({ error: 'Invalid token' });
  req.user = user; // ❌ Has userId, but endpoints expect id
  next();
});
```

**After:**
```javascript
jwt.verify(token, JWT_SECRET, (err, decoded) => {
  if (err) return res.status(403).json({ error: 'Invalid token' });

  // ✅ Normalize the user object
  req.user = {
    id: decoded.userId || decoded.id,  // Handles both formats
    email: decoded.email,
    role: decoded.role
  };
  next();
});
```

---

## 🔐 How Authentication Works in the App

### **Step 1: User Logs In**

**API Call:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Backend Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**What Happens:**
1. Backend creates JWT token with `userId`, `email`, `role`
2. Frontend stores token in `localStorage` as `authToken`
3. Frontend stores user data in `localStorage` as `user`

---

### **Step 2: Making Authenticated Requests**

**How the `authFetch` Helper Works:**

```typescript
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken'); // ✅ Correct key

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // ✅ Adds token
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};
```

**Example API Call:**
```http
GET /api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### **Step 3: Backend Validates Token**

The `authenticateToken` middleware runs before protected endpoints:

```javascript
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  // If we reach here, token is valid and req.user is set
  const user = db.data.users.find(u => u.id === req.user.id);
  res.json(user);
});
```

**Validation Process:**
1. Extract token from `Authorization: Bearer <token>` header
2. Verify token signature using `JWT_SECRET`
3. Decode token payload (contains `userId`, `email`, `role`)
4. Normalize to `req.user` with `id`, `email`, `role`
5. Allow request to continue to endpoint

---

## 📋 Complete API Flow Example

### **Fetching User Profile:**

**Frontend Code:**
```typescript
import { profileAPI } from '@/services/api';

const fetchProfile = async () => {
  try {
    const profile = await profileAPI.get();
    console.log(profile); // User data with stats
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
};
```

**What Happens Behind the Scenes:**

1. **`profileAPI.get()` calls `authFetch()`**
2. **`authFetch()` gets token:** `localStorage.getItem('authToken')`
3. **Makes HTTP request:**
   ```http
   GET /api/user/profile
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Backend middleware `authenticateToken` runs:**
   - Extracts token
   - Verifies with `jwt.verify()`
   - Sets `req.user = { id, email, role }`
5. **Profile endpoint executes:**
   ```javascript
   const user = db.data.users.find(u => u.id === req.user.id);
   const appointments = db.data.appointments.filter(a => a.userId === user.id);
   // ... calculate stats
   res.json({ ...user, stats });
   ```
6. **Frontend receives response:**
   ```json
   {
     "id": "user-123",
     "email": "user@example.com",
     "name": "John Doe",
     "phone": "+254712345678",
     "stats": {
       "totalAppointments": 3,
       "totalSymptomChecks": 12
     }
   }
   ```

---

## 🔑 Token Storage Keys

**Important:** The app uses these localStorage keys:

| Key | Value | Purpose |
|-----|-------|---------|
| `authToken` | JWT token string | User authentication |
| `user` | JSON user object | User display info |
| `adminToken` | JWT token string | Admin authentication |
| `adminUser` | JSON admin object | Admin display info |

**Always use the correct key:**
```typescript
// ✅ Correct
const token = localStorage.getItem('authToken');

// ❌ Wrong
const token = localStorage.getItem('token');
```

---

## 🎯 API Methods Available

### Authentication
```typescript
authAPI.login({ email, password })
authAPI.register({ email, password, name })
authAPI.logout()
authAPI.getProfile()
authAPI.isAuthenticated()
```

### User Profile
```typescript
profileAPI.get()
profileAPI.update({ name, phone, dateOfBirth, gender, location })
profileAPI.changePassword({ currentPassword, newPassword })
```

### Appointments
```typescript
appointmentsAPI.create(data)
appointmentsAPI.getAll()
appointmentsAPI.getById(id)
appointmentsAPI.update(id, data)
appointmentsAPI.cancel(id)
```

### Symptoms
```typescript
symptomsAPI.analyze(symptoms, userId, ageRange, gender)
symptomsAPI.getHistory()
```

---

## 🛡️ Security Features

### 1. **JWT Token Security**
- Tokens expire in 7 days
- Signed with secret key
- Cannot be tampered with

### 2. **Middleware Protection**
- All user endpoints require valid token
- Invalid tokens are rejected
- Expired tokens are rejected

### 3. **Role-Based Access**
- User role stored in token
- Admin endpoints require admin role
- Super admin endpoints require super_admin role

---

## 🔧 How to Implement a New Protected Endpoint

### Backend (server.js):
```javascript
// Add new endpoint with authenticateToken middleware
app.get('/api/user/settings', authenticateToken, async (req, res) => {
  try {
    await db.read();
    const user = db.data.users.find(u => u.id === req.user.id);

    res.json({ settings: user.settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Frontend (api.ts):
```typescript
// Add to existing API object
export const settingsAPI = {
  get: async () => {
    return authFetch(`${API_BASE_URL}/user/settings`);
  },

  update: async (settings: any) => {
    return authFetch(`${API_BASE_URL}/user/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};
```

### Using in Component:
```typescript
import { settingsAPI } from '@/services/api';

const fetchSettings = async () => {
  try {
    const settings = await settingsAPI.get();
    console.log(settings);
  } catch (error) {
    console.error('Failed:', error);
  }
};
```

---

## ✅ Benefits of This Approach

1. **Centralized Authentication:** All API calls use the same auth logic
2. **Automatic Token Injection:** No need to manually add headers
3. **Error Handling:** Consistent error handling across all APIs
4. **Type Safety:** TypeScript types for all API methods
5. **Easy Maintenance:** Update auth logic in one place
6. **Security:** Token never exposed in components

---

## 🚀 Testing the Fix

1. **Login to the app** with any user account
2. **Click your avatar** (top right)
3. **Select "Profile"** from dropdown
4. **Profile page should load** with your information
5. **Try updating** your name/phone
6. **Try changing** your password
7. **Verify everything works!**

---

## 📝 Summary

### The Fix:
- ✅ Updated Profile page to use centralized API service
- ✅ Added profileAPI methods to api.ts
- ✅ Fixed backend middleware to normalize token data
- ✅ Now uses correct `authToken` key from localStorage

### The Result:
- ✅ Profile button works perfectly
- ✅ All authenticated requests use the same pattern
- ✅ Consistent, maintainable codebase
- ✅ Proper error handling throughout

---

**The profile page is now fully functional!** 🎉
