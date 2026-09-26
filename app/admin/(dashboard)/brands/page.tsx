import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { Tag, Plus, CheckCircle2, XCircle, Trash2, ArrowLeft } from 'lucide-react';
import { createBrandAction, toggleBrandStatusAction, deleteBrandAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminBrandsPage() {
  let brands: any[] = [];

  try {
    brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
            <Link href="/admin/categories" className="hover:text-brand flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> ক্যাটাগরি ব্যবস্থাপনা
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ব্র্যান্ড ব্যবস্থাপনা (Brand Management)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            পণ্য প্রস্তুতকারক ও ভেন্ডর ব্র্যান্ড তালিকা তৈরি এবং নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-brand rounded-xl border border-blue-200">
          মোট ব্র্যান্ড: {brands.length} টি
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Brand Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-6">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand" />
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
                  placeholder="যেমন: Hikvision, Dahua, Asus"
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
                <label className="block font-bold text-slate-700 mb-1">লোগো ইমেজ URL (ঐচ্ছিক)</label>
                <input
                  type="url"
                  name="logo"
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="ব্র্যান্ডের সংক্ষিপ্ত পরিচিতি"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow text-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                ব্র্যান্ড সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>

        {/* Brands List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">
                বিদ্যমান ব্র্যান্ডসমূহ ({brands.length})
              </h2>
            </div>

            {brands.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                কোনো ব্র্যান্ড পাওয়া যায়নি। বামপাশের ফর্ম থেকে নতুন ব্র্যান্ড যুক্ত করুন।
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {brands.map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                          {b.name}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">
                          {b.slug}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          b.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {b.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </div>
                      {b.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">{b.description}</p>
                      )}
                      <p className="text-[11px] text-slate-400">
                        সংযুক্ত পণ্য সংখ্যা: <strong className="text-slate-700">{b._count.products}</strong> টি
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <form
                        action={async () => {
                          'use server';
                          await toggleBrandStatusAction(b.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                        >
                          {b.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                        </button>
                      </form>

                      {b._count.products === 0 && (
                        <form
                          action={async () => {
                            'use server';
                            await deleteBrandAction(b.id);
                          }}
                        >
                          <button
                            type="submit"
                            title="মুছে ফেলুন"
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
