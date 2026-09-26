import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdminPaymentsPageProps {
  searchParams?: {
    page?: string;
  };
}

export default async function AdminPaymentsPage({ searchParams }: AdminPaymentsPageProps) {
  const currentPage = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = 25;

  let payments: any[] = [];
  let totalCount = 0;
  let totalPaid = 0;
  let totalPending = 0;

  try {
    const [fetchedPayments, count, paidAgg, pendingAgg] = await Promise.all([
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (currentPage - 1) * pageSize,
        select: {
          id: true,
          orderId: true,
          provider: true,
          transactionId: true,
          amount: true,
          status: true,
          createdAt: true,
          order: {
            select: {
              orderNumber: true,
              customerName: true,
              customerPhone: true,
            },
          },
        },
      }),
      prisma.payment.count(),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'PENDING' },
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Payment Records & Reconciliation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tracking transactions for Cash on Delivery, bKash, and bank transfers.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Paid Revenue</span>
          <div className="text-2xl font-black text-emerald-600">
            ৳{totalPaid.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Settled and verified transactions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Pending Payments</span>
          <div className="text-2xl font-black text-amber-600">
            ৳{totalPending.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Awaiting delivery collection or verification</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Payment Records</span>
          <div className="text-2xl font-black text-slate-800">
            {totalCount.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Logged in database</span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Order # & Customer</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Transaction Ref</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/orders/${p.orderId}`}
                        className="font-bold text-brand hover:underline font-mono"
                      >
                        {p.order.orderNumber}
                      </Link>
                      <div className="text-[11px] text-slate-600">{p.order.customerName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {p.provider}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      {p.transactionId || 'Cash on Delivery'}
                    </td>

                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      ৳{Number(p.amount).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No payment records found.
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
                  href={`/admin/payments?page=${currentPage - 1}`}
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
                  href={`/admin/payments?page=${currentPage + 1}`}
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
