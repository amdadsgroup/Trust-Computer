import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRevalidatePath = vi.fn();
const mockRevalidateTag = vi.fn();

vi.mock('next/cache', () => ({
  revalidatePath: (...args: any[]) => mockRevalidatePath(...args),
  revalidateTag: (...args: any[]) => mockRevalidateTag(...args),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => undefined,
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

const prismaEngineError = () =>
  new Error(
    'Invalid `prisma.product.findFirst()` invocation: Prisma Client could not locate the Query Engine for runtime "debian-openssl-1.1.x".'
  );

const mockPrisma = {
  product: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  category: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    upsert: vi.fn(),
  },
  brand: {
    findUnique: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
  },
  adminAuditLog: {
    create: vi.fn(),
  },
  coupon: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  couponUsage: {
    deleteMany: vi.fn(),
  },
  payment: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  order: {
    update: vi.fn(),
  },
  siteSettings: {
    upsert: vi.fn(),
  },
  inventoryMovement: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock('@/lib/db', () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

const mockRequireAuth = vi.fn();
vi.mock('@/lib/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth')>();
  return {
    ...actual,
    requireAuth: (...args: any[]) => mockRequireAuth(...args),
    requireRole: (...args: any[]) => mockRequireAuth(...args),
  };
});

type QueryCall = {
  table: string;
  op: string;
  payload?: any;
  filters: Array<[string, string, any]>;
};

function createSupabaseMock(handlers: Record<string, (call: QueryCall) => any>) {
  const calls: QueryCall[] = [];

  const from = (table: string) => {
    const state: QueryCall = { table, op: 'select', filters: [] };

    const execute = async () => {
      calls.push({ ...state, filters: [...state.filters] });
      const handler = handlers[table];
      if (handler) {
        return handler(state);
      }
      return { data: null, error: null };
    };

    const builder: any = {
      select: (_cols?: string) => builder,
      insert: (payload: any) => {
        state.op = 'insert';
        state.payload = payload;
        return builder;
      },
      upsert: (payload: any) => {
        state.op = 'upsert';
        state.payload = payload;
        return builder;
      },
      update: (payload: any) => {
        state.op = 'update';
        state.payload = payload;
        return builder;
      },
      delete: () => {
        state.op = 'delete';
        return builder;
      },
      eq: (col: string, val: any) => {
        state.filters.push(['eq', col, val]);
        return builder;
      },
      neq: (col: string, val: any) => {
        state.filters.push(['neq', col, val]);
        return builder;
      },
      in: (col: string, val: any) => {
        state.filters.push(['in', col, val]);
        return builder;
      },
      order: () => builder,
      limit: () => builder,
      maybeSingle: () => execute(),
      single: () => execute(),
      then: (resolve: any, reject: any) => execute().then(resolve, reject),
    };

    return builder;
  };

  return { client: { from }, calls };
}

let activeSupabaseMock: ReturnType<typeof createSupabaseMock> | null = null;
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => activeSupabaseMock?.client ?? null,
}));

function buildProductFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    name: 'HP 845 G8',
    slug: 'hp-845-g8',
    sku: 'hp-845-g8',
    barcode: '6941264000000',
    categoryId: '812fb860-ff77-41e8-9b54-e71f445d7ce8',
    brandId: 'brand-hp-uuid',
    sellingPrice: '40000',
    compareAtPrice: '42000',
    costPrice: '35000',
    stock: '10',
    lowStockThreshold: '3',
    imageUrl: 'https://example.com/hp-845-g8.jpg',
    warrantyInfo: '365 Days',
    description: 'hp-845-g8 with 8 gb ram and 256 gb ssd',
    isActive: 'on',
  };
  for (const [k, v] of Object.entries({ ...defaults, ...overrides })) {
    fd.set(k, v);
  }
  return fd;
}

