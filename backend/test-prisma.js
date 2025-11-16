import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function testPrisma() {
  console.log('🧪 Testing Prisma database connection...\n');

  try {
    // Test 1: Count all records
    const users = await prisma.user.findMany();
    console.log(`✅ Found ${users.length} users`);

    const clinics = await prisma.clinic.findMany();
    console.log(`✅ Found ${clinics.length} clinics`);

    const doctors = await prisma.doctor.findMany();
    console.log(`✅ Found ${doctors.length} doctors`);

    const appointments = await prisma.appointment.findMany();
    console.log(`✅ Found ${appointments.length} appointments`);

    // Test 2: Query with relations
    console.log('\n📊 Testing complex queries...');

    const appointmentsWithRelations = await prisma.appointment.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        doctor: {
          select: {
            name: true,
            specialty: true
          }
        }
      },
      take: 1
    });

    if (appointmentsWithRelations.length > 0) {
      console.log('\n✅ Sample appointment with relations:');
      console.log(JSON.stringify(appointmentsWithRelations[0], null, 2));
    }

    // Test 3: Query with filters
    console.log('\n🔍 Testing filtered queries...');

    const activeUsers = await prisma.user.findMany({
      where: {
        isActive: true
      }
    });
    console.log(`✅ Found ${activeUsers.length} active users`);

    const topRatedClinics = await prisma.clinic.findMany({
      where: {
        rating: {
          gte: 4.0
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });
    console.log(`✅ Found ${topRatedClinics.length} top-rated clinics (rating >= 4.0)`);

    console.log('\n🎉 All Prisma tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
