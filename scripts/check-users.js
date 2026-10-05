const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, phone: true, role: true } });
    console.log('Users in DB:', users);
    for (const u of users) {
      if (u.phone && u.phone.includes('01753')) {
        console.log(`Updating phone for user ${u.email}...`);
        await prisma.user.update({
          where: { id: u.id },
          data: { phone: '01797854836' }
        });
        console.log(`✓ Updated user ${u.email} to 01797854836`);
      }
    }
  } catch (err) {
    console.error('Error querying users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
