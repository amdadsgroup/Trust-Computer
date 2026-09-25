const { PrismaClient } = require('@prisma/client');

async function testConnection(url) {
  console.log('Testing URL:', url.replace(/:[^:@]+@/, ':****@'));
  const prisma = new PrismaClient({
    datasources: {
      db: { url },
    },
  });

  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Success! Result:', result);
    return true;
  } catch (err) {
    console.error('Failed:', err.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const baseUser = 'postgres.icjuiykdcoemxtqgdqzk';
  const basePass = '%40Amdads2025';
  const projectRef = 'icjuiykdcoemxtqgdqzk';

  // 1. Session pooler with sslmode=require
  await testConnection(`postgresql://${baseUser}:${basePass}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require`);

  // 2. Transaction pooler 6543 with pgbouncer=true
  await testConnection(`postgresql://${baseUser}:${basePass}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`);

  // 3. Direct connection
  await testConnection(`postgresql://postgres:${basePass}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`);
}

main();
