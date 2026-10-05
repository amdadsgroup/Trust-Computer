'use client';

import React, { useState } from 'react';
import { verifyPaymentAction, rejectPaymentAction } from '@/app/admin/(dashboard)/payments/actions';
import { CheckCircle2, XCircle, Loader2, Eye, AlertTriangle, FileText } from 'lucide-react';
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
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Transaction not found in bKash statement');
  const [error, setError] = useState<string | null>(null);

  const handleConfirmVerify = async () => {
    setLoading('verify');
    setError(null);
    try {
      const res = await verifyPaymentAction(paymentId, adminNote);
      if (res.success) {
        setVerifyModalOpen(false);
      } else {
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
      const res = await rejectPaymentAction(paymentId, rejectionReason, adminNote);
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
        {/* View Payment Details */}
        <Link
          href={`/admin/payments/${paymentId}`}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-pink-600 hover:border-pink-300 hover:bg-pink-50 transition"
          title="View Payment Verification Details"
        >
          <FileText className="w-3.5 h-3.5" />
        </Link>

        {/* View Order */}
        <Link
          href={`/admin/orders/${orderId}`}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#0084d6] hover:border-blue-300 hover:bg-blue-50 transition"
          title="View Order Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>

        {/* Verify Payment (available if not already PAID) */}
        {currentStatus !== 'PAID' && (
          <button
            type="button"
            onClick={() => setVerifyModalOpen(true)}
            disabled={loading !== null}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition disabled:opacity-50"
            title="Verify and Mark as Paid"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
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

      {/* Verify Confirmation Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Verify bKASH Payment
                </h3>
                <p className="text-xs text-slate-500">
                  Order #{orderNumber} • ৳{amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-semibold text-slate-800">
                Confirm that you have verified this bKASH transaction?
              </p>
              {transactionId && (
                <p className="text-slate-600 font-mono text-[11px]">
                  Transaction ID: <span className="font-bold text-pink-700">{transactionId}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Note (Optional):
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Verified with Shiblu Ahmed"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVerifyModalOpen(false)}
                disabled={loading === 'verify'}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerify}
                disabled={loading === 'verify'}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading === 'verify' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Verify Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-left">
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Note (Optional):
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Internal note"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-rose-500 focus:bg-white transition"
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
                  <span>Reject Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
