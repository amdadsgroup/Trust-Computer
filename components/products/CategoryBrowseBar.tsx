'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Boxes,
  Camera,
  Laptop,
  Cpu,
  Wifi,
  Printer,
  Monitor,
  HardDrive,
  Zap,
  Keyboard,
  Gamepad2,
  Layers,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productCount?: number;
}

interface CategoryBrowseBarProps {
  categories: CategoryItem[];
  currentCategory?: string;
  totalProductsCount: number;
}

function getIcon(slug: string, name: string) {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();

  if (s.includes('cctv') || s.includes('security') || s.includes('camera') || s.includes('surveillance') || n.includes('cctv')) {
    return <Camera className="w-4 h-4 text-emerald-500" />;
  }
  if (s.includes('laptop') || s.includes('computer') || s.includes('notebook') || s.includes('desktop') || n.includes('laptop')) {
    return <Laptop className="w-4 h-4 text-brand-600" />;
  }
  if (s.includes('monitor') || s.includes('display')) {
    return <Monitor className="w-4 h-4 text-indigo-500" />;
  }
  if (s.includes('gaming')) {
    return <Gamepad2 className="w-4 h-4 text-rose-500" />;
  }
  if (s.includes('network') || s.includes('router') || s.includes('wifi')) {
    return <Wifi className="w-4 h-4 text-teal-500" />;
  }
  if (s.includes('power') || s.includes('electronic') || s.includes('ups')) {
    return <Zap className="w-4 h-4 text-amber-500" />;
  }
  if (s.includes('accessories') || s.includes('keyboard') || s.includes('mouse')) {
    return <Keyboard className="w-4 h-4 text-sky-500" />;
  }

  return <Boxes className="w-4 h-4 text-brand-600" />;
}

export default function CategoryBrowseBar({
  categories,
  currentCategory,
  totalProductsCount,
}: CategoryBrowseBarProps) {
  const { t, isBangla } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);

  const activeCategoryObj = categories.find((c) => c.slug === currentCategory);

  const makeCategoryUrl = (slug: string | null) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.delete('page'); // reset pagination
    const qs = params.toString();
    return qs ? `/products?${qs}` : '/products';
  };

  return (
    <div className="space-y-3">
      {/* 1. Category Bar Header & Directory Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-brand" />
          <span>{isBangla ? 'ক্যাটাগরি অনুযায়ী ব্রাউজ করুন' : 'Browse by Category'}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowDirectoryModal(true)}
          className="text-xs font-semibold text-brand hover:text-brand-700 flex items-center gap-1 transition"
        >
          <span>{isBangla ? 'সকল ক্যাটাগরি তালিকা' : 'All Categories Directory'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Scrollable Category Chips Carousel */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* All Products Chip */}
          <Link
            href={makeCategoryUrl(null)}
            className={`snap-start shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs border ${
              !currentCategory
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-slate-50'
            }`}
          >
            <Boxes className={`w-4 h-4 ${!currentCategory ? 'text-white' : 'text-slate-500'}`} />
            <span>{isBangla ? 'সকল পণ্য' : 'All Products'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                !currentCategory ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {totalProductsCount}
            </span>
          </Link>

          {/* Individual Category Chips */}
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <Link
                key={cat.id || cat.slug}
                href={makeCategoryUrl(cat.slug)}
                className={`snap-start shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs border ${
                  isSelected
                    ? 'bg-brand text-white border-brand shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                }`}
              >
                <span className={isSelected ? '[&_svg]:text-white' : ''}>
                  {getIcon(cat.slug, cat.name)}
                </span>
                <span>{cat.name}</span>
                {cat.productCount !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat.productCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Active Category Banner (if filtered) */}
      {activeCategoryObj && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 [&_svg]:w-5 [&_svg]:h-5 [&_svg]:text-sky-300">
              {getIcon(activeCategoryObj.slug, activeCategoryObj.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-sky-300 bg-white/10 px-2 py-0.5 rounded">
                  {isBangla ? 'নির্বাচিত ক্যাটাগরি' : 'Selected Category'}
                </span>
                {activeCategoryObj.productCount !== undefined && (
                  <span className="text-xs text-slate-300">
                    {activeCategoryObj.productCount} {isBangla ? 'টি পণ্য' : 'Products'}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {activeCategoryObj.name}
              </h2>
              {activeCategoryObj.description && (
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                  {activeCategoryObj.description}
                </p>
              )}
            </div>
          </div>

          <Link
            href={makeCategoryUrl(null)}
            className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/20"
          >
            <X className="w-3.5 h-3.5" />
            <span>{isBangla ? 'সকল পণ্য দেখুন' : 'View All Products'}</span>
          </Link>
        </div>
      )}

      {/* 4. Full Category Directory Modal (if opened) */}
      {showDirectoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand" />
                  <span>{isBangla ? 'সকল পণ্য ক্যাটাগরি তালিকা' : 'All Product Categories'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBangla
                    ? 'যেকোনো ক্যাটাগরিতে ক্লিক করে সরাসরি সেই ক্যাটাগরির পণ্যসমূহ ব্রাউজ করুন।'
                    : 'Select any category to browse models and available inventory.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDirectoryModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Categories Grid */}
            <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* All products button card */}
              <Link
                href={makeCategoryUrl(null)}
                onClick={() => setShowDirectoryModal(false)}
                className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  !currentCategory
                    ? 'bg-blue-50 border-brand'
                    : 'bg-slate-50 border-slate-200 hover:border-brand-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
                    <Boxes className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {isBangla ? 'সকল পণ্য (All Products)' : 'All Products'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isBangla ? 'সম্পূর্ণ স্টোর ক্যাটালগ ব্রাউজ করুন' : 'Browse the complete store catalog'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand bg-white px-2.5 py-1 rounded-full border border-slate-200">
                  {totalProductsCount}
                </span>
              </Link>

              {/* Category card items */}
              {categories.map((cat) => {
                const isSelected = currentCategory === cat.slug;
                return (
                  <Link
                    key={cat.id || cat.slug}
                    href={makeCategoryUrl(cat.slug)}
                    onClick={() => setShowDirectoryModal(false)}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50 border-brand'
                        : 'bg-slate-50 border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0">
                        {getIcon(cat.slug, cat.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{cat.name}</h4>
                        {cat.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">{cat.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200 shrink-0">
                      {cat.productCount ?? 0}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowDirectoryModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                {isBangla ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
