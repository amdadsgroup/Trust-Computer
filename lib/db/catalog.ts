import prisma from '@/lib/db';
import catalogData from './catalog-snapshot.json';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '@/lib/supabase/config';

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  sellingPrice: number | string;
  compareAtPrice?: number | string | null;
  costPrice?: number | string | null;
  stock: number;
  lowStockThreshold?: number | null;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isActive: boolean;
  warrantyInfo?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  images: Array<{
    id?: string;
    url: string;
    altText?: string | null;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
  category?: {
    id?: string;
    name: string;
    slug: string;
    description?: string | null;
  } | null;
  brand?: {
    id?: string;
    name: string;
    slug: string;
  } | null;
  specifications?: any[];
  variants?: any[];
}

export interface CatalogFilterMetadata {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sortOrder?: number;
    _count: { products: number };
  }>;
  brands: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  totalInStore: number;
}

const snapshotProducts: CatalogProduct[] = (catalogData.products || []) as unknown as CatalogProduct[];
const snapshotCategories = catalogData.categories || [];
const snapshotBrands = catalogData.brands || [];
const snapshotTotalInStore = catalogData.totalInStore || snapshotProducts.length;

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch {
    return null;
  }
}

export async function getCatalogFilterMetadata(): Promise<CatalogFilterMetadata> {
  // 1. Try Prisma ORM
  try {
    const [categories, brands, totalInStore] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          _count: {
            select: {
              products: {
                where: { isActive: true },
              },
            },
          },
        },
      }),
      prisma.brand.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    if (categories && categories.length > 0 && totalInStore > 0) {
      return { categories, brands, totalInStore };
    }
  } catch {
    // Fall through to Tier 2
  }

  // 2. Try Supabase HTTPS REST
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const [catRes, brandRes, countRes] = await Promise.all([
        supabase
          .from('categories')
          .select('id, name, slug, description, sortOrder, products:products(count)')
          .eq('isActive', true)
          .order('sortOrder', { ascending: true }),
        supabase
          .from('brands')
          .select('id, name, slug')
          .eq('isActive', true)
          .order('name', { ascending: true }),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('isActive', true),
      ]);

      if (catRes.data && catRes.data.length > 0) {
        const formattedCats = catRes.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          sortOrder: c.sortOrder,
          _count: {
            products: Array.isArray(c.products) && c.products[0] ? c.products[0].count : 0,
          },
        }));

        return {
          categories: formattedCats,
          brands: (brandRes.data || []) as any,
          totalInStore: countRes.count || formattedCats.reduce((acc, x) => acc + x._count.products, 0),
        };
      }
    } catch {
      // Fall through to Tier 3
    }
  }

  // 3. In-memory snapshot fallback
  return {
    categories: snapshotCategories,
    brands: snapshotBrands,
    totalInStore: snapshotTotalInStore,
  };
}

export async function getCatalogDefaultProducts(pageSize = 12): Promise<{ products: CatalogProduct[]; totalCount: number }> {
  // 1. Try Prisma
  try {
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          sellingPrice: true,
          compareAtPrice: true,
          stock: true,
          lowStockThreshold: true,
          warrantyInfo: true,
          images: {
            select: { url: true, altText: true },
            orderBy: { sortOrder: 'asc' as const },
            take: 1,
          },
          category: {
            select: { name: true, slug: true },
          },
          brand: {
            select: { name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    if (products && products.length > 0) {
      return { products: products as unknown as CatalogProduct[], totalCount };
    }
  } catch {
    // Fall through to Tier 2
  }

  // 2. Try Supabase REST
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, count } = await supabase
        .from('products')
        .select('id, name, slug, sku, sellingPrice, compareAtPrice, stock, lowStockThreshold, warrantyInfo, category:categories(name, slug), brand:brands(name, slug), images:product_images(url, altText)', { count: 'exact' })
        .eq('isActive', true)
        .order('createdAt', { ascending: false })
        .limit(pageSize);

      if (data && data.length > 0) {
        return {
          products: data as unknown as CatalogProduct[],
          totalCount: count || data.length,
        };
      }
    } catch {
      // Fall through to Tier 3
    }
  }

  // 3. In-memory snapshot fallback
  const items = snapshotProducts.slice(0, pageSize);
  return { products: items, totalCount: snapshotTotalInStore };
}

export interface CatalogQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  inStockOnly?: string;
  page?: number;
  pageSize?: number;
}

