import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import PaymentRowActions from '@/components/admin/PaymentRowActions';
import PaymentFilters from '@/components/admin/PaymentFilters';
import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface AdminPaymentsPageProps {
  searchParams?: {
    page?: string;
    q?: string;
    method?: string;
    status?: string;
  };
}

export default async function AdminPaymentsPage({ searchParams }: AdminPaymentsPageProps) {
  const currentPage = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = 25;
  const searchQuery = (searchParams?.q || '').trim();
  const methodFilter = searchParams?.method || 'ALL';
  const statusFilter = searchParams?.status || 'ALL';

  // Construct database-side filter condition
  const whereClause: Prisma.PaymentWhereInput = {};

  if (methodFilter !== 'ALL' && Object.values(PaymentMethod).includes(methodFilter as PaymentMethod)) {
    whereClause.provider = methodFilter as PaymentMethod;
  }

  if (statusFilter !== 'ALL' && Object.values(PaymentStatus).includes(statusFilter as PaymentStatus)) {
    whereClause.status = statusFilter as PaymentStatus;
  }

  if (searchQuery) {
    whereClause.OR = [
      { transactionId: { contains: searchQuery, mode: 'insensitive' } },
      { rawResponseJson: { contains: searchQuery, mode: 'insensitive' } },
      { notes: { contains: searchQuery, mode: 'insensitive' } },
      {
        order: {
          OR: [
            { orderNumber: { contains: searchQuery, mode: 'insensitive' } },
            { customerName: { contains: searchQuery, mode: 'insensitive' } },
            { customerPhone: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  let payments: any[] = [];
  let totalCount = 0;
  let totalPaid = 0;
  let totalPending = 0;

  try {
    const [fetchedPayments, count, paidAgg, pendingAgg] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (currentPage - 1) * pageSize,
        select: {
          id: true,
          orderId: true,
          provider: true,
          transactionId: true,
          amount: true,
          currency: true,
          status: true,
          rawResponseJson: true,
          notes: true,
          paidAt: true,
          createdAt: true,
          order: {
            select: {
              id: true,
              orderNumber: true,
              customerName: true,
              customerPhone: true,
            },
          },
        },
      }),
      prisma.payment.count({ where: whereClause }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PENDING },
        _sum: { amount: true },
      }),
    ]);

    payments = fetchedPayments;
    totalCount = count;
    totalPaid = Number(paidAgg._sum.amount || 0);
    totalPending = Number(pendingAgg._sum.amount || 0);
  } catch (e) {
    console.error('Error fetching payments:', e);
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  // Helper function to build pagination link with search params
  const buildPageUrl = (page: number) => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    if (searchQuery) p.set('q', searchQuery);
    if (methodFilter && methodFilter !== 'ALL') p.set('method', methodFilter);
    if (statusFilter && statusFilter !== 'ALL') p.set('status', statusFilter);
    return `/admin/payments?${p.toString()}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          bKash & Payments Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify and reconcile customer bKash payments, Cash on Delivery collections, and digital transactions.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Verified Revenue</span>
          <div className="text-2xl font-black text-emerald-600">
            ৳{totalPaid.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Settled and verified customer payments</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Verification Pending</span>
          <div className="text-2xl font-black text-amber-600">
            ৳{totalPending.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Awaiting accounts team confirmation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Filtered Payment Records</span>
          <div className="text-2xl font-black text-slate-800">
            {totalCount.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Matching current search & filters</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <PaymentFilters
        currentSearch={searchQuery}
        currentMethod={methodFilter}
        currentStatus={statusFilter}
      />

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Date / Submitted</th>
                <th className="py-3.5 px-4">Order # & Customer</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Transaction ID / bKash Ref</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Verification Info</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length > 0 ? (
                payments.map((p) => {
                  let meta: Record<string, any> = {};
                  try {
                    if (p.rawResponseJson) meta = JSON.parse(p.rawResponseJson);
                  } catch {
                    meta = {};
                  }

                  const isBkash = p.provider === 'BKASH';
                  const isPaid = p.status === 'PAID';
                  const isFailed = p.status === 'FAILED';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      {/* Submitted Time */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        <div className="text-[10px] text-slate-400">
                          {new Date(p.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Order & Customer */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/orders/${p.orderId}`}
                          className="font-bold text-[#0084d6] hover:underline font-mono block text-xs"
                        >
                          {p.order.orderNumber}
                        </Link>
                        <div className="font-semibold text-slate-800 text-[11.5px] mt-0.5">
                          {p.order.customerName}
                        </div>
                        <div className="text-[10.5px] text-slate-500 font-mono">
                          {p.order.customerPhone}
                        </div>
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] inline-block ${
                            isBkash
                              ? 'bg-pink-100 text-pink-700 border border-pink-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isBkash ? 'bKash (01712556225)' : p.provider}
                        </span>
                      </td>

                      {/* Transaction ID & Meta */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {p.transactionId ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200 block max-w-fit">
                              {p.transactionId}
                            </span>
                            {meta.senderNumber && (
                              <span className="text-[10px] text-slate-500 block">
                                Sender: {meta.senderNumber}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            {isBkash ? 'No TrxID provided' : 'Cash on Delivery'}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm whitespace-nowrap">
                        ৳{Number(p.amount).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isFailed
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </>
                          ) : isFailed ? (
                            <>
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Rejected</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Verification Pending</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Verification Info */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-600 max-w-xs">
                        {isPaid ? (
                          <div>
                            <span className="font-semibold text-emerald-700 block">
                              Verified by: {meta.verifiedBy || 'Admin'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.paidAt
                                ? new Date(p.paidAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Verified'}
                            </span>
                          </div>
                        ) : isFailed ? (
                          <div>
                            <span className="font-semibold text-rose-700 block">
                              Rejected: {meta.rejectionReason || p.notes || 'Unverified'}
                            </span>
                            {meta.rejectedBy && (
                              <span className="text-[10px] text-slate-400">
                                By {meta.rejectedBy}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">
                            Awaiting admin action
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <PaymentRowActions
                          paymentId={p.id}
                          orderId={p.orderId}
                          orderNumber={p.order.orderNumber}
                          currentStatus={p.status}
                          amount={Number(p.amount)}
                          transactionId={p.transactionId}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No payment records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              Page {currentPage} of {totalPages} ({totalCount} total)
            </div>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 flex items-center gap-1 cursor-not-allowed">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </span>
              )}

              {currentPage < totalPages ? (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center gap-1 transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 flex items-center gap-1 cursor-not-allowed">
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
