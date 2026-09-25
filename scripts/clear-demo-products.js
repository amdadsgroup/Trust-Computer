/**
 * Clear ALL demo/seed products from the Trust Computer database.
 * Keeps: categories, brands, site settings, owner account, banners.
 * Deletes: all products, product images, product specs, inventory movements.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllProducts() {
  console.log('============================================================');
  console.log('🗑️  Trust Computer — Clearing All Demo Products');
  console.log('============================================================');

  try {
    // Count before deletion
    const beforeCount = await prisma.product.count();
    console.log(`\nFound ${beforeCount} products in database.`);

    if (beforeCount === 0) {
      console.log('No products found. Database is already clean!');
      return;
    }

    // Step 1: Delete all product specifications
    console.log('\n1. Deleting product specifications...');
    const specsDeleted = await prisma.productSpecification.deleteMany({});
    console.log(`   ✓ Deleted ${specsDeleted.count} product specifications.`);

    // Step 2: Delete all product images
    console.log('2. Deleting product images...');
    const imagesDeleted = await prisma.productImage.deleteMany({});
    console.log(`   ✓ Deleted ${imagesDeleted.count} product images.`);

    // Step 3: Delete all inventory movements
    console.log('3. Deleting inventory movement records...');
    const movementsDeleted = await prisma.inventoryMovement.deleteMany({});
    console.log(`   ✓ Deleted ${movementsDeleted.count} inventory movements.`);

    // Step 4: Delete cart items referencing products
    console.log('4. Deleting cart items...');
    const cartItemsDeleted = await prisma.cartItem.deleteMany({});
    console.log(`   ✓ Deleted ${cartItemsDeleted.count} cart items.`);

    // Step 5: Delete order items referencing products (keep orders themselves)
    console.log('5. Deleting order items...');
    const orderItemsDeleted = await prisma.orderItem.deleteMany({});
    console.log(`   ✓ Deleted ${orderItemsDeleted.count} order items.`);

    // Step 6: Delete product reviews
    console.log('6. Deleting product reviews...');
    const reviewsDeleted = await prisma.productReview.deleteMany({});
    console.log(`   ✓ Deleted ${reviewsDeleted.count} product reviews.`);

    // Step 7: Delete wishlist items
    console.log('7. Deleting wishlist items...');
    try {
      const wishlistDeleted = await prisma.wishlistItem.deleteMany({});
      console.log(`   ✓ Deleted ${wishlistDeleted.count} wishlist items.`);
    } catch(e) {
      console.log('   ℹ Wishlist table not found, skipping.');
    }

    // Step 8: Delete stock reservations
    console.log('8. Deleting stock reservations...');
    try {
      const reservationsDeleted = await prisma.stockReservation.deleteMany({});
      console.log(`   ✓ Deleted ${reservationsDeleted.count} stock reservations.`);
    } catch(e) {
      console.log('   ℹ Stock reservation table not found, skipping.');
    }

    // Step 9: Delete all products
    console.log('9. Deleting all products...');
    const productsDeleted = await prisma.product.deleteMany({});
    console.log(`   ✓ Deleted ${productsDeleted.count} products.`);

    // Verify
    const afterCount = await prisma.product.count();
    console.log('\n============================================================');
    console.log(`✅ Done! Products before: ${beforeCount} → After: ${afterCount}`);
    console.log('   Categories, brands, banners, and settings are preserved.');
    console.log('   The website will show empty product lists until you add');
    console.log('   real products via the admin panel.');
    console.log('============================================================');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllProducts();
