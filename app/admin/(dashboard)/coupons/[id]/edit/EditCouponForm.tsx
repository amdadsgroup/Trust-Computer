'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Tag, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { updateCouponAction, deleteCouponAction } from '../../actions';

interface EditCouponFormProps {
  coupon: any;
}

export default function EditCouponForm({ coupon }: EditCouponFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [couponType, setCouponType] = useState(coupon.type);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateCouponAction(coupon.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/admin/coupons');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) return;
    setDeleting(true);
    const result = await deleteCouponAction(coupon.id);
    if (result.error) {
      setError(result.error);
      setDeleting(false);
    } else {
      router.push('/admin/coupons');
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/coupons"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Edit Coupon: <span className="font-mono text-brand">{coupon.code}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Update discount rules, limits, or validity period.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>{deleting ? 'Deleting...' : 'Delete Coupon'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm">
        {/* Row 1: Code & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Coupon Code *</label>
            <input
              type="text"
              name="code"
              required
              defaultValue={coupon.code}
              className="w-full uppercase font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Discount Type *</label>
            <select
              name="type"
              value={couponType}
              onChange={(e) => setCouponType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand cursor-pointer"
            >
              <option value="PERCENTAGE">Percentage (%) Discount</option>
              <option value="FIXED_AMOUNT">Fixed Amount (৳ BDT) Discount</option>
              <option value="FREE_DELIVERY">Free Delivery</option>
            </select>
          </div>
        </div>

        {/* Row 2: Discount Value & Max Cap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              {couponType === 'PERCENTAGE'
                ? 'Discount Percentage (%) *'
                : couponType === 'FIXED_AMOUNT'
                ? 'Discount Amount (৳ BDT) *'
                : 'Free Delivery (Value not needed)'}
            </label>
            <input
              type="number"
              step="0.01"
              name="value"
              required={couponType !== 'FREE_DELIVERY'}
              defaultValue={couponType === 'FREE_DELIVERY' ? '0' : Number(coupon.value)}
              disabled={couponType === 'FREE_DELIVERY'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-bold text-slate-900 disabled:opacity-50"
            />
          </div>

          {couponType === 'PERCENTAGE' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Maximum Discount Cap (৳ BDT)</label>
              <input
                type="number"
                step="0.01"
                name="maximumDiscount"
                defaultValue={coupon.maximumDiscount ? Number(coupon.maximumDiscount) : ''}
                placeholder="e.g. 500 (Optional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
              />
            </div>
          )}
        </div>

        {/* Row 3: Minimum Order & Usage Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Minimum Order Amount (৳)</label>
            <input
              type="number"
              step="0.01"
              name="minimumOrderValue"
              defaultValue={coupon.minimumOrderValue ? Number(coupon.minimumOrderValue) : ''}
              placeholder="e.g. 1000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Total Usage Limit</label>
            <input
              type="number"
              name="usageLimit"
              defaultValue={coupon.usageLimit ?? ''}
              placeholder="e.g. 100 (Blank = Unlimited)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Per-Customer Limit</label>
            <input
              type="number"
              name="usageLimitPerUser"
              defaultValue={coupon.usageLimitPerUser}
              min="1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Row 4: Validity Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Start Date & Time</label>
            <input
              type="datetime-local"
              name="startAt"
              defaultValue={formatDateTime(coupon.startAt)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Expiry Date & Time</label>
            <input
              type="datetime-local"
              name="endAt"
              defaultValue={formatDateTime(coupon.endAt)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Row 5: Description */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Description</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={coupon.description || ''}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-brand"
          />
        </div>

        {/* Row 6: Active Status */}
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={coupon.isActive}
            className="w-4 h-4 text-brand rounded"
          />
          <span>Active in store</span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            href="/admin/coupons"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Tag className="w-4 h-4" />
                <span>Update Coupon</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
