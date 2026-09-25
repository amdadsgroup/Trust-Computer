const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length > 0) {
    const key = k.trim();
    let val = v.join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bannersToUpsert = [
  {
    id: 'banner-tech-deals',
    title: 'PREMIUM LAPTOPS & WORKSTATIONS',
    subtitle: 'Official warranty, Intel Core & AMD Ryzen laptops, mechanical keyboards & accessories',
    desktopImageUrl: '/images/hero-banner-1.jpg',
    mobileImageUrl: '/images/hero-banner-1.jpg',
    buttonText: 'Shop Tech Deals',
    buttonUrl: '/products?offer=true',
    type: 'PROMOTIONAL',
    priority: 10,
    isActive: true,
  },
  {
    id: 'banner-pc-cctv',
    title: 'CCTV & SECURITY SURVEILLANCE SOLUTIONS',
    subtitle: '4K IP & ColorVu cameras, NVR monitoring systems & professional installation in Moulvibazar',
    desktopImageUrl: '/images/hero-banner-2.jpg',
    mobileImageUrl: '/images/hero-banner-2.jpg',
    buttonText: 'Explore CCTV & Security',
    buttonUrl: '/categories/cctv-surveillance',
    type: 'PROMOTIONAL',
    priority: 8,
    isActive: true,
  },
  {
    id: 'banner-customer-support',
    title: 'CUSTOMER CARE & WARRANTY SUPPORT',
    subtitle: 'Expert technical assistance, genuine warranty & trusted after-sales service',
    desktopImageUrl: '/images/side-banner-feedback.jpg',
    mobileImageUrl: '/images/side-banner-feedback.jpg',
    buttonText: 'Contact Support',
    buttonUrl: '/contact',
    type: 'PROMOTIONAL',
    priority: 6,
    isActive: true,
  },
  {
    id: 'banner-custom-setup',
    title: 'CUSTOM PC BUILDING & WORKSTATIONS',
    subtitle: 'Precision hardware assembly, liquid cooling & high-performance rigs',
    desktopImageUrl: '/images/side-banner-service.jpg',
    mobileImageUrl: '/images/side-banner-service.jpg',
    buttonText: 'Get Custom Build',
    buttonUrl: '/categories/cctv-surveillance',
    type: 'PROMOTIONAL',
    priority: 4,
    isActive: true,
  },
];

async function main() {
  const allowedIds = bannersToUpsert.map(b => b.id);
  // Remove any legacy banners not in allowed list
  await prisma.banner.deleteMany({
    where: {
      id: { notIn: allowedIds }
    }
  });

  for (const b of bannersToUpsert) {
    await prisma.banner.upsert({
      where: { id: b.id },
      create: b,
      update: b,
    });
    console.log(`Synced banner: ${b.title}`);
  }

  const all = await prisma.banner.findMany({ orderBy: { priority: 'desc' } });
  console.log('Total clean DB banners:', all.length);
  all.forEach(b => console.log(`- [${b.priority}] ${b.title} -> ${b.desktopImageUrl}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
