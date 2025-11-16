import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma, {
  parseClinicServices,
  parseDoctorAvailability,
  parseClinics,
  parseDoctors,
  prepareClinicForDB,
  prepareDoctorForDB
} from './prismadb.js';
import mpesaService from './services/mpesa.js';
import emailService from './services/emailService.js';
import { requireAdmin, requireSuperAdmin, logAdminActivity } from './middleware/adminAuth.js';
import {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  createAppointmentSchema,
  createBookingSchema,
  initiatePaymentSchema,
  analyzeSymptomsSchema,
  updateSettingsSchema,
  deleteAccountSchema,
  updateUserSchema,
  createClinicSchema
} from './middleware/validation.js';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';
import rateLimit from 'express-rate-limit';

dotenv.config();

// Environment variable validation
const requiredEnvVars = ['JWT_SECRET', 'MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_PASSKEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

if (missingEnvVars.length > 0) {
  console.warn('⚠️  Warning: Missing environment variables:', missingEnvVars.join(', '));
  console.warn('⚠️  Running in development mode with defaults');
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'safiri-afya-secret-key-change-in-production';
const HF_API_TOKEN = process.env.HF_API_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Middleware - CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8080', 'http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Rate Limiting Configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: 'Too many payment attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

// Database initialization handled by Prisma migrations
// No manual initialization needed - run: npx prisma migrate dev

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // Normalize the user object (handle both 'id' and 'userId')
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  });
};

// ============= AUTHENTICATION ENDPOINTS =============

