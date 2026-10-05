const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDb() {
  try {
    // 1. Add servicePhone, serviceWhatsapp, bkashNumber columns to site_settings if they don't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "site_settings" 
      ADD COLUMN IF NOT EXISTS "servicePhone" text DEFAULT '01608346407',
      ADD COLUMN IF NOT EXISTS "serviceWhatsapp" text DEFAULT '+8801608346407',
      ADD COLUMN IF NOT EXISTS "bkashNumber" text DEFAULT '01712556225'
    `);
    console.log('✓ Successfully added servicePhone, serviceWhatsapp, and bkashNumber columns to site_settings');

    // 2. Update default row with new official contacts
    await prisma.$executeRawUnsafe(`
      UPDATE "site_settings"
      SET 
        "phone" = '01797854836',
        "whatsappNumber" = '+8801797854836',
        "servicePhone" = '01608346407',
        "serviceWhatsapp" = '+8801608346407',
        "bkashNumber" = '01712556225',
        "updatedAt" = NOW()
      WHERE "id" = 'default'
    `);
    console.log('✓ Successfully updated default site_settings row with new official contacts');

    // 3. Verify updated row
    const updated = await prisma.$queryRawUnsafe(`
      SELECT "id", "storeName", "phone", "whatsappNumber", "servicePhone", "serviceWhatsapp", "bkashNumber"
      FROM "site_settings"
      WHERE "id" = 'default'
    `);
    console.log('Updated settings in DB:', JSON.stringify(updated, null, 2));

  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

updateDb();
