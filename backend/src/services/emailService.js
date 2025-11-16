import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@safiri-afya.com';
const APP_NAME = 'Safiri Afya';
const APP_URL = process.env.APP_URL || 'http://localhost:8081';

// Initialize SendGrid only if API key is provided
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid email service initialized');
} else {
  console.warn('⚠️  SENDGRID_API_KEY not found. Email functionality will be simulated.');
}

/**
 * Send an email using SendGrid
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @returns {Promise<boolean>} Success status
 */
async function sendEmail({ to, subject, html, text }) {
  try {
    if (!SENDGRID_API_KEY) {
      // Simulate email sending in development
      console.log('\n📧 [EMAIL SIMULATION]');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', text || 'HTML email');
      console.log('─────────────────────────────\n');
      return true;
    }

    const msg = {
      to,
      from: EMAIL_FROM,
      subject,
      text: text || '',
      html: html || '',
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    if (error.response) {
      console.error('SendGrid error:', error.response.body);
    }
    return false;
  }
}

/**
 * Send password reset email with verification code
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {string} resetCode - 6-digit reset code
 * @returns {Promise<boolean>} Success status
 */
export async function sendPasswordResetEmail(email, name, resetCode) {
  const subject = `${APP_NAME} - Password Reset Code`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 ${APP_NAME}</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>We received a request to reset your password. Use the verification code below to complete the process:</p>

          <div class="code-box">
            <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
            <div class="code">${resetCode}</div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 15 minutes</p>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            If you didn't request this password reset, please ignore this email. Your account remains secure.
          </div>

          <p>For your security:</p>
          <ul>
            <li>This code expires in 15 minutes</li>
            <li>Never share this code with anyone</li>
            <li>Our team will never ask for your code</li>
          </ul>

          <p>Need help? Contact our support team.</p>
        </div>
        <div class="footer">
          <p>${APP_NAME} - Your Health, Our Priority</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hello ${name},

We received a request to reset your password for ${APP_NAME}.

Your verification code is: ${resetCode}

This code will expire in 15 minutes.

If you didn't request this password reset, please ignore this email.

For security:
- Never share this code with anyone
- Our team will never ask for your code

Need help? Contact our support team.

${APP_NAME} - Your Health, Our Priority
  `;

  return sendEmail({ to: email, subject, html, text });
}

/**
 * Send booking confirmation email
 * @param {string} email - User's email
 * @param {Object} booking - Booking details
 * @returns {Promise<boolean>} Success status
 */
export async function sendBookingConfirmationEmail(email, booking) {
  const subject = `${APP_NAME} - Booking Confirmation`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .booking-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .label { color: #666; font-weight: bold; }
        .value { color: #333; }
        .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 ${APP_NAME}</h1>
          <p>Booking Confirmation</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <span class="success-badge">✓ Booking Confirmed</span>
          </div>

          <h2>Hello ${booking.patientName || 'Patient'},</h2>
          <p>Your booking has been confirmed! Here are your appointment details:</p>

          <div class="booking-card">
            <div class="booking-row">
              <span class="label">Booking ID:</span>
              <span class="value">${booking.id}</span>
            </div>
            <div class="booking-row">
              <span class="label">Facility:</span>
              <span class="value">${booking.facilityName || 'Health Facility'}</span>
            </div>
            <div class="booking-row">
              <span class="label">Date:</span>
              <span class="value">${booking.date}</span>
            </div>
            <div class="booking-row">
              <span class="label">Time:</span>
              <span class="value">${booking.time}</span>
            </div>
            <div class="booking-row">
              <span class="label">Amount:</span>
              <span class="value">KES ${booking.amount || 'N/A'}</span>
            </div>
            <div class="booking-row" style="border-bottom: none;">
              <span class="label">Status:</span>
              <span class="value" style="color: #10b981; font-weight: bold;">CONFIRMED</span>
            </div>
          </div>

          <h3>What to bring:</h3>
          <ul>
            <li>Valid ID (National ID, Passport, or Birth Certificate)</li>
            <li>NHIF card (if applicable)</li>
            <li>Previous medical records (if any)</li>
            <li>This confirmation email</li>
          </ul>

          <h3>Important Notes:</h3>
          <ul>
            <li>Please arrive 15 minutes before your appointment</li>
            <li>If you need to reschedule, contact us at least 24 hours in advance</li>
            <li>For emergencies, call 999 or visit the nearest ER</li>
          </ul>

          <p>Need to make changes? Log in to your account at <a href="${APP_URL}">${APP_NAME}</a></p>
        </div>
        <div class="footer">
          <p>${APP_NAME} - Your Health, Our Priority</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
${APP_NAME} - Booking Confirmation

Hello ${booking.patientName || 'Patient'},

Your booking has been confirmed!

APPOINTMENT DETAILS:
- Booking ID: ${booking.id}
- Facility: ${booking.facilityName || 'Health Facility'}
- Date: ${booking.date}
- Time: ${booking.time}
- Amount: KES ${booking.amount || 'N/A'}
- Status: CONFIRMED

WHAT TO BRING:
- Valid ID (National ID, Passport, or Birth Certificate)
- NHIF card (if applicable)
- Previous medical records (if any)
- This confirmation email

IMPORTANT NOTES:
- Please arrive 15 minutes before your appointment
- If you need to reschedule, contact us at least 24 hours in advance
- For emergencies, call 999 or visit the nearest ER

Need to make changes? Log in to your account at ${APP_URL}

${APP_NAME} - Your Health, Our Priority
  `;

  return sendEmail({ to: email, subject, html, text });
}

/**
 * Send appointment confirmation email
 * @param {string} email - User's email
 * @param {Object} appointment - Appointment details
 * @returns {Promise<boolean>} Success status
 */
export async function sendAppointmentConfirmationEmail(email, appointment) {
  const subject = `${APP_NAME} - Appointment Scheduled`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 ${APP_NAME}</h1>
          <p>Appointment Scheduled</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <span class="success-badge">✓ Appointment Confirmed</span>
          </div>

          <h2>Hello ${appointment.patientName || 'Patient'},</h2>
          <p>Your appointment has been successfully scheduled.</p>

          <div class="appointment-card">
            <h3>📅 Appointment Details</h3>
            <p><strong>Doctor:</strong> ${appointment.doctorName || 'Doctor'}</p>
            <p><strong>Date:</strong> ${appointment.date}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
            <p><strong>Reason:</strong> ${appointment.reason || 'General consultation'}</p>
            <p><strong>Status:</strong> <span style="color: #10b981;">SCHEDULED</span></p>
          </div>

          <p>We look forward to seeing you!</p>
        </div>
        <div class="footer">
          <p>${APP_NAME} - Your Health, Our Priority</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
${APP_NAME} - Appointment Scheduled

Hello ${appointment.patientName || 'Patient'},

Your appointment has been successfully scheduled.

APPOINTMENT DETAILS:
- Doctor: ${appointment.doctorName || 'Doctor'}
- Date: ${appointment.date}
- Time: ${appointment.time}
- Reason: ${appointment.reason || 'General consultation'}
- Status: SCHEDULED

We look forward to seeing you!

${APP_NAME} - Your Health, Our Priority
  `;

  return sendEmail({ to: email, subject, html, text });
}

/**
 * Send welcome email to new users
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @returns {Promise<boolean>} Success status
 */
export async function sendWelcomeEmail(email, name) {
  const subject = `Welcome to ${APP_NAME}! 🏥`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature-box { background: white; border-radius: 8px; padding: 15px; margin: 10px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Welcome to ${APP_NAME}!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}! 👋</h2>
          <p>Thank you for joining ${APP_NAME}. We're excited to be part of your healthcare journey!</p>

          <h3>What you can do with ${APP_NAME}:</h3>

          <div class="feature-box">
            <strong>🔍 Symptom Checker</strong>
            <p>Get instant insights about your symptoms and recommended next steps</p>
          </div>

          <div class="feature-box">
            <strong>🏥 Find Clinics</strong>
            <p>Locate nearby healthcare facilities with real-time geolocation</p>
          </div>

          <div class="feature-box">
            <strong>📅 Book Appointments</strong>
            <p>Schedule appointments with healthcare providers</p>
          </div>

          <div class="feature-box">
            <strong>💳 M-Pesa Payments</strong>
            <p>Pay securely for consultations using M-Pesa</p>
          </div>

          <div style="text-align: center;">
            <a href="${APP_URL}" class="button">Get Started</a>
          </div>

          <p>Need help? Our support team is here for you!</p>
        </div>
        <div class="footer">
          <p>${APP_NAME} - Your Health, Our Priority</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to ${APP_NAME}!

Hello ${name}!

Thank you for joining ${APP_NAME}. We're excited to be part of your healthcare journey!

What you can do with ${APP_NAME}:

🔍 SYMPTOM CHECKER
Get instant insights about your symptoms and recommended next steps

🏥 FIND CLINICS
Locate nearby healthcare facilities with real-time geolocation

📅 BOOK APPOINTMENTS
Schedule appointments with healthcare providers

💳 M-PESA PAYMENTS
Pay securely for consultations using M-Pesa

Get started at ${APP_URL}

Need help? Our support team is here for you!

${APP_NAME} - Your Health, Our Priority
  `;

  return sendEmail({ to: email, subject, html, text });
}

export default {
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendAppointmentConfirmationEmail,
  sendWelcomeEmail,
};