// Register new user
app.post('/api/auth/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER', // Prisma enum value
        isActive: true
        // createdAt, updatedAt, and other defaults are handled by Prisma
      }
    });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(email, name).catch(err => {
      console.error('Failed to send welcome email:', err.message);
    });

    // Generate token
    const token = jwt.sign({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Login user
app.post('/api/auth/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate token with role information
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        appointments: true,
        symptomHistory: true,
        bookings: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      location: user.location || '',
      profilePicture: user.profilePicture || '',
      role: user.role || 'USER',
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      stats: {
        totalAppointments: user.appointments.length,
        totalSymptomChecks: user.symptomHistory.length,
        totalBookings: user.bookings.length,
        accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) // days
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, validate(updateProfileSchema), async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, location, profilePicture } = req.body;

    // Build update data object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (location !== undefined) updateData.location = location;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        location: user.location,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Change password
app.put('/api/user/change-password', authenticateToken, validate(changePasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get user settings
app.get('/api/user/settings', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        dataSharing: true,
        language: true,
        theme: true,
        timezone: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      settings: {
        notifications: {
          email: user.emailNotifications,
          sms: user.smsNotifications,
          push: user.pushNotifications
        },
        privacy: {
          dataSharing: user.dataSharing
        },
        preferences: {
          language: user.language,
          theme: user.theme,
          timezone: user.timezone
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Update user settings
app.put('/api/user/settings', authenticateToken, validate(updateSettingsSchema), async (req, res) => {
  try {
    const { notifications, privacy, preferences } = req.body;

    // Build update data object
    const updateData = {};

    // Update notification settings
    if (notifications) {
      if (notifications.email !== undefined) updateData.emailNotifications = notifications.email;
      if (notifications.sms !== undefined) updateData.smsNotifications = notifications.sms;
      if (notifications.push !== undefined) updateData.pushNotifications = notifications.push;
    }

    // Update privacy settings
    if (privacy) {
      if (privacy.dataSharing !== undefined) updateData.dataSharing = privacy.dataSharing;
    }

    // Update preferences
    if (preferences) {
      if (preferences.language !== undefined) updateData.language = preferences.language;
      if (preferences.theme !== undefined) updateData.theme = preferences.theme;
      if (preferences.timezone !== undefined) updateData.timezone = preferences.timezone;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        dataSharing: true,
        language: true,
        theme: true,
        timezone: true
      }
    });

    res.json({
      message: 'Settings updated successfully',
      settings: {
        notifications: {
          email: user.emailNotifications,
          sms: user.smsNotifications,
          push: user.pushNotifications
        },
        privacy: {
          dataSharing: user.dataSharing
        },
        preferences: {
          language: user.language,
          theme: user.theme,
          timezone: user.timezone
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Delete user account
app.delete('/api/user/account', authenticateToken, validate(deleteAccountSchema), async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Delete user (cascade delete will remove appointments, symptomHistory, bookings)
    await prisma.user.delete({
      where: { id: user.id }
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Refresh token
app.post('/api/auth/refresh', authenticateToken, async (req, res) => {
  try {
    // Generate new token with extended expiry
    const token = jwt.sign({ id: req.user.id, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Request password reset
app.post('/api/auth/forgot-password', authLimiter, validate(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If the email exists, a reset code has been sent.' });
    }

    // Generate reset token (6-digit code)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    // Delete any existing reset codes for this email
    await prisma.passwordReset.deleteMany({
      where: { email }
    });

    // Store reset code
    await prisma.passwordReset.create({
      data: {
        email,
        code: resetCode,
        expiresAt: resetExpiry
      }
    });

    // Send password reset email (non-blocking)
    emailService.sendPasswordResetEmail(email, user.name, resetCode).catch(err => {
      console.error('Failed to send password reset email:', err.message);
    });

    // For development only - also log to console
    console.log(`[DEV] Password reset code for ${email}: ${resetCode}`);

    res.json({
      message: 'If the email exists, a reset code has been sent. Please check your email.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Verify reset code
app.post('/api/auth/verify-reset-code', authLimiter, validate(verifyResetCodeSchema), async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        email,
        code
      }
    });

    if (!resetRequest) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Check if code has expired
    if (new Date() > new Date(resetRequest.expiresAt)) {
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    res.json({ message: 'Code verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Reset password
app.post('/api/auth/reset-password', authLimiter, validate(resetPasswordSchema), async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    // Verify reset code
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        email,
        code
      }
    });

    if (!resetRequest) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Check if code has expired
    if (new Date() > new Date(resetRequest.expiresAt)) {
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    });

    // Remove used reset code
    await prisma.passwordReset.delete({
      where: { id: resetRequest.id }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ============= CLINIC ENDPOINTS =============

// Get all clinics
app.get('/api/clinics', async (req, res) => {
  try {
    const clinics = await prisma.clinic.findMany();
    const parsedClinics = parseClinics(clinics); // Parse services JSON string to array
    res.json(parsedClinics);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get clinic by ID
app.get('/api/clinics/:id', async (req, res) => {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: req.params.id }
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    const parsedClinic = parseClinicServices(clinic); // Parse services JSON string to array
    res.json(parsedClinic);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Search clinics by location
app.post('/api/clinics/search', async (req, res) => {
  try {
    const { location } = req.body;

    if (!location) {
      const clinics = await prisma.clinic.findMany();
      return res.json(parseClinics(clinics));
    }

    const filtered = await prisma.clinic.findMany({
      where: {
        OR: [
          { location: { contains: location, mode: 'insensitive' } },
          { name: { contains: location, mode: 'insensitive' } }
        ]
      }
    });

    res.json(parseClinics(filtered));
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get nearby clinics (simplified - in production, use geospatial queries)
app.post('/api/clinics/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10 } = req.body;

    // Get all clinics from database
    const allClinics = await prisma.clinic.findMany();

    // Simple distance calculation (for production, use proper geospatial library)
    const clinics = parseClinics(allClinics).map(clinic => {
      const distance = Math.sqrt(
        Math.pow(clinic.latitude - lat, 2) +
        Math.pow(clinic.longitude - lng, 2)
      ) * 111; // Rough conversion to km

      return { ...clinic, calculatedDistance: distance.toFixed(1) + ' km' };
    })
    .filter(clinic => parseFloat(clinic.calculatedDistance) <= maxDistance)
    .sort((a, b) => parseFloat(a.calculatedDistance) - parseFloat(b.calculatedDistance));

    res.json(clinics);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ============= DOCTOR ENDPOINTS =============

// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany();
    const parsedDoctors = parseDoctors(doctors); // Parse availability JSON string to array
    res.json(parsedDoctors);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get doctor by ID
app.get('/api/doctors/:id', async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const parsedDoctor = parseDoctorAvailability(doctor); // Parse availability JSON string to array
    res.json(parsedDoctor);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get doctor availability
app.get('/api/doctors/:id/availability', async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
      select: { availability: true }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Parse availability from JSON string to array
    const availability = typeof doctor.availability === 'string'
      ? JSON.parse(doctor.availability)
      : doctor.availability;

    res.json({ availability });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ============= APPOINTMENT ENDPOINTS =============

// Create appointment
app.post('/api/appointments', authenticateToken, validate(createAppointmentSchema), async (req, res) => {
  try {
    const { doctorId, date, time, reason, name, email, phone } = req.body;

    if (!doctorId || !date || !time || !reason || !name || !email || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check for existing appointment at same time
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date,
        time,
        status: { not: 'CANCELLED' }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    const newAppointment = await prisma.appointment.create({
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

    // Send appointment confirmation email (non-blocking)
    emailService.sendAppointmentConfirmationEmail(email, {
      patientName: name,
      doctorName: doctor.name,
      date,
      time,
      reason
    }).catch(err => {
      console.error('Failed to send appointment confirmation email:', err.message);
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: newAppointment
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get user appointments
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const userAppointments = await prisma.appointment.findMany({
      where: { userId: req.user.id },
      include: {
        doctor: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(userAppointments);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get appointment by ID
app.get('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        doctor: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Update appointment
app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { date, time, reason, status } = req.body;

    // Check if appointment exists and belongs to user
    const existing = await prisma.appointment.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Build update data object
    const updateData = {};
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (reason !== undefined) updateData.reason = reason;
    if (status !== undefined) {
      // Convert status to uppercase for Prisma enum
      updateData.status = status.toUpperCase();
    }

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Cancel appointment
app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    // Check if appointment exists and belongs to user
    const existing = await prisma.appointment.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Soft delete by updating status
    await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ============= SYMPTOM CHECKER ENDPOINT =============

// Helper function to call OpenRouter AI
async function analyzeWithAI(symptoms, ageRange, gender) {
  const systemPrompt = `You are a medical assistant AI.
Task: Assess the user's symptoms and classify risk as Low, Medium, or High.
Provide simple, safe home-care tips, and advise when to see a healthcare professional.
Respond in English or Swahili depending on user input.
Always include: "This is not a substitute for professional medical care."

Format your response as JSON with the following structure:
{
  "urgency": "low" | "medium" | "high",
  "condition": "Brief description of likely condition",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

  const userMessage = `Patient Information:
Age Range: ${ageRange || 'not specified'}
Gender: ${gender || 'not specified'}

Symptoms: ${symptoms}

Please analyze these symptoms and provide a risk assessment in JSON format.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://safiri-afya.com', // Optional - your site URL
        'X-Title': 'Safiri Afya Health App', // Optional - your app name
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free', // Free Mistral 7B model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Try to parse JSON from the response
    let parsedResponse;
    try {
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(aiResponse);
      }

      // Ensure urgency is lowercase
      if (parsedResponse.urgency) {
        parsedResponse.urgency = parsedResponse.urgency.toLowerCase();
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // If parsing fails, extract information from text
      const urgencyMatch = aiResponse.toLowerCase().match(/\b(low|medium|high)\s*(risk|urgency|priority)?/i);
      const urgency = urgencyMatch ? urgencyMatch[1].toLowerCase() : 'medium';

      parsedResponse = {
        urgency: urgency,
        condition: 'Based on your symptoms',
        recommendations: [
          'Consult a healthcare professional for proper diagnosis',
          'Monitor your symptoms closely',
          'Seek medical attention if symptoms worsen'
        ]
      };
    }

    return parsedResponse;
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
}

// Analyze symptoms
app.post('/api/symptoms/analyze', validate(analyzeSymptomsSchema), async (req, res) => {
  try {
    const { symptoms, userId, ageRange, gender } = req.body;

    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms description is required' });
    }

    await db.read();

    let urgency, condition, recommendations;

    // Try AI analysis if OpenRouter API key is available
    if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your-openrouter-api-key-here') {
      try {
        console.log('Using OpenRouter AI (Llama 3.2) for symptom analysis...');
        const aiResult = await analyzeWithAI(symptoms, ageRange, gender);
        urgency = aiResult.urgency;
        condition = aiResult.condition;
        recommendations = aiResult.recommendations;
      } catch (aiError) {
        console.error('AI analysis failed, falling back to keyword analysis:', aiError.message);
        // Fall back to keyword-based analysis
        const fallback = keywordBasedAnalysis(symptoms, ageRange);
        urgency = fallback.urgency;
        condition = fallback.condition;
        recommendations = fallback.recommendations;
      }
    } else {
      // No OpenRouter API key, use enhanced keyword analysis
      console.log('Using Enhanced Medical Keyword Analysis (no OpenRouter key)...');
      const analysisResult = keywordBasedAnalysis(symptoms, ageRange);
      urgency = analysisResult.urgency;
      condition = analysisResult.condition;
      recommendations = analysisResult.recommendations;
    }

    // Save to symptom history
    const analysis = await prisma.symptomHistory.create({
      data: {
        userId: userId || null, // null for anonymous users
        symptoms,
        ageRange: ageRange || 'not specified',
        gender: gender || 'not specified',
        riskLevel: urgency,
        analysis: condition,
        recommendations: JSON.stringify(recommendations) // Convert array to JSON string
      }
    });

    res.json({
      id: analysis.id,
      userId: analysis.userId || 'anonymous',
      symptoms: analysis.symptoms,
      ageRange: analysis.ageRange,
      gender: analysis.gender,
      urgency: analysis.riskLevel,
      condition: analysis.analysis,
      recommendations: JSON.parse(analysis.recommendations),
      disclaimer: 'This is not a substitute for professional medical care. Always consult with a qualified healthcare professional for proper diagnosis and treatment.',
      analyzedAt: analysis.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Enhanced Medical Keyword-Based Analysis
function keywordBasedAnalysis(symptoms, ageRange) {
  let urgency = 'low';
  let condition = 'Common Cold or Minor Illness';
  let recommendations = [];

  const symptomsLower = symptoms.toLowerCase();
  const isVulnerable = ageRange === '0-12' || ageRange === '65+';
  const isInfant = ageRange === '0-12';
  const isElderly = ageRange === '65+';

  // CRITICAL/EMERGENCY - High Urgency
  const emergencySymptoms = [
    { en: ['chest pain', 'crushing chest'], sw: ['maumivu ya kifua', 'kifua kinaumwa sana'] },
    { en: ['difficulty breathing', 'can\'t breathe', 'shortness of breath'], sw: ['shida ya kupumua', 'kupumua vigumu'] },
    { en: ['severe bleeding', 'heavy bleeding'], sw: ['damu nyingi', 'kutoka damu kwingi'] },
    { en: ['unconscious', 'passed out', 'fainting'], sw: ['kuzimia', 'kuzirai'] },
    { en: ['stroke', 'facial drooping', 'arm weakness', 'speech difficulty'], sw: ['kiharusi', 'uso kulegea'] },
    { en: ['severe headache', 'worst headache'], sw: ['maumivu makali ya kichwa'] },
    { en: ['confusion', 'disoriented', 'not making sense'], sw: ['kuchanganyikiwa', 'kukosa fahamu'] },
    { en: ['seizure', 'convulsions'], sw: ['kifafa', 'degedege'] },
    { en: ['severe abdominal pain'], sw: ['maumivu makali ya tumbo'] },
    { en: ['coughing blood', 'vomiting blood'], sw: ['kutapika damu', 'kikohozi cha damu'] },
  ];

  // Check for emergency symptoms
  for (const symptomGroup of emergencySymptoms) {
    const allSymptoms = [...symptomGroup.en, ...symptomGroup.sw];
    if (allSymptoms.some(s => symptomsLower.includes(s))) {
      urgency = 'high';
      condition = 'Medical Emergency - Immediate Attention Required';
      recommendations = [
        'Call emergency services immediately (999 or 112 in Kenya)',
        'Do NOT drive yourself - wait for ambulance or get emergency transport',
        'Stay calm and sit or lie down in a comfortable position',
        'Do not take any medication unless advised by emergency services',
        'Have someone stay with you while waiting for help'
      ];
      return { urgency, condition, recommendations };
    }
  }

  // MEDIUM URGENCY - See Doctor Within 24-48 Hours
  const mediumUrgencySymptoms = [
    { en: ['high fever', 'fever above 39', 'fever over 102'], sw: ['homa kali', 'homa ya juu'] },
    { en: ['persistent vomiting', 'can\'t keep food down'], sw: ['kutapika mara kwa mara', 'kutapika sana'] },
    { en: ['severe diarrhea', 'bloody diarrhea', 'frequent diarrhea'], sw: ['kuharisha sana', 'kuhara damu'] },
    { en: ['dehydration', 'very thirsty', 'dry mouth', 'dark urine'], sw: ['ukame wa mwili', 'mkavu'] },
    { en: ['persistent pain', 'severe pain'], sw: ['maumivu ya muda mrefu', 'maumivu makali'] },
    { en: ['rash with fever', 'spreading rash'], sw: ['upele na homa'] },
    { en: ['stiff neck', 'neck pain with fever'], sw: ['shingo ngumu'] },
    { en: ['difficulty swallowing'], sw: ['shida ya kumeza'] },
    { en: ['persistent cough', 'cough for weeks'], sw: ['kikohozi cha muda mrefu'] },
    { en: ['sudden weight loss'], sw: ['kupungua uzito ghafla'] },
  ];

  for (const symptomGroup of mediumUrgencySymptoms) {
    const allSymptoms = [...symptomGroup.en, ...symptomGroup.sw];
    if (allSymptoms.some(s => symptomsLower.includes(s))) {
      urgency = 'medium';
      condition = 'Condition Requiring Medical Attention';
      recommendations = [
        'Schedule a doctor\'s appointment within 24-48 hours',
        'Keep track of your symptoms (write them down with times)',
        'Stay well hydrated - drink clean water regularly',
        'Rest and avoid strenuous activities',
        'Monitor temperature if you have fever'
      ];

      // Escalate if vulnerable population
      if (isVulnerable) {
        urgency = 'high';
        condition = isInfant ? 'Infant/Child - Requires Immediate Medical Care' : 'Elderly Patient - Requires Prompt Medical Care';
        recommendations = [
          'Seek medical care immediately - vulnerable age group',
          'Go to the nearest clinic or hospital today',
          'Do not delay treatment',
          'Bring a list of all current medications',
          'Have someone accompany you if possible'
        ];
      }

      return { urgency, condition, recommendations };
    }
  }

  // LOW URGENCY - Common Illnesses
  const mildSymptoms = [
    { en: ['headache', 'head hurts'], sw: ['maumivu ya kichwa', 'kichwa kinaumwa'] },
    { en: ['mild fever', 'low fever', 'slight fever'], sw: ['homa kidogo', 'joto kidogo'] },
    { en: ['cough', 'dry cough'], sw: ['kikohozi'] },
    { en: ['runny nose', 'stuffy nose', 'congestion'], sw: ['pua inzambia', 'pua imeziba'] },
    { en: ['sore throat', 'throat hurts'], sw: ['koo inaumwa', 'maumivu ya koo'] },
    { en: ['body aches', 'muscle pain'], sw: ['maumivu ya mwili', 'misuli inaumwa'] },
    { en: ['fatigue', 'tired', 'weak'], sw: ['uchovu', 'udhaifu'] },
    { en: ['sneezing'], sw: ['kupiga chafya'] },
    { en: ['mild nausea'], sw: ['kichefuchefu kidogo'] },
  ];

  for (const symptomGroup of mildSymptoms) {
    const allSymptoms = [...symptomGroup.en, ...symptomGroup.sw];
    if (allSymptoms.some(s => symptomsLower.includes(s))) {
      urgency = 'low';
      condition = 'Common Cold, Flu, or Minor Illness';
      recommendations = [
        'Rest at home and get plenty of sleep',
        'Drink lots of fluids - water, herbal tea, or warm lemon water',
        'Use over-the-counter pain relievers if needed (paracetamol/ibuprofen)',
        'Stay home to avoid spreading illness to others',
        'Gargle with warm salt water for sore throat',
        'See a doctor if symptoms persist beyond 7 days or worsen'
      ];
      return { urgency, condition, recommendations };
    }
  }

  // Default response if no specific symptoms matched
  return {
    urgency: 'low',
    condition: 'General Health Concern',
    recommendations: [
      'Monitor your symptoms over the next 24-48 hours',
      'Stay hydrated and get adequate rest',
      'Consult a healthcare provider if symptoms persist or worsen',
      'Keep a symptom diary noting when symptoms occur and their severity',
      'Seek medical attention if you develop concerning symptoms'
    ]
  };
}

// Get symptom history
app.get('/api/symptoms/history', authenticateToken, async (req, res) => {
  try {
    const history = await prisma.symptomHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Parse recommendations from JSON strings to arrays
    const parsedHistory = history.map(h => ({
      id: h.id,
      userId: h.userId,
      symptoms: h.symptoms,
      ageRange: h.ageRange,
      gender: h.gender,
      urgency: h.riskLevel,
      condition: h.analysis,
      recommendations: typeof h.recommendations === 'string' ? JSON.parse(h.recommendations) : h.recommendations,
      analyzedAt: h.createdAt
    }));

    res.json(parsedHistory);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ============= BOOKING ENDPOINTS =============

// Create a booking for consultation
app.post('/api/bookings', validate(createBookingSchema), async (req, res) => {
  try {
    const { facilityId, patientName, patientEmail, patientPhone, appointmentDate, appointmentTime, symptoms } = req.body;

    if (!facilityId || !patientName || !patientPhone || !appointmentDate || !appointmentTime || !symptoms) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Find the facility (could be from clinics or from OSM data)
    const facility = await prisma.clinic.findUnique({
      where: { id: facilityId }
    });

    const booking = await prisma.booking.create({
      data: {
        facilityId,
        facilityName: facility?.name || 'Unknown Facility',
        patientName,
        patientEmail: patientEmail || null,
        patientPhone,
        appointmentDate,
        appointmentTime,
        symptoms,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        consultationFee: facility?.consultationFee || 1000
      }
    });

    // Send booking confirmation email if email is provided (non-blocking)
    if (patientEmail) {
      emailService.sendBookingConfirmationEmail(patientEmail, {
        id: booking.id,
        facilityName: booking.facilityName,
        patientName,
        date: appointmentDate,
        time: appointmentTime,
        amount: booking.consultationFee
      }).catch(err => {
        console.error('Failed to send booking confirmation email:', err.message);
      });
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get booking by ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ============= PAYMENT ENDPOINTS =============

// Initiate M-Pesa STK Push for consultation payment
app.post('/api/payments/initiate', paymentLimiter, validate(initiatePaymentSchema), async (req, res) => {
  try {
    const { bookingId, phoneNumber } = req.body;

    if (!bookingId || !phoneNumber) {
      return res.status(400).json({ error: 'Booking ID and phone number are required' });
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Find the facility to get hospital phone number
    const facility = await prisma.clinic.findUnique({
      where: { id: booking.facilityId }
    });

    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    // Calculate revenue split
    const revenueSplit = mpesaService.calculateRevenueSplit(booking.consultationFee);

    // Initiate STK Push
    const stkPushResult = await mpesaService.initiateSTKPush(
      phoneNumber,
      booking.consultationFee,
      booking.id,
      `Consultation at ${booking.facilityName}`
    );

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: booking.consultationFee,
        phoneNumber: mpesaService.formatPhoneNumber(phoneNumber),
        status: 'PENDING'
      }
    });

    // Update booking payment status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'PENDING' }
    });

    res.json({
      message: 'STK Push initiated successfully',
      payment: {
        id: payment.id,
        checkoutRequestId: stkPushResult.checkoutRequestId,
        amount: payment.amount,
        status: payment.status,
      },
      instructions: stkPushResult.customerMessage || 'Please check your phone and enter your M-Pesa PIN to complete the payment',
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: error.message || 'Failed to initiate payment' });
  }
});

// M-Pesa callback endpoint (STK Push result)
app.post('/api/payments/mpesa/callback', async (req, res) => {
  try {
    console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    const stkCallback = Body?.stkCallback;

    if (!stkCallback) {
      return res.status(400).json({ error: 'Invalid callback data' });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    // Find the payment record by booking ID (since we don't store checkoutRequestId in Prisma schema)
    // Note: In production, you'd want to add checkoutRequestId to the Payment model
    const payments = await prisma.payment.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 10 // Get recent pending payments
    });

    // For now, use the most recent pending payment
    // In production, store checkoutRequestId in Payment model
    const payment = payments[0];

    if (!payment) {
      console.error('No pending payment found for CheckoutRequestID:', CheckoutRequestID);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Update payment status based on result code
    if (ResultCode === 0) {
      // Payment successful
      // Extract M-Pesa receipt number if available
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const receiptItem = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber');

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          mpesaReceiptNumber: receiptItem?.Value || null,
          transactionId: CheckoutRequestID
        }
      });

      // Update booking payment status
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED'
        }
      });

      console.log('Payment successful:', {
        id: payment.id,
        mpesaReceiptNumber: receiptItem?.Value
      });
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      // Update booking payment status
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'FAILED' }
      });

      console.log('Payment failed:', { id: payment.id, reason: ResultDesc });
    }

    // Respond to M-Pesa
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check payment status
app.get('/api/payments/:id/status', async (req, res) => {
  try {
    await db.read();
    const payment = db.data.payments.find(p => p.id === req.params.id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      mpesaReceiptNumber: payment.mpesaReceiptNumber,
      completedAt: payment.completedAt,
      failureReason: payment.failureReason,
      splitProcessed: payment.splitProcessed,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get payment by checkout request ID (for polling)
app.get('/api/payments/checkout/:checkoutRequestId', async (req, res) => {
  try {
    await db.read();
    const payment = db.data.payments.find(
      p => p.checkoutRequestId === req.params.checkoutRequestId
    );

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      mpesaReceiptNumber: payment.mpesaReceiptNumber,
      completedAt: payment.completedAt,
      failureReason: payment.failureReason,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ============= HEALTH NEWS ENDPOINTS =============

const rssParser = new Parser();
const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY;

// Cache for news articles (simple in-memory cache)
let newsCache = {
  articles: [],
  lastFetched: null,
  cacheDuration: 30 * 60 * 1000, // 30 minutes
};

// Helper function to fetch Guardian health news
async function fetchGuardianNews() {
  if (!GUARDIAN_API_KEY || GUARDIAN_API_KEY === 'your-guardian-api-key-here') {
    console.log('Guardian API key not configured, skipping Guardian news');
    return [];
  }

  try {
    const response = await fetch(
      `https://content.guardianapis.com/search?section=society&tag=society/health&show-fields=thumbnail,trailText&page-size=10&api-key=${GUARDIAN_API_KEY}`
    );

    const data = await response.json();

    if (data.response.status === 'ok') {
      return data.response.results.map(article => ({
        title: article.webTitle,
        description: article.fields?.trailText || '',
        url: article.webUrl,
        imageUrl: article.fields?.thumbnail || '',
        source: 'The Guardian',
        publishedAt: article.webPublicationDate,
        category: article.sectionName,
      }));
    }
    return [];
  } catch (error) {
    console.error('Guardian API error:', error.message);
    return [];
  }
}

// Helper function to fetch RSS feeds
async function fetchRSSFeeds() {
  const feeds = [
    { url: 'https://www.who.int/rss-feeds/news-english.xml', name: 'WHO' },
    { url: 'https://www.medicalnewstoday.com/rss', name: 'Medical News Today' },
    { url: 'https://www.healthline.com/health/rss', name: 'Healthline' },
  ];

  const allArticles = [];

  for (const feedInfo of feeds) {
    try {
      const feed = await rssParser.parseURL(feedInfo.url);
      const articles = feed.items.slice(0, 5).map(item => ({
        title: item.title,
        description: item.contentSnippet || item.summary || item.content?.substring(0, 200),
        url: item.link,
        source: feedInfo.name,
        publishedAt: item.pubDate || item.isoDate,
        imageUrl: item.enclosure?.url || item.image?.url || null,
        category: 'Health & Wellness',
      }));
      allArticles.push(...articles);
    } catch (err) {
      console.error(`Failed to fetch RSS feed ${feedInfo.name}:`, err.message);
    }
  }

  return allArticles;
}

// Get health news (with caching)
app.get('/api/news/health', async (req, res) => {
  try {
    const now = Date.now();

    // Check if cache is still valid
    if (newsCache.lastFetched && (now - newsCache.lastFetched) < newsCache.cacheDuration) {
      console.log('Serving news from cache');
      return res.json({ articles: newsCache.articles, cached: true });
    }

    console.log('Fetching fresh health news...');

    // Fetch from both sources in parallel
    const [guardianArticles, rssArticles] = await Promise.all([
      fetchGuardianNews(),
      fetchRSSFeeds(),
    ]);

    // Combine and sort by date
    const allArticles = [...guardianArticles, ...rssArticles];
    allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // Update cache
    newsCache.articles = allArticles.slice(0, 20);
    newsCache.lastFetched = now;

    res.json({
      articles: newsCache.articles,
      cached: false,
      sources: {
        guardian: guardianArticles.length,
        rss: rssArticles.length,
        total: newsCache.articles.length,
      }
    });
  } catch (error) {
    console.error('News fetch error:', error);

    // Return cached data if available, even if expired
    if (newsCache.articles.length > 0) {
      return res.json({
        articles: newsCache.articles,
        cached: true,
        warning: 'Using cached data due to fetch error'
      });
    }

    res.status(500).json({ error: 'Failed to fetch health news: ' + error.message });
  }
});

// ============= ADMIN ENDPOINTS =============

// Admin Dashboard - Get statistics
app.get('/api/admin/dashboard/stats', requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalAppointments,
      totalBookings,
      totalClinics,
      totalDoctors,
      paymentsAggregate,
      recentActivity
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.appointment.count(),
      prisma.booking.count(),
      prisma.clinic.count(),
      prisma.doctor.count(),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.adminLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const stats = {
      totalUsers,
      totalAdmins,
      totalAppointments,
      totalBookings,
      totalClinics,
      totalDoctors,
      totalRevenue: paymentsAggregate._sum.amount || 0,
      recentActivity
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User Management - Get all users
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User Management - Update user
app.put('/api/admin/users/:id', requireAdmin, validate(updateUserSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role.toUpperCase().replace('-', '_');
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    // Log activity
    await logAdminActivity(req.user.id, 'UPDATE_USER', {
      targetUserId: id,
      changes: { name, email, role, isActive }
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User Management - Delete user
app.delete('/api/admin/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }

    // Delete user (cascade delete will handle related data)
    await prisma.user.delete({ where: { id } });

    // Log activity
    await logAdminActivity(req.user.id, 'DELETE_USER', {
      targetUserId: id,
      email: user.email
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Appointments Management
app.get('/api/admin/appointments', requireAdmin, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { user: { select: { name: true, email: true } }, doctor: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bookings Management
app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Payments Management
app.get('/api/admin/payments', requireAdmin, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { booking: { select: { facilityName: true, patientName: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clinics Management
app.get('/api/admin/clinics', requireAdmin, async (req, res) => {
  try {
    const clinics = await prisma.clinic.findMany();
    const parsedClinics = parseClinics(clinics);
    res.json({ success: true, clinics: parsedClinics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/clinics', requireAdmin, validate(createClinicSchema), async (req, res) => {
  try {
    const newClinic = await prisma.clinic.create({
      data: prepareClinicForDB(req.body)
    });

    await logAdminActivity(req.user.id, 'CREATE_CLINIC', { clinicId: newClinic.id });

    res.json({ success: true, clinic: parseClinicServices(newClinic) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/clinics/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await prisma.clinic.update({
      where: { id },
      data: prepareClinicForDB(req.body)
    });

    await logAdminActivity(req.user.id, 'UPDATE_CLINIC', { clinicId: id });

    res.json({ success: true, clinic: parseClinicServices(clinic) });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/clinics/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.clinic.delete({ where: { id } });

    await logAdminActivity(req.user.id, 'DELETE_CLINIC', { clinicId: id });

    res.json({ success: true, message: 'Clinic deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Doctors Management
app.get('/api/admin/doctors', requireAdmin, async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany();
    const parsedDoctors = parseDoctors(doctors);
    res.json({ success: true, doctors: parsedDoctors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// System Settings
app.get('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    // Convert array of settings to object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    res.json({ success: true, settings: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/settings', requireSuperAdmin, async (req, res) => {
  try {
    // Update or create each setting
    const updates = Object.entries(req.body).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    );

    await Promise.all(updates);

    await logAdminActivity(req.user.id, 'UPDATE_SETTINGS', { settings: req.body });

    const settings = await prisma.systemSetting.findMany();
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    res.json({ success: true, settings: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Activity Logs
app.get('/api/admin/logs', requireAdmin, async (req, res) => {
  try {
    const logs = await prisma.adminLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Symptom Analytics
app.get('/api/admin/symptom-analytics', requireAdmin, async (req, res) => {
  try {
    const [totalChecks, lowRisk, mediumRisk, highRisk, recentChecks] = await Promise.all([
      prisma.symptomHistory.count(),
      prisma.symptomHistory.count({ where: { riskLevel: 'low' } }),
      prisma.symptomHistory.count({ where: { riskLevel: 'medium' } }),
      prisma.symptomHistory.count({ where: { riskLevel: 'high' } }),
      prisma.symptomHistory.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const analytics = {
      totalChecks,
      byRiskLevel: {
        low: lowRisk,
        medium: mediumRisk,
        high: highRisk
      },
      recentChecks
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= HEALTH CHECK =============

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Safiri Afya Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🏥 Safiri Afya Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});


