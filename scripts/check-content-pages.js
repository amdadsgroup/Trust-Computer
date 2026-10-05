const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkContentPages() {
  try {
    const pages = await prisma.$queryRawUnsafe(`SELECT slug, title, content FROM content_pages`);
    console.log(`Found ${pages.length} content pages in DB:`);
    for (const p of pages) {
      console.log(`- ${p.slug}: ${p.title} (content length: ${p.content ? p.content.length : 0})`);
      if (p.content && p.content.includes('01753')) {
        console.log(`  WARNING: Found 01753 in page ${p.slug}!`);
      }
    }
  } catch (err) {
    console.error('Error querying content_pages:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkContentPages();
