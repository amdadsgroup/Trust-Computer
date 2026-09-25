/**
 * Clear ALL demo/seed products from the Trust Computer database.
 * Keeps: categories, brands, site settings, owner account, banners.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllProducts() {
  console.log('============================================================');
  console.log('🗑️  Trust Computer — Clearing All Demo Products');
  console.log('============================================================');

  try {
    const beforeCount = await prisma.product.count();
    console.log(`\nFound ${beforeCount} products in database.`);

    if (beforeCount === 0) {
      console.log('✅ No products found. Database is already clean!');
      return;
    }

    // Delete in dependency order (children first)
    const steps = [
      { name: 'stock reservations',      fn: () => prisma.stockReservation.deleteMany({}) },
      { name: 'coupon usages',           fn: () => prisma.couponUsage.deleteMany({}) },
      { name: 'wishlist items',          fn: () => prisma.wishlistItem.deleteMany({}) },
      { name: 'wishlists',              fn: () => prisma.wishlist.deleteMany({}) },
      { name: 'review images',          fn: () => prisma.reviewImage.deleteMany({}) },
      { name: 'reviews',               fn: () => prisma.review.deleteMany({}) },
      { name: 'order items',           fn: () => prisma.orderItem.deleteMany({}) },
      { name: 'product variants',      fn: () => prisma.productVariant.deleteMany({}) },
      { name: 'product specifications', fn: () => prisma.productSpecification.deleteMany({}) },
      { name: 'product images',        fn: () => prisma.productImage.deleteMany({}) },
      { name: 'inventory movements',   fn: () => prisma.inventoryMovement.deleteMany({}) },
      { name: 'products',             fn: () => prisma.product.deleteMany({}) },
    ];

    for (const step of steps) {
      process.stdout.write(`  Deleting ${step.name}... `);
      const result = await step.fn();
      console.log(`✓ ${result.count} deleted`);
    }

    const afterCount = await prisma.product.count();
    console.log('\n============================================================');
    console.log(`✅ Done! Products before: ${beforeCount} → After: ${afterCount}`);
    console.log('   Categories, brands, banners & settings preserved.');
    console.log('   Add real products via: /admin/products/new');
    console.log('============================================================');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllProducts();
