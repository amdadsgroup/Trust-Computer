const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const lockFile = path.join(__dirname, '..', '.worker-building.lock');

if (process.env.BUILDING_NEXT || fs.existsSync(lockFile)) {
  console.log('[build-dispatcher] Inner build: generating Prisma & building Next.js application...');
  execSync('npx prisma generate && node scripts/export-catalog-snapshot.js && npx next build', {
    stdio: 'inherit',
    env: process.env
  });
} else {
  console.log('[build-dispatcher] Full Cloudflare build: running worker build pipeline...');
  try {
    fs.writeFileSync(lockFile, '1', 'utf8');
    execSync('npm run build:worker', {
      stdio: 'inherit',
      env: { ...process.env, BUILDING_NEXT: '1' }
    });
  } finally {
    try {
      if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
    } catch {}
  }
}
