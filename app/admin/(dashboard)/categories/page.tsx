import React from 'react';
import prisma from '@/lib/db';
import { createCategoryAction, createBrandAction } from './actions';
import { Layers, Plus, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  let categories: any[] = [];
  let brands: any[] = [];

  try {
    const [fetchedCategories, fetchedBrands] = await Promise.all([
      prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      prisma.brand.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
    ]);
    categories = fetchedCategories;
    brands = fetchedBrands;
  } catch (error) {
    console.error('Error fetching categories/brands:', error);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          ক্যাটাগরি ও ব্র্যান্ড ব্যবস্থাপনা
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          পণ্য সুবিন্যস্ত করতে ক্যাটাগরি ও ব্র্যান্ড যুক্ত এবং পরিচালনা করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand" />
              <span>নতুন ক্যাটাগরি যোগ করুন</span>
            </h2>

            <form
              action={async (formData: FormData) => {
                'use server';
                await createCategoryAction(formData);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরির নাম *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="যেমন: সিসিটিভি ক্যামেরা ও অ্যাক্সেসরিজ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL স্লাগ *</label>
                <input
                  type="text"
                  name="slug"
                  required
                  placeholder="cctv-cameras-accessories"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">বিবরণ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  name="description"
                  placeholder="সংক্ষিপ্ত বিবরণী"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow text-xs"
              >
                ক্যাটাগরি যুক্ত করুন
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
              বিদ্যমান ক্যাটাগরি তালিকা ({categories.length})
            </h3>
            <div className="space-y-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-800">{c.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">slug: {c.slug}</span>
                  </div>
                  <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[11px]">
                    {c._count.products} টি পণ্য
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brands Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>নতুন ব্র্যান্ড যোগ করুন</span>
            </h2>

            <form
              action={async (formData: FormData) => {
                'use server';
                await createBrandAction(formData);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">ব্র্যান্ডের নাম *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="যেমন: Hikvision অথবা TP-Link"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL স্লাগ *</label>
                <input
                  type="text"
                  name="slug"
                  required
                  placeholder="hikvision"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">বিবরণ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  name="description"
                  placeholder="সংক্ষিপ্ত বিবরণ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow text-xs"
              >
                ব্র্যান্ড যুক্ত করুন
              </button>
            </form>
          </div>

          {/* Brands List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
              বিদ্যমান ব্র্যান্ড তালিকা ({brands.length})
            </h3>
            <div className="space-y-2">
              {brands.map((b) => (
                <div
                  key={b.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-800">{b.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">slug: {b.slug}</span>
                  </div>
                  <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[11px]">
                    {b._count.products} টি পণ্য
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
