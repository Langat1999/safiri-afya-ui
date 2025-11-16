import db, { initializeDatabase } from './database.js';

async function migrateExistingUsers() {
  console.log('🔧 Migrating existing users...');

  await initializeDatabase();
  await db.read();

  let updatedCount = 0;

  db.data.users.forEach(user => {
    // Add missing fields if they don't exist
    if (!user.role) {
      user.role = 'user';
      updatedCount++;
    }
    if (user.isActive === undefined) {
      user.isActive = true;
      updatedCount++;
    }
    if (user.lastLogin === undefined) {
      user.lastLogin = null;
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    await db.write();
    console.log(`✅ Updated ${updatedCount} user field(s) successfully!`);
  } else {
    console.log('✅ All users already have the required fields.');
  }

  console.log(`\n📊 Total users in database: ${db.data.users.length}`);
  console.log(`   Regular users: ${db.data.users.filter(u => u.role === 'user').length}`);
  console.log(`   Admin users: ${db.data.users.filter(u => u.role === 'admin').length}`);
  console.log(`   Super admin users: ${db.data.users.filter(u => u.role === 'super_admin').length}\n`);

  process.exit(0);
}

migrateExistingUsers().catch(error => {
  console.error('❌ Error migrating users:', error);
  process.exit(1);
});
