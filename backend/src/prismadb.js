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

// Helper functions for PostgreSQL
// PostgreSQL supports native arrays, so we don't need JSON stringify/parse

/**
 * Parse clinic services (PostgreSQL native arrays - no conversion needed)
 */
export const parseClinicServices = (clinic) => {
  if (!clinic) return null;
  // PostgreSQL returns arrays directly, just ensure it's an array
  return {
    ...clinic,
    services: Array.isArray(clinic.services) ? clinic.services : []
  };
};

/**
 * Parse doctor availability (PostgreSQL native arrays - no conversion needed)
 */
export const parseDoctorAvailability = (doctor) => {
  if (!doctor) return null;
  // PostgreSQL returns arrays directly, just ensure it's an array
  return {
    ...doctor,
    availability: Array.isArray(doctor.availability) ? doctor.availability : []
  };
};

/**
 * Parse symptom recommendations
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
 * Prepare clinic data for database insertion (PostgreSQL native arrays)
 */
export const prepareClinicForDB = (clinicData) => {
  return {
    ...clinicData,
    // PostgreSQL accepts arrays directly, just ensure it's an array
    services: Array.isArray(clinicData.services)
      ? clinicData.services
      : (typeof clinicData.services === 'string' ? [clinicData.services] : [])
  };
};

/**
 * Prepare doctor data for database insertion (PostgreSQL native arrays)
 */
export const prepareDoctorForDB = (doctorData) => {
  return {
    ...doctorData,
    // PostgreSQL accepts arrays directly, just ensure it's an array
    availability: Array.isArray(doctorData.availability)
      ? doctorData.availability
      : (typeof doctorData.availability === 'string' ? [doctorData.availability] : [])
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
