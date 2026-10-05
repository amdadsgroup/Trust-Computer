'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  Phone,
  ShieldCheck,
  Calendar,
  User,
  CreditCard,
  Clock,
} from 'lucide-react';
import { verifyPaymentAction, rejectPaymentAction } from '@/app/admin/(dashboard)/payments/actions';
import { business } from '@/lib/business';

export interface PaymentDetailsData {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  provider: string;
  amount: number;
  currency: string;
  status: string; // 'PENDING' | 'PAID' | 'FAILED'
  transactionId: string | null;
  receiverNumber: string;
  senderNumber: string | null;
  submittedAt: string;
  paidAt: string | null;
  verifiedBy?: string | null;
  rejectionReason?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  adminNote?: string | null;
  notes?: string | null;
}

interface PaymentDetailsCardProps {
  payment: PaymentDetailsData;
  isStandalonePage?: boolean;
  onClose?: () => void;
}

export default function PaymentDetailsCard({
  payment,
  isStandalonePage = false,
  onClose,
}: PaymentDetailsCardProps) {
  const router = useRouter();
  const [adminNote, setAdminNote] = useState(payment.adminNote || '');
  const [loading, setLoading] = useState<'verify' | 'reject' | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Transaction not found in bKash statement');
  const [copiedTrx, setCopiedTrx] = useState(false);
  const [copiedReceiver, setCopiedReceiver] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isBkash = payment.provider === 'BKASH';
  const isVerified = payment.status === 'PAID';
  const isRejected = payment.status === 'FAILED';
  const isPending = !isVerified && !isRejected;

  const handleCopy = async (text: string, type: 'trx' | 'receiver') => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-999999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      if (type === 'trx') {
        setCopiedTrx(true);
        setTimeout(() => setCopiedTrx(false), 2000);
      } else {
        setCopiedReceiver(true);
        setTimeout(() => setCopiedReceiver(false), 2000);
      }
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const handleConfirmVerify = async () => {
    setLoading('verify');
    setFeedback(null);
    try {
      const res = await verifyPaymentAction(payment.id, adminNote);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message || 'Payment successfully verified!' });
        setShowVerifyModal(false);
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to verify payment.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('reject');
    setFeedback(null);
    try {
      const res = await rejectPaymentAction(payment.id, rejectionReason, adminNote);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message || 'Payment has been rejected.' });
        setShowRejectModal(false);
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to reject payment.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Payment Verification Dashboard</span>
            <span>•</span>
            <span className="text-[#0084d6]">Trust Computer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            PAYMENT DETAILS
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isStandalonePage ? (
            <Link
              href="/admin/payments"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Payments</span>
            </Link>
          ) : (
            onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
              >
                Close
              </button>
            )
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order & Customer Information */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/60 pb-2">
            <User className="w-4 h-4 text-[#0084d6]" />
            <span>Order & Customer Information</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Order:</span>
              <Link
                href={`/admin/orders/${payment.orderId}`}
                className="font-mono font-bold text-[#0084d6] hover:underline flex items-center gap-1 text-sm"
              >
                <span>#{payment.orderNumber}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Customer:</span>
              <span className="font-bold text-slate-900">{payment.customerName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Phone:</span>
              <a
                href={`tel:${payment.customerPhone}`}
                className="font-mono font-bold text-[#0084d6] hover:underline flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>{payment.customerPhone}</span>
              </a>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
              <span className="text-slate-500">Submitted Date/Time:</span>
              <span className="font-mono text-slate-700">
                {new Date(payment.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                •{' '}
                {new Date(payment.submittedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Transaction Details */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/60 pb-2">
            <CreditCard className="w-4 h-4 text-pink-600" />
            <span>Transaction Verification Details</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-bold text-pink-700 uppercase bg-pink-100/70 px-2.5 py-0.5 rounded text-[11px] border border-pink-200">
                {isBkash ? 'bKASH Cash Out' : payment.provider}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Amount:</span>
              <span className="text-lg font-black text-slate-900">
                ৳ {Number(payment.amount).toLocaleString('en-BD')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Receiver:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-900">{payment.receiverNumber}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(payment.receiverNumber, 'receiver')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 transition"
                  title="Copy receiver number"
                >
                  {copiedReceiver ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Sender:</span>
              <span className="font-mono font-bold text-slate-800">
                {payment.senderNumber || <span className="text-slate-400 italic">Not provided</span>}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Transaction ID:</span>
              {payment.transactionId ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-pink-700 bg-pink-100/80 px-2 py-0.5 rounded border border-pink-300 tracking-wider">
                    {payment.transactionId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(payment.transactionId || '', 'trx')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 transition"
                    title="Copy Transaction ID"
                  >
                    {copiedTrx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <span className="text-slate-400 italic">None</span>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
              <span className="text-slate-600 font-bold">Status:</span>
              <span
                className={`font-bold px-2.5 py-1 rounded-full text-[10.5px] inline-flex items-center gap-1 ${
                  isVerified
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isRejected
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {isVerified ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </>
                ) : isRejected ? (
                  <>
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>Rejected</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Verification Pending</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Audit Info If Verified or Rejected */}
      {(payment.paidAt || payment.rejectedAt || payment.rejectionReason) && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-slate-700 block">Reconciliation History:</span>
          {payment.paidAt && (
            <p className="text-emerald-700">
              • Verified on {new Date(payment.paidAt).toLocaleString('en-US')} by{' '}
              <strong>{payment.verifiedBy || 'Admin'}</strong>
            </p>
          )}
          {payment.rejectedAt && (
            <p className="text-rose-700">
              • Rejected on {new Date(payment.rejectedAt).toLocaleString('en-US')} by{' '}
              <strong>{payment.rejectedBy || 'Admin'}</strong>
            </p>
          )}
          {payment.rejectionReason && (
            <p className="text-slate-600">
              • Reason: <em>"{payment.rejectionReason}"</em>
            </p>
          )}
          {payment.notes && (
            <p className="text-slate-500 font-mono text-[11px] pt-1">
              Internal notes: {payment.notes}
            </p>
          )}
        </div>
      )}

      {/* Admin Note Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          Admin Note (Internal record):
        </label>
        <textarea
          rows={2}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="e.g. Verified with Shiblu Ahmed on bKash merchant statement #4892"
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-[#0084d6] focus:bg-white transition"
        />
        <span className="text-[10.5px] text-slate-400 block">
          Admin notes are private and never exposed to the customer storefront.
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Link
          href={`/admin/orders/${payment.orderId}`}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5"
        >
          <span>View Order #{payment.orderNumber}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Reject Payment Button */}
        {!isRejected && (
          <button
            type="button"
            onClick={() => setShowRejectModal(true)}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>REJECT PAYMENT</span>
          </button>
        )}

        {/* Verify Payment Button */}
        {!isVerified && (
          <button
            type="button"
            onClick={() => setShowVerifyModal(true)}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>VERIFY PAYMENT</span>
          </button>
        )}
      </div>

      {/* Verification Confirmation Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Verify bKASH Payment
                </h3>
                <p className="text-xs text-slate-500">
                  Order #{payment.orderNumber} • ৳{payment.amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-semibold text-slate-800">
                Confirm that you have verified this bKASH transaction?
              </p>
              {payment.transactionId && (
                <p className="text-slate-600 font-mono">
                  Transaction ID: <span className="font-bold text-pink-700">{payment.transactionId}</span>
                </p>
              )}
              {payment.senderNumber && (
                <p className="text-slate-600 font-mono">
                  Sender Number: <span className="font-bold text-slate-800">{payment.senderNumber}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
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

      {/* Rejection Modal */}
      {showRejectModal && (
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
                  Order #{payment.orderNumber} • ৳{payment.amount.toLocaleString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
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
                  onClick={() => setShowRejectModal(false)}
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
    </div>
  );
}
