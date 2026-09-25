// scripts/production-qa.js
// Comprehensive live production test suite against https://trustcomputer.vercel.app/

const BASE_URL = 'https://trustcomputer.vercel.app';

const urlsToTest = [
  { path: '/', name: 'Homepage', expectStatus: [200] },
  { path: '/products', name: 'Products Catalog', expectStatus: [200] },
  { path: '/products?q=cctv', name: 'Search Query (cctv)', expectStatus: [200] },
  { path: '/products?category=cctv-surveillance', name: 'Category Filter', expectStatus: [200] },
  { path: '/categories/desktop-components', name: 'Category: Desktop Components', expectStatus: [200] },
  { path: '/categories/laptops-notebooks', name: 'Category: Laptops', expectStatus: [200] },
  { path: '/categories/cctv-surveillance', name: 'Category: CCTV Surveillance', expectStatus: [200] },
  { path: '/categories/networking-equipment', name: 'Category: Networking', expectStatus: [200] },
  { path: '/categories/computer-accessories', name: 'Category: Accessories', expectStatus: [200] },
  { path: '/cart', name: 'Shopping Cart', expectStatus: [200] },
  { path: '/checkout', name: 'Checkout Page', expectStatus: [200] },
  { path: '/compare', name: 'Product Comparison', expectStatus: [200] },
  { path: '/wishlist', name: 'Wishlist', expectStatus: [200] },
  { path: '/track-order', name: 'Track Order', expectStatus: [200] },
  { path: '/about', name: 'About Us', expectStatus: [200] },
  { path: '/contact', name: 'Contact Page', expectStatus: [200] },
  { path: '/policies/terms', name: 'Terms of Service', expectStatus: [200] },
  { path: '/policies/privacy', name: 'Privacy Policy', expectStatus: [200] },
  { path: '/policies/delivery', name: 'Delivery Policy', expectStatus: [200] },
  { path: '/policies/warranty', name: 'Warranty Policy', expectStatus: [200] },
  { path: '/account', name: 'Account Area (Customer)', expectStatus: [200, 307, 302] },
  { path: '/account/login', name: 'Customer Login', expectStatus: [200] },
  { path: '/account/register', name: 'Customer Register', expectStatus: [200] },
  { path: '/admin', name: 'Admin Dashboard (Unauthenticated)', expectStatus: [307, 302, 200] },
  { path: '/admin/login', name: 'Admin Login', expectStatus: [200] },
  { path: '/robots.txt', name: 'Robots.txt', expectStatus: [200] },
  { path: '/sitemap.xml', name: 'Sitemap.xml', expectStatus: [200] },
  { path: '/manifest.webmanifest', name: 'PWA Manifest', expectStatus: [200] }
];

