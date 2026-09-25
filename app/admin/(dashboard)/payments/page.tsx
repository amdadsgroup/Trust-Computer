import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  let payments: any[] = [];
  try {
    payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { orderNumber: true, customerName: true, customerPhone: true } },
      },
    });
  } catch (e) {
    console.error('Error fetching payments:', e);
  }

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          পেমেন্ট ও রিকনসিলিয়েশন (Payment Records)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          ক্যাশ অন ডেলিভারি, বিকাশ এবং ব্যাংক ট্রান্সফারের সকল লেনদেন ট্র্যাকিং।
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">পরিশোধিত মোট রাজস্ব (Paid)</span>
          <div className="text-2xl font-black text-emerald-600">
            ৳{totalPaid.toLocaleString('en-BD')}
          </div>
          <span className="text-[10px] text-slate-400">নিশ্চিতকৃত লেনদেনসমূহ</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">অপেক্ষমান পেমেন্ট (Pending)</span>
          <div className="text-2xl font-black text-amber-600">
            ৳{totalPending.toLocaleString('en-BD')}
          </div>
          <span className="text-[10px] text-slate-400">ডেলিভারির সময় বা যাচাই অপেক্ষমান</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">মোট লেনদেন রেকর্ড</span>
          <div className="text-2xl font-black text-slate-800">
            {payments.length}
          </div>
          <span className="text-[10px] text-slate-400">ডাটাবেজে সংরক্ষিত রেকর্ড</span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">তারিখ</th>
                <th className="py-3.5 px-4">অর্ডার নং ও গ্রাহক</th>
                <th className="py-3.5 px-4">পেমেন্ট মেথড</th>
                <th className="py-3.5 px-4">ট্রানজেকশন রেফারেন্স</th>
                <th className="py-3.5 px-4">পরিমাণ</th>
                <th className="py-3.5 px-4">পেমেন্ট স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString('bn-BD', {
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
                      {p.transactionId || 'ক্যাশ অন ডেলিভারি'}
                    </td>

                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      ৳{Number(p.amount).toLocaleString('en-BD')}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                    কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
