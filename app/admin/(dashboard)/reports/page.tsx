import React from 'react';
import prisma from '@/lib/db';
import { BarChart3, TrendingUp, ShoppingBag, Boxes, Award, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  let ordersByStatus: any[] = [];
  let topSellingItems: any[] = [];
  let totalSales = 0;
  let totalOrdersCount = 0;

  try {
    const [orders, orderItems] = await Promise.all([
      prisma.order.findMany({
        select: { status: true, total: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productName', 'productSku'],
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    totalOrdersCount = orders.length;
    totalSales = orders.reduce((acc, o) => acc + Number(o.total), 0);

    // Group orders by status
    const statusCounts: Record<string, number> = {};
    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }
    ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
    topSellingItems = orderItems;
  } catch (e) {
    console.error('Error fetching reports data:', e);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          সেলস ও ইনভেন্টরি রিপোর্টস (Sales & Analytics)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Trust Computer-Moulvibazar এর প্রকৃত বিক্রয় এবং স্টক বিশ্লেষণ।
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">মোট বিক্রয় মূল্য (Total Volume)</span>
          <div className="text-3xl font-black text-slate-900">
            ৳{totalSales.toLocaleString('en-BD')}
          </div>
          <span className="text-[11px] text-slate-400">সকল কার্যকর অর্ডার মিলিয়ে</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">মোট গ্রাহক অর্ডার</span>
          <div className="text-3xl font-black text-brand">
            {totalOrdersCount}
          </div>
          <span className="text-[11px] text-slate-400">সম্পূর্ণ অর্ডার ভলিউম</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">গড় অর্ডার মূল্য (AOV)</span>
          <div className="text-3xl font-black text-emerald-600">
            ৳{totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount).toLocaleString('en-BD') : 0}
          </div>
          <span className="text-[11px] text-slate-400">প্রতি অর্ডারে গড় লেনদেন</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand" />
            <span>অর্ডার স্ট্যাটাস বিভাজন (Status Breakdown)</span>
          </h2>

          <div className="space-y-3">
            {ordersByStatus.length > 0 ? (
              ordersByStatus.map(({ status, count }) => {
                const percent = totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{status}</span>
                      <span className="text-slate-500 font-mono">
                        {count} টি ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          status === 'DELIVERED'
                            ? 'bg-emerald-500'
                            : status === 'CANCELLED'
                            ? 'bg-red-500'
                            : 'bg-brand'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">কোনো অর্ডার নেই</div>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>শীর্ষ বিক্রিত পণ্যসমূহ (Best Sellers)</span>
          </h2>

          <div className="space-y-3">
            {topSellingItems.length > 0 ? (
              topSellingItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <h3 className="font-bold text-slate-900">{item.productName}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      SKU: {item.productSku}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block">
                      {item._sum.quantity} টি বিক্রি
                    </span>
                    <span className="text-[10px] text-brand font-semibold">
                      ৳{Number(item._sum.subtotal).toLocaleString('en-BD')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                এখনো কোনো পণ্য বিক্রয় হয়নি।
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
