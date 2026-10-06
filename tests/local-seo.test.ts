import { describe, it, expect } from 'vitest';
import { business } from '@/lib/business';
import {
  getLocalBusinessSchema,
  getOrganizationSchema,
  getWebSiteSchema,
  getBreadcrumbSchema,
  getFAQSchema,
} from '@/lib/seo';
import fs from 'fs';
import path from 'path';

describe('Trust Computer - Moulvibazar Local SEO Module', () => {
  describe('1. NAP & Business Identity Consistency', () => {
    it('should have exact official business name and address in Kusumbagh Moulvibazar', () => {
      expect(business.officialFullName).toBe('Trust Computer-Moulvibazar');
      expect(business.address).toContain('T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar');
      expect(business.city).toBe('Moulvibazar');
      expect(business.postalCode).toBe('3200');
      expect(business.country).toBe('Bangladesh');
    });

    it('should have official sales, service, and email contacts', () => {
      expect(business.sales.phone).toBe('01797854836');
      expect(business.service.phone).toBe('01608346407');
      expect(business.email).toBe('trustcomputermb@gmail.com');
      expect(business.productionUrl).toBe('https://trustcomputermb.com');
    });

    it('should have valid real geographic coordinates for Kusumbagh, Moulvibazar', () => {
      expect(business.geo.latitude).toBeCloseTo(24.4829, 2);
      expect(business.geo.longitude).toBeCloseTo(91.7649, 2);
      expect(business.googleMapsUrl).toContain('maps/search');
      expect(business.googleMapsEmbedUrl).toContain('output=embed');
    });
  });

  describe('2. Schema.org LocalBusiness Structured Data', () => {
    it('should generate valid LocalBusiness / ComputerStore schema', () => {
      const schema = getLocalBusinessSchema();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('ComputerStore');
      expect(schema['@id']).toBe('https://trustcomputermb.com/#store');
      expect(schema.name).toBe('Trust Computer-Moulvibazar');
      expect(schema.telephone).toBe(business.sales.phoneIntl);
      expect(schema.email).toBe('trustcomputermb@gmail.com');
      expect(schema.address['@type']).toBe('PostalAddress');
      expect(schema.address.streetAddress).toBe('T.S Plaza (2nd Floor), Kusumbagh');
      expect(schema.address.addressLocality).toBe('Moulvibazar');
      expect(schema.address.postalCode).toBe('3200');
      expect(schema.address.addressCountry).toBe('BD');
      expect(schema.geo['@type']).toBe('GeoCoordinates');
      expect(schema.geo.latitude).toBe(24.4829);
      expect(schema.geo.longitude).toBe(91.7649);
      expect(schema.openingHoursSpecification).toBeDefined();
      expect(schema.openingHoursSpecification[0].opens).toBe('10:00');
      expect(schema.openingHoursSpecification[0].closes).toBe('21:00');
    });

    it('should NOT contain personal names or fake branches in LocalBusiness schema', () => {
      const schemaString = JSON.stringify(getLocalBusinessSchema());
      // Prompt specifically mandated: "Do NOT add the owner's personal name"
      expect(schemaString).not.toContain('Shiblu');
      expect(schemaString).not.toContain('Ahmed');
      // No fake branches
      expect(schemaString).not.toContain('Branch 2');
      expect(schemaString).not.toContain('Dhaka Branch');
    });

    it('should generate valid Organization, WebSite, and FAQ schemas', () => {
      const org = getOrganizationSchema();
      expect(org['@type']).toBe('Organization');
      expect(org.contactPoint.length).toBeGreaterThanOrEqual(2);

      const website = getWebSiteSchema();
      expect(website['@type']).toBe('WebSite');
      expect(website.potentialAction['@type']).toBe('SearchAction');

      const faq = getFAQSchema([
        { question: 'Where is Trust Computer?', answer: 'T.S Plaza, Kusumbagh, Moulvibazar' },
      ]);
      expect(faq['@type']).toBe('FAQPage');
      expect(faq.mainEntity.length).toBe(1);
    });
  });

  describe('3. Moulvibazar Local Landing Page (/moulvibazar)', () => {
    it('should have the /moulvibazar page file created and properly structured', () => {
      const pagePath = path.join(process.cwd(), 'app', '(store)', 'moulvibazar', 'page.tsx');
      expect(fs.existsSync(pagePath)).toBe(true);

      const content = fs.readFileSync(pagePath, 'utf-8');
      // SEO Title & H1
      expect(content).toContain('Computer Shop in Moulvibazar');
      // Real Location
      expect(content).toContain('T.S Plaza');
      expect(content).toContain('Kusumbagh');
      // Hotlines
      expect(content).toContain('01797854836');
      expect(content).toContain('01608346407');
      // Structured Data
      expect(content).toContain('JsonLd');
      expect(content).toContain('getLocalBusinessSchema');
      expect(content).toContain('getFAQSchema');
      // Products & Services
      expect(content).toContain('Laptops & Notebooks');
      expect(content).toContain('Desktop Computers');
      expect(content).toContain('CCTV Camera');
      expect(content).toContain('Networking & Wi-Fi Routers');
    });
  });

  describe('4. Product & Category Local SEO', () => {
    it('should verify category page generates Moulvibazar specific SEO titles', async () => {
      const categoryPagePath = path.join(process.cwd(), 'app', '(store)', 'categories', '[slug]', 'page.tsx');
      const content = fs.readFileSync(categoryPagePath, 'utf-8');
      expect(content).toContain('Laptop Price in Moulvibazar');
      expect(content).toContain('CCTV Camera Price in Moulvibazar');
      expect(content).toContain('Computer Accessories in Moulvibazar');
      expect(content).toContain('Monitor Price in Moulvibazar');
      expect(content).toContain('Router & Networking Price in Moulvibazar');
    });

    it('should verify product page mentions Moulvibazar local showroom availability', () => {
      const productPagePath = path.join(process.cwd(), 'app', '(store)', 'products', '[slug]', 'page.tsx');
      const content = fs.readFileSync(productPagePath, 'utf-8');
      expect(content).toContain('Price in Moulvibazar | Trust Computer');
      expect(content).toContain('Moulvibazar Showroom Availability');
      expect(content).toContain('Kusumbagh');
      expect(content).toContain('01797854836');
    });
  });

  describe('5. Sitemap & Robots Indexing Readiness', () => {
    it('should include /moulvibazar in sitemap.xml', async () => {
      const sitemapPath = path.join(process.cwd(), 'app', 'sitemap.ts');
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content).toContain('/moulvibazar');
      expect(content).toContain('/services');
    });

    it('should verify robots.txt allows /moulvibazar', () => {
      const robotsPath = path.join(process.cwd(), 'app', 'robots.ts');
      const content = fs.readFileSync(robotsPath, 'utf-8');
      expect(content).toContain("allow: '/'");
      expect(content).toContain('sitemap.xml');
    });
  });

  describe('6. Sitewide Internal Linking to /moulvibazar', () => {
    it('should link to /moulvibazar in Header and Footer', () => {
      const headerPath = path.join(process.cwd(), 'components', 'layout', 'Header.tsx');
      const footerPath = path.join(process.cwd(), 'components', 'layout', 'Footer.tsx');

      const headerContent = fs.readFileSync(headerPath, 'utf-8');
      const footerContent = fs.readFileSync(footerPath, 'utf-8');

      expect(headerContent).toContain('href="/moulvibazar"');
      expect(footerContent).toContain('href="/moulvibazar"');
    });
  });
});
