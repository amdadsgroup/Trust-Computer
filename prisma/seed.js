const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('------------------------------------------------------------');
  console.log('🌱 Trust Computer-Moulvibazar — Essential Setup Sync');
  console.log('   (No demo products — add real products via admin panel)');
  console.log('------------------------------------------------------------');

  // 1. Site Settings
  console.log('1. Upserting Store Settings...');
  const siteSettings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      storeName: 'Trust Computer-Moulvibazar',
      phone: '01753-765372',
      email: 'trustcomputermb@gmail.com',
      address: 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh',
      facebookUrl: 'https://www.facebook.com/TrustComputerr/',
      whatsappNumber: '+8801753765372',
      storeDescription: 'মানসম্মত কম্পিউটার ও সিসি ক্যামেরা জগতে মৌলভীবাজারের একটি বিশ্বস্ত প্রতিষ্ঠান।❤️',
      deliveryFeeInsideMoulvibazar: 60.0,
      deliveryFeeOutsideMoulvibazar: 120.0,
      freeDeliveryThreshold: 10000.0,
      isMaintenanceMode: false,
    },
    create: {
      id: 'default',
      storeName: 'Trust Computer-Moulvibazar',
      phone: '01753-765372',
      email: 'trustcomputermb@gmail.com',
      address: 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh',
      facebookUrl: 'https://www.facebook.com/TrustComputerr/',
      whatsappNumber: '+8801753765372',
      storeDescription: 'মানসম্মত কম্পিউটার ও সিসি ক্যামেরা জগতে মৌলভীবাজারের একটি বিশ্বস্ত প্রতিষ্ঠান।❤️',
      deliveryFeeInsideMoulvibazar: 60.0,
      deliveryFeeOutsideMoulvibazar: 120.0,
      freeDeliveryThreshold: 10000.0,
      isMaintenanceMode: false,
    },
  });
  console.log('✓ Store settings saved:', siteSettings.storeName);

  // 2. Owner Account
  console.log('2. Syncing Owner Administrator Account...');
  const ownerEmail = process.env.INITIAL_OWNER_EMAIL || 'trustcomputermb@gmail.com';
  const ownerPassword = process.env.INITIAL_OWNER_PASSWORD || 'Trust@Moulvibazar2026!';
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(ownerPassword, salt);

  const ownerUser = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {
      role: 'OWNER',
      phone: '01753-765372',
      isActive: true,
    },
    create: {
      email: ownerEmail,
      passwordHash,
      name: 'Store Owner',
      phone: '01753-765372',
      role: 'OWNER',
      isActive: true,
    },
  });
  console.log(`✓ Owner account verified: ${ownerUser.email}`);

  // 3. Categories
  console.log('3. Upserting Store Categories...');
  const categoriesData = [
    {
      name: 'CCTV & Surveillance',
      slug: 'cctv-surveillance',
      description: 'High definition ColorVu CCTV cameras, DVRs, XVRs, surveillance hard drives & security accessories in Moulvibazar.',
      sortOrder: 1,
    },
    {
      name: 'Desktop & Components',
      slug: 'desktop-components',
      description: 'Processors, Motherboards, RAM, NVMe SSDs, Graphics Cards, Power Supplies and Cases for custom PC builds.',
      sortOrder: 2,
    },
    {
      name: 'Laptops & Notebooks',
      slug: 'laptops-notebooks',
      description: 'Official brand new business, student, and high performance laptops with authorized manufacturer warranties.',
      sortOrder: 3,
    },
    {
      name: 'Networking Equipment',
      slug: 'networking-equipment',
      description: 'Dual-band Wi-Fi Routers, Gigabit Network Switches, Cat6 Cables, Access Points & Fiber connectors.',
      sortOrder: 4,
    },
    {
      name: 'Computer Accessories',
      slug: 'computer-accessories',
      description: 'Ergonomic keyboards, gaming mouse, headphones, soundbars, webcams, and heavy duty computer cables.',
      sortOrder: 5,
    },
    {
      name: 'Printers & Scanners',
      slug: 'printers-scanners',
      description: 'Reliable inkjet, laser, and all-in-one multifunction business printers and barcode scanners.',
      sortOrder: 6,
    },
  ];

  const categoryMap = new Map();
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder, isActive: true },
      create: { ...cat, isActive: true },
    });
    categoryMap.set(cat.slug, upserted.id);
  }
  console.log(`✓ ${categoryMap.size} categories synced.`);

  // 4. Brands
  console.log('4. Upserting Brands...');
  const brandsData = [
    { name: 'Hikvision', slug: 'hikvision', description: 'Global leader in smart video surveillance and ColorVu security systems.' },
    { name: 'Dahua', slug: 'dahua', description: 'World-leading video-centric smart IoT solutions and WizSense AI recorders.' },
    { name: 'TP-Link', slug: 'tp-link', description: 'Reliable networking devices, gigabit routers, and smart connectivity.' },
    { name: 'Intel', slug: 'intel', description: 'World standard Core i3, i5, i7 computing processors and silicon solutions.' },
    { name: 'AMD', slug: 'amd', description: 'High performance Ryzen processors and Radeon graphics architectures.' },
    { name: 'Asus', slug: 'asus', description: 'Premium motherboards, Eye Care monitors, and gaming hardware components.' },
    { name: 'Western Digital', slug: 'western-digital', description: 'Industry leading Purple surveillance storage hard drives and WD SSDs.' },
    { name: 'Samsung', slug: 'samsung', description: 'Ultra high-speed NVMe M.2 solid state drives and computing memory.' },
    { name: 'HP', slug: 'hp', description: 'Official high-efficiency commercial and consumer laptops and computing systems.' },
    { name: 'Corsair', slug: 'corsair', description: 'High performance enthusiast Vengeance LPX DDR4/DDR5 system memory.' },
    { name: 'Fantech', slug: 'fantech', description: 'Ergonomic gaming peripherals, mechanical keyboards, and precision mice.' },
    { name: 'A4Tech', slug: 'a4tech', description: 'Durable daily office keyboards, wireless mice, and Fstyler accessories.' },
  ];

  const brandMap = new Map();
  for (const b of brandsData) {
    const upserted = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, description: b.description, isActive: true },
      create: { ...b, isActive: true },
    });
    brandMap.set(b.slug, upserted.id);
  }
  console.log(`✓ ${brandMap.size} brands synced.`);

  // NOTE: No demo products seeded intentionally.
  // Add real products via the admin panel at /admin/products/new
  console.log('5. ℹ️  Products: None seeded. Add your real products via /admin/products/new');

  // 6. Banners
  console.log('6. Upserting Store Promotion Banners...');
  const bannersData = [
    {
      title: 'TECH MEGA DEAL FEST',
      subtitle: 'Special discounts & official warranty on laptops, CCTV & computer accessories',
      desktopImageUrl: '/images/hero-banner-1.jpg',
      buttonText: 'Shop Tech Deals',
      buttonUrl: '/products?offer=true',
      type: 'PROMOTIONAL',
      priority: 10,
    },
    {
      title: 'HIGH PERFORMANCE PC & CCTV SOLUTIONS',
      subtitle: 'Trusted computer showroom & surveillance installation in Moulvibazar',
      desktopImageUrl: '/images/hero-banner-2.jpg',
      buttonText: 'Explore CCTV & PC',
      buttonUrl: '/categories/cctv-surveillance',
      type: 'PROMOTIONAL',
      priority: 5,
    },
  ];

  for (const b of bannersData) {
    const existingBanner = await prisma.banner.findFirst({ where: { title: b.title } });
    if (existingBanner) {
      await prisma.banner.update({ where: { id: existingBanner.id }, data: { ...b, isActive: true } });
    } else {
      await prisma.banner.create({ data: { ...b, isActive: true } });
    }
  }
  console.log('✓ Banners synced.');

  console.log('------------------------------------------------------------');
  console.log('✅ Trust Computer setup complete! Add products via /admin');
  console.log('------------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
