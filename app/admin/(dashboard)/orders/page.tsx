import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { Search, ShoppingBag, Eye, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdminOrdersPageProps {
  searchParams: {
    status?: string;
    search?: string;
  };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const where: any = {};

  if (searchParams.status && searchParams.status !== 'ALL') {
    where.status = searchParams.status;
  }

  if (searchParams.search) {
    where.OR = [
      { orderNumber: { contains: searchParams.search, mode: 'insensitive' } },
      { customerPhone: { contains: searchParams.search, mode: 'insensitive' } },
      { customerName: { contains: searchParams.search, mode: 'insensitive' } },
    ];
  }

  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  } catch (e) {
    console.error('Error fetching admin orders:', e);
  }

  const statuses = [
    { key: 'ALL', label: 'সকল অর্ডার' },
    { key: 'PENDING', label: 'অপেক্ষমান (Pending)' },
    { key: 'CONFIRMED', label: 'নিশ্চিতকৃত (Confirmed)' },
    { key: 'PROCESSING', label: 'প্রস্তুতকরণ (Processing)' },
    { key: 'SHIPPED', label: 'কুরিয়ারে (Shipped)' },
    { key: 'DELIVERED', label: 'ডেলিভার্ড (Delivered)' },
    { key: 'CANCELLED', label: 'বাতিল (Cancelled)' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          অর্ডার ব্যবস্থাপনা (Order Management)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          মোট {orders.length} টি অর্ডার প্রদর্শিত হচ্ছে
        </p>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {statuses.map((s) => {
          const isActive = (searchParams.status || 'ALL') === s.key;
          return (
            <Link
              key={s.key}
              href={`/admin/orders?status=${s.key}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
              className={`px-3 py-1.5 rounded-xl border transition ${
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
          <input
            type="text"
            name="search"
            defaultValue={searchParams.search || ''}
            placeholder="অর্ডার নং, ফোন নম্বর বা গ্রাহকের নাম দিয়ে খুঁজুন..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-brand"
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
                <th className="py-3.5 px-4">অর্ডার নং ও সময়</th>
                <th className="py-3.5 px-4">গ্রাহক ও এলাকা</th>
                <th className="py-3.5 px-4">আইটেম সংখ্যা</th>
                <th className="py-3.5 px-4">মোট টাকা</th>
                <th className="py-3.5 px-4">পেমেন্ট</th>
                <th className="py-3.5 px-4">অর্ডার স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">কার্যক্রম</th>
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
                        {new Date(o.createdAt).toLocaleDateString('bn-BD', {
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
                        {o.items.reduce((acc: number, i: any) => acc + i.quantity, 0)} টি
                      </span>
                    </td>

                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      ৳{Number(o.total).toLocaleString('en-BD')}
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
                        <span>বিস্তারিত</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    কোনো অর্ডার পাওয়া যায়নি।
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
