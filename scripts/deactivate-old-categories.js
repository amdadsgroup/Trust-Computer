/**
 * Deactivate the 5 old legacy categories that don't match the nav slugs.
 * The 7 new correct ones stay active.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const OLD_SLUGS = [
  'cctv-surveillance',
  'desktop-components',
  'laptops-notebooks',
  'networking-equipment',
  'printers-scanners',
];

async function deactivateOldCategories() {
  console.log('Deactivating legacy categories...');
  const result = await prisma.category.updateMany({
    where: { slug: { in: OLD_SLUGS } },
    data: { isActive: false },
  });
  console.log(`✓ Deactivated ${result.count} old categories.`);

  const active = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  console.log(`\nActive categories now (${active.length}):`);
  active.forEach(c => console.log(`  ${c.sortOrder}. [${c.slug}] ${c.name}`));
  await prisma.$disconnect();
}

deactivateOldCategories().catch(e => { console.error(e); process.exit(1); });
