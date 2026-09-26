'use client';

import React, { useState } from 'react';
import {
  Layers,
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import {
  createCategoryAction,
  createBrandAction,
  deleteCategoryAction,
  deleteBrandAction,
} from './actions';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count: {
    products: number;
  };
}

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count: {
    products: number;
  };
}

interface Props {
  initialCategories: CategoryItem[];
  initialBrands: BrandItem[];
}

function slugify(text: string): string {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CategoriesManagementClient({
  initialCategories,
  initialBrands,
}: Props) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [brands, setBrands] = useState<BrandItem[]>(initialBrands);

  // Category form state
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categorySlugTouched, setCategorySlugTouched] = useState(false);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Brand form state
  const [brandName, setBrandName] = useState('');
  const [brandSlug, setBrandSlug] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandSlugTouched, setBrandSlugTouched] = useState(false);
  const [isSubmittingBrand, setIsSubmittingBrand] = useState(false);
  const [brandMessage, setBrandMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Auto-slugify for Category
  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCategoryName(val);
    if (!categorySlugTouched) {
      setCategorySlug(slugify(val));
    }
  };

  // Auto-slugify for Brand
  const handleBrandNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBrandName(val);
    if (!brandSlugTouched) {
      setBrandSlug(slugify(val));
    }
  };

  // Handle Category Submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setCategoryMessage({ type: 'error', text: 'Category name is required.' });
      return;
    }

    setIsSubmittingCategory(true);
    setCategoryMessage(null);

    const formData = new FormData();
    formData.append('name', categoryName.trim());
    formData.append('slug', (categorySlug || slugify(categoryName)).trim());
    formData.append('description', categoryDescription.trim());

    try {
      const res = await createCategoryAction(formData);
      if (res.error) {
        setCategoryMessage({ type: 'error', text: res.error });
      } else {
        setCategoryMessage({ type: 'success', text: 'Category created successfully!' });
        if (res.category) {
          setCategories((prev) => [
            {
              id: res.category.id,
              name: res.category.name,
              slug: res.category.slug,
              description: res.category.description,
              _count: { products: 0 },
            },
            ...prev,
          ]);
        }
        setCategoryName('');
        setCategorySlug('');
        setCategoryDescription('');
        setCategorySlugTouched(false);
        setTimeout(() => setCategoryMessage(null), 4000);
      }
    } catch (err: any) {
      setCategoryMessage({
        type: 'error',
        text: err?.message || 'Server error. Please try again.',
      });
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  // Handle Brand Submit
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setBrandMessage({ type: 'error', text: 'Brand name is required.' });
      return;
    }

    setIsSubmittingBrand(true);
    setBrandMessage(null);

    const formData = new FormData();
    formData.append('name', brandName.trim());
    formData.append('slug', (brandSlug || slugify(brandName)).trim());
    formData.append('description', brandDescription.trim());

    try {
      const res = await createBrandAction(formData);
      if (res.error) {
        setBrandMessage({ type: 'error', text: res.error });
      } else {
        setBrandMessage({ type: 'success', text: 'Brand created successfully!' });
        if (res.brand) {
          setBrands((prev) => [
            {
              id: res.brand.id,
              name: res.brand.name,
              slug: res.brand.slug,
              description: res.brand.description,
              _count: { products: 0 },
            },
            ...prev,
          ]);
        }
        setBrandName('');
        setBrandSlug('');
        setBrandDescription('');
        setBrandSlugTouched(false);
        setTimeout(() => setBrandMessage(null), 4000);
      }
    } catch (err: any) {
      setBrandMessage({
        type: 'error',
        text: err?.message || 'Server error. Please try again.',
      });
    } finally {
      setIsSubmittingBrand(false);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await deleteCategoryAction(id);
      if (res.error) {
        alert(res.error);
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Delete Brand
  const handleDeleteBrand = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete brand "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await deleteBrandAction(id);
      if (res.error) {
        alert(res.error);
      } else {
        setBrands((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to delete brand.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Categories Column */}
      <div className="space-y-6">
        {/* Create Category Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand" />
            <span>Create New Category</span>
          </h2>

          {/* Category Feedback Notification */}
          {categoryMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                categoryMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {categoryMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{categoryMessage.text}</div>
            </div>
          )}

          <form onSubmit={handleCategorySubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={handleCategoryNameChange}
                required
                placeholder="e.g. Laptop & Desktop"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                value={categorySlug}
                onChange={(e) => {
                  setCategorySlug(e.target.value);
                  setCategorySlugTouched(true);
                }}
                required
                placeholder="laptop-desktop"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand focus:bg-white transition font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Auto-generated using lowercase letters and hyphens
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Brief description of this category"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingCategory}
              className="w-full bg-[#1b2b7b] hover:bg-[#152365] disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl transition shadow text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmittingCategory ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Categories List Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Existing Categories ({categories.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No categories found. Fill in the form above to add one.
              </div>
            ) : (
              categories.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs transition"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{c.name}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      slug: {c.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[11px]">
                      {c._count?.products || 0} products
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      disabled={deletingId === c.id}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Brands Column */}
      <div className="space-y-6">
        {/* Create Brand Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Create New Brand</span>
          </h2>

          {/* Brand Feedback Notification */}
          {brandMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                brandMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {brandMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{brandMessage.text}</div>
            </div>
          )}

          <form onSubmit={handleBrandSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                value={brandName}
                onChange={handleBrandNameChange}
                required
                placeholder="e.g. HP, Asus, Hikvision"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                value={brandSlug}
                onChange={(e) => {
                  setBrandSlug(e.target.value);
                  setBrandSlugTouched(true);
                }}
                required
                placeholder="hp"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Auto-generated using lowercase letters and hyphens
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                placeholder="Brief description of this brand"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingBrand}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl transition shadow text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmittingBrand ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Brand</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Brands List Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Existing Brands ({brands.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {brands.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No brands found. Fill in the form above to add one.
              </div>
            ) : (
              brands.map((b) => (
                <div
                  key={b.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs transition"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{b.name}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      slug: {b.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[11px]">
                      {b._count?.products || 0} products
                    </span>
                    <button
                      onClick={() => handleDeleteBrand(b.id, b.name)}
                      disabled={deletingId === b.id}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
