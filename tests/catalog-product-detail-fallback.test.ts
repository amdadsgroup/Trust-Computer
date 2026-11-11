import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaEngineError = () =>
  new Error(
    'Invalid `prisma.product.findUnique()` invocation: Prisma Client could not locate the Query Engine for runtime "debian-openssl-1.1.x".'
  );

const mockPrisma = {
  product: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  category: {
    findUnique: vi.fn(),
  },
  review: {
    findMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  },
};

vi.mock('@/lib/db', () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

vi.mock('@/lib/supabase/config', () => ({
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'anon-test-key-with-sufficient-length-12345',
  isSupabaseConfigured: () => true,
}));

let mockSelectCalls: string[] = [];
let mockProductResponse: (selectStr: string) => any;
let mockRelatedResponse: () => any;

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => {
      let currentSelect = '';
      const builder: any = {
        select: (cols: string) => {
          currentSelect = cols;
          mockSelectCalls.push(`${table}:${cols}`);
          return builder;
        },
        eq: () => builder,
        neq: () => builder,
        order: () => builder,
        limit: () => {
          if (table === 'products' && mockRelatedResponse) {
            return Promise.resolve(mockRelatedResponse());
          }
          return builder;
        },
        maybeSingle: () => {
          if (table === 'products' && mockProductResponse) {
            return Promise.resolve(mockProductResponse(currentSelect));
          }
          return Promise.resolve({ data: null, error: null });
        },
      };
      return builder;
    },
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => null,
}));

describe('Catalog Product Detail Cloudflare Fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectCalls = [];
    mockPrisma.product.findUnique.mockRejectedValue(prismaEngineError());
    mockPrisma.product.findMany.mockRejectedValue(prismaEngineError());
    mockPrisma.category.findUnique.mockRejectedValue(prismaEngineError());
  });

  it('normalizes missing specifications, variants, and image order from Supabase REST', async () => {
    mockProductResponse = () => ({
      data: {
        id: '87b2a6a6-071b-4b1a-8703-28e8fd6548dd',
        name: 'Dahua HAC-T1A21P-U-IL-A is a 2MP Smart Dual Light HDCVI Eyeball Camera',
        slug: 'dahua-hac-t1a21p-u-il-a-is-a-2mp-smart-dual-light-hdcvi-eyeball-camera',
        sku: 'DH-T1A21P',
        sellingPrice: 1450,
        compareAtPrice: 1750,
        stock: 10,
        isActive: true,
        categoryId: '51fe1370-3699-4ea9-96e4-529f6d5937df',
        images: [
          { id: 'img-2', url: 'https://www.startech.com.bd/img2.webp', sortOrder: 2 },
          { id: 'img-1', url: 'https://www.startech.com.bd/img1.webp', sortOrder: 0 },
        ],
        category: { id: 'cat-1', name: 'CCTV & Security', slug: 'cctv-security' },
        brand: { id: 'brand-1', name: 'Dahua', slug: 'dahua' },
      },
      error: null,
    });

    const { getCatalogProductBySlug } = await import('@/lib/db/catalog');
    const product = await getCatalogProductBySlug(
      'dahua-hac-t1a21p-u-il-a-is-a-2mp-smart-dual-light-hdcvi-eyeball-camera'
    );

    expect(product).not.toBeNull();
    expect(product?.specifications).toEqual([]);
    expect(product?.variants).toEqual([]);
    expect(product?.images.map((i) => i.id)).toEqual(['img-1', 'img-2']);
  });

  it('retries basic Supabase select when nested specifications relation fails', async () => {
    mockProductResponse = (selectStr) => {
      if (selectStr.includes('product_specifications')) {
        return { data: null, error: { message: 'Could not find relationship product_specifications' } };
      }
      return {
        data: {
          id: 'prod-1',
          name: 'Test Product',
          slug: 'test-product',
          sku: 'TST-1',
          sellingPrice: 1000,
          stock: 5,
          isActive: true,
          images: null,
        },
        error: null,
      };
    };

    const { getCatalogProductBySlug } = await import('@/lib/db/catalog');
    const product = await getCatalogProductBySlug('test-product');

    expect(product).not.toBeNull();
    expect(product?.images).toEqual([]);
    expect(product?.specifications).toEqual([]);
    expect(product?.variants).toEqual([]);
    expect(mockSelectCalls.length).toBe(2);
  });

  it('fetches related products via Supabase REST when Prisma fails', async () => {
    mockRelatedResponse = () => ({
      data: [
        {
          id: 'rel-1',
          name: 'Dahua Bullet Camera',
          slug: 'dahua-bullet-camera',
          sku: 'DH-B1A21P',
          sellingPrice: 1600,
          compareAtPrice: 1750,
          stock: 8,
          images: [{ url: 'https://www.startech.com.bd/bullet.webp', sortOrder: 0 }],
          category: { name: 'CCTV & Security', slug: 'cctv-security' },
          brand: { name: 'Dahua', slug: 'dahua' },
        },
      ],
      error: null,
    });

    const { getCatalogRelatedProducts } = await import('@/lib/db/catalog');
    const related = await getCatalogRelatedProducts(
      '51fe1370-3699-4ea9-96e4-529f6d5937df',
      '87b2a6a6-071b-4b1a-8703-28e8fd6548dd',
      4
    );

    expect(related).toHaveLength(1);
    expect(related[0].slug).toBe('dahua-bullet-camera');
    expect(related[0].specifications).toEqual([]);
  });
});
