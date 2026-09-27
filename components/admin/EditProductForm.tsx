'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { updateProductAction } from '@/app/admin/(dashboard)/products/actions';
import ProductDeleteButton from '@/components/admin/ProductDeleteButton';
import { Loader2, AlertCircle, CheckCircle2, Sparkles, ExternalLink, ArrowLeft } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '@/lib/categories-data';

interface EditProductFormProps {
  product: any;
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
}

export default function EditProductForm({ product, categories, brands }: EditProductFormProps) {
  const router = useRouter();
  const availableCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initialImageUrl = product.images?.[0]?.url || '';
  const [name, setName] = useState(product.name || '');
  const [slug, setSlug] = useState(product.slug || '');
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [imageError, setImageError] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
  };

  const generateSlugFromName = () => {
    const generatedSlug = name
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
    const result = await updateProductAction(product.id, formData);

    if (result && result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess('Product updated successfully!');
      setLoading(false);
      router.refresh();
      // Wait a moment then navigate back to products list
      setTimeout(() => {
        router.push('/admin/products');
      }, 700);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span className="font-medium">{error}</span>
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
            placeholder="e.g. HP ProBook 430 G8 Core i5 11th Gen"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-bold text-slate-700">URL Slug *</label>
            <button
              type="button"
              onClick={generateSlugFromName}
              className="text-[11px] font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer"
              title="Regenerate slug from current product name"
            >
              <Sparkles className="w-3 h-3" />
              <span>Regenerate</span>
            </button>
          </div>
          <input
            type="text"
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="hp-probook-430-g8"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono text-xs transition"
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
            defaultValue={product.sku}
            placeholder="DS-2CE10DF0T-F"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono transition"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Barcode (Optional)</label>
          <input
            type="text"
            name="barcode"
            defaultValue={product.barcode || ''}
            placeholder="6941264000000"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono transition"
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
            defaultValue={product.categoryId}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand cursor-pointer transition"
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
            defaultValue={product.brandId || ''}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand cursor-pointer transition"
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
            defaultValue={Number(product.sellingPrice)}
            placeholder="2500"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-bold text-slate-900 transition"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Regular / Compare Price</label>
          <input
            type="number"
            step="0.01"
            name="compareAtPrice"
            defaultValue={product.compareAtPrice ? Number(product.compareAtPrice) : ''}
            placeholder="2800"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Cost Price (Confidential)</label>
          <input
            type="number"
            step="0.01"
            name="costPrice"
            defaultValue={product.costPrice ? Number(product.costPrice) : ''}
            placeholder="2100"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition"
          />
        </div>
      </div>

      {/* Row 5: Stock & Threshold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-bold text-slate-700">Stock Quantity *</label>
            <Link
              href={`/admin/inventory?productId=${product.id}`}
              className="text-[11px] font-semibold text-brand hover:underline"
              target="_blank"
            >
              View Inventory Ledger &rarr;
            </Link>
          </div>
          <input
            type="number"
            name="stock"
            required
            defaultValue={product.stock}
            min="0"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-bold text-slate-900 transition"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Updating stock will log an automatic adjustment entry in the inventory ledger.
          </p>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Low Stock Warning Threshold</label>
          <input
            type="number"
            name="lowStockThreshold"
            defaultValue={product.lowStockThreshold}
            min="0"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition"
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
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImageError(false);
            }}
            placeholder="https://example.com/image.jpg"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition"
          />
          {imageUrl && !imageError && (
            <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
              <div className="relative w-14 h-14 bg-white rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                <span className="font-semibold text-slate-700 block">Image Preview</span>
                <span className="truncate">{imageUrl}</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Warranty Information</label>
          <input
            type="text"
            name="warrantyInfo"
            defaultValue={product.warrantyInfo || ''}
            placeholder="e.g. 1 Year Official Brand Warranty"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition"
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
          defaultValue={product.description}
          placeholder="Write key features, technical specifications, and description here..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-brand leading-relaxed transition"
        />
      </div>

      {/* Row 8: Catalog Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product.isActive}
            className="w-4 h-4 text-brand rounded"
          />
          <span>Active in Catalog</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={product.isFeatured}
            className="w-4 h-4 text-brand rounded"
          />
          <span>Featured Product</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
          <input
            type="checkbox"
            name="isNewArrival"
            defaultChecked={product.isNewArrival}
            className="w-4 h-4 text-brand rounded"
          />
          <span>New Arrival</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
          <input
            type="checkbox"
            name="isBestSeller"
            defaultChecked={product.isBestSeller}
            className="w-4 h-4 text-brand rounded"
          />
          <span>Best Seller</span>
        </label>
      </div>

      {/* Form Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <ProductDeleteButton
            productId={product.id}
            productName={product.name}
            variant="button"
            redirectOnDelete="/admin/products"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm transition text-center"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="bg-brand hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
