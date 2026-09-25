const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const productCount = await prisma.product.count();
    console.log('Total Products in DB:', productCount);
    
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        images: true,
      },
    });

    console.log('--- Current Products in DB ---');
    products.forEach((p, idx) => {
      console.log(`${idx + 1}. [${p.sku}] ${p.name} - Price: ${p.sellingPrice} - Category: ${p.category?.name} - Brand: ${p.brand?.name}`);
    });

    const categories = await prisma.category.findMany();
    console.log('\n--- Categories in DB ---');
    categories.forEach(c => console.log(`- ${c.name} (${c.slug})`));

    const brands = await prisma.brand.findMany();
    console.log('\n--- Brands in DB ---');
    brands.forEach(b => console.log(`- ${b.name} (${b.slug})`));

  } catch (e) {
    console.error('Error connecting to database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
