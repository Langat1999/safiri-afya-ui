import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db, { initializeDatabase } from './database.js';
import mpesaService from './services/mpesa.js';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'safiri-afya-secret-key-change-in-production';
const HF_API_TOKEN = process.env.HF_API_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Create data directory
await mkdir(join(__dirname, '../data'), { recursive: true });

// Initialize database
await initializeDatabase();

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ============= AUTHENTICATION ENDPOINTS =============

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    await db.read();

    // Check if user already exists
    const existingUser = db.data.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString()
    };

    db.data.users.push(newUser);
    await db.write();

    // Generate token
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, email: newUser.email, name: newUser.name }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    await db.read();

    // Find user
    const user = db.data.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    await db.read();
    const user = db.data.users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    });
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
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await db.read();

    // Check if user exists
    const user = db.data.users.find(u => u.email === email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If the email exists, a reset code has been sent.' });
    }

    // Generate reset token (6-digit code)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour expiry

    // Initialize passwordResets array if it doesn't exist
    if (!db.data.passwordResets) {
      db.data.passwordResets = [];
    }

    // Store reset code
    db.data.passwordResets = db.data.passwordResets.filter(r => r.email !== email);
    db.data.passwordResets.push({
      email,
      code: resetCode,
      expiresAt: resetExpiry,
      createdAt: new Date().toISOString()
    });

    await db.write();

    // In production, send this via email
    // For now, we'll return it in the response (NOT SECURE - FOR DEMO ONLY)
    console.log(`Password reset code for ${email}: ${resetCode}`);

    res.json({
      message: 'If the email exists, a reset code has been sent.',
      // Remove this in production - only for demo
      resetCode: resetCode
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Verify reset code
app.post('/api/auth/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    await db.read();

    const resetRequest = db.data.passwordResets?.find(
      r => r.email === email && r.code === code
    );

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
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    await db.read();

    // Verify reset code
    const resetRequest = db.data.passwordResets?.find(
      r => r.email === email && r.code === code
    );

    if (!resetRequest) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Check if code has expired
    if (new Date() > new Date(resetRequest.expiresAt)) {
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    // Find user and update password
    const userIndex = db.data.users.findIndex(u => u.email === email);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.data.users[userIndex].password = hashedPassword;
    db.data.users[userIndex].updatedAt = new Date().toISOString();

    // Remove used reset code
    db.data.passwordResets = db.data.passwordResets.filter(
      r => !(r.email === email && r.code === code)
    );

    await db.write();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ============= CLINIC ENDPOINTS =============

// Get all clinics
app.get('/api/clinics', async (req, res) => {
  try {
    await db.read();
    res.json(db.data.clinics);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get clinic by ID
app.get('/api/clinics/:id', async (req, res) => {
  try {
    await db.read();
    const clinic = db.data.clinics.find(c => c.id === req.params.id);

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    res.json(clinic);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Search clinics by location
app.post('/api/clinics/search', async (req, res) => {
  try {
    const { location } = req.body;
    await db.read();

    if (!location) {
      return res.json(db.data.clinics);
    }

    const filtered = db.data.clinics.filter(clinic =>
      clinic.location.toLowerCase().includes(location.toLowerCase()) ||
      clinic.name.toLowerCase().includes(location.toLowerCase())
    );

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get nearby clinics (simplified - in production, use geospatial queries)
app.post('/api/clinics/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10 } = req.body;
    await db.read();

    // Simple distance calculation (for production, use proper geospatial library)
    const clinics = db.data.clinics.map(clinic => {
      const distance = Math.sqrt(
        Math.pow(clinic.coordinates.lat - lat, 2) +
        Math.pow(clinic.coordinates.lng - lng, 2)
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
    await db.read();
    res.json(db.data.doctors);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get doctor by ID
app.get('/api/doctors/:id', async (req, res) => {
  try {
    await db.read();
    const doctor = db.data.doctors.find(d => d.id === req.params.id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get doctor availability
app.get('/api/doctors/:id/availability', async (req, res) => {
  try {
    await db.read();
    const doctor = db.data.doctors.find(d => d.id === req.params.id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ availability: doctor.availability });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ============= APPOINTMENT ENDPOINTS =============

// Create appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { doctorId, date, time, reason, name, email, phone } = req.body;

    if (!doctorId || !date || !time || !reason || !name || !email || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await db.read();

    // Verify doctor exists
    const doctor = db.data.doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check for existing appointment at same time
    const existingAppointment = db.data.appointments.find(
      a => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'cancelled'
    );

    if (existingAppointment) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    const newAppointment = {
      id: uuidv4(),
      userId: req.user.id,
      doctorId,
      doctorName: doctor.name,
      date,
      time,
      reason,
      name,
      email,
      phone,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    db.data.appointments.push(newAppointment);
    await db.write();

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
    await db.read();
    const userAppointments = db.data.appointments.filter(a => a.userId === req.user.id);
    res.json(userAppointments);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get appointment by ID
app.get('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    await db.read();
    const appointment = db.data.appointments.find(a => a.id === req.params.id && a.userId === req.user.id);

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
    await db.read();

    const appointmentIndex = db.data.appointments.findIndex(
      a => a.id === req.params.id && a.userId === req.user.id
    );

    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = db.data.appointments[appointmentIndex];

    // Update fields
    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (reason) appointment.reason = reason;
    if (status) appointment.status = status;
    appointment.updatedAt = new Date().toISOString();

    await db.write();

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
    await db.read();

    const appointmentIndex = db.data.appointments.findIndex(
      a => a.id === req.params.id && a.userId === req.user.id
    );

    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Soft delete by updating status
    db.data.appointments[appointmentIndex].status = 'cancelled';
    db.data.appointments[appointmentIndex].cancelledAt = new Date().toISOString();

    await db.write();

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
app.post('/api/symptoms/analyze', async (req, res) => {
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

    const analysis = {
      id: uuidv4(),
      userId: userId || 'anonymous',
      symptoms,
      ageRange: ageRange || 'not specified',
      gender: gender || 'not specified',
      urgency,
      condition,
      recommendations,
      disclaimer: 'This is not a substitute for professional medical care. Always consult with a qualified healthcare professional for proper diagnosis and treatment.',
      analyzedAt: new Date().toISOString()
    };

    // Save to history
    db.data.symptomHistory.push(analysis);
    await db.write();

    res.json(analysis);
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
    await db.read();
    const history = db.data.symptomHistory.filter(s => s.userId === req.user.id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ============= BOOKING ENDPOINTS =============

// Create a booking for consultation
app.post('/api/bookings', async (req, res) => {
  try {
    const { facilityId, patientName, patientPhone, appointmentDate, appointmentTime, symptoms } = req.body;

    if (!facilityId || !patientName || !patientPhone || !appointmentDate || !appointmentTime || !symptoms) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await db.read();

    // Find the facility (could be from clinics or from OSM data)
    const facility = db.data.clinics.find(c => c.id === facilityId);

    const booking = {
      id: uuidv4(),
      facilityId,
      facilityName: facility?.name || 'Unknown Facility',
      patientName,
      patientPhone,
      appointmentDate,
      appointmentTime,
      symptoms,
      status: 'pending', // pending, confirmed, cancelled, completed
      paymentStatus: 'unpaid', // unpaid, pending, paid, failed
      consultationFee: facility?.consultationFee || 1000,
      createdAt: new Date().toISOString(),
    };

    db.data.bookings.push(booking);
    await db.write();

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
    await db.read();
    const booking = db.data.bookings.find(b => b.id === req.params.id);

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
app.post('/api/payments/initiate', async (req, res) => {
  try {
    const { bookingId, phoneNumber } = req.body;

    if (!bookingId || !phoneNumber) {
      return res.status(400).json({ error: 'Booking ID and phone number are required' });
    }

    await db.read();

    // Find the booking
    const booking = db.data.bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Find the facility to get hospital phone number
    const facility = db.data.clinics.find(c => c.id === booking.facilityId);
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
    const payment = {
      id: uuidv4(),
      bookingId,
      amount: booking.consultationFee,
      phoneNumber: mpesaService.formatPhoneNumber(phoneNumber),
      facilityPhone: facility.mpesaNumber || facility.phone,
      checkoutRequestId: stkPushResult.checkoutRequestId,
      merchantRequestId: stkPushResult.merchantRequestId,
      status: 'pending', // pending, completed, failed
      revenueSplit: revenueSplit,
      splitProcessed: false,
      createdAt: new Date().toISOString(),
    };

    db.data.payments.push(payment);

    // Update booking payment status
    const bookingIndex = db.data.bookings.findIndex(b => b.id === bookingId);
    db.data.bookings[bookingIndex].paymentStatus = 'pending';

    await db.write();

    res.json({
      message: 'STK Push initiated successfully',
      payment: {
        id: payment.id,
        checkoutRequestId: payment.checkoutRequestId,
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

    await db.read();

    // Find the payment record
    const paymentIndex = db.data.payments.findIndex(
      p => p.checkoutRequestId === CheckoutRequestID
    );

    if (paymentIndex === -1) {
      console.error('Payment not found for CheckoutRequestID:', CheckoutRequestID);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const payment = db.data.payments[paymentIndex];

    // Update payment status based on result code
    if (ResultCode === 0) {
      // Payment successful
      payment.status = 'completed';
      payment.completedAt = new Date().toISOString();

      // Extract M-Pesa receipt number if available
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const receiptItem = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber');
      if (receiptItem) {
        payment.mpesaReceiptNumber = receiptItem.Value;
      }

      // Update booking payment status
      const bookingIndex = db.data.bookings.findIndex(b => b.id === payment.bookingId);
      if (bookingIndex !== -1) {
        db.data.bookings[bookingIndex].paymentStatus = 'paid';
        db.data.bookings[bookingIndex].status = 'confirmed';
      }

      // Process revenue split
      try {
        const splitResult = await mpesaService.processRevenueSplit(
          payment.amount,
          payment.facilityPhone,
          payment.id
        );
        payment.splitProcessed = true;
        payment.splitResult = splitResult;
        console.log('Revenue split processed successfully');
      } catch (splitError) {
        console.error('Revenue split failed:', splitError);
        payment.splitProcessed = false;
        payment.splitError = splitError.message;
      }
    } else {
      // Payment failed
      payment.status = 'failed';
      payment.failureReason = ResultDesc;

      // Update booking payment status
      const bookingIndex = db.data.bookings.findIndex(b => b.id === payment.bookingId);
      if (bookingIndex !== -1) {
        db.data.bookings[bookingIndex].paymentStatus = 'failed';
      }
    }

    db.data.payments[paymentIndex] = payment;
    await db.write();

    console.log('Payment updated:', {
      id: payment.id,
      status: payment.status,
      mpesaReceiptNumber: payment.mpesaReceiptNumber,
    });

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

