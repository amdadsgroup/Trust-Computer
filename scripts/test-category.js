const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCategory() {
  try {
    const slug = 'desktop-components';
    console.log('Testing category include query for slug:', slug);
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            category: true,
            brand: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 60,
        },
      },
    });
    console.log('Category found:', category ? category.name : 'NULL');
    if (category) {
      console.log('Category ID:', category.id);
      console.log('Products:', category.products.length);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testCategory();
