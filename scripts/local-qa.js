// scripts/local-qa.js
// Automated End-to-End QA Test Suite against local running production server

const BASE_URL = 'http://localhost:3000';

const routesToTest = [
  { path: '/', name: 'Homepage' },
  { path: '/products', name: 'Products Catalog' },
  { path: '/products?search=cctv', name: 'Search: CCTV' },
  { path: '/products?category=cctv-security', name: 'Category Filter: CCTV' },
  { path: '/products?sort=price_asc', name: 'Sort: Price Ascending' },
  { path: '/categories/laptop-computer', name: 'Category: Laptop & Computer' },
  { path: '/categories/cctv-security', name: 'Category: CCTV & Security' },
  { path: '/categories/monitor', name: 'Category: Monitor' },
  { path: '/cart', name: 'Shopping Cart Page' },
  { path: '/checkout', name: 'Checkout Page' },
  { path: '/compare', name: 'Compare Page' },
  { path: '/wishlist', name: 'Wishlist Page' },
  { path: '/about', name: 'About Page' },
  { path: '/contact', name: 'Contact Page' },
  { path: '/policies/delivery', name: 'Delivery Policy' },
  { path: '/policies/privacy', name: 'Privacy Policy' },
  { path: '/policies/returns', name: 'Returns Policy' },
  { path: '/policies/terms', name: 'Terms of Service' },
  { path: '/policies/warranty', name: 'Warranty Policy' },
  { path: '/admin/login', name: 'Admin Login' },
  { path: '/track-order', name: 'Track Order' },
  { path: '/manifest.webmanifest', name: 'PWA Webmanifest' },
  { path: '/robots.txt', name: 'Robots.txt' },
  { path: '/sitemap.xml', name: 'Sitemap.xml' }
];

async function runLocalQA() {
  console.log('============================================================');
  console.log(`RUNNING FULL END-TO-END QA ON ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  for (const r of routesToTest) {
    const start = Date.now();
    try {
      const res = await fetch(`${BASE_URL}${r.path}`, {
        headers: { 'User-Agent': 'TrustComputer-LocalQA/1.0' },
        redirect: 'manual'
      });
      const duration = Date.now() - start;
      const status = res.status;
      const isOk = status === 200 || status === 307 || status === 308 || status === 302;

      let body = '';
      if (status === 200) {
        body = await res.text();
      }

      // Compliance verification
      const ownerLeaked = body.toLowerCase().includes('shiblu ahmed');
      const pcBuilderLeaked = /href=["'][^"']*pc-builder/i.test(body);
      const hasErrorTrace = body.includes('Internal Server Error') || body.includes('Unhandled Runtime Error');

      const pass = isOk && !ownerLeaked && !pcBuilderLeaked && !hasErrorTrace;

      if (pass) {
        passed++;
        console.log(`[PASS] ${r.name.padEnd(30)} -> Status ${status} (${duration}ms) [Payload: ${(body.length / 1024).toFixed(1)} kB]`);
      } else {
        failed++;
        console.log(`[FAIL] ${r.name.padEnd(30)} -> Status ${status} (${duration}ms)`);
        if (ownerLeaked) console.log(`   [CRITICAL] Owner personal name detected!`);
        if (pcBuilderLeaked) console.log(`   [CRITICAL] PC Builder link detected!`);
        if (hasErrorTrace) console.log(`   [CRITICAL] Unhandled runtime error trace detected!`);
      }
    } catch (err) {
      failed++;
      console.log(`[FAIL] ${r.name.padEnd(30)} -> Network/Connection Error: ${err.message}`);
    }
  }

  // Test Protected Admin Routes
  console.log('\n------------------------------------------------------------');
  console.log('TESTING SECURITY & ACCESS CONTROL');
  console.log('------------------------------------------------------------');
  const protectedRoutes = ['/admin', '/admin/products', '/admin/orders', '/admin/settings'];
  for (const p of protectedRoutes) {
    const res = await fetch(`${BASE_URL}${p}`, { redirect: 'manual' });
    const isProtected = res.status === 307 || res.status === 302 || res.status === 401;
    console.log(`[${isProtected ? 'PASS' : 'FAIL'}] Protected route ${p.padEnd(20)} -> Status ${res.status} (Redirected to: ${res.headers.get('location') || 'N/A'})`);
    if (isProtected) passed++; else failed++;
  }

  console.log('\n============================================================');
  console.log('LOCAL END-TO-END QA SUMMARY');
  console.log(`Total Checks: ${passed + failed}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);
  console.log('============================================================\n');
}

runLocalQA();
