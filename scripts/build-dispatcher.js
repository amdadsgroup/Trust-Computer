const { execSync } = require('child_process');

if (process.env.BUILDING_NEXT) {
  console.log('[build-dispatcher] Inner build: generating Prisma & building Next.js application...');
  execSync('npx prisma generate && node scripts/export-catalog-snapshot.js && npx next build', {
    stdio: 'inherit',
    env: process.env
  });
} else {
  console.log('[build-dispatcher] Full Cloudflare build: running worker build pipeline...');
  execSync('npm run build:worker', {
    stdio: 'inherit',
    env: { ...process.env, BUILDING_NEXT: '1' }
  });
}

