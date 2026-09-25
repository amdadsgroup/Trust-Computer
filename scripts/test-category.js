const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCategory() {
  try {
    const slug = 'desktop-components';
    console.log('Finding category with slug:', slug);
    const category = await prisma.category.findUnique({
      where: { slug },
    });
    console.log('Category found:', category);

    if (!category) {
      console.log('Category not found!');
      return;
    }

    const where = {
      categoryId: category.id,
      isActive: true,
    };

    console.log('Running Promise.all queries...');
    const [products, totalCount, categoryBrands] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          category: true,
          brand: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
      prisma.brand.findMany({
        where: {
          products: {
            some: {
              categoryId: category.id,
              isActive: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    console.log('Success! Products:', products.length, 'Total:', totalCount, 'Brands:', categoryBrands.length);
  } catch (err) {
    console.error('Error in category query:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testCategory();
