import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '../data/db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, {});

// Initialize database with default data
export async function initializeDatabase() {
  await db.read();

  // Initialize with default structure if empty or missing
  if (!db.data || Object.keys(db.data).length === 0) {
    db.data = {
      users: [
        // Default admin user
        {
          id: "admin-001",
          email: "admin@safiri.com",
          password: "$2a$10$YourHashedPasswordHere", // Will be properly hashed in server.js
          name: "System Administrator",
          role: "super_admin",
          createdAt: new Date().toISOString(),
          lastLogin: null,
          isActive: true
        }
      ],
      clinics: [
      {
        id: "1",
        name: "Nairobi Central Hospital",
        location: "Nairobi CBD",
        distance: "2.5 km",
        rating: 4.5,
        services: ["General Practice", "Emergency", "Pediatrics"],
        hours: "24/7",
        phone: "+254712345678",
        mpesaNumber: "254712345678",
        consultationFee: 1000,
        coordinates: { lat: -1.2864, lng: 36.8172 }
      },
      {
        id: "2",
        name: "Karen Medical Centre",
        location: "Karen, Nairobi",
        distance: "5.1 km",
        rating: 4.8,
        services: ["General Practice", "Maternal Health", "Dentistry"],
        hours: "Mon-Fri: 8AM-6PM",
        phone: "+254723456789",
        mpesaNumber: "254723456789",
        consultationFee: 1500,
        coordinates: { lat: -1.3192, lng: 36.7073 }
      },
      {
        id: "3",
        name: "Kilimani Health Clinic",
        location: "Kilimani, Nairobi",
        distance: "3.2 km",
        rating: 4.3,
        services: ["General Practice", "Laboratory", "Pharmacy"],
        hours: "Mon-Sat: 7AM-8PM",
        phone: "+254734567890",
        mpesaNumber: "254734567890",
        consultationFee: 800,
        coordinates: { lat: -1.2833, lng: 36.7833 }
      },
      {
        id: "4",
        name: "Westlands Family Clinic",
        location: "Westlands, Nairobi",
        distance: "4.0 km",
        rating: 4.6,
        services: ["General Practice", "Pediatrics", "Vaccination"],
        hours: "Mon-Sun: 8AM-10PM",
        phone: "+254745678901",
        mpesaNumber: "254745678901",
        consultationFee: 1200,
        coordinates: { lat: -1.2667, lng: 36.8083 }
      }
    ],
    doctors: [
      {
        id: "1",
        name: "Dr. Sarah Kamau",
        specialty: "General Practice",
        availability: ["Monday", "Wednesday", "Friday"]
      },
      {
        id: "2",
        name: "Dr. James Ochieng",
        specialty: "Pediatrics",
        availability: ["Tuesday", "Thursday", "Saturday"]
      },
      {
        id: "3",
        name: "Dr. Mary Wanjiku",
        specialty: "Maternal Health",
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      }
    ],
    appointments: [],
    symptomHistory: [],
    bookings: [],
    payments: [],
    adminLogs: [],
    systemSettings: {
      maintenanceMode: false,
      allowNewRegistrations: true,
      mpesaEnabled: true,
      newsEnabled: true,
      symptomCheckerEnabled: true,
      appVersion: "1.0.0"
    }
    };
  } else {
    // Ensure all arrays exist
    db.data.users = db.data.users || [];
    db.data.clinics = db.data.clinics || [];
    db.data.doctors = db.data.doctors || [];
    db.data.appointments = db.data.appointments || [];
    db.data.symptomHistory = db.data.symptomHistory || [];
    db.data.bookings = db.data.bookings || [];
    db.data.payments = db.data.payments || [];
    db.data.adminLogs = db.data.adminLogs || [];
    db.data.systemSettings = db.data.systemSettings || {
      maintenanceMode: false,
      allowNewRegistrations: true,
      mpesaEnabled: true,
      newsEnabled: true,
      symptomCheckerEnabled: true,
      appVersion: "1.0.0"
    };
  }

  await db.write();
  return db;
}

export default db;
