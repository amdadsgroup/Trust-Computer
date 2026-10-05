const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    console.log('Current site settings in DB:', JSON.stringify(settings, null, 2));
    
    // Check columns in site_settings
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'site_settings'
    `);
    console.log('Columns in site_settings:', JSON.stringify(columns, null, 2));

    // Check columns in payments
    const paymentCols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'payments'
    `);
    console.log('Columns in payments:', JSON.stringify(paymentCols, null, 2));

  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
