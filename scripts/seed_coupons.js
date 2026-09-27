const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const coupons = await prisma.coupon.findMany();
  console.log('Existing coupons:', coupons.length);
  if (coupons.length === 0) {
    const c1 = await prisma.coupon.create({
      data: {
        code: 'WELCOME100',
        description: '৳100 discount on any purchase above ৳1,000',
        type: 'FIXED_AMOUNT',
        value: 100,
        minimumOrderValue: 1000,
        isActive: true,
      },
    });
    console.log('Created default coupon:', c1.code);

    const c2 = await prisma.coupon.create({
      data: {
        code: 'TRUST5',
        description: '5% discount on all orders up to ৳500 max discount',
        type: 'PERCENTAGE',
        value: 5,
        maximumDiscount: 500,
        minimumOrderValue: 500,
        isActive: true,
      },
    });
    console.log('Created default coupon:', c2.code);

    const c3 = await prisma.coupon.create({
      data: {
        code: 'FREESHIP',
        description: 'Free delivery on orders above ৳2,000',
        type: 'FREE_DELIVERY',
        value: 0,
        minimumOrderValue: 2000,
        isActive: true,
      },
    });
    console.log('Created default coupon:', c3.code);
  } else {
    console.log('Available coupons:');
    coupons.forEach((c) => console.log(`- ${c.code} (${c.type}: ${c.value}, active: ${c.isActive})`));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
