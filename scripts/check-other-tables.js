const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOtherTables() {
  try {
    const customers = await prisma.customerProfile.findMany({
      where: { phone: { contains: '01753' } },
      select: { id: true, email: true, phone: true }
    });
    console.log('Customer profiles with 01753:', customers);

    const banners = await prisma.banner.findMany({ select: { id: true, title: true, subtitle: true, description: true } });
    console.log('Banners:', banners);

    const homepageSections = await prisma.homepageSection.findMany({ include: { items: true } });
    console.log('Homepage sections count:', homepageSections.length);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkOtherTables();
