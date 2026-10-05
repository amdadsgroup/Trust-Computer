'use client';

import React, { useState } from 'react';
import { verifyPaymentAction, rejectPaymentAction } from '@/app/admin/(dashboard)/payments/actions';
import { CheckCircle2, XCircle, Loader2, Eye, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface PaymentRowActionsProps {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  amount: number;
  transactionId?: string | null;
}

export default function PaymentRowActions({
  paymentId,
  orderId,
  orderNumber,
  currentStatus,
  amount,
  transactionId,
}: PaymentRowActionsProps) {
  const [loading, setLoading] = useState<'verify' | 'reject' | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Transaction could not be verified.');
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!window.confirm(`Are you sure you want to verify payment of ৳${amount.toLocaleString()} for Order #${orderNumber}?`)) {
      return;
    }

    setLoading('verify');
    setError(null);
    try {
      const res = await verifyPaymentAction(paymentId);
      if (!res.success) {
        setError(res.error || 'Failed to verify payment');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('reject');
    setError(null);
    try {
      const res = await rejectPaymentAction(paymentId, rejectionReason);
      if (res.success) {
        setRejectModalOpen(false);
      } else {
        setError(res.error || 'Failed to reject payment');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 justify-end">
        {/* View Order */}
        <Link
          href={`/admin/orders/${orderId}`}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand hover:border-brand hover:bg-blue-50 transition"
          title="View Order Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>

        {/* Verify Payment (available if not already PAID) */}
        {currentStatus !== 'PAID' && (
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading !== null}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition disabled:opacity-50"
            title="Verify and Mark as Paid"
          >
            {loading === 'verify' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>Verify</span>
          </button>
        )}

        {/* Reject Payment (available if not already FAILED) */}
        {currentStatus !== 'FAILED' && (
          <button
            type="button"
            onClick={() => setRejectModalOpen(true)}
            disabled={loading !== null}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-[11px] transition disabled:opacity-50"
            title="Reject Transaction"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>
        )}
      </div>

      {error && (
        <span className="block text-[10px] text-rose-600 font-semibold text-right mt-1">
          {error}
        </span>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reject Payment
                </h3>
                <p className="text-xs text-slate-500">
                  Order #{orderNumber} • ৳{amount.toLocaleString()}
                </p>
              </div>
            </div>

            {transactionId && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block">Submitted Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800">{transactionId}</span>
              </div>
            )}

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rejection Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Transaction ID was not found in our bKash statement."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-rose-500 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  disabled={loading === 'reject'}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading === 'reject'}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading === 'reject' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
