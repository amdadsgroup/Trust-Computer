import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import { Plus, Search, ExternalLink, Package, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { toggleProductActiveAction, deleteProductAction } from './actions';

export const dynamic = 'force-dynamic';

interface AdminProductsPageProps {
  searchParams: {
    search?: string;
    category?: string;
    page?: string;
  };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const sp = searchParams || {};
  const where: any = {};
  const currentPage = Math.max(1, parseInt(sp.page || '1', 10));
  const pageSize = 25;

  if (sp.search?.trim()) {
    where.OR = [
      { name: { contains: sp.search.trim(), mode: 'insensitive' } },
      { sku: { contains: sp.search.trim(), mode: 'insensitive' } },
    ];
  }

  if (sp.category) {
    where.categoryId = sp.category;
  }

  let products: any[] = [];
  let totalCount = 0;
  let categories: any[] = [];

  try {
    const [fetchedProducts, count, fetchedCategories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (currentPage - 1) * pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          sellingPrice: true,
          compareAtPrice: true,
          stock: true,
          lowStockThreshold: true,
          isActive: true,
          isFeatured: true,
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          images: { take: 1, select: { url: true } },
        },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    products = fetchedProducts;
    totalCount = count;
    categories = fetchedCategories;
  } catch (e) {
    console.error('Error fetching admin products:', e);
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {products.length} of {totalCount} total products
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-brand hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <form method="GET" action="/admin/products" className="flex-1 relative">
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
          <input
            type="text"
            name="search"
            defaultValue={sp.search || ''}
            placeholder="Search by product name or SKU..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-brand transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <form method="GET" action="/admin/products" className="flex items-center gap-2">
          {sp.search && <input type="hidden" name="search" value={sp.search} />}
          <select
            name="category"
            defaultValue={sp.category || ''}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Product & Image</th>
                <th className="py-3.5 px-4">SKU & Category</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
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
                                sizes="48px"
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
                                Featured
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
                        ৳{Number(p.sellingPrice).toLocaleString()}
                        {p.compareAtPrice && (
                          <span className="block text-[10px] text-slate-400 line-through">
                            ৳{Number(p.compareAtPrice).toLocaleString()}
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
                          {p.stock} in stock
                        </span>
                        {isLow && !isOut && (
                          <span className="block text-[10px] text-red-500 font-semibold mt-0.5">
                            Low Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <form
                          action={async () => {
                            'use server';
                            await toggleProductActiveAction(p.id, p.isActive);
                          }}
                        >
                          <button
                            type="submit"
                            title="Click to toggle active status"
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition hover:opacity-80 cursor-pointer ${
                              p.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {p.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </form>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="text-slate-400 hover:text-brand"
                            title="View in Store"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/admin/inventory?productId=${p.id}`}
                            className="text-xs font-semibold text-brand hover:underline"
                          >
                            Adjust Stock
                          </Link>

                          <form
                            action={async () => {
                              'use server';
                              await deleteProductAction(p.id);
                            }}
                          >
                            <button
                              type="submit"
                              title="Delete or Archive Product"
                              className="text-slate-400 hover:text-rose-600 transition p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              Page {currentPage} of {totalPages} ({totalCount} total)
            </div>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={`/admin/products?page=${currentPage - 1}${
                    sp.category ? `&category=${sp.category}` : ''
                  }${sp.search ? `&search=${sp.search}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 flex items-center gap-1 cursor-not-allowed">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </span>
              )}

              {currentPage < totalPages ? (
                <Link
                  href={`/admin/products?page=${currentPage + 1}${
                    sp.category ? `&category=${sp.category}` : ''
                  }${sp.search ? `&search=${sp.search}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center gap-1 transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 flex items-center gap-1 cursor-not-allowed">
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
