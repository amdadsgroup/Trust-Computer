import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getContentPage, DEFAULT_POLICY_PAGES } from '@/lib/content';
import { brand } from '@/lib/brand';

describe('Trust Computer - Policies, Content Management & Admin Routes', () => {
  it('should define all 5 essential policy pages in DEFAULT_POLICY_PAGES', () => {
    const requiredSlugs = ['delivery', 'returns', 'warranty', 'privacy', 'terms'];
    for (const slug of requiredSlugs) {
      expect(DEFAULT_POLICY_PAGES[slug], `Missing policy: ${slug}`).toBeDefined();
      expect(DEFAULT_POLICY_PAGES[slug].title).toBeTruthy();
      expect(DEFAULT_POLICY_PAGES[slug].content).toBeTruthy();
    }
  });

  it('should mark unfinalized legal policies as draft to prevent fake commitments', () => {
    // Return & refund, privacy, terms, and warranty should have draft flags until client legal review
    expect(DEFAULT_POLICY_PAGES.returns.isDraft).toBe(true);
    expect(DEFAULT_POLICY_PAGES.privacy.isDraft).toBe(true);
    expect(DEFAULT_POLICY_PAGES.terms.isDraft).toBe(true);
    expect(DEFAULT_POLICY_PAGES.warranty.isDraft).toBe(true);

    // Delivery policy reflects verified physical store location & delivery fees
    expect(DEFAULT_POLICY_PAGES.delivery.content).toContain('মৌলভীবাজার');
    expect(DEFAULT_POLICY_PAGES.delivery.content).toContain('৬০');
    expect(DEFAULT_POLICY_PAGES.delivery.content).toContain('১২০');
  });

  it('should verify physical pages exist for all 5 customer-facing policies', () => {
    const policiesDir = path.join(process.cwd(), 'app', '(store)', 'policies');
    const requiredPolicies = ['delivery', 'returns', 'warranty', 'privacy', 'terms'];

    for (const policy of requiredPolicies) {
      const pageFile = path.join(policiesDir, policy, 'page.tsx');
      expect(fs.existsSync(pageFile), `Missing policy page: ${policy}`).toBe(true);
      const content = fs.readFileSync(pageFile, 'utf-8');
      expect(content).toContain(`getContentPage('${policy}')`);
    }
  });

  it('should verify all suggested admin dashboard routes exist', () => {
    const adminDir = path.join(process.cwd(), 'app', 'admin', '(dashboard)');
    const expectedRoutes = [
      'page.tsx', // /admin
      'products', // /admin/products
      'categories', // /admin/categories
      'brands', // /admin/brands
      'orders', // /admin/orders
      'inventory', // /admin/inventory
      'customers', // /admin/customers
      'payments', // /admin/payments
      'reports', // /admin/reports
      'banners', // /admin/banners
      'content', // /admin/content
      'users', // /admin/users
      'audit-logs', // /admin/audit-logs
      'settings', // /admin/settings
    ];

    for (const route of expectedRoutes) {
      const routePath = path.join(adminDir, route);
      expect(fs.existsSync(routePath), `Missing admin route: ${route}`).toBe(true);
    }
  });

  it('should verify layout navigation contains links to all new administrative modules', () => {
    const layoutPath = path.join(process.cwd(), 'app', 'admin', '(dashboard)', 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

    expect(layoutContent).toContain('/admin/brands');
    expect(layoutContent).toContain('/admin/content');
    expect(layoutContent).toContain('/admin/users');
    expect(layoutContent).toContain('/admin/audit-logs');
  });

  it('should verify footer contains Software Developed BY Amdads Group and verified policies', () => {
    const footerPath = path.join(process.cwd(), 'components', 'layout', 'Footer.tsx');
    const footerContent = fs.readFileSync(footerPath, 'utf-8');

    expect(footerContent).toContain('Software Developed BY Amdads Group');
    expect(footerContent).toContain('/policies/returns');
    expect(footerContent).toContain('/policies/delivery');
    expect(footerContent).toContain('/policies/warranty');
    expect(footerContent).toContain('/policies/privacy');
    expect(footerContent).toContain('/policies/terms');
  });

  it('should verify about page contains Shiblu Ahmed and Amdads Group attribution', () => {
    const aboutClientPath = path.join(process.cwd(), 'components', 'about', 'AboutPageClient.tsx');
    const aboutContent = fs.readFileSync(aboutClientPath, 'utf-8');

    expect(aboutContent).toContain('Shiblu Ahmed');
    expect(aboutContent).toContain('Amdads Group');
    expect(aboutContent).toContain('T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar');
    expect(aboutContent).toContain('01753-765372');
  });
});
