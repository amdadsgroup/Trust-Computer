import React from 'react';
import Link from 'next/link';
import { requireCustomer, getCustomerOrders, getCustomerAddresses } from '@/lib/customer';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  ArrowRight,
  User,
  ShieldCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomerDashboardPage() {
  const customer = await requireCustomer();
  const [orders, addresses] = await Promise.all([
    getCustomerOrders(customer.id),
    getCustomerAddresses(customer.id),
  ]);

  const recentOrders = orders.slice(0, 3);
  const pendingCount = orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PROCESSING').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#0084d6] uppercase tracking-wider block mb-1">
            Customer Dashboard
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {customer.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your purchases, tracking updates, and delivery addresses.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-md self-start sm:self-auto flex-shrink-0"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0084d6] flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {orders.length}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Total Orders</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {pendingCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold">In Progress</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {deliveredCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Completed Orders</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-[#0084d6] hover:underline flex items-center gap-1"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/products"
              className="inline-block text-xs font-bold text-[#0084d6] hover:underline"
            >
              Start shopping now →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{order.orderNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    • {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="font-extrabold text-sm text-slate-900">
                    ৳{Number(order.total).toLocaleString('en-BD')}
                  </span>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile & Saved Addresses Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Profile Info Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-[#0084d6]" />
              <span>Profile Details</span>
            </h3>
            <Link
              href="/account/profile"
              className="text-xs font-bold text-[#0084d6] hover:underline"
            >
              Edit
            </Link>
          </div>
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-bold text-slate-900">{customer.fullName}</p>
            <p>{customer.email}</p>
            <p>{customer.phone || 'No phone number provided'}</p>
          </div>
        </div>

        {/* Saved Addresses Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0084d6]" />
              <span>Saved Addresses ({addresses.length})</span>
            </h3>
            <Link
              href="/account/addresses"
              className="text-xs font-bold text-[#0084d6] hover:underline"
            >
              Manage
            </Link>
          </div>
          {addresses.length === 0 ? (
            <p className="text-xs text-slate-500">No saved addresses yet.</p>
          ) : (
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">
                {addresses[0].fullName}{' '}
                {addresses[0].isDefault && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded">
                    Default
                  </span>
                )}
              </p>
              <p className="truncate">{addresses[0].address}</p>
              <p>
                {addresses[0].area}, {addresses[0].city}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
