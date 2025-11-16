import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from './database.js';

async function createAdminUser() {
  console.log('🔧 Initializing admin user...');

  await initializeDatabase();
  await db.read();

  // Check if admin user already exists
  const existingAdmin = db.data.users.find(u => u.email === 'admin@safiri.com');

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists. Updating password and role...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin@2025!', 10);

    // Update the admin user
    existingAdmin.password = hashedPassword;
    existingAdmin.role = 'super_admin';
    existingAdmin.isActive = true;
    existingAdmin.lastLogin = null;
    existingAdmin.name = 'System Administrator';

    await db.write();
    console.log('✅ Admin user updated successfully!');
  } else {
    console.log('➕ Creating new admin user...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin@2025!', 10);

    // Create new admin user
    const adminUser = {
      id: 'admin-001',
      email: 'admin@safiri.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'super_admin',
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString()
    };

    db.data.users.push(adminUser);
    await db.write();
    console.log('✅ Admin user created successfully!');
  }

  console.log('\n📋 Admin Credentials:');
  console.log('   Email: admin@safiri.com');
  console.log('   Password: Admin@2025!');
  console.log('\n⚠️  Please change these credentials after first login!\n');

  process.exit(0);
}

createAdminUser().catch(error => {
  console.error('❌ Error creating admin user:', error);
  process.exit(1);
});
