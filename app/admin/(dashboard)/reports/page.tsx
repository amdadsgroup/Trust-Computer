import React from 'react';
import prisma from '@/lib/db';
import { BarChart3, TrendingUp, ShoppingBag, Boxes, Award, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  let ordersByStatus: { status: string; count: number }[] = [];
  let topSellingItems: any[] = [];
  let totalSales = 0;
  let totalOrdersCount = 0;

  try {
    const [ordersAggregate, statusGroups, orderItems] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productName', 'productSku'],
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    totalOrdersCount = ordersAggregate._count.id || 0;
    totalSales = Number(ordersAggregate._sum.total || 0);

    ordersByStatus = statusGroups.map((g) => ({
      status: g.status,
      count: g._count.id,
    }));
    topSellingItems = orderItems;
  } catch (e) {
    console.error('Error fetching reports data:', e);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sales & Analytics Reports
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time sales volume, revenue metrics, and top product performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">Total Sales Volume</span>
          <div className="text-3xl font-black text-slate-900">
            ৳{totalSales.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Cumulative order revenue</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">Total Customer Orders</span>
          <div className="text-3xl font-black text-brand">
            {totalOrdersCount.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">All registered store orders</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">Average Order Value (AOV)</span>
          <div className="text-3xl font-black text-emerald-600">
            ৳{totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount).toLocaleString() : 0}
          </div>
          <span className="text-[11px] text-slate-400">Average transaction size</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand" />
            <span>Order Status Breakdown</span>
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
                        {count.toLocaleString()} ({percent}%)
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
              <div className="text-center py-8 text-xs text-slate-400">No orders recorded yet.</div>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Top Selling Products</span>
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
                      {item._sum.quantity} sold
                    </span>
                    <span className="text-[10px] text-brand font-semibold">
                      ৳{Number(item._sum.subtotal).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No product sales recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
