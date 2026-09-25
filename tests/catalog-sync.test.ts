import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Trust Computer - Real Catalog Sync & Demo Removal', () => {
  it('should not contain hardcoded demo fallbackProducts in app/(store)/page.tsx', () => {
    const homePageContent = fs.readFileSync(
      path.join(process.cwd(), 'app', '(store)', 'page.tsx'),
      'utf-8'
    );
    expect(homePageContent).not.toContain('fallbackProducts');
    expect(homePageContent).not.toContain('tc-cctv-1');
    expect(homePageContent).not.toContain('/images/hero-banner-1.jpg\', altText: \'Intel Core i5');
  });

  it('should contain dedicated product visual assets in public/products', () => {
    const productsDir = path.join(process.cwd(), 'public', 'products');
    expect(fs.existsSync(productsDir)).toBe(true);

    const requiredProductAssets = [
      'hikvision-colorvu-bullet.svg',
      'hikvision-colorvu-dome.svg',
      'dahua-8ch-xvr.svg',
      'wd-purple-2tb.svg',
      'tplink-archer-c6.svg',
      'tplink-8port-switch.svg',
      'intel-i5-12400.svg',
      'asus-h610m-k.svg',
      'corsair-16gb-ram.svg',
      'samsung-980-ssd.svg',
      'hp-15s-laptop.svg',
      'asus-vp228he-monitor.svg',
      'fantech-kx302-combo.svg',
      'a4tech-fg10-mouse.svg',
    ];

    for (const asset of requiredProductAssets) {
      const assetPath = path.join(productsDir, asset);
      expect(fs.existsSync(assetPath), `Missing product visual asset: ${asset}`).toBe(true);
      const stats = fs.statSync(assetPath);
      expect(stats.size).toBeGreaterThan(100);
    }
  });

  it('should maintain comprehensive seed script with authentic settings, categories and brands', () => {
    const seedContent = fs.readFileSync(path.join(process.cwd(), 'prisma', 'seed.js'), 'utf-8');
    expect(seedContent).toContain('cctv-surveillance');
    expect(seedContent).toContain('desktop-components');
    expect(seedContent).toContain('laptops-notebooks');
    expect(seedContent).toContain('networking-equipment');
    expect(seedContent).toContain('hikvision');
    expect(seedContent).toContain('dahua');
    expect(seedContent).toContain('tp-link');
    expect(seedContent).toContain('trustcomputermb@gmail.com');
  });

  it('should have professional empty state fallback on home page', () => {
    const homePageContent = fs.readFileSync(
      path.join(process.cwd(), 'app', '(store)', 'page.tsx'),
      'utf-8'
    );
    expect(homePageContent).toContain('Showroom Inventory Syncing');
    expect(homePageContent).toContain('PackageOpen');
  });
});