async function testSingleUrl(item) {
  const url = `${BASE_URL}${item.path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'TrustComputer-Production-QA/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'manual'
    });
    const duration = Date.now() - start;
    const status = res.status;
    const ok = item.expectStatus.includes(status);
    const isRedirect = [301, 302, 307, 308].includes(status);
    const location = isRedirect ? res.headers.get('location') : null;

    let body = '';
    if (status === 200) {
      body = await res.text();
    }

    // Check for Owner personal name leak
    const ownerNameLeaked = body.toLowerCase().includes('shiblu ahmed');
    
    // Check for PC Builder leak in customer-facing links
    const pcBuilderLeaked = /href=["'][^"']*pc-builder/i.test(body) || /href=["'][^"']*build-pc/i.test(body);

    // Check for 500 error traces
    const hasErrorTrace = body.includes('Internal Server Error') || body.includes('Unhandled Runtime Error');

    const isPass = ok && !ownerNameLeaked && !pcBuilderLeaked && !hasErrorTrace;

    return {
      name: item.name,
      path: item.path,
      status,
      duration,
      passed: isPass,
      ownerNameLeaked,
      pcBuilderLeaked,
      hasErrorTrace,
      location,
      bodyLength: body.length
    };
  } catch (err) {
    return {
      name: item.name,
      path: item.path,
      passed: false,
      error: err.message
    };
  }
}

async function runProductionQA() {
  console.log(`============================================================`);
  console.log(`LIVE PRODUCTION QA SUITE: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`============================================================\n`);

  // Run in chunks of 5 parallel requests
  const chunkSize = 5;
  const results = [];
  for (let i = 0; i < urlsToTest.length; i += chunkSize) {
    const chunk = urlsToTest.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(testSingleUrl));
    for (const r of chunkResults) {
      results.push(r);
      if (r.passed) {
        console.log(`[PASS] ${r.name.padEnd(32)} -> ${r.status} (${r.duration}ms)${r.location ? ` -> Redirect to ${r.location}` : ''}`);
      } else {
        console.log(`[FAIL] ${r.name.padEnd(32)} -> ${r.status || 'ERROR'} (${r.duration || 0}ms)`);
        if (r.error) console.log(`   Fetch Error: ${r.error}`);
        if (r.ownerNameLeaked) console.log(`   [CRITICAL] Owner personal name detected in HTML response!`);
        if (r.pcBuilderLeaked) console.log(`   [CRITICAL] PC Builder links found in customer interface!`);
        if (r.hasErrorTrace) console.log(`   [CRITICAL] Server error / trace detected in body!`);
      }
    }
  }

  let passed = results.filter(r => r.passed).length;
  let failed = results.filter(r => !r.passed).length;

  // 2. Deep Content & Security Inspection on Homepage
  console.log(`\n------------------------------------------------------------`);
  console.log(`INSPECTING HOMEPAGE PAYLOAD & ASSETS`);
  console.log(`------------------------------------------------------------`);
  try {
    const homeRes = await fetch(`${BASE_URL}/`);
    const homeHtml = await homeRes.text();

    const titleMatch = homeHtml.match(/<title>(.*?)<\/title>/i);
    const metaDesc = homeHtml.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    const ogTitle = homeHtml.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
    const canonical = homeHtml.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
    const pwaManifest = homeHtml.match(/<link\s+rel=["']manifest["']\s+href=["'](.*?)["']/i);

    console.log(`Title:       ${titleMatch ? titleMatch[1] : 'NOT FOUND'}`);
    console.log(`Description: ${metaDesc ? metaDesc[1] : 'NOT FOUND'}`);
    console.log(`OG Title:    ${ogTitle ? ogTitle[1] : 'NOT FOUND'}`);
    console.log(`Canonical:   ${canonical ? canonical[1] : 'NOT FOUND'}`);
    console.log(`Manifest:    ${pwaManifest ? pwaManifest[1] : 'NOT FOUND'}`);

    // Check key assets
    const assetsToCheck = [
      '/brand/trust-computer-logo.png',
      '/brand/favicon.png',
      '/brand/favicon-48.png',
      '/brand/apple-touch-icon.png',
      '/manifest.webmanifest'
    ];

    console.log('\nChecking static brand assets:');
    for (const asset of assetsToCheck) {
      const aRes = await fetch(`${BASE_URL}${asset}`);
      const isOk = aRes.status === 200;
      console.log(`[${isOk ? 'PASS' : 'FAIL'}] Asset ${asset.padEnd(30)} -> Status ${aRes.status} (${aRes.headers.get('content-type')})`);
      if (isOk) passed++; else failed++;
    }

  } catch (err) {
    console.log(`Error during deep inspection: ${err.message}`);
  }

  // 3. Security Route Access Check
  console.log(`\n------------------------------------------------------------`);
  console.log(`SECURITY & ACCESS CONTROL CHECKS`);
  console.log(`------------------------------------------------------------`);
  const secChecks = [
    { path: '/admin/products', name: 'Admin Products Route (Unauth)', expectRedirect: true },
    { path: '/admin/orders', name: 'Admin Orders Route (Unauth)', expectRedirect: true },
    { path: '/admin/inventory', name: 'Admin Inventory Route (Unauth)', expectRedirect: true },
    { path: '/admin/settings', name: 'Admin Settings Route (Unauth)', expectRedirect: true },
    { path: '/account/orders', name: 'Customer Orders Route (Unauth)', expectRedirect: true }
  ];

  for (const s of secChecks) {
    const res = await fetch(`${BASE_URL}${s.path}`, { redirect: 'manual' });
    const isProtected = res.status === 307 || res.status === 302 || res.status === 401 || res.status === 403;
    const location = res.headers.get('location');
    console.log(`[${isProtected ? 'PASS' : 'FAIL'}] ${s.name} -> Status: ${res.status}${location ? ` (Redirected to: ${location})` : ''}`);
    if (isProtected) passed++; else failed++;
  }

  console.log(`\n============================================================`);
  console.log(`PRODUCTION QA SUMMARY`);
  console.log(`Total Checks: ${passed + failed}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);
  console.log(`============================================================\n`);
}

runProductionQA();
