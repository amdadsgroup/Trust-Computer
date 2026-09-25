'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompare } from '@/components/compare/CompareContext';
import { X, GitCompare, ChevronRight } from 'lucide-react';

export default function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare, compareCount, maxCompare } = useCompare();

  if (compareCount === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Compare Icon + Count */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="p-2 rounded-lg bg-brand/10 text-brand-600">
              <GitCompare className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-black text-slate-900">Compare Products</p>
              <p className="text-[10px] text-slate-500">{compareCount}/{maxCompare} selected</p>
            </div>
          </div>

          {/* Product Thumbnails */}
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            {compareItems.map((product) => (
              <div
                key={product.id}
                className="relative flex-shrink-0 w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden group"
              >
                {product.images?.[0]?.url ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-[8px] font-mono text-center leading-tight p-1">
                    {product.name.slice(0, 10)}
                  </div>
                )}

                {/* Remove on hover */}
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  title={`Remove ${product.name} from comparison`}
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: maxCompare - compareCount }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-12 h-12 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center"
              >
                <span className="text-slate-300 text-xs">+</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={clearCompare}
              className="text-xs text-slate-400 hover:text-rose-500 transition px-2 py-1.5 rounded-lg hover:bg-rose-50 hidden sm:flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>

            <Link
              href="/compare"
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                compareCount >= 2
                  ? 'bg-brand hover:bg-brand-700 text-white'
                  : 'bg-slate-200 text-slate-400 pointer-events-none cursor-not-allowed'
              }`}
            >
              <span>Compare Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
