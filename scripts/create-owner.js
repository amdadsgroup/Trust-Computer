const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || process.env.INITIAL_OWNER_EMAIL || 'trustcomputermb@gmail.com';
  const password = process.argv[3] || process.env.INITIAL_OWNER_PASSWORD || 'Trust@Moulvibazar2026!';
  const name = process.argv[4] || process.env.INITIAL_OWNER_NAME || 'Shiblu Ahmed';
  const phone = process.argv[5] || process.env.INITIAL_OWNER_PHONE || '01753-765372';

  console.log(`Setting up initial OWNER account for: ${email}`);

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`User ${email} already exists. Updating role to OWNER...`);
    const updated = await prisma.user.update({
      where: { email },
      data: {
        role: 'OWNER',
        passwordHash,
        name,
        phone,
        isActive: true,
      },
    });
    console.log(`OWNER account successfully updated: ${updated.id} (${updated.email})`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phone,
      role: 'OWNER',
      isActive: true,
    },
  });

  console.log('--------------------------------------------------');
  console.log('✓ Initial Owner Account Created Successfully!');
  console.log(`- Email: ${user.email}`);
  console.log(`- Name:  ${user.name}`);
  console.log(`- Role:  ${user.role}`);
  console.log(`- Phone: ${user.phone}`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Failed to create owner account:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
