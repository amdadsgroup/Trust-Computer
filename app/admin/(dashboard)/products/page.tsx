import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import { Plus, Search, ExternalLink, Package, AlertCircle } from 'lucide-react';
import { toggleProductActiveAction } from './actions';

export const dynamic = 'force-dynamic';

interface AdminProductsPageProps {
  searchParams: {
    search?: string;
    category?: string;
  };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const sp = searchParams || {};
  const where: any = {};

  if (sp.search) {
    where.OR = [
      { name: { contains: sp.search, mode: 'insensitive' } },
      { sku: { contains: sp.search, mode: 'insensitive' } },
    ];
  }

  if (sp.category) {
    where.categoryId = sp.category;
  }

  let products: any[] = [];
  let categories: any[] = [];

  try {
    const [fetchedProducts, fetchedCategories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          brand: true,
          images: { take: 1 },
        },
      }),
      prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    ]);
    products = fetchedProducts;
    categories = fetchedCategories;
  } catch (e) {
    console.error('Error fetching admin products:', e);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            পণ্য ব্যবস্থাপনা (Product Inventory)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            মোট {products.length} টি পণ্য ডাটাবেজে রয়েছে
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-brand hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন পণ্য যুক্ত করুন</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <form method="GET" action="/admin/products" className="flex-1 relative">
          <input
            type="text"
            name="search"
            defaultValue={sp.search || ''}
            placeholder="পণ্যের নাম বা SKU দিয়ে খুঁজুন..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-brand"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <form method="GET" action="/admin/products">
          <select
            name="category"
            defaultValue={sp.category || ''}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
          >
            <option value="">সকল ক্যাটাগরি</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">ছবি ও নাম</th>
                <th className="py-3.5 px-4">SKU ও ক্যাটাগরি</th>
                <th className="py-3.5 px-4">বিক্রয় মূল্য</th>
                <th className="py-3.5 px-4">বর্তমান স্টক</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length > 0 ? (
                products.map((p) => {
                  const isLow = p.stock <= p.lowStockThreshold;
                  const isOut = p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {p.images[0]?.url ? (
                              <Image
                                src={p.images[0].url}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 line-clamp-1">{p.name}</span>
                            {p.isFeatured && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                ফিচার্ড
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-700 font-bold">{p.sku}</div>
                        <div className="text-[11px] text-slate-400">{p.category?.name}</div>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        ৳{Number(p.sellingPrice).toLocaleString('en-BD')}
                        {p.compareAtPrice && (
                          <span className="block text-[10px] text-slate-400 line-through">
                            ৳{Number(p.compareAtPrice).toLocaleString('en-BD')}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded-full inline-block ${
                            isOut
                              ? 'bg-slate-200 text-slate-700'
                              : isLow
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stock} টি
                        </span>
                        {isLow && !isOut && (
                          <span className="block text-[10px] text-red-500 font-semibold mt-0.5">
                            সীমিত স্টক
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {p.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="text-slate-400 hover:text-brand"
                            title="ওয়েবসাইটে দেখুন"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/admin/inventory?productId=${p.id}`}
                            className="text-xs font-semibold text-brand hover:underline"
                          >
                            স্টক পরিবর্তন
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    কোনো পণ্য পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
