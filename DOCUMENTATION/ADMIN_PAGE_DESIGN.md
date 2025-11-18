# Admin Page - Design & Implementation Plan

## 🎯 Overview

Create a secure admin dashboard accessible **only to registered developers/administrators**, completely separate from regular users.

---

## 🔐 Security Architecture

### Role-Based Access Control (RBAC)

```
User Roles:
├── user (default)      → Regular app users
├── admin               → System administrators
└── super_admin         → Full system access (optional)
```

### User Schema Update

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "password": "hashed_password",
  "name": "User Name",
  "role": "user | admin | super_admin",
  "isActive": true,
  "createdAt": "ISO timestamp",
  "lastLogin": "ISO timestamp",
  "permissions": ["read", "write", "delete"]  // Optional fine-grained control
}
```

### Authentication Flow

```
1. Admin Login → /admin/login (separate from user login)
2. Verify role === 'admin' || 'super_admin'
3. Issue admin-specific JWT with role claim
4. Protect all /admin/* routes with middleware
5. Frontend: ProtectedAdminRoute component
```

---

## 📊 Admin Dashboard Features

### 1. **Dashboard Overview** (`/admin`)

**Metrics Cards:**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Users │ Today's     │ Total       │ Revenue     │
│    1,247    │ Appointments│ Bookings    │  KES 45K    │
│  +12% ↑     │     23      │    456      │  +8% ↑      │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Charts:**
- User growth over time (line chart)
- Appointments by status (pie chart)
- Symptom checker usage (bar chart)
- Revenue trends (area chart)

**Recent Activity:**
- Latest user registrations
- Recent bookings
- Recent payments
- System health alerts

---

### 2. **User Management** (`/admin/users`)

**Features:**
- ✅ View all users (paginated table)
- ✅ Search users (by name, email, phone)
- ✅ Filter by role, status, date joined
- ✅ View user details (modal)
- ✅ Edit user information
- ✅ Activate/Deactivate users
- ✅ Promote user to admin (super_admin only)
- ✅ Delete users (with confirmation)
- ✅ Export users to CSV

**Table Columns:**
| ID | Name | Email | Role | Status | Joined | Actions |
|----|------|-------|------|--------|--------|---------|
| 001 | John | john@... | user | Active | 2025-01-15 | View/Edit/Delete |

---

### 3. **Appointments Management** (`/admin/appointments`)

**Features:**
- ✅ View all appointments (all users)
- ✅ Filter by status (confirmed, cancelled, completed)
- ✅ Filter by date range
- ✅ Filter by doctor/clinic
- ✅ View appointment details
- ✅ Update appointment status
- ✅ Cancel appointments
- ✅ Send reminders (SMS/Email)
- ✅ Export to CSV

**Appointment Details:**
```
┌──────────────────────────────────┐
│ Appointment #12345               │
├──────────────────────────────────┤
│ Patient: John Doe                │
│ Doctor: Dr. Sarah Kamau           │
│ Date: 2025-01-20 @ 10:00 AM      │
│ Status: Confirmed                │
│ Reason: Checkup                  │
│ Phone: +254712345678             │
│ Email: john@example.com          │
│                                  │
│ [Update Status] [Cancel] [Send Reminder] │
└──────────────────────────────────┘
```

---

### 4. **Bookings & Payments** (`/admin/bookings`)

**Features:**
- ✅ View all bookings with payment status
- ✅ Filter by payment status (paid, pending, failed)
- ✅ View payment details
- ✅ M-Pesa transaction tracking
- ✅ Revenue analytics
- ✅ Refund management
- ✅ Export financial reports

**Booking Table:**
| Booking ID | Patient | Clinic | Date | Amount | Payment | M-Pesa Receipt | Actions |
|------------|---------|--------|------|--------|---------|----------------|---------|
| BK-001 | John | Central Hospital | 2025-01-20 | 1,000 | Paid | ABC123XYZ | View/Refund |

---

### 5. **Clinics & Doctors** (`/admin/clinics`, `/admin/doctors`)

**Clinic Management:**
- ✅ Add new clinics
- ✅ Edit clinic information
- ✅ Update consultation fees
- ✅ Manage clinic services
- ✅ Update operating hours
- ✅ Set M-Pesa payment numbers
- ✅ Delete clinics

**Doctor Management:**
- ✅ Add new doctors
- ✅ Edit doctor profiles
- ✅ Update specialties
- ✅ Manage availability schedules
- ✅ View doctor statistics (appointments count)
- ✅ Delete doctors

---

### 6. **Health News Management** (`/admin/news`)

**Features:**
- ✅ View cached news articles
- ✅ Manually refresh news cache
- ✅ Block/hide specific articles
- ✅ Add custom health tips
- ✅ Manage RSS feed sources
- ✅ Configure Guardian API key

---

### 7. **Symptom Checker Analytics** (`/admin/symptom-analysis`)

**Features:**
- ✅ View all symptom analyses
- ✅ Filter by urgency level (low, medium, high)
- ✅ View common symptoms patterns
- ✅ Anonymous vs authenticated analyses
- ✅ Track AI vs keyword-based results
- ✅ Export symptom data for research

**Insights:**
```
Most Common Symptoms:
1. Fever (342 instances)
2. Headache (278 instances)
3. Cough (234 instances)

Urgency Distribution:
- Low: 60%
- Medium: 30%
- High: 10%
```

---

### 8. **System Settings** (`/admin/settings`)

**Sections:**

#### General Settings
- App name & description
- Contact information
- Support email/phone
- Maintenance mode toggle

#### API Configuration
- OpenRouter API key
- Guardian API key
- M-Pesa credentials (view only, not editable for security)
- News feed URLs

#### Feature Toggles
- Enable/disable symptom checker
- Enable/disable bookings
- Enable/disable payments
- Enable/disable health news

#### Email Settings
- SMTP configuration
- Email templates
- Notification preferences

---

### 9. **Admin Activity Logs** (`/admin/logs`)

**Track:**
- ✅ Admin login attempts
- ✅ User role changes
- ✅ Data modifications (who, what, when)
- ✅ Deleted records
- ✅ System configuration changes
- ✅ Failed authentication attempts

**Log Entry:**
```
[2025-01-15 14:32:45] Admin 'admin@safiri.com'
  → Updated user 'john@example.com' role from 'user' to 'admin'
```

---

## 🎨 UI Design Mockup

### Admin Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Safiri Afya Admin          [User: admin@] [Logout]   │
├─────────────────────────────────────────────────────────────┤
│ SIDEBAR      │ MAIN CONTENT AREA                            │
│              │                                               │
│ 📊 Dashboard  │  ┌──────────────────────────────────────┐   │
│ 👥 Users      │  │  Dashboard Overview                  │   │
│ 📅 Appointments│  ├──────────────────────────────────────┤   │
│ 💳 Bookings   │  │  [Metrics Cards]                    │   │
│ 🏥 Clinics    │  │  [Charts & Graphs]                  │   │
│ 👨‍⚕️ Doctors    │  │  [Recent Activity]                  │   │
│ 📰 News       │  └──────────────────────────────────────┘   │
│ 🩺 Symptoms   │                                               │
│ ⚙️ Settings   │                                               │
│ 📋 Logs       │                                               │
│              │                                               │
└─────────────────────────────────────────────────────────────┘
```

### Color Scheme (Dark Mode Support)

```css
/* Light Mode */
Background: #F9FAFB
Sidebar: #FFFFFF
Primary: #2563EB (Blue)
Success: #10B981 (Green)
Warning: #F59E0B (Orange)
Danger: #EF4444 (Red)

