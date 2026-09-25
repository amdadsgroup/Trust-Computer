'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  createOfferAction,
  updateOfferAction,
  deleteOfferAction,
  toggleOfferActiveAction,
} from '@/app/admin/(dashboard)/offers/actions';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Gift,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Tag,
  Eye,
  EyeOff,
} from 'lucide-react';

interface OfferData {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  badge: string | null;
  discountType: string;
  discountValue: number | null;
  productId: string | null;
  categoryId: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  priority: number;
  startAt: Date | null;
  endAt: Date | null;
  isActive: boolean;
  product?: { id: string; name: string; sku: string } | null;
  category?: { id: string; name: string } | null;
}

export default function OffersManagementClient({
  initialOffers,
  products,
  categories,
}: {
  initialOffers: OfferData[];
  products: { id: string; name: string; sku: string; sellingPrice: number }[];
  categories: { id: string; name: string; slug: string }[];
}) {
  const [offers, setOffers] = useState<OfferData[]>(initialOffers);
  const [isModalOpen, setIsFormOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('HOT DEAL');
  const [discountType, setDiscountType] = useState('PROMOTIONAL_ONLY');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [productId, setProductId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [buttonText, setButtonText] = useState('View Offer');
  const [buttonUrl, setButtonUrl] = useState('');
  const [priority, setPriority] = useState(0);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const resetForm = () => {
    setEditingOfferId(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setBadge('HOT DEAL');
    setDiscountType('PROMOTIONAL_ONLY');
    setDiscountValue('');
    setProductId('');
    setCategoryId('');
    setButtonText('View Offer');
    setButtonUrl('');
    setPriority(0);
    setStartAt('');
    setEndAt('');
    setIsActive(true);
    setFeedback(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditModal = (o: OfferData) => {
    setEditingOfferId(o.id);
    setTitle(o.title);
    setDescription(o.description || '');
    setImageUrl(o.imageUrl || '');
    setBadge(o.badge || 'HOT DEAL');
    setDiscountType(o.discountType);
    setDiscountValue(o.discountValue !== null ? String(o.discountValue) : '');
    setProductId(o.productId || '');
    setCategoryId(o.categoryId || '');
    setButtonText(o.buttonText || 'View Offer');
    setButtonUrl(o.buttonUrl || '');
    setPriority(o.priority);
    setStartAt(o.startAt ? new Date(o.startAt).toISOString().slice(0, 16) : '');
    setEndAt(o.endAt ? new Date(o.endAt).toISOString().slice(0, 16) : '');
    setIsActive(o.isActive);
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'offers');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
        setFeedback({ type: 'success', message: 'Offer image uploaded successfully!' });
      } else {
        setFeedback({ type: 'error', message: data.error || 'Upload failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to upload image' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const payload = {
      title,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      badge: badge || undefined,
      discountType: discountType as any,
      discountValue: discountValue ? Number(discountValue) : undefined,
      productId: productId || undefined,
      categoryId: categoryId || undefined,
      buttonText: buttonText || 'View Offer',
      buttonUrl: buttonUrl || undefined,
      priority: Number(priority) || 0,
      startAt: startAt || undefined,
      endAt: endAt || undefined,
      isActive,
    };

    try {
      let result;
      if (editingOfferId) {
        result = await updateOfferAction(editingOfferId, payload);
      } else {
        result = await createOfferAction(payload);
      }

      if (result.success) {
        setIsFormOpen(false);
        window.location.reload();
      } else {
        setFeedback({ type: 'error', message: result.error || 'Failed to save offer' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional offer?')) return;
    const result = await deleteOfferAction(id);
    if (result.success) {
      setOffers((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const nextState = !current;
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, isActive: nextState } : o))
    );
    await toggleOfferActiveAction(id, nextState);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Storefront Promotional Offers
          </span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            Total Offers: {offers.length} | Active:{' '}
            <span className="text-emerald-600 font-extrabold">
              {offers.filter((o) => o.isActive).length}
            </span>
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Offer</span>
        </button>
      </div>

      {/* Offers Cards Grid */}
      {offers.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-3">
          <Gift className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Offers Created</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create limited-time promotions, discount highlights, or product campaign banners.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-[#0084d6] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Offer</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white rounded-2xl p-5 border transition flex flex-col justify-between gap-4 shadow-sm ${
                offer.isActive ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                {offer.imageUrl ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                    <Image
                      src={offer.imageUrl}
                      alt={offer.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0 text-orange-600">
                    <Gift className="w-8 h-8" />
                  </div>
                )}

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {offer.badge && (
                      <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        {offer.badge}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        offer.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 truncate">
                    {offer.title}
                  </h3>

                  {offer.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{offer.description}</p>
                  )}

                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                    {offer.product && (
                      <p className="truncate">
                        <strong>Product:</strong> {offer.product.name}
                      </p>
                    )}
                    {offer.category && (
                      <p>
                        <strong>Category:</strong> {offer.category.name}
                      </p>
                    )}
                    {offer.discountValue && (
                      <p className="text-emerald-700 font-bold">
                        Discount: {offer.discountValue}{' '}
                        {offer.discountType === 'PERCENTAGE' ? '%' : 'BDT'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  Priority: <strong>{offer.priority}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(offer.id, offer.isActive)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                      offer.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {offer.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{offer.isActive ? 'Active' : 'Inactive'}</span>
                  </button>

                  <button
                    onClick={() => openEditModal(offer)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">
                {editingOfferId ? 'Edit Promotional Offer' : 'Create New Promotional Offer'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CCTV Surveillance Security Bundle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief promotional copy..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#0084d6] focus:bg-white transition"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Offer Image</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="Image URL or upload below"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#0084d6] focus:bg-white transition"
                  />
                  <label className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 flex-shrink-0 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Badge & Discount Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Promotional Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. HOT DEAL, 15% OFF"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#0084d6] transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#0084d6] transition"
                  >
                    <option value="PROMOTIONAL_ONLY">Promotional Display Only</option>
                    <option value="PERCENTAGE">Percentage (%) Discount</option>
                    <option value="FIXED">Fixed Amount (BDT) Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    placeholder="e.g. 10 or 500"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#0084d6] transition"
                  />
                </div>
              </div>

              {/* Associations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Associated Product (Optional)</label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#0084d6] transition"
                  >
                    <option value="">-- No Specific Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) - ৳{p.sellingPrice}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Associated Category (Optional)</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#0084d6] transition"
                  >
                    <option value="">-- No Specific Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Button & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. View Offer"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination URL</label>
                  <input
                    type="text"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="e.g. /products?offer=true"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] transition"
                  />
                </div>
              </div>

              {/* Priority & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Priority</label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0084d6] transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date/Time</label>
                  <input
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0084d6] transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date/Time</label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0084d6] transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0084d6] focus:ring-[#0084d6]"
                  />
                  <span className="font-bold text-slate-800">
                    Activate offer immediately (Visible during schedule)
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="bg-[#0084d6] hover:bg-[#0074be] text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
