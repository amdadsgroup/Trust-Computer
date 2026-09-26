import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import {
  ShoppingBag,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Package,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getDashboardMetrics() {
  try {
    const [
      totalOrders,
      pendingOrders,
      lowStockCount,
      lowStockProducts,
      recentOrders,
      paidPaymentsAggregate,
      totalProductsCount,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { status: { in: ['PENDING', 'CONFIRMED'] } },
      }),
      prisma.product.count({
        where: {
          isActive: true,
          stock: { lte: 3 },
        },
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          stock: { lte: 3 },
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
        },
        take: 5,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    const totalRevenue = Number(paidPaymentsAggregate._sum.amount || 0);

    return {
      totalOrders,
      pendingOrders,
      lowStockCount,
      lowStockProducts,
      recentOrders,
      totalRevenue,
      totalProductsCount,
    };
  } catch (error) {
    console.error('Error calculating dashboard metrics:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      lowStockCount: 0,
      lowStockProducts: [],
      recentOrders: [],
      totalRevenue: 0,
      totalProductsCount: 0,
    };
  }
}

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time sales, order volume, and inventory health for Trust Computer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="bg-brand hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* 4 Key Real Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-brand">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.totalOrders.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">All registered customer orders</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pending Orders</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {metrics.pendingOrders.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Requires confirmation or processing</p>
        </div>

        {/* Paid Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Paid Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ৳{metrics.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Settled payments to date</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Low Stock Alerts</span>
            <div className="p-2 rounded-xl bg-red-50 text-accent-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-accent-600">
            {metrics.lowStockCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Items at or below reorder threshold</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm sm:text-base text-slate-900">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {metrics.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 font-semibold">
                    <th className="pb-2.5">Order #</th>
                    <th className="pb-2.5">Customer & Phone</th>
                    <th className="pb-2.5">Total</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono font-bold text-slate-800">
                        {order.orderNumber}
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-800">{order.customerName}</div>
                        <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 font-bold text-slate-900">
                        ৳{Number(order.total).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-brand font-semibold hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No customer orders received yet.
            </div>
          )}
        </div>

        {/* Low Stock Alerts Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent-500" />
              <span>Stock Alerts</span>
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Inventory
            </Link>
          </div>

          {metrics.lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {metrics.lowStockProducts.map((p: any) => (
                <div
                  key={p.id}
                  className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <h3 className="font-bold text-slate-800 truncate">{p.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-extrabold text-accent-600 block">
                      {p.stock} remaining
                    </span>
                    <Link
                      href={`/admin/inventory?productId=${p.id}`}
                      className="text-[10px] text-brand font-semibold hover:underline"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span>All products have adequate stock levels.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