/* Dark Mode */
Background: #111827
Sidebar: #1F2937
Primary: #3B82F6
Success: #34D399
Warning: #FBBF24
Danger: #F87171
```

---

## 🔒 Security Measures

### 1. **Route Protection**

**Backend Middleware:**
```javascript
// middleware/adminAuth.js
const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};
```

**Frontend Route Guard:**
```tsx
// components/ProtectedAdminRoute.tsx
const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};
```

### 2. **Separate Admin Login**

- Different login page: `/admin/login`
- Different JWT claims (includes `role`)
- Different session management
- Admin sessions expire faster (30 minutes vs 7 days for users)

### 3. **Audit Trail**

- Log all admin actions
- Track IP addresses
- Record timestamps
- Store before/after values for updates

### 4. **Two-Factor Authentication (Future)**

- SMS-based 2FA for admin logins
- TOTP (Time-based One-Time Password)
- Backup codes

---

## 📁 File Structure

```
src/
├── pages/
│   └── admin/
│       ├── AdminLogin.tsx          # Separate admin login
│       ├── Dashboard.tsx           # Main dashboard
│       ├── Users.tsx               # User management
│       ├── Appointments.tsx        # Appointments management
│       ├── Bookings.tsx            # Bookings & payments
│       ├── Clinics.tsx             # Clinic management
│       ├── Doctors.tsx             # Doctor management
│       ├── News.tsx                # News management
│       ├── SymptomAnalytics.tsx   # Symptom analytics
│       ├── Settings.tsx            # System settings
│       └── Logs.tsx                # Activity logs
│
├── components/
│   └── admin/
│       ├── AdminLayout.tsx         # Admin shell with sidebar
│       ├── AdminSidebar.tsx        # Navigation sidebar
│       ├── AdminNavbar.tsx         # Top navbar
│       ├── ProtectedAdminRoute.tsx # Route guard
│       ├── MetricCard.tsx          # Dashboard metric card
│       ├── UserTable.tsx           # User management table
│       ├── AppointmentTable.tsx    # Appointments table
│       └── Charts/                 # Chart components
│           ├── LineChart.tsx
│           ├── PieChart.tsx
│           └── BarChart.tsx
│
└── contexts/
    └── AdminContext.tsx            # Admin-specific context
