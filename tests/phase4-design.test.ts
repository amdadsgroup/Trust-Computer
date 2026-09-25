import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 4 — Design Polish & UI System', () => {
  it('should have standard UI component primitives in components/ui', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'components/ui/button.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'components/ui/badge.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'components/ui/card.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'components/ui/input.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'components/ui/dialog.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'components/ui/tabs.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'components/ui/toast.tsx'))).toBe(true);
  });

  it('should have cn utility in lib/utils.ts', () => {
    const utilsContent = fs.readFileSync(path.join(process.cwd(), 'lib/utils.ts'), 'utf-8');
    expect(utilsContent).toContain('export function cn(');
    expect(utilsContent).toContain('twMerge');
  });

  it('should have client-side Wishlist architecture and dedicated /wishlist route', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'components/wishlist/WishlistContext.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'app/(store)/wishlist/page.tsx'))).toBe(true);

    const wishlistCtx = fs.readFileSync(
      path.join(process.cwd(), 'components/wishlist/WishlistContext.tsx'),
      'utf-8'
    );
    expect(wishlistCtx).toContain('WishlistProvider');
    expect(wishlistCtx).toContain('useWishlist');
    expect(wishlistCtx).toContain('toggleWishlist');
  });

  it('should wrap root layout with ToastProvider and WishlistProvider', () => {
    const layoutContent = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf-8');
    expect(layoutContent).toContain('ToastProvider');
    expect(layoutContent).toContain('WishlistProvider');
    expect(layoutContent).toContain('CompareProvider');
    expect(layoutContent).toContain('themeColor: \'#2A3B97\'');
  });

  it('should integrate Wishlist and Compare into ProductCard and Header', () => {
    const cardContent = fs.readFileSync(
      path.join(process.cwd(), 'components/products/ProductCard.tsx'),
      'utf-8'
    );
    expect(cardContent).toContain('useWishlist');
    expect(cardContent).toContain('useCompare');
    expect(cardContent).toContain('handleToggleWishlist');
    expect(cardContent).toContain('handleToggleCompare');

    const headerContent = fs.readFileSync(
      path.join(process.cwd(), 'components/layout/Header.tsx'),
      'utf-8'
    );
    expect(headerContent).toContain('wishlistCount');
    expect(headerContent).toContain('compareCount');
    expect(headerContent).toContain('/wishlist');
    expect(headerContent).toContain('/compare');
  });

  it('should have dynamic brand and stock filters on category page', () => {
    const categoryContent = fs.readFileSync(
      path.join(process.cwd(), 'app/(store)/categories/[slug]/page.tsx'),
      'utf-8'
    );
    expect(categoryContent).toContain('searchParams');
    expect(categoryContent).toContain('inStockOnly');
    expect(categoryContent).toContain('categoryBrands');
    expect(categoryContent).toContain('buildFilterUrl');
  });
});
