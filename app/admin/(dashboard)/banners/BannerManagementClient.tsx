'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  createBannerAction,
  updateBannerAction,
  deleteBannerAction,
  toggleBannerActiveAction,
  reorderBannersAction,
} from './actions';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Calendar,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface BannerData {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  desktopImageUrl: string;
  mobileImageUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  type: string;
  priority: number;
  startAt: Date | null;
  endAt: Date | null;
  isActive: boolean;
}

export default function BannerManagementClient({
  initialBanners,
}: {
  initialBanners: BannerData[];
}) {
  const [banners, setBanners] = useState<BannerData[]>(initialBanners);
  const [isModalOpen, setIsFormOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [desktopImageUrl, setDesktopImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [buttonUrl, setButtonUrl] = useState('');
  const [type, setType] = useState('PROMOTIONAL');
  const [priority, setPriority] = useState(0);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const resetForm = () => {
    setEditingBannerId(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setDesktopImageUrl('');
    setMobileImageUrl('');
    setButtonText('Shop Now');
    setButtonUrl('');
    setType('PROMOTIONAL');
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

  const openEditModal = (b: BannerData) => {
    setEditingBannerId(b.id);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setDescription(b.description || '');
    setDesktopImageUrl(b.desktopImageUrl);
    setMobileImageUrl(b.mobileImageUrl || '');
    setButtonText(b.buttonText || 'Shop Now');
    setButtonUrl(b.buttonUrl || '');
    setType(b.type);
    setPriority(b.priority);
    setStartAt(b.startAt ? new Date(b.startAt).toISOString().slice(0, 16) : '');
    setEndAt(b.endAt ? new Date(b.endAt).toISOString().slice(0, 16) : '');
    setIsActive(b.isActive);
    setFeedback(null);
    setIsFormOpen(true);
  };

  // Upload handler using /api/admin/upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'banners');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        if (isMobile) {
          setMobileImageUrl(data.url);
        } else {
          setDesktopImageUrl(data.url);
        }
        setFeedback({ type: 'success', message: 'Image uploaded successfully!' });
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
      subtitle: subtitle || undefined,
      description: description || undefined,
      desktopImageUrl,
      mobileImageUrl: mobileImageUrl || undefined,
      buttonText: buttonText || 'Shop Now',
      buttonUrl: buttonUrl || undefined,
      type: type as any,
      priority: Number(priority) || 0,
      startAt: startAt || undefined,
      endAt: endAt || undefined,
      isActive,
    };

    try {
      let result;
      if (editingBannerId) {
        result = await updateBannerAction(editingBannerId, payload);
      } else {
        result = await createBannerAction(payload);
      }

      if (result.success) {
        setIsFormOpen(false);
        window.location.reload();
      } else {
        setFeedback({ type: 'error', message: result.error || 'Failed to save banner' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    const result = await deleteBannerAction(id);
    if (result.success) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const nextState = !current;
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: nextState } : b))
    );
    await toggleBannerActiveAction(id, nextState);
  };

  const handleMove = async (index: number, direction: 'UP' | 'DOWN') => {
    const newBanners = [...banners];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBanners.length) return;

    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    setBanners(newBanners);
    await reorderBannersAction(newBanners.map((b) => b.id));
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Hero Carousel Banners
          </span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            Total Banners: {banners.length} | Active:{' '}
            <span className="text-emerald-600 font-extrabold">
              {banners.filter((b) => b.isActive).length}
            </span>
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Banner Cards List */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Banners Configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add promotional banners to appear on the storefront homepage carousel.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-[#0084d6] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Banner</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => {
            const isFirst = index === 0;
            const isLast = index === banners.length - 1;

            return (
              <div
                key={banner.id}
                className={`bg-white rounded-2xl p-5 border transition flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm ${
                  banner.isActive ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                }`}
              >
                {/* Left: Thumbnail & Banner Details */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMove(index, 'UP')}
                      disabled={isFirst}
                      title="Move Up"
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'DOWN')}
                      disabled={isLast}
                      title="Move Down"
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Image Preview */}
                  <div className="relative w-36 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0">
                    <Image
                      src={banner.desktopImageUrl}
                      alt={banner.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {banner.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {banner.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          banner.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {banner.subtitle && (
                      <p className="text-xs text-slate-500 truncate">{banner.subtitle}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                      <span>Priority: <strong>{banner.priority}</strong></span>
                      {banner.buttonUrl && (
                        <span className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          <span>Link: {banner.buttonUrl}</span>
                        </span>
                      )}
                      {(banner.startAt || banner.endAt) && (
                        <span className="flex items-center gap-1 text-amber-700 font-medium">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Schedule: {banner.startAt ? new Date(banner.startAt).toLocaleDateString() : 'Now'}{' '}
                            to {banner.endAt ? new Date(banner.endAt).toLocaleDateString() : 'Indefinite'}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 justify-end flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleToggleActive(banner.id, banner.isActive)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                      banner.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                    title={banner.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {banner.isActive ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Disabled</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Edit Banner"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">
                {editingBannerId ? 'Edit Homepage Banner' : 'Create New Homepage Banner'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banner Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Upgrade Your PC Today"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banner Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
                  >
                    <option value="PROMOTIONAL">Promotional Banner</option>
                    <option value="PRODUCT">Product Promotion</option>
                    <option value="CATEGORY">Category Banner</option>
                    <option value="ANNOUNCEMENT">Announcement Banner</option>
                    <option value="SEASONAL">Seasonal Campaign</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Latest computer components and accessories"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
                />
              </div>

              {/* Desktop Image Upload & Preview */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Desktop Banner Image *</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Image URL or upload below"
                    value={desktopImageUrl}
                    onChange={(e) => setDesktopImageUrl(e.target.value)}
                    className="flex-1 w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#0084d6] focus:bg-white transition"
                  />

                  <label className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 flex-shrink-0 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>

                {desktopImageUrl && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                    <Image
                      src={desktopImageUrl}
                      alt="Banner Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Mobile Image Upload (Optional) */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Mobile Banner Image (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="Mobile optimized image URL"
                    value={mobileImageUrl}
                    onChange={(e) => setMobileImageUrl(e.target.value)}
                    className="flex-1 w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#0084d6] focus:bg-white transition"
                  />
                  <label className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 flex-shrink-0 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Mobile</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* CTA Button & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Shop Now"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button URL / Link</label>
                  <input
                    type="text"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="e.g. /categories/cctv-surveillance"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Schedule Dates & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Priority</label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#0084d6] transition"
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
                    Activate banner immediately (Visible within schedule)
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
                  {isLoading ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
