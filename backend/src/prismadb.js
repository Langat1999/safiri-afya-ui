import { PrismaClient } from '../generated/prisma/index.js';

// Create a singleton Prisma client
const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper functions for array fields (SQLite stores as JSON strings)

/**
 * Parse clinic services from JSON string to array
 */
export const parseClinicServices = (clinic) => {
  if (!clinic) return null;
  return {
    ...clinic,
    services: typeof clinic.services === 'string'
      ? JSON.parse(clinic.services)
      : clinic.services || []
  };
};

/**
 * Parse doctor availability from JSON string to array
 */
export const parseDoctorAvailability = (doctor) => {
  if (!doctor) return null;
  return {
    ...doctor,
    availability: typeof doctor.availability === 'string'
      ? JSON.parse(doctor.availability)
      : doctor.availability || []
  };
};

/**
 * Parse symptom recommendations from JSON string to array
 */
export const parseSymptomRecommendations = (symptom) => {
  if (!symptom) return null;
  return {
    ...symptom,
    recommendations: typeof symptom.recommendations === 'string'
      ? JSON.parse(symptom.recommendations)
      : symptom.recommendations
  };
};

/**
 * Prepare clinic data for database insertion
 */
export const prepareClinicForDB = (clinicData) => {
  return {
    ...clinicData,
    services: Array.isArray(clinicData.services)
      ? JSON.stringify(clinicData.services)
      : clinicData.services
  };
};

/**
 * Prepare doctor data for database insertion
 */
export const prepareDoctorForDB = (doctorData) => {
  return {
    ...doctorData,
    availability: Array.isArray(doctorData.availability)
      ? JSON.stringify(doctorData.availability)
      : doctorData.availability
  };
};

/**
 * Parse multiple clinics
 */
export const parseClinics = (clinics) => {
  return clinics.map(parseClinicServices);
};

/**
 * Parse multiple doctors
 */
export const parseDoctors = (doctors) => {
  return doctors.map(parseDoctorAvailability);
};

export default prisma;
