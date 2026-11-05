const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('[export-catalog-snapshot] Fetching live database snapshot from Supabase...');
  
  const [products, rawCategories, rawBrands] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        brand: true,
        specifications: { orderBy: { sortOrder: 'asc' } },
        variants: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' }
    })
  ]);

  const totalInStore = products.length;

  // Format products for serializing Decimals to numbers
  const formattedProducts = products.map(p => ({
    ...p,
    sellingPrice: Number(p.sellingPrice),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    costPrice: p.costPrice ? Number(p.costPrice) : null,
  }));

  const snapshot = {
    generatedAt: new Date().toISOString(),
    totalInStore,
    categories: rawCategories,
    brands: rawBrands,
    products: formattedProducts
  };

  const outDir = path.join(__dirname, '..', 'lib', 'db');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'catalog-snapshot.json');
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf8');

  console.log(`[export-catalog-snapshot] Successfully saved ${formattedProducts.length} products, ${rawCategories.length} categories, and ${rawBrands.length} brands to ${outPath}`);
}

main()
  .catch(err => {
    console.warn('[export-catalog-snapshot] Warning during snapshot refresh:', err.message);
    const outPath = path.join(__dirname, '..', 'lib', 'db', 'catalog-snapshot.json');
    if (fs.existsSync(outPath)) {
      console.log('[export-catalog-snapshot] Using existing catalog snapshot: ' + outPath);
      process.exit(0);
    } else {
      console.error('[export-catalog-snapshot] Fatal: No existing snapshot found.');
      process.exit(1);
    }
  })
  .finally(() => prisma.$disconnect());

