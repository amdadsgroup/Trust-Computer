import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import ProductCard from '@/components/products/ProductCard';
import MobileFilterDrawer from '@/components/products/MobileFilterDrawer';
import CategoryBrowseBar from '@/components/products/CategoryBrowseBar';
import ProductSortSelect from '@/components/products/ProductSortSelect';
import BudgetPriceFilter from '@/components/products/BudgetPriceFilter';
import { Prisma } from '@prisma/client';
import { Filter, SlidersHorizontal, Search, X, ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';

import { unstable_cache } from 'next/cache';

export const revalidate = 60;
export const maxDuration = 30;

interface ProductsPageProps {
  searchParams: {
    search?: string;
    category?: string;
    brand?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
    page?: string;
  };
}

const productSelect = {
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
};

const getCachedFilterMetadata = unstable_cache(
  async () => {
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

    return { categories, brands, totalInStore };
  },
  ['catalog-filter-metadata'],
  { revalidate: 120, tags: ['categories', 'brands', 'products'] }
);

const getCachedDefaultProducts = unstable_cache(
  async () => {
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: productSelect,
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);
    return { products, totalCount };
  },
  ['catalog-default-page-1'],
  { revalidate: 60, tags: ['products'] }
);

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = searchParams || {};
  const page = Math.max(1, parseInt(sp.page || '1', 10));
  const pageSize = 12;

  const isDefaultQuery =
    page === 1 &&
    !sp.search &&
    !sp.category &&
    !sp.brand &&
    !sp.sort &&
    !sp.minPrice &&
    !sp.maxPrice &&
    !sp.inStockOnly;

  // Build Prisma where filter
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (sp.search) {
    where.OR = [
      { name: { contains: sp.search, mode: 'insensitive' } },
      { sku: { contains: sp.search, mode: 'insensitive' } },
    ];
  }

  if (sp.category) {
    where.category = { slug: sp.category };
  }

  if (sp.brand) {
    where.brand = { slug: sp.brand };
  }

  if (sp.inStockOnly === 'true') {
    where.stock = { gt: 0 };
  }

  if (sp.minPrice || sp.maxPrice) {
    const minVal = sp.minPrice ? parseFloat(sp.minPrice) : null;
    const maxVal = sp.maxPrice ? parseFloat(sp.maxPrice) : null;

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

  // Sorting
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  if (sp.sort === 'price_asc') {
    orderBy = { sellingPrice: 'asc' };
  } else if (sp.sort === 'price_desc') {
    orderBy = { sellingPrice: 'desc' };
  } else if (sp.sort === 'name_asc') {
    orderBy = { name: 'asc' };
  }

  // Fetch products and categories/brands for sidebar filters
  let products: any[] = [];
  let totalCount = 0;
  let categories: any[] = [];
  let brands: any[] = [];
  let totalStoreCount = 0;

  try {
    if (isDefaultQuery) {
      const [defaultProds, metaData] = await Promise.all([
        getCachedDefaultProducts(),
        getCachedFilterMetadata(),
      ]);
      products = defaultProds.products;
      totalCount = defaultProds.totalCount;
      categories = metaData.categories;
      brands = metaData.brands;
      totalStoreCount = metaData.totalInStore;
    } else {
      const [productData, metaData] = await Promise.all([
        Promise.all([
          prisma.product.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: productSelect,
          }),
          prisma.product.count({ where }),
        ]),
        getCachedFilterMetadata(),
      ]);

      products = productData[0];
      totalCount = productData[1];
      categories = metaData.categories;
      brands = metaData.brands;
      totalStoreCount = metaData.totalInStore;
    }
  } catch (e) {
    console.error('Error fetching product catalog:', e);
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  // Helper to build URL query with filters
  const buildFilterUrl = (key: string, value: string | null) => {
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
    // reset to page 1 on filter change
    params.delete('page');

    return `/products?${params.toString()}`;
  };

  const hasActiveFilters = Boolean(
    sp.search ||
      sp.category ||
      sp.brand ||
      sp.sort ||
      sp.inStockOnly ||
      sp.minPrice ||
      sp.maxPrice
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
            <Link href="/" className="hover:text-brand transition">Home</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Product Catalog</span>
            {sp.category && (
              <>
                <span>/</span>
                <span className="text-brand font-semibold capitalize">
                  {sp.category.replace('-', ' ')}
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Computer & CCTV Products
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total {totalCount} {totalCount === 1 ? 'product' : 'products'} available
          </p>
        </div>

        {/* Mobile Filter & Sort Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto">
          <MobileFilterDrawer
            categories={categories}
            brands={brands}
            currentCategory={sp.category}
            currentBrand={sp.brand}
            inStockOnly={sp.inStockOnly}
            currentMinPrice={sp.minPrice}
            currentMaxPrice={sp.maxPrice}
            totalCount={totalCount}
          />

          <ProductSortSelect currentSort={sp.sort} />
        </div>
      </div>

      {/* Prominent Category Browser Section (Browse Categories & All Products) */}
      <CategoryBrowseBar
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          productCount: c._count?.products ?? 0,
        }))}
        currentCategory={sp.category}
        totalProductsCount={totalStoreCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand" />
                <h2 className="font-bold text-sm text-slate-800">Filters</h2>
              </div>
              {hasActiveFilters && (
                <Link
                  href="/products"
                  className="text-xs text-accent-600 hover:text-accent-800 font-semibold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </Link>
              )}
            </div>

            {/* Categories Filter */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="space-y-1.5 text-xs">
                <Link
                  href={buildFilterUrl('category', null)}
                  className={`block px-2.5 py-1.5 rounded-lg transition ${
                    !sp.category
                      ? 'bg-brand text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={buildFilterUrl('category', cat.slug)}
                    className={`block px-2.5 py-1.5 rounded-lg transition ${
                      sp.category === cat.slug
                        ? 'bg-brand text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Budget / Price Filter */}
            <div className="pt-4 border-t border-slate-100">
              <BudgetPriceFilter
                currentMinPrice={sp.minPrice}
                currentMaxPrice={sp.maxPrice}
              />
            </div>

            {/* Brands Filter */}
            {brands.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Brands
                </h3>
                <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto">
                  <Link
                    href={buildFilterUrl('brand', null)}
                    className={`block px-2.5 py-1.5 rounded-lg transition ${
                      !sp.brand
                        ? 'bg-brand text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Brands
                  </Link>
                  {brands.map((b) => (
                    <Link
                      key={b.id}
                      href={buildFilterUrl('brand', b.slug)}
                      className={`block px-2.5 py-1.5 rounded-lg transition ${
                        sp.brand === b.slug
                          ? 'bg-brand text-white font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Filter */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Stock Availability
              </h3>
              <div className="space-y-1.5 text-xs">
                <Link
                  href={buildFilterUrl(
                    'inStockOnly',
                    sp.inStockOnly === 'true' ? null : 'true'
                  )}
                  className={`block px-2.5 py-1.5 rounded-lg border transition ${
                    sp.inStockOnly === 'true'
                      ? 'border-brand bg-brand-50 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ✓ In Stock Only
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Products Grid */}
        <main className="lg:col-span-3 space-y-4">
          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Active Filters:
              </span>

              {sp.category && (
                <Link
                  href={buildFilterUrl('category', null)}
                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-accent text-slate-700 hover:text-accent px-2.5 py-1 rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  <span>Category: {categories.find((c) => c.slug === sp.category)?.name || sp.category}</span>
                  <X className="w-3 h-3 text-slate-400" />
                </Link>
              )}

              {(sp.minPrice || sp.maxPrice) && (
                <Link
                  href={(() => {
                    const p = new URLSearchParams();
                    if (sp.search) p.set('search', sp.search);
                    if (sp.category) p.set('category', sp.category);
                    if (sp.brand) p.set('brand', sp.brand);
                    if (sp.sort) p.set('sort', sp.sort);
                    if (sp.inStockOnly) p.set('inStockOnly', sp.inStockOnly);
                    const q = p.toString();
                    return q ? `/products?${q}` : '/products';
                  })()}
                  className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand/30 text-brand px-2.5 py-1 rounded-xl text-xs font-bold shadow-xs hover:border-accent hover:text-accent transition"
                  title="Remove budget filter"
                >
                  <span>
                    Budget: {sp.minPrice && sp.maxPrice
                      ? `৳${Number(sp.minPrice).toLocaleString('en-BD')} - ৳${Number(sp.maxPrice).toLocaleString('en-BD')}`
                      : sp.minPrice
                      ? `Above ৳${Number(sp.minPrice).toLocaleString('en-BD')}`
                      : `Up to ৳${Number(sp.maxPrice).toLocaleString('en-BD')}`}
                  </span>
                  <X className="w-3 h-3 text-brand hover:text-accent" />
                </Link>
              )}

              {sp.brand && (
                <Link
                  href={buildFilterUrl('brand', null)}
                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-accent text-slate-700 hover:text-accent px-2.5 py-1 rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  <span>Brand: {brands.find((b) => b.slug === sp.brand)?.name || sp.brand}</span>
                  <X className="w-3 h-3 text-slate-400" />
                </Link>
              )}

              {sp.inStockOnly === 'true' && (
                <Link
                  href={buildFilterUrl('inStockOnly', null)}
                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-accent text-slate-700 hover:text-accent px-2.5 py-1 rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  <span>In Stock Only</span>
                  <X className="w-3 h-3 text-slate-400" />
                </Link>
              )}

              {sp.search && (
                <Link
                  href={buildFilterUrl('search', null)}
                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-accent text-slate-700 hover:text-accent px-2.5 py-1 rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  <span>Search: &ldquo;{sp.search}&rdquo;</span>
                  <X className="w-3 h-3 text-slate-400" />
                </Link>
              )}

              <Link
                href="/products"
                className="text-xs text-accent-600 hover:text-accent-800 font-bold ml-auto px-2 py-1 transition"
              >
                Clear All
              </Link>
            </div>
          )}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      sku: product.sku,
                      sellingPrice: Number(product.sellingPrice),
                      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
                      stock: product.stock,
                      lowStockThreshold: product.lowStockThreshold,
                      images: product.images,
                      category: product.category,
                      brand: product.brand,
                      warrantyInfo: product.warrantyInfo,
                    }}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <Link
                      href={`/products?${new URLSearchParams({
                        ...searchParams,
                        page: String(page - 1),
                      }).toString()}`}
                      className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Link>
                  )}

                  <span className="text-xs font-bold text-slate-600 px-4 py-2 border border-slate-200 rounded-xl bg-white">
                    Page {page} of {totalPages}
                  </span>

                  {page < totalPages && (
                    <Link
                      href={`/products?${new URLSearchParams({
                        ...searchParams,
                        page: String(page + 1),
                      }).toString()}`}
                      className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <PackageOpen className="w-16 h-16 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No Products Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No products found matching your current filter criteria. Try adjusting or clearing your filters.
              </p>
              {hasActiveFilters && (
                <Link
                  href="/products"
                  className="inline-block bg-brand hover:bg-brand-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition"
                >
                  Reset All Filters
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
