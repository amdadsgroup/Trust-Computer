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

  it('should have printable invoice with official logo and company details', () => {
    const invoicePage = path.join(process.cwd(), 'app', 'admin', '(dashboard)', 'orders', '[id]', 'invoice', 'page.tsx');
    expect(fs.existsSync(invoicePage)).toBe(true);

    const content = fs.readFileSync(invoicePage, 'utf-8');
    expect(content).toContain('trust-computer-logo.png');
    expect(content).toContain('INVOICE');
    expect(content).toContain('brand.phone');
  });
});