```

---

## 🗄️ Database Changes

### Add to `db.json`:

```json
{
  "users": [
    {
      "id": "admin-001",
      "email": "admin@safiri.com",
      "password": "$hashed_password",
      "name": "System Admin",
      "role": "super_admin",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "lastLogin": "2025-01-15T10:30:00Z",
      "permissions": ["*"]
    }
  ],
  "adminLogs": [
    {
      "id": "log-001",
      "adminId": "admin-001",
      "action": "user_role_update",
      "details": "Changed user john@example.com role to admin",
      "timestamp": "2025-01-15T14:32:45Z",
      "ipAddress": "192.168.1.100"
    }
  ],
  "systemSettings": {
    "appName": "Safiri Afya",
    "maintenanceMode": false,
    "featuresEnabled": {
      "symptomChecker": true,
      "bookings": true,
      "payments": true,
      "healthNews": true
    },
    "apiKeys": {
      "guardianApiKey": "***",
      "openRouterApiKey": "***"
    }
  }
}
```

---

## 🔧 Backend API Endpoints

### Admin Authentication
```
POST   /api/admin/login              # Admin login
POST   /api/admin/logout             # Admin logout
GET    /api/admin/verify             # Verify admin session
```

### User Management
```
GET    /api/admin/users              # Get all users (paginated)
GET    /api/admin/users/:id          # Get user by ID
PUT    /api/admin/users/:id          # Update user
PUT    /api/admin/users/:id/role     # Update user role
DELETE /api/admin/users/:id          # Delete user
GET    /api/admin/users/export       # Export users CSV
```

### Analytics
```
GET    /api/admin/analytics/overview    # Dashboard metrics
GET    /api/admin/analytics/users       # User analytics
GET    /api/admin/analytics/appointments# Appointment stats
GET    /api/admin/analytics/revenue     # Revenue stats
GET    /api/admin/analytics/symptoms    # Symptom patterns
```

### System Management
```
GET    /api/admin/settings              # Get settings
PUT    /api/admin/settings              # Update settings
GET    /api/admin/logs                  # Get activity logs
POST   /api/admin/news/refresh          # Refresh news cache
```

---

## 📊 Sample Admin Dashboard Data

### Metrics

```javascript
{
  totalUsers: 1247,
  usersChange: +12, // percentage
  todaysAppointments: 23,
  totalBookings: 456,
  revenue: 45000, // KES
  revenueChange: +8, // percentage
  activeUsers: 892,
  pendingPayments: 12,
  symptomChecks: 3421
}
```

### Charts Data

```javascript
// User growth (last 30 days)
userGrowth: [
  { date: '2025-01-01', users: 1100 },
  { date: '2025-01-08', users: 1150 },
  { date: '2025-01-15', users: 1247 }
]

// Appointment status
appointmentStatus: [
  { name: 'Confirmed', value: 320, color: '#10B981' },
  { name: 'Cancelled', value: 89, color: '#EF4444' },
  { name: 'Completed', value: 47, color: '#3B82F6' }
]