describe('Cloudflare Workers Supabase REST Fallback for Products & Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({
      userId: 'master-owner-root',
      email: 'trustcomputermb@gmail.com',
      name: 'Shiblu Ahmed',
      role: 'OWNER',
    });

    // Simulate Cloudflare Workers where Prisma fails to locate native Query Engine
    mockPrisma.product.findFirst.mockRejectedValue(prismaEngineError());
    mockPrisma.product.findUnique.mockRejectedValue(prismaEngineError());
    mockPrisma.product.update.mockRejectedValue(prismaEngineError());
    mockPrisma.product.delete.mockRejectedValue(prismaEngineError());
    mockPrisma.$transaction.mockRejectedValue(prismaEngineError());
    mockPrisma.category.findMany.mockRejectedValue(prismaEngineError());
    mockPrisma.category.findUnique.mockRejectedValue(prismaEngineError());
    mockPrisma.category.findFirst.mockRejectedValue(prismaEngineError());
    mockPrisma.brand.findUnique.mockRejectedValue(prismaEngineError());
    mockPrisma.user.findUnique.mockRejectedValue(prismaEngineError());
    mockPrisma.user.findFirst.mockRejectedValue(prismaEngineError());
    mockPrisma.adminAuditLog.create.mockRejectedValue(prismaEngineError());
    mockPrisma.coupon.findUnique.mockRejectedValue(prismaEngineError());
    mockPrisma.coupon.update.mockRejectedValue(prismaEngineError());
    mockPrisma.payment.findUnique.mockRejectedValue(prismaEngineError());
    mockPrisma.siteSettings.upsert.mockRejectedValue(prismaEngineError());
  });

  it('createProductAction creates product, image, initial movement, and audit log via Supabase REST when Prisma fails', async () => {
    activeSupabaseMock = createSupabaseMock({
      products: (call) => {
        if (call.op === 'select') return { data: null, error: null };
        if (call.op === 'insert') {
          return {
            data: { id: call.payload.id, name: call.payload.name, sku: call.payload.sku },
            error: null,
          };
        }
        return { data: null, error: null };
      },
      categories: () => ({ data: { id: '812fb860-ff77-41e8-9b54-e71f445d7ce8' }, error: null }),
      brands: () => ({ data: { id: 'brand-hp-uuid' }, error: null }),
      users: () => ({ data: { id: 'owner-uuid-123' }, error: null }),
      product_images: () => ({ data: { id: 'img-1' }, error: null }),
      inventory_movements: () => ({ data: { id: 'mov-1' }, error: null }),
      admin_audit_logs: () => ({ data: { id: 'log-1' }, error: null }),
    });

    const { createProductAction } = await import('@/app/admin/(dashboard)/products/actions');
    const result = await createProductAction(buildProductFormData());

    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);
    expect(result.productId).toBeDefined();

    const prodInsert = activeSupabaseMock.calls.find(
      (c) => c.table === 'products' && c.op === 'insert'
    );
    expect(prodInsert).toBeDefined();
    expect(prodInsert?.payload.brandId).toBe('brand-hp-uuid');
    expect(prodInsert?.payload.categoryId).toBe('812fb860-ff77-41e8-9b54-e71f445d7ce8');

    const imgInsert = activeSupabaseMock.calls.find(
      (c) => c.table === 'product_images' && c.op === 'insert'
    );
    expect(imgInsert?.payload.url).toBe('https://example.com/hp-845-g8.jpg');

    const movInsert = activeSupabaseMock.calls.find(
      (c) => c.table === 'inventory_movements' && c.op === 'insert'
    );
    expect(movInsert?.payload.quantity).toBe(10);
    expect(movInsert?.payload.createdByUserId).toBe('owner-uuid-123');

    const auditInsert = activeSupabaseMock.calls.find(
      (c) => c.table === 'admin_audit_logs' && c.op === 'insert'
    );
    expect(auditInsert?.payload.action).toBe('PRODUCT_CREATE');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/products');
  });

  it('createProductAction returns duplicate SKU error in Supabase REST fallback', async () => {
    activeSupabaseMock = createSupabaseMock({
      products: (call) => {
        if (call.op === 'select' && call.filters.some(([, col]) => col === 'sku')) {
          return { data: { id: 'existing-prod-id' }, error: null };
        }
        return { data: null, error: null };
      },
    });

    const { createProductAction } = await import('@/app/admin/(dashboard)/products/actions');
    const result = await createProductAction(buildProductFormData());

    expect(result.error).toContain('SKU (hp-845-g8) is already in use');
    expect(
      activeSupabaseMock.calls.some((c) => c.table === 'products' && c.op === 'insert')
    ).toBe(false);
  });

  it('createProductAction rolls back created product if image insert fails', async () => {
    activeSupabaseMock = createSupabaseMock({
      products: (call) => {
        if (call.op === 'select') return { data: null, error: null };
        if (call.op === 'insert') {
          return {
            data: { id: 'created-prod-rollback', name: call.payload.name, sku: call.payload.sku },
            error: null,
          };
        }
        return { data: null, error: null };
      },
      categories: () => ({ data: { id: '812fb860-ff77-41e8-9b54-e71f445d7ce8' }, error: null }),
      brands: () => ({ data: { id: 'brand-hp-uuid' }, error: null }),
      users: () => ({ data: { id: 'owner-uuid-123' }, error: null }),
      product_images: () => ({ data: null, error: { message: 'Image insert failed' } }),
    });

    const { createProductAction } = await import('@/app/admin/(dashboard)/products/actions');
    const result = await createProductAction(buildProductFormData());

    expect(result.error).toBe('Image insert failed');
    const rollbackDelete = activeSupabaseMock.calls.find(
      (c) => c.table === 'products' && c.op === 'delete'
    );
    expect(rollbackDelete).toBeDefined();
  });

  it('updateProductAction, toggle actions, and deleteProductAction work via Supabase REST fallback', async () => {
    activeSupabaseMock = createSupabaseMock({
      products: (call) => {
        if (call.op === 'select') {
          const isEqId = call.filters.some(([op, col]) => op === 'eq' && col === 'id');
          if (isEqId) {
            return {
              data: {
                id: 'prod-1',
                name: 'HP 845 G8',
                sku: 'hp-845-g8',
                slug: 'hp-845-g8',
                stock: 5,
                images: [{ id: 'img-existing', isPrimary: true }],
              },
              error: null,
            };
          }
          return { data: null, error: null };
        }
        if (call.op === 'update') {
          return {
            data: { id: 'prod-1', isActive: false, isFeatured: true },
            error: null,
          };
        }
        return { data: null, error: null };
      },
      categories: () => ({ data: { id: '812fb860-ff77-41e8-9b54-e71f445d7ce8' }, error: null }),
      brands: () => ({ data: { id: 'brand-hp-uuid' }, error: null }),
      users: () => ({ data: { id: 'owner-uuid-123' }, error: null }),
      reviews: () => ({ data: [{ id: 'rev-1' }], error: null }),
    });

    const {
      updateProductAction,
      toggleProductActiveAction,
      toggleProductFeaturedAction,
      deleteProductAction,
    } = await import('@/app/admin/(dashboard)/products/actions');

    const updateRes = await updateProductAction('prod-1', buildProductFormData({ stock: '12' }));
    expect(updateRes).toEqual({ success: true, productId: 'prod-1' });
    expect(
      activeSupabaseMock.calls.some(
        (c) => c.table === 'inventory_movements' && c.op === 'insert' && c.payload.quantity === 7
      )
    ).toBe(true);

    const activeRes = await toggleProductActiveAction('prod-1', true);
    expect(activeRes).toEqual({ success: true });

    const featRes = await toggleProductFeaturedAction('prod-1', false);
    expect(featRes).toEqual({ success: true, isFeatured: true });

    const delRes = await deleteProductAction('prod-1');
    expect(delRes).toEqual({ success: true });
    expect(
      activeSupabaseMock.calls.some((c) => c.table === 'review_images' && c.op === 'delete')
    ).toBe(true);
    expect(
      activeSupabaseMock.calls.some((c) => c.table === 'products' && c.op === 'delete')
    ).toBe(true);
  });

  it('getAdminCategories loads DB categories via Supabase REST when Prisma fails', async () => {
    activeSupabaseMock = createSupabaseMock({
      categories: () => ({
        data: [
          {
            id: 'cat-router-id',
            name: 'Router',
            slug: 'router',
            sortOrder: 0,
          },
        ],
        error: null,
      }),
    });

    const { getAdminCategories } = await import('@/lib/categories');
    const categories = await getAdminCategories();

    expect(categories.some((c) => c.id === 'cat-router-id' && c.name === 'Router')).toBe(true);
    expect(categories.some((c) => c.slug === 'laptop-computer')).toBe(true);
  });

  it('categories, inventory, coupons, payments, and settings actions work via Supabase REST fallback', async () => {
    activeSupabaseMock = createSupabaseMock({
      categories: (call) => {
        if (call.op === 'select') return { data: null, error: null };
        if (call.op === 'insert') {
          return { data: { id: call.payload.id, name: call.payload.name, slug: call.payload.slug }, error: null };
        }
        return { data: null, error: null };
      },
      products: (call) => {
        if (call.op === 'select') {
          return { data: { id: 'prod-1', stock: 10, name: 'HP 845 G8', sku: 'hp-845-g8' }, error: null };
        }
        if (call.op === 'update') {
          return { data: { id: 'prod-1', stock: 15, name: 'HP 845 G8', sku: 'hp-845-g8' }, error: null };
        }
        return { data: null, error: null };
      },
      inventory_movements: (call) => ({ data: { id: call.payload.id }, error: null }),
      users: () => ({ data: { id: 'owner-uuid-123' }, error: null }),
      coupons: (call) => {
        if (call.op === 'select') return { data: null, error: null };
        if (call.op === 'insert') return { data: { id: call.payload.id }, error: null };
        return { data: { isActive: false }, error: null };
      },
      payments: (call) => {
        if (call.op === 'select') {
          return {
            data: {
              orderId: 'ord-1',
              amount: 40000,
              transactionId: 'TRX123',
              rawResponseJson: null,
              order: { id: 'ord-1', orderNumber: 'TC-1001' },
            },
            error: null,
          };
        }
        return { data: null, error: null };
      },
      orders: () => ({ data: null, error: null }),
      site_settings: () => ({ data: { id: 'default' }, error: null }),
      admin_audit_logs: () => ({ data: { id: 'log-1' }, error: null }),
    });

    const { createCategoryAction } = await import('@/app/admin/(dashboard)/categories/actions');
    const catFd = new FormData();
    catFd.set('name', 'Laptops');
    const catRes = await createCategoryAction(catFd);
    expect(catRes.success).toBe(true);

    const { submitStockAdjustmentAction } = await import('@/app/admin/(dashboard)/inventory/actions');
    const invFd = new FormData();
    invFd.set('productId', 'prod-1');
    invFd.set('type', 'RECEIVE');
    invFd.set('quantity', '5');
    invFd.set('reason', 'New stock arrival');
    const invRes = await submitStockAdjustmentAction(invFd);
    expect(invRes).toEqual({ success: true });

    const { createCouponAction } = await import('@/app/admin/(dashboard)/coupons/actions');
    const coupFd = new FormData();
    coupFd.set('code', 'SAVE10');
    coupFd.set('type', 'PERCENTAGE');
    coupFd.set('value', '10');
    coupFd.set('isActive', 'on');
    const coupRes = await createCouponAction(coupFd);
    expect(coupRes.success).toBe(true);

    const { verifyPaymentAction } = await import('@/app/admin/(dashboard)/payments/actions');
    const payRes = await verifyPaymentAction('pay-1', 'Verified manually');
    expect(payRes.success).toBe(true);

    const { updateStoreSettingsAction } = await import('@/app/admin/(dashboard)/settings/actions');
    const setFd = new FormData();
    setFd.set('storeName', 'Trust Computer-Moulvibazar');
    const setRes = await updateStoreSettingsAction(setFd);
    expect(setRes).toEqual({ success: true });
  });
});
