import { describe, it, expect } from 'vitest';
import manifest from '@/app/manifest';

describe('Mobile App-Like Experience & PWA Configuration', () => {
  it('should generate a valid PWA manifest with standalone display and brand colors', () => {
    const pwaManifest = manifest();
    expect(pwaManifest.name).toBe('Trust Computer-Moulvibazar');
    expect(pwaManifest.short_name).toBe('Trust Computer');
    expect(pwaManifest.display).toBe('standalone');
    expect(['#2A3B97', '#081621']).toContain(pwaManifest.theme_color);
    expect(['#FFFFFF', '#ffffff', '#f2f4f8']).toContain(pwaManifest.background_color);
    expect(pwaManifest.icons).toBeDefined();
    expect(pwaManifest.icons?.length).toBeGreaterThan(0);
    expect(pwaManifest.start_url).toBe('/');
  });

  it('should define safe area and touch utilities for smartphones in styles', () => {
    const fs = require('fs');
    const globalsCss = fs.readFileSync('app/globals.css', 'utf-8');
    expect(globalsCss).toContain('env(safe-area-inset-bottom');
    expect(globalsCss).toContain('pb-safe');
    expect(globalsCss).toContain('touch-callout-none');
    expect(globalsCss).toContain('tap-highlight-transparent');
  });

  it('should have mobile bottom navigation configured with 5 core app items', () => {
    const fs = require('fs');
    const bottomNavContent = fs.readFileSync('components/layout/BottomNav.tsx', 'utf-8');
    expect(bottomNavContent).toContain("'Home'");
    expect(bottomNavContent).toContain("'Products'");
    expect(bottomNavContent).toContain("'Search'");
    expect(bottomNavContent).toContain("'Cart'");
    expect(bottomNavContent).toContain("'Account'");
    expect(bottomNavContent).toContain('MobileSearchModal');
    expect(bottomNavContent).toContain('env(safe-area-inset-bottom');
  });

  it('should implement sticky mobile purchase bar on product details', () => {
    const fs = require('fs');
    const actionsContent = fs.readFileSync('app/(store)/products/[slug]/ProductDetailActions.tsx', 'utf-8');
    expect(actionsContent).toContain('md:hidden fixed bottom-0');
    expect(actionsContent).toContain('Buy Now');
    expect(actionsContent).toContain('env(safe-area-inset-bottom');
  });

  it('should support swipe gestures on mobile hero carousel', () => {
    const fs = require('fs');
    const heroContent = fs.readFileSync('components/home/HeroCarousel.tsx', 'utf-8');
    expect(heroContent).toContain('onTouchStart');
    expect(heroContent).toContain('onTouchMove');
    expect(heroContent).toContain('onTouchEnd');
    expect(heroContent).toContain('touch-pan-y');
  });

  it('should use 2 products per row on mobile screens in product grids', () => {
    const fs = require('fs');
    const productsPage = fs.readFileSync('app/(store)/products/page.tsx', 'utf-8');
    const homePage = fs.readFileSync('app/(store)/page.tsx', 'utf-8');
    expect(productsPage).toContain('grid-cols-2');
    expect(homePage).toContain('grid-cols-2');
  });

  it('should feature mobile filter drawer with apply and clear controls', () => {
    const fs = require('fs');
    const filterDrawer = fs.readFileSync('components/products/MobileFilterDrawer.tsx', 'utf-8');
    expect(filterDrawer).toContain('Apply Filters');
    expect(filterDrawer).toContain('Clear All');
    expect(filterDrawer).toContain('SlidersHorizontal');
    expect(filterDrawer).toContain('env(safe-area-inset-bottom');
  });
});
