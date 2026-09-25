'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Check, RotateCcw } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface MobileFilterDrawerProps {
  categories: Category[];
  brands: Brand[];
  currentCategory?: string;
  currentBrand?: string;
  inStockOnly?: string;
  totalCount: number;
}

export default function MobileFilterDrawer({
  categories,
  brands,
  currentCategory,
  currentBrand,
  inStockOnly,
  totalCount,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(currentCategory || null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(currentBrand || null);
  const [selectedInStock, setSelectedInStock] = useState<boolean>(inStockOnly === 'true');

  const activeFilterCount =
    (selectedCategory ? 1 : 0) + (selectedBrand ? 1 : 0) + (selectedInStock ? 1 : 0);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory) params.set('category', selectedCategory);
    else params.delete('category');

    if (selectedBrand) params.set('brand', selectedBrand);
    else params.delete('brand');

    if (selectedInStock) params.set('inStockOnly', 'true');
    else params.delete('inStockOnly');

    params.delete('page');

    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedInStock(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('brand');
    params.delete('inStockOnly');
    params.delete('page');

    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex lg:hidden items-center justify-center gap-2 bg-white text-slate-800 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm active:bg-slate-50 transition"
      >
        <SlidersHorizontal className="w-4 h-4 text-[#0084d6]" />
        <span>Filter Products</span>
        {activeFilterCount > 0 && (
          <span className="bg-[#0084d6] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Bottom Sheet Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#0084d6]" />
                <h3 className="font-bold text-sm text-slate-900">
                  Filter Catalog ({totalCount} items)
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full active:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Category Filter */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition ${
                      selectedCategory === null
                        ? 'bg-[#0084d6] text-white font-bold'
                        : 'bg-slate-100 text-slate-700 active:bg-slate-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`px-3 py-1.5 rounded-xl font-medium transition ${
                        selectedCategory === cat.slug
                          ? 'bg-[#0084d6] text-white font-bold'
                          : 'bg-slate-100 text-slate-700 active:bg-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands Filter */}
              {brands.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                    Brand
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedBrand(null)}
                      className={`px-3 py-1.5 rounded-xl font-medium transition ${
                        selectedBrand === null
                          ? 'bg-[#0084d6] text-white font-bold'
                          : 'bg-slate-100 text-slate-700 active:bg-slate-200'
                      }`}
                    >
                      All Brands
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBrand(b.slug)}
                        className={`px-3 py-1.5 rounded-xl font-medium transition ${
                          selectedBrand === b.slug
                            ? 'bg-[#0084d6] text-white font-bold'
                            : 'bg-slate-100 text-slate-700 active:bg-slate-200'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status Filter */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Availability
                </h4>
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedInStock}
                    onChange={(e) => setSelectedInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0084d6] focus:ring-[#0084d6]"
                  />
                  <span className="font-semibold text-slate-800">
                    Show only products currently in stock
                  </span>
                </label>
              </div>
            </div>

            {/* Bottom Actions Bar with Safe Area */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                onClick={handleClear}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs active:bg-slate-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
              <button
                onClick={handleApply}
                className="flex-[2] flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#0084d6] text-white font-bold text-xs shadow-md active:bg-[#0074be]"
              >
                <Check className="w-4 h-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