// Revenue trend
revenueTrend: [
  { month: 'Oct', revenue: 32000 },
  { month: 'Nov', revenue: 38000 },
  { month: 'Dec', revenue: 41000 },
  { month: 'Jan', revenue: 45000 }
]
```

---

## 🚀 Implementation Steps

### Phase 1: Foundation (Days 1-2)
1. ✅ Update user schema with `role` field
2. ✅ Create default admin user in database
3. ✅ Implement admin authentication middleware
4. ✅ Create ProtectedAdminRoute component
5. ✅ Build AdminLayout with sidebar

### Phase 2: Core Features (Days 3-5)
6. ✅ Build Dashboard with metrics
7. ✅ Implement User Management page
8. ✅ Implement Appointments Management
9. ✅ Implement Bookings & Payments page

### Phase 3: Extended Features (Days 6-7)
10. ✅ Add Clinics & Doctors management
11. ✅ Add Health News management
12. ✅ Add Symptom Analytics
13. ✅ Add System Settings

### Phase 4: Polish (Day 8)
14. ✅ Add Activity Logs
15. ✅ Add export functionality
16. ✅ Add charts/visualizations
17. ✅ Testing & bug fixes

---

## 🎨 Component Examples

### MetricCard Component

```tsx
<MetricCard
  title="Total Users"
  value="1,247"
  change="+12%"
  trend="up"
  icon={<Users className="w-6 h-6" />}
  color="blue"
/>
```

### UserTable Component

```tsx
<UserTable
  users={users}
  onEdit={(user) => handleEdit(user)}
  onDelete={(user) => handleDelete(user)}
  onRoleChange={(user, role) => handleRoleChange(user, role)}
  pagination={{
    page: 1,
    pageSize: 20,
    total: 1247
  }}
/>
```

---

## 🔐 Default Admin Credentials

**For initial setup:**
```
Email: admin@safiri.com
Password: Admin@2025! (change immediately)
Role: super_admin
```

**Security Notes:**
- Must change password on first login
- Enable 2FA (future feature)
- Restrict IP access (production)

---

## ✅ Features Summary

### Must-Have (Phase 1-2)
- [x] Admin authentication
- [x] Dashboard overview
- [x] User management
- [x] Appointments management
- [x] Bookings & payments

### Nice-to-Have (Phase 3-4)
- [x] Clinics/Doctors management
- [x] News management
- [x] Symptom analytics
- [x] Activity logs
- [x] Export functionality
- [x] Charts & visualizations

### Future Enhancements
- [ ] Two-factor authentication
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics
- [ ] Role-based permissions (fine-grained)
- [ ] Multi-language admin panel

---

## 🎯 Success Criteria

1. **Security**: Only users with `admin` role can access
2. **Functionality**: All CRUD operations work correctly
3. **Performance**: Page loads < 2 seconds
4. **UX**: Intuitive navigation, clear actions
5. **Mobile**: Responsive admin panel (optional)
6. **Audit**: All actions logged
7. **Export**: CSV export for all data tables

---

## 📝 Testing Checklist

- [ ] Admin login works
- [ ] Regular users cannot access `/admin/*`
- [ ] All data tables load correctly
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] Charts render correctly
- [ ] Export to CSV works
- [ ] Role changes work (super_admin only)
- [ ] Activity logs record actions
- [ ] Session timeout works
- [ ] Mobile responsiveness (if implemented)

---

## 🚨 Security Warnings

1. **Never commit admin credentials** to version control
2. **Always use HTTPS** in production
3. **Implement rate limiting** on admin endpoints
4. **Log all admin actions** for accountability
5. **Regular security audits** of admin functions
6. **IP whitelisting** in production (optional)
7. **Strong password requirements** for admin accounts

---

## 📊 Estimated Complexity

**Time Estimate**: 6-8 days (full-time)
- Foundation: 2 days
- Core Features: 3 days
- Extended Features: 2 days
- Polish & Testing: 1-2 days

**Lines of Code**: ~3,000-4,000 LOC
- Backend: ~1,000 LOC
- Frontend: ~2,000-3,000 LOC

**Complexity**: Medium-High
- Authentication: Medium
- CRUD Operations: Low-Medium
- Analytics/Charts: Medium
- Export Features: Low

---

## 🎉 Ready to Implement?

This design provides:
✅ Complete security architecture
✅ Comprehensive feature list
✅ Clear UI/UX design
✅ Database schema
✅ API endpoints
✅ Implementation roadmap

**Next Steps:**
1. Review this design
2. Confirm features to include
3. Approve security model
4. Begin Phase 1 implementation

Would you like me to proceed with implementation?
