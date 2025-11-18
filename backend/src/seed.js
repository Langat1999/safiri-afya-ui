import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.symptomHistory.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.adminLog.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  // Create Admin User
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@safiriafya.com',
      password: hashedPassword,
      phone: '254712345678',
      role: 'SUPER_ADMIN',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'MALE',
      location: 'Nairobi, Kenya',
      language: 'en',
      theme: 'light',
      timezone: 'Africa/Nairobi',
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      dataSharing: 'MINIMAL',
    },
  });
  console.log(`✅ Admin created: ${adminUser.email} / Admin@123456`);

  // Create Sample Clinics in Nairobi
  console.log('🏥 Creating clinics...');

  const clinics = [
    {
      name: 'Nairobi Women\'s Hospital - Hurlingham',
      location: 'Hurlingham, Argwings Kodhek Road, Nairobi',
      coordinates: { lat: -1.2885, lng: 36.7832 },
      phone: '0730 666 000',
      email: 'info@nwhkenya.com',
      services: ['General Medicine', 'Maternity', 'Pediatrics', 'Surgery', 'Laboratory', 'Radiology', 'Pharmacy'],
      operatingHours: 'Mon-Sun: 24 Hours',
      description: 'Leading private hospital specializing in women and children healthcare with 24-hour emergency services.',
      fees: 'Consultation: KES 2,000 - 5,000',
      facilities: ['Emergency Room', 'ICU', 'Theater', 'Maternity Ward', 'Laboratory', 'Pharmacy'],
      insuranceAccepted: ['NHIF', 'AAR', 'Britam', 'Jubilee', 'Madison', 'CIC'],
      rating: 4.5,
    },
    {
      name: 'Aga Khan University Hospital',
      location: '3rd Parklands Avenue, Nairobi',
      coordinates: { lat: -1.2632, lng: 36.8079 },
      phone: '0730 124 000',
      email: 'info@aku.edu',
      services: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'General Surgery', 'Pediatrics', 'Laboratory'],
      operatingHours: 'Mon-Sun: 24 Hours',
      description: 'World-class tertiary care hospital offering comprehensive medical services with state-of-the-art facilities.',
      fees: 'Consultation: KES 3,000 - 8,000',
      facilities: ['Emergency Room', 'ICU', 'Cardiac Center', 'Cancer Center', 'Laboratory', 'Pharmacy'],
      insuranceAccepted: ['NHIF', 'AAR', 'Britam', 'Jubilee', 'Madison', 'Cigna', 'Allianz'],
      rating: 4.8,
    },
    {
      name: 'Kenyatta National Hospital',
      location: 'Hospital Road, Upper Hill, Nairobi',
      coordinates: { lat: -1.3006, lng: 36.8074 },
      phone: '020 272 6300',
      email: 'info@knh.or.ke',
      services: ['General Medicine', 'Surgery', 'Pediatrics', 'Maternity', 'Orthopedics', 'Cardiology', 'Laboratory'],
      operatingHours: 'Mon-Sun: 24 Hours',
      description: 'Kenya\'s largest referral and teaching hospital providing comprehensive healthcare services to all Kenyans.',
      fees: 'Consultation: KES 500 - 2,000',
      facilities: ['Emergency Room', 'ICU', 'Specialist Clinics', 'Laboratory', 'Radiology', 'Pharmacy'],
      insuranceAccepted: ['NHIF', 'Most Private Insurance'],
      rating: 4.0,
    },
    {
      name: 'MP Shah Hospital',
      location: 'Shivachi Road, Parklands, Nairobi',
      coordinates: { lat: -1.2598, lng: 36.8083 },
      phone: '020 427 4000',
      email: 'info@mpshahospital.org',
      services: ['General Medicine', 'Surgery', 'Orthopedics', 'ENT', 'Ophthalmology', 'Dental', 'Laboratory'],
      operatingHours: 'Mon-Fri: 8am-6pm, Sat: 8am-1pm, Emergency: 24/7',
      description: 'Premier healthcare facility offering quality medical services with experienced specialists and modern equipment.',
      fees: 'Consultation: KES 2,500 - 5,000',
      facilities: ['Emergency Room', 'Specialist Clinics', 'Laboratory', 'Radiology', 'Pharmacy'],
      insuranceAccepted: ['NHIF', 'AAR', 'Britam', 'Jubilee', 'Madison'],
      rating: 4.3,
    },
    {
      name: 'Mater Hospital',
      location: 'Dunga Road, South B, Nairobi',
      coordinates: { lat: -1.3126, lng: 36.8344 },
      phone: '020 272 0400',
      email: 'info@materkenya.com',
      services: ['Cardiology', 'Oncology', 'Orthopedics', 'General Surgery', 'Maternity', 'Pediatrics', 'Laboratory'],
      operatingHours: 'Mon-Sun: 24 Hours',
      description: 'Catholic healthcare institution providing compassionate and quality medical services to all communities.',
      fees: 'Consultation: KES 2,000 - 4,500',
      facilities: ['Emergency Room', 'ICU', 'Heart Center', 'Cancer Center', 'Laboratory', 'Pharmacy'],
      insuranceAccepted: ['NHIF', 'AAR', 'Britam', 'Jubilee', 'Old Mutual'],
      rating: 4.4,
    },
    {
      name: 'Avenue Healthcare',
      location: 'Ngong Road, Nairobi',
      coordinates: { lat: -1.2975, lng: 36.7821 },
      phone: '0709 977 000',
      email: 'info@avenuehealthcare.com',
      services: ['General Medicine', 'Pediatrics', 'Dental', 'Laboratory', 'Radiology', 'Pharmacy'],
      operatingHours: 'Mon-Sat: 8am-8pm, Sun: 10am-6pm',
      description: 'Modern outpatient healthcare facility providing quality and affordable medical services to families.',
      fees: 'Consultation: KES 1,500 - 3,000',
      facilities: ['Outpatient Clinics', 'Laboratory', 'Dental Clinic', 'Pharmacy'],
      insuranceAccepted: ['NHIF', 'AAR', 'Britam', 'Jubilee'],
      rating: 4.2,
    },
    {
      name: 'Bliss Healthcare',
      location: 'Mombasa Road, Nairobi',
      coordinates: { lat: -1.3235, lng: 36.8564 },
      phone: '0707 123 456',
      email: 'info@blisshealthcare.co.ke',
      services: ['General Medicine', 'Pediatrics', 'Laboratory', 'Pharmacy'],
      operatingHours: 'Mon-Sat: 8am-6pm',
      description: 'Community healthcare center providing accessible and affordable medical services.',
      fees: 'Consultation: KES 1,000 - 2,000',
      facilities: ['Outpatient Clinics', 'Laboratory', 'Pharmacy'],
      insuranceAccepted: ['NHIF', 'AAR'],
      rating: 3.8,
    },
    {
      name: 'Gertrude\'s Children\'s Hospital',
      location: 'Muthaiga Road, Nairobi',
      coordinates: { lat: -1.2546, lng: 36.8437 },
      phone: '020 272 2713',
      email: 'info@gerties.org',
      services: ['Pediatrics', 'Neonatology', 'Pediatric Surgery', 'Vaccination', 'Laboratory', 'Pharmacy'],
      operatingHours: 'Mon-Sun: 24 Hours',
      description: 'East Africa\'s premier children\'s hospital specializing in pediatric care with expert child specialists.',
      fees: 'Consultation: KES 2,500 - 5,000',
      facilities: ['Pediatric Emergency', 'NICU', 'Pediatric ICU', 'Laboratory', 'Pharmacy'],
      insuranceAccepted: ['NHIF', 'AAR', 'Britam', 'Jubilee', 'Madison'],
      rating: 4.7,
    },
  ];

  const createdClinics = [];
  for (const clinic of clinics) {
    // Transform clinic data to match Prisma schema
    const { coordinates, operatingHours, email, description, fees, facilities, insuranceAccepted, ...clinicData } = clinic;

    const created = await prisma.clinic.create({
      data: {
        ...clinicData,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        hours: operatingHours,
      },
    });
    createdClinics.push(created);
    console.log(`  ✅ ${created.name}`);
  }

  // Create Sample Doctors
  console.log('👨‍⚕️ Creating doctors...');

  const doctors = [
    {
      name: 'Dr. James Mwangi',
      specialty: 'General Practitioner',
      clinicId: createdClinics[0].id,
      phone: '0712345671',
      email: 'dr.mwangi@nwhkenya.com',
      bio: 'Experienced general practitioner with over 10 years in family medicine. Fluent in English, Swahili, and Kikuyu.',
      qualifications: ['MBChB (UoN)', 'MMED (UoN)', 'Family Medicine Specialist'],
      languages: ['English', 'Swahili', 'Kikuyu'],
      availability: ['Monday', 'Wednesday', 'Friday'],
      consultationFee: 2000,
      rating: 4.6,
    },
    {
      name: 'Dr. Mary Wanjiru',
      specialty: 'Pediatrician',
      clinicId: createdClinics[7].id,
      phone: '0712345672',
      email: 'dr.wanjiru@gerties.org',
      bio: 'Pediatric specialist focusing on child development and preventive care. Passionate about children\'s health.',
      qualifications: ['MBChB (UoN)', 'MMED Pediatrics (UoN)', 'Registered Pediatrician'],
      languages: ['English', 'Swahili'],
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      consultationFee: 3000,
      rating: 4.8,
    },
    {
      name: 'Dr. Ahmed Hassan',
      specialty: 'Cardiologist',
      clinicId: createdClinics[1].id,
      phone: '0712345673',
      email: 'dr.hassan@aku.edu',
      bio: 'Board-certified cardiologist specializing in heart disease prevention and treatment.',
      qualifications: ['MBChB (AKU)', 'MMED Cardiology (AKU)', 'Fellow of Cardiology'],
      languages: ['English', 'Swahili', 'Arabic'],
      availability: ['Tuesday', 'Thursday'],
      consultationFee: 5000,
      rating: 4.7,
    },
    {
      name: 'Dr. Grace Achieng',
      specialty: 'Obstetrician & Gynecologist',
      clinicId: createdClinics[0].id,
      phone: '0712345674',
      email: 'dr.achieng@nwhkenya.com',
      bio: 'Specialist in women\'s health, pregnancy care, and reproductive medicine with 15 years experience.',
      qualifications: ['MBChB (UoN)', 'MMED OB/GYN (UoN)', 'Reproductive Health Specialist'],
      languages: ['English', 'Swahili', 'Luo'],
      availability: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      consultationFee: 3500,
      rating: 4.9,
    },
    {
      name: 'Dr. Peter Kamau',
      specialty: 'Orthopedic Surgeon',
      clinicId: createdClinics[3].id,
      phone: '0712345675',
      email: 'dr.kamau@mpshahospital.org',
      bio: 'Orthopedic surgeon specializing in joint replacement and sports injuries.',
      qualifications: ['MBChB (UoN)', 'MMED Orthopedics (UoN)', 'Fellowship in Joint Surgery'],
      languages: ['English', 'Swahili'],
      availability: ['Wednesday', 'Friday'],
      consultationFee: 4000,
      rating: 4.5,
    },
    {
      name: 'Dr. Sarah Njeri',
      specialty: 'Dermatologist',
      clinicId: createdClinics[5].id,
      phone: '0712345676',
      email: 'dr.njeri@avenuehealthcare.com',
      bio: 'Skin specialist treating various skin conditions, acne, and cosmetic dermatology.',
      qualifications: ['MBChB (UoN)', 'Diploma in Dermatology', 'Cosmetic Dermatology Certified'],
      languages: ['English', 'Swahili'],
      availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      consultationFee: 2500,
      rating: 4.4,
    },
    {
      name: 'Dr. Daniel Ochieng',
      specialty: 'Dentist',
      clinicId: createdClinics[5].id,
      phone: '0712345677',
      email: 'dr.ochieng@avenuehealthcare.com',
      bio: 'General dentist providing comprehensive dental care including cleanings, fillings, and extractions.',
      qualifications: ['BDS (UoN)', 'Diploma in Advanced Dentistry', 'Implantology Certificate'],
      languages: ['English', 'Swahili', 'Luo'],
      availability: ['Tuesday', 'Thursday', 'Saturday'],
      consultationFee: 2000,
      rating: 4.3,
    },
    {
      name: 'Dr. Lucy Wambui',
      specialty: 'Psychiatrist',
      clinicId: createdClinics[4].id,
      phone: '0712345678',
      email: 'dr.wambui@materkenya.com',
      bio: 'Mental health specialist helping patients with depression, anxiety, and other mental health conditions.',
      qualifications: ['MBChB (UoN)', 'MMED Psychiatry (UoN)', 'Licensed Psychiatrist'],
      languages: ['English', 'Swahili', 'Kikuyu'],
      availability: ['Monday', 'Wednesday', 'Friday'],
      consultationFee: 3000,
      rating: 4.6,
    },
    {
      name: 'Dr. John Kiplagat',
      specialty: 'Ophthalmologist',
      clinicId: createdClinics[3].id,
      phone: '0712345679',
      email: 'dr.kiplagat@mpshahospital.org',
      bio: 'Eye specialist providing comprehensive eye care including cataract surgery and laser treatment.',
      qualifications: ['MBChB (UoN)', 'MMED Ophthalmology (UoN)', 'Fellowship in Cataract Surgery'],
      languages: ['English', 'Swahili', 'Kalenjin'],
      availability: ['Tuesday', 'Thursday'],
      consultationFee: 3500,
      rating: 4.5,
    },
    {
      name: 'Dr. Faith Wangari',
      specialty: 'General Practitioner',
      clinicId: createdClinics[6].id,
      phone: '0712345680',
      email: 'dr.wangari@blisshealthcare.co.ke',
      bio: 'Community health doctor providing primary care services to families and individuals.',
      qualifications: ['MBChB (UoN)', 'Diploma in Family Medicine'],
      languages: ['English', 'Swahili', 'Kikuyu'],
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      consultationFee: 1500,
      rating: 4.2,
    },
  ];

  for (const doctor of doctors) {
    // Transform doctor data to match Prisma schema (only name, specialty, availability)
    const { name, specialty, availability } = doctor;

    const created = await prisma.doctor.create({
      data: {
        name,
        specialty,
        availability,
      },
    });
    console.log(`  ✅ ${created.name} - ${created.specialty}`);
  }

  // Create System Settings
  console.log('⚙️  Creating system settings...');
  await prisma.systemSetting.create({
    data: {
      key: 'maintenance_mode',
      value: 'false',
    },
  });
  await prisma.systemSetting.create({
    data: {
      key: 'platform_commission',
      value: '15',
    },
  });

  console.log('✨ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - ${createdClinics.length} clinics created`);
  console.log(`  - ${doctors.length} doctors created`);
  console.log(`  - 1 admin user created (admin@safiriafya.com / Admin@123456)`);
  console.log(`  - 2 system settings created`);
  console.log('\n🚀 Your database is ready for use!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