export async function queryCatalogProducts(params: CatalogQueryParams): Promise<{ products: CatalogProduct[]; totalCount: number }> {
  const page = Math.max(1, params.page || 1);
  const pageSize = params.pageSize || 12;

  // 1. Try Prisma
  try {
    const where: any = { isActive: true };
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.category) {
      where.category = { slug: params.category };
    }
    if (params.brand) {
      where.brand = { slug: params.brand };
    }
    if (params.inStockOnly === 'true') {
      where.stock = { gt: 0 };
    }
    if (params.minPrice || params.maxPrice) {
      const minVal = params.minPrice ? parseFloat(params.minPrice) : null;
      const maxVal = params.maxPrice ? parseFloat(params.maxPrice) : null;
      if ((minVal !== null && !isNaN(minVal)) || (maxVal !== null && !isNaN(maxVal))) {
        where.sellingPrice = {};
        if (minVal !== null && !isNaN(minVal) && minVal >= 0) where.sellingPrice.gte = minVal;
        if (maxVal !== null && !isNaN(maxVal) && maxVal >= 0) where.sellingPrice.lte = maxVal;
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (params.sort === 'price_asc') orderBy = { sellingPrice: 'asc' };
    else if (params.sort === 'price_desc') orderBy = { sellingPrice: 'desc' };
    else if (params.sort === 'name_asc') orderBy = { name: 'asc' };

    const [dbProducts, dbCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          sellingPrice: true,
          compareAtPrice: true,
          stock: true,
          lowStockThreshold: true,
          warrantyInfo: true,
          images: {
            select: { url: true, altText: true },
            orderBy: { sortOrder: 'asc' as const },
            take: 1,
          },
          category: {
            select: { name: true, slug: true },
          },
          brand: {
            select: { name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    if (dbProducts && dbProducts.length > 0) {
      return { products: dbProducts as unknown as CatalogProduct[], totalCount: dbCount };
    }
  } catch {
    // Fall through to memory query below
  }

  // 2. In-memory filtering over snapshot (instant 0ms)
  let filtered = snapshotProducts.filter((p) => p.isActive);

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  }

  if (params.category) {
    filtered = filtered.filter((p) => p.category?.slug === params.category);
  }

  if (params.brand) {
    filtered = filtered.filter((p) => p.brand?.slug === params.brand);
  }

  if (params.inStockOnly === 'true') {
    filtered = filtered.filter((p) => Number(p.stock) > 0);
  }

  if (params.minPrice) {
    const min = parseFloat(params.minPrice);
    if (!isNaN(min)) {
      filtered = filtered.filter((p) => Number(p.sellingPrice) >= min);
    }
  }

  if (params.maxPrice) {
    const max = parseFloat(params.maxPrice);
    if (!isNaN(max)) {
      filtered = filtered.filter((p) => Number(p.sellingPrice) <= max);
    }
  }

  // Sorting
  if (params.sort === 'price_asc') {
    filtered.sort((a, b) => Number(a.sellingPrice) - Number(b.sellingPrice));
  } else if (params.sort === 'price_desc') {
    filtered.sort((a, b) => Number(b.sellingPrice) - Number(a.sellingPrice));
  } else if (params.sort === 'name_asc') {
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else {
    filtered.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }

  const totalCount = filtered.length;
  const skip = (page - 1) * pageSize;
  const paginated = filtered.slice(skip, skip + pageSize);

  return { products: paginated, totalCount };
}

export async function getCatalogProductBySlug(slug: string): Promise<CatalogProduct | null> {
  // 1. Try Prisma
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        specifications: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true,
        brand: true,
      },
    });

    if (product) return product as unknown as CatalogProduct;
  } catch {
    // Fall through to Tier 2
  }

  // 2. Try Supabase REST
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('products')
        .select('*, images:product_images(*), category:categories(*), brand:brands(*)')
        .eq('slug', slug)
        .single();

      if (data) return data as unknown as CatalogProduct;
    } catch {
      // Fall through to Tier 3
    }
  }

  // 3. Fallback to snapshot
  const fallback = snapshotProducts.find((p) => p.slug === slug);
  return fallback || null;
}

export async function getCatalogRelatedProducts(categoryId: string, productId: string, limit = 4): Promise<CatalogProduct[]> {
  // 1. Try Prisma
  try {
    const related = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        sellingPrice: true,
        compareAtPrice: true,
        stock: true,
        lowStockThreshold: true,
        warrantyInfo: true,
        images: {
          select: { url: true, altText: true },
          orderBy: { sortOrder: 'asc' as const },
          take: 1,
        },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
      take: limit,
    });

    if (related && related.length > 0) return related as unknown as CatalogProduct[];
  } catch {
    // Fall through
  }

  // 2. Fallback to snapshot
  return snapshotProducts
    .filter((p) => p.categoryId === categoryId && p.id !== productId && p.isActive)
    .slice(0, limit);
}

export async function getCatalogCategoryBySlug(slug: string): Promise<any | null> {
  // 1. Try Prisma
  try {
    const cat = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            sellingPrice: true,
            compareAtPrice: true,
            stock: true,
            lowStockThreshold: true,
            warrantyInfo: true,
            images: {
              select: { url: true, altText: true },
              orderBy: { sortOrder: 'asc' as const },
            },
            category: { select: { name: true, slug: true } },
            brand: { select: { name: true, slug: true } },
          },
        },
      },
    });

    if (cat) return cat;
  } catch {
    // Fall through
  }

  // 2. Fallback to snapshot
  const catMeta = snapshotCategories.find((c) => c.slug === slug);
  if (!catMeta) return null;

  const prods = snapshotProducts.filter((p) => p.category?.slug === slug && p.isActive);

  return {
    ...catMeta,
    products: prods,
  };
}
