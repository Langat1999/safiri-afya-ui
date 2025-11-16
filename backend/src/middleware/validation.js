import { z } from 'zod';

// Validation middleware factory
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      // Log unexpected validation errors
      console.error('Unexpected validation error:', error);
      return res.status(400).json({
        error: 'Invalid request data',
        message: error.message || 'Request validation failed'
      });
    }
  };
};

// Authentication Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const verifyResetCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Reset code must be 6 digits')
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Reset code must be 6 digits'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

// Profile Schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  location: z.string().max(200).optional(),
  profilePicture: z.string().url().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

// Appointment Schemas
export const createAppointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason is too long'),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
});

// Booking Schemas
export const createBookingSchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  patientName: z.string().min(2, 'Patient name must be at least 2 characters').max(100),
  patientEmail: z.string().email().optional(),
  patientPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  symptoms: z.string().min(10, 'Symptoms description must be at least 10 characters').max(1000)
});

// Payment Schemas
export const initiatePaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  phoneNumber: z.string().regex(/^254\d{9}$/, 'Phone number must be in format 254XXXXXXXXX')
});

// Symptom Checker Schema
export const analyzeSymptomsSchema = z.object({
  symptoms: z.string().min(10, 'Symptoms description must be at least 10 characters').max(2000),
  userId: z.string().uuid().optional(),
  ageRange: z.string().optional(),
  gender: z.string().optional()
});

// Settings Schemas
export const updateSettingsSchema = z.object({
  notifications: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    appointments: z.boolean().optional(),
    healthTips: z.boolean().optional(),
    newsletter: z.boolean().optional()
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
    shareHealthData: z.boolean().optional()
  }).optional(),
  preferences: z.object({
    language: z.enum(['en', 'sw']).optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    timezone: z.string().optional()
  }).optional()
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required')
});

// Admin Schemas
export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  role: z.enum(['user', 'admin', 'super_admin']).optional(),
  isActive: z.boolean().optional()
});

export const createClinicSchema = z.object({
  name: z.string().min(2, 'Clinic name must be at least 2 characters').max(200),
  location: z.string().min(2, 'Location is required'),
  lat: z.number().min(-90).max(90, 'Invalid latitude'),
  lng: z.number().min(-180).max(180, 'Invalid longitude'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  hours: z.string().min(5, 'Operating hours required'),
  services: z.array(z.string()).min(1, 'At least one service is required'),
  rating: z.number().min(0).max(5).optional(),
  consultationFee: z.number().min(0, 'Consultation fee must be positive')
});
