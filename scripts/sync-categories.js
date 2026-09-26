/**
 * Sync the 7 official Trust Computer categories to the database.
 * These match the website navigation slugs exactly.
 * Existing categories with old slugs are kept (not deleted) to preserve
 * any product relations, but new ones are added/updated.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: 'Laptop & Computer',
    slug: 'laptop-computer',
    description: 'Brand new laptops, desktop computers, all-in-one PCs and computing solutions with official warranty in Moulvibazar.',
    sortOrder: 1,
    icon: '💻',
  },
  {
    name: 'Monitor',
    slug: 'monitor',
    description: 'Full HD, 2K and 4K monitors with Eye Care technology, gaming displays and office screens with HDMI/VGA connectivity.',
    sortOrder: 2,
    icon: '🖥️',
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    description: 'Gaming PCs, gaming laptops, graphics cards, RGB peripherals, gaming chairs and high-performance gaming gear.',
    sortOrder: 3,
    icon: '🎮',
  },
  {
    name: 'Computer Accessories',
    slug: 'computer-accessories',
    description: 'Keyboards, mouse, headphones, webcams, USB hubs, cables, cooling pads and essential computer accessories.',
    sortOrder: 4,
    icon: '🖱️',
  },
  {
    name: 'CCTV & Security',
    slug: 'cctv-security',
    description: 'IP cameras, HD analog cameras, DVRs, NVRs, surveillance hard drives and complete CCTV security systems.',
    sortOrder: 5,
    icon: '📹',
  },
  {
    name: 'Networking',
    slug: 'networking',
    description: 'Wi-Fi routers, network switches, access points, Cat6 cables, fiber connectors and networking infrastructure.',
    sortOrder: 6,
    icon: '📡',
  },
  {
    name: 'Power & Electronics',
    slug: 'power-electronics',
    description: 'UPS, IPS, voltage stabilizers, power strips, solar solutions and electronic components.',
    sortOrder: 7,
    icon: '🔌',
  },
];

async function syncCategories() {
  console.log('==============================================');
  console.log('🗂️  Syncing Trust Computer Categories');
  console.log('==============================================');

  try {
    const existing = await prisma.category.findMany();
    console.log(`\nExisting categories in DB: ${existing.length}`);
    existing.forEach(c => console.log(`  - [${c.slug}] ${c.name}`));

    console.log('\nUpserting 7 official categories...');
    let created = 0, updated = 0;

    for (const cat of CATEGORIES) {
      const result = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true,
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true,
        },
      });

      const wasExisting = existing.find(e => e.slug === cat.slug);
      if (wasExisting) {
        console.log(`  ✓ Updated: [${cat.slug}] ${cat.name}`);
        updated++;
      } else {
        console.log(`  ✨ Created: [${cat.slug}] ${cat.name}`);
        created++;
      }
    }

    // Show final state
    const final = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
    console.log(`\n==============================================`);
    console.log(`✅ Done! Created: ${created}, Updated: ${updated}`);
    console.log(`\nAll categories in DB now (${final.length} total):`);
    final.forEach(c => console.log(`  ${c.sortOrder}. [${c.slug}] ${c.name} — ${c.isActive ? 'Active' : 'Inactive'}`));
    console.log(`==============================================`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncCategories();
