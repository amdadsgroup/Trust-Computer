'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompare } from '@/components/compare/CompareContext';
import { useCart } from '@/components/cart/CartContext';
import {
  X,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  GitCompare,
  PackageOpen,
} from 'lucide-react';

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();

  if (compareItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
            <GitCompare className="w-10 h-10 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">No Products to Compare</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Browse our catalog and add up to 4 products using the "Compare" button on each product.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-brand text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-brand-700 transition shadow-md"
          >
            <PackageOpen className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Collect all unique spec keys across compared products
  const allSpecGroups = new Map<string, Set<string>>();
  compareItems.forEach((product) => {
    product.specifications?.forEach((spec) => {
      if (!allSpecGroups.has(spec.group)) {
        allSpecGroups.set(spec.group, new Set());
      }
      allSpecGroups.get(spec.group)!.add(spec.key);
    });
  });

  const getSpecValue = (product: (typeof compareItems)[0], group: string, key: string) => {
    return product.specifications?.find((s) => s.group === group && s.key === key)?.value;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition text-slate-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Product Comparison
              </h1>
              <p className="text-xs text-slate-500">
                Comparing {compareItems.length} product{compareItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={clearCompare}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition"
          >
            <X className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>

        {/* Comparison Table — Scrollable on mobile */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full min-w-[640px] text-sm">
            {/* Product Headers */}
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-40 bg-slate-50/80">
                  Product
                </th>
                {compareItems.map((product) => (
                  <th key={product.id} className="px-4 py-4 align-top">
                    <div className="space-y-3">
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove
                      </button>

                      {/* Product Image */}
                      <Link href={`/products/${product.slug}`} className="block">
                        <div className="relative w-full pt-[75%] bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-contain p-2"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="text-left space-y-1">
                        {product.brand && (
                          <p className="text-xs text-brand-600 font-semibold">{product.brand.name}</p>
                        )}
                        <Link href={`/products/${product.slug}`} className="block">
                          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-brand-700 transition">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-lg font-black text-slate-900">
                          ৳{Number(product.sellingPrice).toLocaleString('en-BD')}
                        </p>
                        {product.compareAtPrice && product.compareAtPrice > product.sellingPrice && (
                          <p className="text-xs text-slate-400 line-through">
                            ৳{Number(product.compareAtPrice).toLocaleString('en-BD')}
                          </p>
                        )}
                      </div>

                      {/* Add to Cart */}
                      <button
                        onClick={() =>
                          addItem({
                            productId: product.id,
                            name: product.name,
                            slug: product.slug,
                            sku: product.sku,
                            price: Number(product.sellingPrice),
                            image: product.images?.[0]?.url,
                            stock: product.stock,
                            warranty: product.warrantyInfo ?? undefined,
                          })
                        }
                        disabled={product.stock <= 0}
                        className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-700 text-white font-bold text-xs py-2.5 rounded-xl transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Stock Row */}
              <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td className="px-5 py-3 text-xs font-semibold text-slate-500 bg-slate-50/50 whitespace-nowrap">
                  Availability
                </td>
                {compareItems.map((product) => (
                  <td key={product.id} className="px-4 py-3 text-center">
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        In Stock ({product.stock})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                        <XCircle className="w-3.5 h-3.5" />
                        Out of Stock
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Warranty Row */}
              <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td className="px-5 py-3 text-xs font-semibold text-slate-500 bg-slate-50/50 whitespace-nowrap">
                  Warranty
                </td>
                {compareItems.map((product) => (
                  <td key={product.id} className="px-4 py-3 text-center text-xs text-slate-700">
                    {product.warrantyInfo || <span className="text-slate-300">—</span>}
                  </td>
                ))}
              </tr>

              {/* Category Row */}
              <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td className="px-5 py-3 text-xs font-semibold text-slate-500 bg-slate-50/50 whitespace-nowrap">
                  Category
                </td>
                {compareItems.map((product) => (
                  <td key={product.id} className="px-4 py-3 text-center text-xs text-slate-700">
                    {product.category?.name || <span className="text-slate-300">—</span>}
                  </td>
                ))}
              </tr>

              {/* SKU Row */}
              <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td className="px-5 py-3 text-xs font-semibold text-slate-500 bg-slate-50/50 whitespace-nowrap">
                  SKU
                </td>
                {compareItems.map((product) => (
                  <td key={product.id} className="px-4 py-3 text-center text-xs font-mono text-slate-500">
                    {product.sku}
                  </td>
                ))}
              </tr>

              {/* Specification Rows */}
              {Array.from(allSpecGroups.entries()).map(([group, keys]) => (
                <React.Fragment key={group}>
                  {/* Group Header Row */}
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <td
                      colSpan={compareItems.length + 1}
                      className="px-5 py-2 text-xs font-black text-slate-600 uppercase tracking-wider"
                    >
                      {group}
                    </td>
                  </tr>

                  {/* Spec Key Rows */}
                  {Array.from(keys).map((key) => {
                    const values = compareItems.map((p) => getSpecValue(p, group, key));
                    const uniqueValues = new Set(values.filter(Boolean));
                    const allSame = uniqueValues.size <= 1;

                    return (
                      <tr
                        key={key}
                        className={`border-b border-slate-50 hover:bg-slate-50/50 transition ${
                          !allSame ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <td className="px-5 py-3 text-xs font-semibold text-slate-500 bg-slate-50/50 whitespace-nowrap">
                          {key}
                          {!allSame && (
                            <span className="ml-1 text-amber-500 text-[10px]">differs</span>
                          )}
                        </td>
                        {compareItems.map((product) => {
                          const value = getSpecValue(product, group, key);
                          return (
                            <td key={product.id} className="px-4 py-3 text-center text-xs text-slate-700">
                              {value || <span className="text-slate-300">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}

              {allSpecGroups.size === 0 && (
                <tr>
                  <td
                    colSpan={compareItems.length + 1}
                    className="px-5 py-6 text-center text-xs text-slate-400"
                  >
                    No detailed specifications available for these products.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Specifications are highlighted in amber when values differ between products.
        </p>
      </div>
    </div>
  );
}
