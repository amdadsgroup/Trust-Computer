const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- CATEGORIES ---');
  const categories = await prisma.category.findMany();
  console.log(categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

  console.log('\n--- BRANDS ---');
  const brands = await prisma.brand.findMany();
  console.log(brands.map(b => ({ id: b.id, name: b.name, slug: b.slug })));

  console.log('\n--- PRODUCTS COUNT ---');
  const productCount = await prisma.product.count();
  console.log('Total Products:', productCount);

  console.log('\n--- ADMIN USERS ---');
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, name: true } });
  console.log('Users:', users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
