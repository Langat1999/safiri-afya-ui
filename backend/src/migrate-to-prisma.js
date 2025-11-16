import { PrismaClient } from '../generated/prisma/index.js';
import db from './database.js';

const prisma = new PrismaClient();

async function migrateData() {
  console.log('🚀 Starting data migration from LowDB to Prisma (SQLite)...\n');

  try {
    // Read current data from LowDB
    await db.read();

    let migrationStats = {
      users: 0,
      clinics: 0,
      doctors: 0,
      appointments: 0,
      bookings: 0,
      payments: 0,
      symptomHistory: 0,
      adminLogs: 0,
      systemSettings: 0,
      passwordResets: 0
    };

    // 1. Migrate Users
    console.log('👤 Migrating users...');
    for (const user of db.data.users || []) {
      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role.toUpperCase().replace('-', '_'),
            isActive: user.isActive ?? true,
            lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          },
        });
        migrationStats.users++;
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate user ${user.email}:`, error.message);
      }
    }
    console.log(`✅ Migrated ${migrationStats.users} users\n`);

    // 2. Migrate Clinics
    console.log('🏥 Migrating clinics...');
    for (const clinic of db.data.clinics || []) {
      try {
        await prisma.clinic.upsert({
          where: { id: clinic.id },
          update: {},
          create: {
            id: clinic.id,
            name: clinic.name,
            location: clinic.location,
            latitude: clinic.coordinates?.lat || 0,
            longitude: clinic.coordinates?.lng || 0,
            distance: clinic.distance,
            rating: clinic.rating || 0,
            services: JSON.stringify(clinic.services || []),
            hours: clinic.hours,
            phone: clinic.phone,
            mpesaNumber: clinic.mpesaNumber,
            consultationFee: clinic.consultationFee || 1000,
          },
        });
        migrationStats.clinics++;
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate clinic ${clinic.name}:`, error.message);
      }
    }
    console.log(`✅ Migrated ${migrationStats.clinics} clinics\n`);

    // 3. Migrate Doctors
    console.log('👨‍⚕️ Migrating doctors...');
    for (const doctor of db.data.doctors || []) {
      try {
        await prisma.doctor.upsert({
          where: { id: doctor.id },
          update: {},
          create: {
            id: doctor.id,
            name: doctor.name,
            specialty: doctor.specialty,
            availability: JSON.stringify(doctor.availability || []),
          },
        });
        migrationStats.doctors++;
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate doctor ${doctor.name}:`, error.message);
      }
    }
    console.log(`✅ Migrated ${migrationStats.doctors} doctors\n`);

    // 4. Migrate Appointments
    console.log('📅 Migrating appointments...');
    for (const appointment of db.data.appointments || []) {
      try {
        // Verify foreign keys exist
        const userExists = await prisma.user.findUnique({ where: { id: appointment.userId } });
        const doctorExists = await prisma.doctor.findUnique({ where: { id: appointment.doctorId } });

        if (userExists && doctorExists) {
          await prisma.appointment.create({
            data: {
              id: appointment.id,
              userId: appointment.userId,
              doctorId: appointment.doctorId,
              doctorName: appointment.doctorName,
              date: appointment.date,
              time: appointment.time,
              reason: appointment.reason,
              name: appointment.name,
              email: appointment.email,
              phone: appointment.phone,
              status: appointment.status?.toUpperCase() || 'CONFIRMED',
              createdAt: appointment.createdAt ? new Date(appointment.createdAt) : new Date(),
            },
          });
          migrationStats.appointments++;
        } else {
          console.log(`  ⚠️  Skipping appointment ${appointment.id} - missing user or doctor`);
        }
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate appointment:`, error.message);
      }
    }
    console.log(`✅ Migrated ${migrationStats.appointments} appointments\n`);

    // 5. Migrate Bookings
    console.log('📋 Migrating bookings...');
    for (const booking of db.data.bookings || []) {
      try {
        const clinicExists = await prisma.clinic.findUnique({ where: { id: booking.facilityId } });

        if (clinicExists) {
          await prisma.booking.create({
            data: {
              id: booking.id,
              userId: booking.userId || null,
              facilityId: booking.facilityId,
              facilityName: booking.facilityName,
              patientName: booking.patientName,
              patientEmail: booking.patientEmail,
              patientPhone: booking.patientPhone,
              appointmentDate: booking.appointmentDate,
              appointmentTime: booking.appointmentTime,
              symptoms: booking.symptoms,
              status: booking.status?.toUpperCase() || 'PENDING',
              paymentStatus: booking.paymentStatus?.toUpperCase() || 'UNPAID',
              consultationFee: booking.consultationFee || 1000,
              createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
            },
          });
          migrationStats.bookings++;
        } else {
          console.log(`  ⚠️  Skipping booking ${booking.id} - missing facility`);
        }
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate booking:`, error.message);
      }
    }
    console.log(`✅ Migrated ${migrationStats.bookings} bookings\n`);

    // 6. Migrate Payments
    console.log('💳 Migrating payments...');
    for (const payment of db.data.payments || []) {
      try {
        const bookingExists = await prisma.booking.findUnique({ where: { id: payment.bookingId } });

        if (bookingExists) {
          await prisma.payment.create({
            data: {
              id: payment.id,
              bookingId: payment.bookingId,
              amount: payment.amount,
              phoneNumber: payment.phoneNumber,
              mpesaReceiptNumber: payment.mpesaReceiptNumber,
              transactionId: payment.transactionId,
              status: payment.status?.toUpperCase() || 'PENDING',
              developerAmount: payment.developerAmount,
              facilityAmount: payment.facilityAmount,
              errorMessage: payment.errorMessage,
              createdAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
            },
          });
          migrationStats.payments++;
        } else {
          console.log(`  ⚠️  Skipping payment ${payment.id} - missing booking`);
        }
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate payment:`, error.message);
      }
    }
    console.log(`✅ Migrated ${migrationStats.payments} payments\n`);

    // 7. Migrate Symptom History
    console.log('🩺 Migrating symptom history...');
    for (const symptom of db.data.symptomHistory || []) {
      try {
        await prisma.symptomHistory.create({
          data: {
            id: symptom.id,
            userId: symptom.userId || null,
            symptoms: symptom.symptoms,
            analysis: symptom.analysis,
            riskLevel: symptom.riskLevel,
            recommendations: Array.isArray(symptom.recommendations)
              ? JSON.stringify(symptom.recommendations)
              : symptom.recommendations,
            ageRange: symptom.ageRange,
            gender: symptom.gender,
            createdAt: symptom.createdAt ? new Date(symptom.createdAt) : new Date(),
          },
        });
        migrationStats.symptomHistory++;
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate symptom record:`, error.message);
      }
    }
    console.log(`✅ Migrated ${migrationStats.symptomHistory} symptom records\n`);

    // 8. Migrate Password Resets (if any)
    console.log('🔑 Migrating password resets...');
    for (const reset of db.data.passwordResets || []) {
      try {
        await prisma.passwordReset.create({
          data: {
            id: reset.id || undefined,
            email: reset.email,
            code: reset.code,
            expiresAt: new Date(reset.expiresAt),
            createdAt: reset.createdAt ? new Date(reset.createdAt) : new Date(),
          },
        });
        migrationStats.passwordResets++;
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate password reset:`, error.message);
      }
    }
    console.log(`✅ Migrated ${migrationStats.passwordResets} password resets\n`);

    // 9. Migrate Admin Logs
    console.log('📊 Migrating admin logs...');
    for (const log of db.data.adminLogs || []) {
      try {
        const adminExists = await prisma.user.findUnique({ where: { id: log.adminId } });

        if (adminExists) {
          await prisma.adminLog.create({
            data: {
              id: log.id || undefined,
              adminId: log.adminId,
              action: log.action,
              details: log.details,
              timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
            },
          });
          migrationStats.adminLogs++;
        } else {
          console.log(`  ⚠️  Skipping admin log - admin user ${log.adminId} not found`);
        }
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate admin log:`, error.message);
      }
    }
    console.log(`✅ Migrated ${migrationStats.adminLogs} admin logs\n`);

    // 10. Migrate System Settings
    console.log('⚙️  Migrating system settings...');
    if (db.data.systemSettings) {
      const settings = db.data.systemSettings;
      const settingsToMigrate = [
        { key: 'maintenanceMode', value: String(settings.maintenanceMode) },
        { key: 'allowNewRegistrations', value: String(settings.allowNewRegistrations) },
        { key: 'mpesaEnabled', value: String(settings.mpesaEnabled) },
        { key: 'newsEnabled', value: String(settings.newsEnabled) },
        { key: 'symptomCheckerEnabled', value: String(settings.symptomCheckerEnabled) },
        { key: 'appVersion', value: settings.appVersion },
      ];

      for (const setting of settingsToMigrate) {
        try {
          await prisma.systemSetting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: setting,
          });
          migrationStats.systemSettings++;
        } catch (error) {
          console.error(`  ⚠️  Failed to migrate setting ${setting.key}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${migrationStats.systemSettings} system settings\n`);

    // Print final statistics
    console.log('┌─────────────────────────────────────────┐');
    console.log('│   🎉 MIGRATION COMPLETED SUCCESSFULLY!  │');
    console.log('└─────────────────────────────────────────┘\n');

    console.log('📊 Final Statistics:');
    console.log('────────────────────────────────');
    console.log(`   Users:            ${migrationStats.users}`);
    console.log(`   Clinics:          ${migrationStats.clinics}`);
    console.log(`   Doctors:          ${migrationStats.doctors}`);
    console.log(`   Appointments:     ${migrationStats.appointments}`);
    console.log(`   Bookings:         ${migrationStats.bookings}`);
    console.log(`   Payments:         ${migrationStats.payments}`);
    console.log(`   Symptom Records:  ${migrationStats.symptomHistory}`);
    console.log(`   Password Resets:  ${migrationStats.passwordResets}`);
    console.log(`   Admin Logs:       ${migrationStats.adminLogs}`);
    console.log(`   System Settings:  ${migrationStats.systemSettings}`);
    console.log('────────────────────────────────\n');

    // Verify counts
    console.log('🔍 Verifying migration...');
    const verification = {
      users: await prisma.user.count(),
      clinics: await prisma.clinic.count(),
      doctors: await prisma.doctor.count(),
      appointments: await prisma.appointment.count(),
      bookings: await prisma.booking.count(),
      payments: await prisma.payment.count(),
      symptomHistory: await prisma.symptomHistory.count(),
      adminLogs: await prisma.adminLog.count(),
      systemSettings: await prisma.systemSetting.count(),
      passwordResets: await prisma.passwordReset.count(),
    };

    console.log('\n✅ Database Verification:');
    console.log('────────────────────────────────');
    console.log(`   Users:            ${verification.users}`);
    console.log(`   Clinics:          ${verification.clinics}`);
    console.log(`   Doctors:          ${verification.doctors}`);
    console.log(`   Appointments:     ${verification.appointments}`);
    console.log(`   Bookings:         ${verification.bookings}`);
    console.log(`   Payments:         ${verification.payments}`);
    console.log(`   Symptom Records:  ${verification.symptomHistory}`);
    console.log(`   Password Resets:  ${verification.passwordResets}`);
    console.log(`   Admin Logs:       ${verification.adminLogs}`);
    console.log(`   System Settings:  ${verification.systemSettings}`);
    console.log('────────────────────────────────\n');

    console.log('✨ Migration completed successfully!');
    console.log('💡 Next steps:');
    console.log('   1. Test the application with Prisma');
    console.log('   2. Update server.js to use Prisma instead of LowDB');
    console.log('   3. Backup the old db.json file');
    console.log('   4. Remove LowDB dependency when ready\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateData()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  });
