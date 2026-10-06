'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProductAction } from '@/app/admin/(dashboard)/products/actions';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '@/lib/categories-data';

interface NewProductFormProps {
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
}

export default function NewProductForm({ categories, brands }: NewProductFormProps) {
  const router = useRouter();
  const availableCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createProductAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess('Product created successfully!');
      setLoading(false);
      setTimeout(() => {
        router.push('/admin/products');
      }, 700);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {/* Row 1: Basic Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Product Name *</label>
          <input
            type="text"
            name="name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Hikvision 2MP ColorVu Bullet Camera"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">URL Slug *</label>
          <input
            type="text"
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="hikvision-2mp-colorvu-bullet-camera"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono text-xs"
          />
        </div>
      </div>

      {/* Row 2: SKU & Barcode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">SKU Code (Unique) *</label>
          <input
            type="text"
            name="sku"
            required
            placeholder="DS-2CE10DF0T-F"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Barcode (Optional)</label>
          <input
            type="text"
            name="barcode"
            placeholder="6941264000000"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono"
          />
        </div>
      </div>

      {/* Row 3: Category & Brand */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Category *</label>
          <select
            name="categoryId"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand cursor-pointer"
          >
            <option value="">Select Category</option>
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Brand (Optional)</label>
          <select
            name="brandId"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand cursor-pointer"
          >
            <option value="">Select Brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: Pricing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Selling Price (BDT) *</label>
          <input
            type="number"
            step="0.01"
            name="sellingPrice"
            required
            placeholder="2500"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-bold text-slate-900"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Regular / Compare Price</label>
          <input
            type="number"
            step="0.01"
            name="compareAtPrice"
            placeholder="2800"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Cost Price (Confidential)</label>
          <input
            type="number"
            step="0.01"
            name="costPrice"
            placeholder="2100"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Row 5: Stock & Threshold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Initial Stock Quantity *</label>
          <input
            type="number"
            name="stock"
            required
            defaultValue="10"
            min="0"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-bold text-slate-900"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Low Stock Warning Threshold</label>
          <input
            type="number"
            name="lowStockThreshold"
            defaultValue="3"
            min="0"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Row 6: Image URL & Warranty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Product Image URL</label>
          <input
            type="url"
            name="imageUrl"
            placeholder="https://example.com/image.jpg"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Warranty Information</label>
          <input
            type="text"
            name="warrantyInfo"
            placeholder="e.g. 1 Year Official Brand Warranty"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Row 7: Description */}
      <div>
        <label className="block font-bold text-slate-700 mb-1.5">Product Detailed Description *</label>
        <textarea
          name="description"
          required
          rows={5}
          placeholder="Write key features, technical specifications, and description here..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-brand leading-relaxed"
        />
      </div>

      {/* Row 8: Toggles */}
      <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
          <input type="checkbox" name="isActive" defaultChecked className="w-4 h-4 text-brand rounded" />
          <span>Active in Store Catalog</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
          <input type="checkbox" name="isFeatured" className="w-4 h-4 text-brand rounded" />
          <span>Show as Featured on Homepage</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving Product...</span>
          </>
        ) : (
          <span>Save Product to Catalog</span>
        )}
      </button>
    </form>
  );
}
export { NewProductForm };
