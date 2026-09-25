import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import ProductCard from '@/components/products/ProductCard';
import MobileFilterDrawer from '@/components/products/MobileFilterDrawer';
import { Prisma } from '@prisma/client';
import { Filter, SlidersHorizontal, Search, X, ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';
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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = searchParams || {};
  const page = Math.max(1, parseInt(sp.page || '1', 10));
  const pageSize = 12;

  // Build Prisma where filter
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (sp.search) {
    where.OR = [
      { name: { contains: sp.search, mode: 'insensitive' } },
      { sku: { contains: sp.search, mode: 'insensitive' } },
      { description: { contains: sp.search, mode: 'insensitive' } },
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
    where.sellingPrice = {};
    if (sp.minPrice) {
      where.sellingPrice.gte = parseFloat(sp.minPrice);
    }
    if (sp.maxPrice) {
      where.sellingPrice.lte = parseFloat(sp.maxPrice);
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

  try {
    const [fetchedProducts, count, fetchedCategories, fetchedBrands] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          category: true,
          brand: true,
        },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    ]);

    products = fetchedProducts;
    totalCount = count;
    categories = fetchedCategories;
    brands = fetchedBrands;
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
      sp.inStockOnly
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb & Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
            <Link href="/" className="hover:text-brand transition">হোম</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">পণ্য ক্যাটালগ</span>
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
            কম্পিউটার ও সিসিটিভি পণ্যসমূহ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            মোট {totalCount} টি পণ্য পাওয়া গেছে
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
            totalCount={totalCount}
          />

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="hidden sm:inline text-xs font-semibold text-slate-600">
              Sort:
            </label>
            <select
              id="sort-select"
              defaultValue={sp.sort || 'newest'}
              className="bg-white border border-slate-200 text-xs font-medium text-slate-800 rounded-xl px-3 py-2 outline-none focus:border-[#0084d6] cursor-pointer shadow-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand" />
                <h2 className="font-bold text-sm text-slate-800">ফিল্টার (Filters)</h2>
              </div>
              {hasActiveFilters && (
                <Link
                  href="/products"
                  className="text-xs text-accent-600 hover:text-accent-800 font-semibold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>মুছে ফেলুন</span>
                </Link>
              )}
            </div>

            {/* Categories Filter */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                ক্যাটাগরি
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
                  সকল ক্যাটাগরি
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

            {/* Brands Filter */}
            {brands.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  ব্র্যান্ড
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
                    সকল ব্র্যান্ড
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
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                স্টক উপস্থিতি
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
                  ✓ শুধুমাত্র স্টকে থাকা পণ্য
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Products Grid */}
        <main className="lg:col-span-3">
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
                    পৃষ্ঠা {page} / {totalPages}
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
              <h3 className="text-lg font-bold text-slate-800">কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                আপনার অনুসন্ধানের সাথে মিলে এমন কোনো পণ্য এই মুহূর্তে নেই। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
              </p>
              {hasActiveFilters && (
                <Link
                  href="/products"
                  className="inline-block bg-brand hover:bg-brand-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition"
                >
                  ফিল্টার রিসেট করুন
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
