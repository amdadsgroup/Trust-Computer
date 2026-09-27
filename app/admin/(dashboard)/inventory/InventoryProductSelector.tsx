'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Package, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

interface InventoryProductSelectorProps {
  defaultProductId?: string;
}

export default function InventoryProductSelector({ defaultProductId }: InventoryProductSelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load default product if productId provided via URL
  useEffect(() => {
    if (!defaultProductId) return;
    fetch(`/api/admin/products-search?q=${defaultProductId}&limit=1`)
      .then((r) => r.json())
      .then((data) => {
        if (data.products?.length > 0) {
          // Try to match by ID
          const match = data.products.find((p: Product) => p.id === defaultProductId);
          if (match) setSelected(match);
        }
      })
      .catch(() => {});
  }, [defaultProductId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/products-search?q=${encodeURIComponent(q)}&limit=20`);
        const data = await res.json();
        setResults(data.products || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 1) {
      search(val);
    } else if (val.length === 0) {
      // Show recent products when empty
      search('');
    }
  };

  const handleSelect = (product: Product) => {
    setSelected(product);
    setQuery('');
    setOpen(false);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    setResults([]);
  };

  const handleFocus = () => {
    if (!selected) {
      search(query);
    }
  };

  return (
    <div>
      <label className="block font-bold text-slate-700 mb-1">Select Product *</label>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name="productId"
        value={selected?.id || ''}
        required
      />

      <div ref={containerRef} className="relative">
        {selected ? (
          // Selected state — show product card
          <div className="w-full bg-slate-50 border border-brand/30 rounded-xl px-3 py-2.5 flex items-center justify-between">
            <div className="min-w-0">
              <p className="font-bold text-slate-800 text-xs truncate">{selected.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                SKU: {selected.sku} · Stock: {selected.stock}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          // Search input
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              placeholder="Search product by name or SKU..."
              autoComplete="off"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 outline-none focus:border-brand text-xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-brand/40 border-t-brand rounded-full animate-spin" />
            )}
          </div>
        )}

        {/* Dropdown results */}
        {open && !selected && results.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="max-h-52 overflow-y-auto">
              {results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  className="w-full text-left px-3 py-2.5 hover:bg-brand/5 transition flex items-center gap-2 border-b border-slate-50 last:border-0"
                >
                  <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-xs truncate">{product.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      SKU: {product.sku} · Stock: {product.stock}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {open && !selected && results.length === 0 && !loading && query.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg p-4 text-center text-xs text-slate-400">
            No products found for &quot;{query}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
