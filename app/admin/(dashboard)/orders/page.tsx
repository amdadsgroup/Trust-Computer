import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { Search, ShoppingBag, Eye, Clock, CheckCircle2, XCircle, Truck, ChevronLeft, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdminOrdersPageProps {
  searchParams: {
    status?: string;
    search?: string;
    page?: string;
  };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const where: any = {};
  const currentStatus = searchParams.status || 'ALL';
  const searchQuery = searchParams.search?.trim() || '';
  const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10));
  const pageSize = 25;

  if (currentStatus !== 'ALL') {
    where.status = currentStatus;
  }

  if (searchQuery) {
    where.OR = [
      { orderNumber: { contains: searchQuery, mode: 'insensitive' } },
      { customerPhone: { contains: searchQuery, mode: 'insensitive' } },
      { customerName: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  let orders: any[] = [];
  let totalCount = 0;

  try {
    const [fetchedOrders, count] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (currentPage - 1) * pageSize,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          cityArea: true,
          total: true,
          paymentMethod: true,
          paymentStatus: true,
          status: true,
          createdAt: true,
          items: {
            select: {
              quantity: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    orders = fetchedOrders;
    totalCount = count;
  } catch (e) {
    console.error('Error fetching admin orders:', e);
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  const statuses = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {orders.length} of {totalCount} total orders
          </p>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {statuses.map((s) => {
          const isActive = currentStatus === s.key;
          return (
            <Link
              key={s.key}
              href={`/admin/orders?status=${s.key}${searchQuery ? `&search=${searchQuery}` : ''}`}
              className={`px-3.5 py-2 rounded-xl border transition ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form method="GET" action="/admin/orders" className="relative">
          {currentStatus !== 'ALL' && (
            <input type="hidden" name="status" value={currentStatus} />
          )}
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search by order number, phone number, or customer name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-brand transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Order # & Date</th>
                <th className="py-3.5 px-4">Customer & Location</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {o.orderNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{o.customerName}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{o.customerPhone}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{o.cityArea}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {o.items.reduce((acc: number, i: any) => acc + i.quantity, 0)} items
                      </span>
                    </td>

                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      ৳{Number(o.total).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700 uppercase">{o.paymentMethod}</div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          o.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : o.status === 'SHIPPED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : o.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-brand hover:text-white text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders found.
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
                  href={`/admin/orders?page=${currentPage - 1}${
                    currentStatus !== 'ALL' ? `&status=${currentStatus}` : ''
                  }${searchQuery ? `&search=${searchQuery}` : ''}`}
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
                  href={`/admin/orders?page=${currentPage + 1}${
                    currentStatus !== 'ALL' ? `&status=${currentStatus}` : ''
                  }${searchQuery ? `&search=${searchQuery}` : ''}`}
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
