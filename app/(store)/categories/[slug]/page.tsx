import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import ProductCard from '@/components/products/ProductCard';
import { PackageOpen, ChevronRight, Home, Filter, SlidersHorizontal, Check, ShieldCheck } from 'lucide-react';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    sort?: string;
    brand?: string;
    inStockOnly?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
    });
    if (!category) return { title: 'Category Not Found' };
    return {
      title: `${category.name} | Trust Computer-Moulvibazar`,
      description:
        category.description ||
        `মৌলভীবাজারে সেরা মূল্যে ${category.name} কিনুন Trust Computer থেকে। টি.এস প্লাজা (২য় তলা), কুসুমবাগ, মৌলভীবাজার।`,
    };
  } catch {
    return { title: 'Category' };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const sp = searchParams || {};
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    notFound();
  }

  // Construct filtering
  const where: Prisma.ProductWhereInput = {
    categoryId: category.id,
    isActive: true,
  };

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

  // Fetch products and brands available in this category
  const [products, totalCount, categoryBrands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        category: true,
        brand: true,
      },
      orderBy,
    }),
    prisma.product.count({ where }),
    prisma.brand.findMany({
      where: {
        products: {
          some: {
            categoryId: category.id,
            isActive: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  // URL helper for filters
  const buildFilterUrl = (key: string, value: string | null) => {
    const p = new URLSearchParams();
    if (sp.sort) p.set('sort', sp.sort);
    if (sp.brand) p.set('brand', sp.brand);
    if (sp.inStockOnly) p.set('inStockOnly', sp.inStockOnly);

    if (value === null) {
      p.delete(key);
    } else {
      p.set(key, value);
    }

    const query = p.toString();
    return `/categories/${params.slug}${query ? `?${query}` : ''}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>হোম</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/products" className="hover:text-brand-600">
          পণ্যসমূহ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900">{category.name}</span>
      </nav>

      {/* Category Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="space-y-2 max-w-2xl relative z-10">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider">
            Trust Computer Moulvibazar
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {category.name}
          </h1>
          {category.description ? (
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-xl">
              {category.description}
            </p>
          ) : (
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-xl">
              মৌলভীবাজারের কুসুমবাগ শোরুমে অফিসিয়াল ওয়ারেন্টি ও সেরা প্রাইসে {category.name} সংগ্রহ করুন।
            </p>
          )}
        </div>
        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-xs font-bold text-white self-start md:self-auto relative z-10 shrink-0">
          মোট {totalCount} টি পণ্য তালিকাভুক্ত
        </div>
      </div>

      {/* Filter and Sorting Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <Link
            href={`/categories/${params.slug}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              !sp.brand && !sp.inStockOnly
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            সব পণ্য
          </Link>

          <Link
            href={buildFilterUrl(
              'inStockOnly',
              sp.inStockOnly === 'true' ? null : 'true'
            )}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
              sp.inStockOnly === 'true'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {sp.inStockOnly === 'true' && <Check className="w-3.5 h-3.5" />}
            <span>শুধুমাত্র স্টকে আছে</span>
          </Link>

          {/* Brand Pills */}
          {categoryBrands.map((b) => {
            const isSelected = sp.brand === b.slug;
            return (
              <Link
                key={b.id}
                href={buildFilterUrl('brand', isSelected ? null : b.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {b.name}
              </Link>
            );
          })}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 text-xs">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 font-medium">সর্ট:</span>
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <Link
              href={buildFilterUrl('sort', null)}
              className={`px-2.5 py-1 rounded-lg transition ${
                !sp.sort ? 'bg-white font-bold text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              নতুন
            </Link>
            <Link
              href={buildFilterUrl('sort', 'price_asc')}
              className={`px-2.5 py-1 rounded-lg transition ${
                sp.sort === 'price_asc' ? 'bg-white font-bold text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              দাম: কম ➔ বেশি
            </Link>
            <Link
              href={buildFilterUrl('sort', 'price_desc')}
              className={`px-2.5 py-1 rounded-lg transition ${
                sp.sort === 'price_desc' ? 'bg-white font-bold text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              দাম: বেশি ➔ কম
            </Link>
          </div>
        </div>
      </div>

      {/* Category Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <PackageOpen className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            এই ফিল্টারে কোনো পণ্য পাওয়া যায়নি
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            ফিল্টার পরিবর্তন করুন অথবা সরাসরি আমাদের শোরুমে যোগাযোগ করুন।
          </p>
          <div className="pt-2">
            <Link
              href={`/categories/${params.slug}`}
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              সব {category.name} দেখুন
            </Link>
          </div>
        </div>
      )}

      {/* Showroom Trust Strip */}
      <div className="bg-slate-100/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 border border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            ট্রাস্ট কম্পিউটার — টি.এস প্লাজা (২য় তলা), কুসুমবাগ, মৌলভীবাজার। হটলাইন: 01753-765372
          </span>
        </div>
        <Link
          href="/contact"
          className="text-brand-600 font-semibold hover:underline shrink-0"
        >
          শোরুম লোকেশন ও যোগাযোগ ➔
        </Link>
      </div>
    </div>
  );
}
