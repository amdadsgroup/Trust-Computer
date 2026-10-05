import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { brand } from '@/lib/brand';

describe('Trust Computer - Official Brand Identity & Color Management', () => {
  it('should have exact authoritative extracted colors', () => {
    // Extracted directly from uploaded primary brand asset
    expect(brand.colors.primaryBlue.toUpperCase()).toBe('#2A3B97');
    expect(brand.colors.primaryRed.toUpperCase()).toBe('#E91D26');
    expect(brand.colors.white.toUpperCase()).toBe('#FFFFFF');
    expect(brand.colors.primaryBlueRgb).toBe('rgb(42, 59, 151)');
    expect(brand.colors.primaryRedRgb).toBe('rgb(233, 29, 38)');
  });

  it('should contain all required official brand files in public/brand', () => {
    const brandDir = path.join(process.cwd(), 'public', 'brand');
    expect(fs.existsSync(brandDir)).toBe(true);

    const requiredFiles = [
      'trust-computer-logo.png',
      'trust-computer-logo-mark.png',
      'trust-computer-logo-dark.png',
      'trust-computer-logo-original.jpg',
      'favicon.png',
      'favicon-48.png',
      'apple-touch-icon.png',
      'icon-192.png',
      'icon-512.png',
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(brandDir, file);
      expect(fs.existsSync(filePath), `Missing asset: ${file}`).toBe(true);
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(500);
    }
  });

  it('should have official BRAND_GUIDELINES.md documentation', () => {
    const guidelinesPath = path.join(process.cwd(), 'BRAND_GUIDELINES.md');
    expect(fs.existsSync(guidelinesPath)).toBe(true);

    const content = fs.readFileSync(guidelinesPath, 'utf-8');
    expect(content).toContain('#2A3B97');
    expect(content).toContain('#E91D26');
    expect(content).toContain('Trust Computer-Moulvibazar');
    expect(content).toContain('trust-computer-logo.png');
    expect(content).toContain('trust-computer-logo-mark.png');
  });

  it('should configure CSS variables and Tailwind tokens for brand identity', () => {
    const globalsCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf-8');
    expect(globalsCss).toContain('--brand-blue: #2A3B97');
    expect(globalsCss).toContain('--brand-red: #E91D26');

    const tailwindConfig = fs.readFileSync(path.join(process.cwd(), 'tailwind.config.ts'), 'utf-8');
    expect(tailwindConfig).toContain('#2A3B97');
    expect(tailwindConfig).toContain('#E91D26');
  });

  it('should have admin branding management at /admin/settings/branding', () => {
    const brandingPage = path.join(process.cwd(), 'app', 'admin', '(dashboard)', 'settings', 'branding', 'page.tsx');
    expect(fs.existsSync(brandingPage)).toBe(true);

    const content = fs.readFileSync(brandingPage, 'utf-8');
    expect(content).toContain('brand.assets.logo');
    expect(content).toContain('brand.colors.primaryBlue');
    expect(content).toContain('OWNER');
  });

  it('should verify client owner Shiblu Ahmed and developer Amdads Group attribution', () => {
    expect(brand.owner).toBe('Shiblu Ahmed');
    expect(brand.developer).toBe('Amdads Group');
    expect(brand.developerStatement).toBe('Software Developed BY Amdads Group');
    expect(brand.officialFullName).toBe('Trust Computer-Moulvibazar');
    expect(brand.address).toContain('T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar');
    expect(brand.phone).toBe('01797854836');
    expect(brand.servicePhone).toBe('01608346407');
    expect(brand.bkashNumber).toBe('01712556225');
    expect(brand.email).toBe('trustcomputermb@gmail.com');
  });

  it('should verify official tagline "- Your Trust, Our Technology -" in brand config and guidelines', () => {
    expect(brand.tagline).toBe('- Your Trust, Our Technology -');
    expect(brand.taglineBn).toBe('- আপনার আস্থা, আমাদের প্রযুক্তি -');
    expect(brand.taglineText).toBe('Your Trust, Our Technology');
    expect(brand.taglineTextBn).toBe('আপনার আস্থা, আমাদের প্রযুক্তি');

    // formatTagline normalization checks
    expect(brand.formatTagline('Your Trust, Our Technology')).toBe('- Your Trust, Our Technology -');
    expect(brand.formatTagline('-- Your Trust, Our Technology --')).toBe('- Your Trust, Our Technology -');
    expect(brand.formatTagline('--- Your Trust, Our Technology ---')).toBe('- Your Trust, Our Technology -');
    expect(brand.formatTagline('- Your Trust, Our Technology -')).toBe('- Your Trust, Our Technology -');
    expect(brand.formatTagline('“Your Trust, Our Technology”')).toBe('- Your Trust, Our Technology -');

    const guidelinesPath = path.join(process.cwd(), 'BRAND_GUIDELINES.md');
    const content = fs.readFileSync(guidelinesPath, 'utf-8');
    expect(content).toContain('Your Trust, Our Technology');
  });

  it('should display brand tagline in topbar for both mobile and desktop views', () => {
    const headerPath = path.join(process.cwd(), 'components', 'layout', 'Header.tsx');
    const content = fs.readFileSync(headerPath, 'utf-8');
    expect(content).toContain("t('brand.tagline', '- Your Trust, Our Technology -')");
    // Ensure tagline is not hidden on mobile screens
    expect(content).not.toContain('hidden xl:flex flex-col border-l border-slate-700/80 pl-3 justify-center');
    expect(content).toContain('flex flex-col border-l border-slate-700/80');
  });

  it('should verify system-wide standardized tagline format with exactly ONE hyphen on each side', () => {
    // 1. Translations dictionary
    const translationsPath = path.join(process.cwd(), 'lib', 'i18n', 'translations.ts');
    const translationsContent = fs.readFileSync(translationsPath, 'utf-8');
    expect(translationsContent).toContain("en: '- Your Trust, Our Technology -'");
    expect(translationsContent).toContain("bn: '- আপনার আস্থা, আমাদের প্রযুক্তি -'");

    // 2. Components check
    const componentsToCheck = [
      path.join(process.cwd(), 'components', 'layout', 'Header.tsx'),
      path.join(process.cwd(), 'components', 'layout', 'Footer.tsx'),
      path.join(process.cwd(), 'components', 'home', 'ShowroomInfoSection.tsx'),
      path.join(process.cwd(), 'components', 'cart', 'CartDrawer.tsx'),
      path.join(process.cwd(), 'components', 'about', 'AboutPageClient.tsx'),
      path.join(process.cwd(), 'components', 'contact', 'ContactPageClient.tsx'),
      path.join(process.cwd(), 'app', '(store)', 'checkout', 'page.tsx'),
      path.join(process.cwd(), 'app', '(store)', 'order-confirmation', '[orderNumber]', 'page.tsx'),
      path.join(process.cwd(), 'app', '(store)', 'track-order', 'page.tsx'),
      path.join(process.cwd(), 'app', '(store)', 'login', 'page.tsx'),
      path.join(process.cwd(), 'app', '(store)', 'register', 'page.tsx'),
      path.join(process.cwd(), 'app', '(store)', 'forgot-password', 'page.tsx'),
      path.join(process.cwd(), 'app', '(store)', 'reset-password', 'page.tsx'),
      path.join(process.cwd(), 'app', 'admin', 'login', 'page.tsx'),
      path.join(process.cwd(), 'app', 'not-found.tsx'),
      path.join(process.cwd(), 'lib', 'email', 'index.ts'),
    ];

    for (const file of componentsToCheck) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).toContain('- Your Trust, Our Technology -');
      expect(content).not.toContain('-- Your Trust, Our Technology --');
      expect(content).not.toContain('--- Your Trust, Our Technology ---');
      expect(content).not.toContain('“Your Trust, Our Technology”');
    }
  });
});
