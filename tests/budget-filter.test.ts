import { describe, it, expect } from 'vitest';
import { BUDGET_PRESETS } from '../components/products/BudgetPriceFilter';

describe('Budget / Price Filter System', () => {
  it('should have all 5 defined budget presets with Bengali and English labels', () => {
    expect(BUDGET_PRESETS).toHaveLength(5);

    const ids = BUDGET_PRESETS.map((p) => p.id);
    expect(ids).toContain('under-5k');
    expect(ids).toContain('5k-15k');
    expect(ids).toContain('15k-35k');
    expect(ids).toContain('35k-60k');
    expect(ids).toContain('above-60k');

    for (const preset of BUDGET_PRESETS) {
      expect(preset.labelEn).toBeDefined();
      expect(preset.labelBn).toBeDefined();
      expect(typeof preset.min).toBe('string');
      expect(typeof preset.max).toBe('string');
    }
  });

  it('should correctly format price query constraints for Prisma', () => {
    // Helper function simulating products/page.tsx logic
    const buildPriceWhere = (minPrice?: string, maxPrice?: string) => {
      const where: any = {};
      if (minPrice || maxPrice) {
        const minVal = minPrice ? parseFloat(minPrice) : null;
        const maxVal = maxPrice ? parseFloat(maxPrice) : null;

        if ((minVal !== null && !isNaN(minVal)) || (maxVal !== null && !isNaN(maxVal))) {
          where.sellingPrice = {};
          if (minVal !== null && !isNaN(minVal) && minVal >= 0) {
            where.sellingPrice.gte = minVal;
          }
          if (maxVal !== null && !isNaN(maxVal) && maxVal >= 0) {
            where.sellingPrice.lte = maxVal;
          }
        }
      }
      return where;
    };

    // Range: 35000 to 60000
    const res1 = buildPriceWhere('35000', '60000');
    expect(res1.sellingPrice).toEqual({ gte: 35000, lte: 60000 });

    // Under 5000 (min undefined, max 5000)
    const res2 = buildPriceWhere(undefined, '5000');
    expect(res2.sellingPrice).toEqual({ lte: 5000 });

    // Above 60000 (min 60000, max undefined)
    const res3 = buildPriceWhere('60000', undefined);
    expect(res3.sellingPrice).toEqual({ gte: 60000 });

    // Non-numeric garbage input (e.g. minPrice=abc, maxPrice=xyz) should not crash
    const res4 = buildPriceWhere('abc', 'xyz');
    expect(res4.sellingPrice).toBeUndefined();
  });

  it('should preserve minPrice and maxPrice when modifying other query parameters', () => {
    const buildFilterUrl = (
      sp: Record<string, string | undefined>,
      key: string,
      value: string | null
    ) => {
      const params = new URLSearchParams();
      if (sp.search) params.set('search', sp.search);
      if (sp.category) params.set('category', sp.category);
      if (sp.brand) params.set('brand', sp.brand);
      if (sp.sort) params.set('sort', sp.sort);
      if (sp.inStockOnly) params.set('inStockOnly', sp.inStockOnly);
      if (sp.minPrice) params.set('minPrice', sp.minPrice);
      if (sp.maxPrice) params.set('maxPrice', sp.maxPrice);

      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete('page');

      return `/products?${params.toString()}`;
    };

    const sp = {
      category: 'laptop-computer',
      minPrice: '35000',
      maxPrice: '60000',
    };

    // Changing category should keep budget
    const url1 = buildFilterUrl(sp, 'brand', 'hp');
    expect(url1).toContain('minPrice=35000');
    expect(url1).toContain('maxPrice=60000');
    expect(url1).toContain('category=laptop-computer');
    expect(url1).toContain('brand=hp');

    // Clearing category should keep budget
    const url2 = buildFilterUrl(sp, 'category', null);
    expect(url2).not.toContain('category=');
    expect(url2).toContain('minPrice=35000');
    expect(url2).toContain('maxPrice=60000');
  });
});
