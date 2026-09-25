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

async function main() {
  const banners = await prisma.banner.findMany({
    orderBy: { priority: 'desc' },
  });
  console.log('Current DB Banners count:', banners.length);
  console.log(JSON.stringify(banners, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
