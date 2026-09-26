'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductSortSelect({ currentSort }: { currentSort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    if (newSort === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : '/products');
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="hidden sm:inline text-xs font-semibold text-slate-600">
        Sort:
      </label>
      <select
        id="sort-select"
        value={currentSort || 'newest'}
        onChange={(e) => handleSortChange(e.target.value)}
        className="bg-white border border-slate-200 text-xs font-medium text-slate-800 rounded-xl px-3 py-2 outline-none focus:border-brand cursor-pointer shadow-xs"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Name: A to Z</option>
      </select>
    </div>
  );
}
