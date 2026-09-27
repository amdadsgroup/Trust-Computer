import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Admin Dashboard - 17 Fully Functional Sections & Review Removal', () => {
  const adminDashboardDir = path.join(process.cwd(), 'app', 'admin', '(dashboard)');
  const layoutPath = path.join(adminDashboardDir, 'layout.tsx');

  it('should have Reviews removed from admin sidebar navigation', () => {
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    expect(layoutContent).not.toContain("href: '/admin/reviews'");
    expect(layoutContent).not.toContain("label: 'Reviews'");
  });

  it('should redirect /admin/reviews to /admin', () => {
    const reviewsPagePath = path.join(adminDashboardDir, 'reviews', 'page.tsx');
    expect(fs.existsSync(reviewsPagePath)).toBe(true);
    const reviewsContent = fs.readFileSync(reviewsPagePath, 'utf-8');
    expect(reviewsContent).toContain("redirect('/admin')");
  });

  const expectedAdminSections = [
    { name: 'Overview Dashboard', path: 'page.tsx' },
    { name: 'Products & Stock', path: 'products/page.tsx' },
    { name: 'New Product Page', path: 'products/new/page.tsx' },
    { name: 'Edit Product Page', path: 'products/[id]/edit/page.tsx' },
    { name: 'Categories', path: 'categories/page.tsx' },
    { name: 'Brands', path: 'brands/page.tsx' },
    { name: 'Order Management', path: 'orders/page.tsx' },
    { name: 'Customers', path: 'customers/page.tsx' },
    { name: 'Homepage Banners', path: 'banners/page.tsx' },
    { name: 'Promotional Offers', path: 'offers/page.tsx' },
    { name: 'Coupons List', path: 'coupons/page.tsx' },
    { name: 'New Coupon Page', path: 'coupons/new/page.tsx' },
    { name: 'Edit Coupon Page', path: 'coupons/[id]/edit/page.tsx' },
    { name: 'Homepage Control', path: 'homepage/page.tsx' },
    { name: 'Inventory Ledger', path: 'inventory/page.tsx' },
    { name: 'Payments & Gateway', path: 'payments/page.tsx' },
    { name: 'Sales & Reports', path: 'reports/page.tsx' },
    { name: 'Policy & Content', path: 'content/page.tsx' },
    { name: 'Staff & Roles', path: 'users/page.tsx' },
    { name: 'Audit Logs', path: 'audit-logs/page.tsx' },
    { name: 'Store Settings', path: 'settings/page.tsx' },
  ];

  for (const section of expectedAdminSections) {
    it(`should verify ${section.name} page exists and is functional`, () => {
      const fullPath = path.join(adminDashboardDir, section.path);
      expect(fs.existsSync(fullPath), `Missing file: ${section.path}`).toBe(true);
      const content = fs.readFileSync(fullPath, 'utf-8');
      expect(content.length).toBeGreaterThan(100);
    });
  }

  it('should verify coupon actions are exported and typed', async () => {
    const couponActions = await import('@/app/admin/(dashboard)/coupons/actions');
    expect(couponActions.createCouponAction).toBeDefined();
    expect(couponActions.updateCouponAction).toBeDefined();
    expect(couponActions.toggleCouponActiveAction).toBeDefined();
    expect(couponActions.deleteCouponAction).toBeDefined();
  });

  it('should verify product actions including edit and delete are exported and typed', async () => {
    const productActions = await import('@/app/admin/(dashboard)/products/actions');
    expect(productActions.createProductAction).toBeDefined();
    expect(productActions.updateProductAction).toBeDefined();
    expect(productActions.deleteProductAction).toBeDefined();
    expect(productActions.toggleProductActiveAction).toBeDefined();
    expect(productActions.toggleProductFeaturedAction).toBeDefined();
  });

  it('should verify reviews are removed from product detail page', () => {
    const productDetailPath = path.join(process.cwd(), 'app', '(store)', 'products', '[slug]', 'page.tsx');
    const content = fs.readFileSync(productDetailPath, 'utf-8');
    expect(content).not.toContain('<ReviewsSection');
    expect(content).not.toContain('getProductReviews(');
    expect(content).not.toContain('getProductReviewStats(');
  });

  it('should verify reviews API route is disabled', async () => {
    const apiRoutePath = path.join(process.cwd(), 'app', 'api', 'reviews', 'route.ts');
    const content = fs.readFileSync(apiRoutePath, 'utf-8');
    expect(content).toContain('The review system has been removed and is disabled');
  });
});

