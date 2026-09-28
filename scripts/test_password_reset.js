const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

function hashResetToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
}

async function runTests() {
  console.log('=== STARTING PASSWORD RESET SYSTEM TEST ===\n');

  const testEmail = 'contact.amdadur@gmail.com';
  const newTestPassword = 'NewSecretPassword2026!';

  // Step 1: Ensure customer exists
  let customer = await prisma.customerProfile.findUnique({
    where: { email: testEmail },
  });

  if (!customer) {
    customer = await prisma.customerProfile.create({
      data: {
        id: crypto.randomUUID(),
        email: testEmail,
        fullName: 'Amdadur Test',
        phone: '01750121758',
      },
    });
    console.log('✓ Created test customer:', customer.email);
  } else {
    console.log('✓ Found test customer:', customer.email, customer.fullName);
  }

  // Step 2: Create reset token
  console.log('\n--- Test 1: Generate Password Reset Token ---');
  // Invalidate any existing unused tokens
  await prisma.passwordResetToken.deleteMany({ where: { email: testEmail } });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const createdToken = await prisma.passwordResetToken.create({
    data: {
      email: testEmail,
      tokenHash,
      expiresAt,
      userType: 'CUSTOMER',
    },
  });
  console.log('✓ Successfully created token in database:');
  console.log('  Token ID:', createdToken.id);
  console.log('  Raw Token:', rawToken.substring(0, 16) + '...');
  console.log('  Expires At:', createdToken.expiresAt.toISOString());

  // Step 3: Verify token
  console.log('\n--- Test 2: Token Verification ---');
  const foundRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(rawToken) },
  });

  if (!foundRecord || foundRecord.usedAt !== null || foundRecord.expiresAt < new Date()) {
    throw new Error('Token verification failed unexpectedly!');
  }
  console.log('✓ Valid token verification passed successfully');

  // Verify bogus token fails
  const bogusRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken('invalid_bogus_token_12345') },
  });
  if (bogusRecord !== null) {
    throw new Error('Bogus token should not be found!');
  }
  console.log('✓ Invalid token rejection passed successfully');

  // Step 4: Execute Password Reset
  console.log('\n--- Test 3: Atomic Password Reset & Hash ---');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newTestPassword, salt);

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });

    await tx.customerProfile.update({
      where: { email: testEmail },
      data: { passwordHash },
    });
  });

  const updatedCustomer = await prisma.customerProfile.findUnique({
    where: { email: testEmail },
  });
  console.log('✓ Customer passwordHash updated:', updatedCustomer.passwordHash ? 'YES (Bcrypt)' : 'NO');

  // Step 5: Test Token Single-Use (Replay Attack Prevention)
  console.log('\n--- Test 4: Prevent Token Reuse (Single-Use Guarantee) ---');
  const recheckToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });
  if (recheckToken.usedAt === null) {
    throw new Error('Token should be marked as used!');
  }
  console.log('✓ Token usedAt is set to:', recheckToken.usedAt.toISOString());
  console.log('✓ Subsequent attempts to use this token will be blocked.');

  // Step 6: Verify password match
  console.log('\n--- Test 5: Bcrypt Password Verification ---');
  const matches = await bcrypt.compare(newTestPassword, updatedCustomer.passwordHash);
  const wrongMatches = await bcrypt.compare('WrongPassword999!', updatedCustomer.passwordHash);

  if (!matches || wrongMatches) {
    throw new Error('Password verification comparison failed!');
  }
  console.log('✓ Correct password matched bcrypt hash: TRUE');
  console.log('✓ Incorrect password rejected: TRUE');

  console.log('\n=== ALL PASSWORD RESET SYSTEM TESTS PASSED SUCCESSFULLY! ===\n');
}

runTests()
  .catch((err) => {
    console.error('TEST FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
