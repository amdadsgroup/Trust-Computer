import React from 'react';
import Link from 'next/link';
import { requireCustomer, getCustomerOrders } from '@/lib/customer';
import { ShoppingBag, ArrowRight, Package, Calendar, CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomerOrdersPage() {
  const customer = await requireCustomer();
  const orders = await getCustomerOrders(customer.id);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Your Order History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review all your current and past orders placed with Trust Computer Moulvibazar.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-slate-800">No Orders Placed Yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t placed any orders with this customer account. Explore our products and place your first order.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-md mt-2"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={order.id}
                className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {order.orderNumber}
                      </span>
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
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Placed on {formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Total Amount</span>
                      <span className="font-extrabold text-sm sm:text-base text-[#0084d6]">
                        ৳{Number(order.total).toLocaleString('en-BD')}
                      </span>
                    </div>

                    <Link
                      href={`/account/orders/${order.orderNumber}`}
                      className="bg-[#0084d6] hover:bg-[#0074be] text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 flex-shrink-0"
                    >
                      <span>View Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Ordered Products ({order.items.length})
                  </span>
                  <div className="divide-y divide-slate-100 text-xs">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="py-2 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">
                            {item.productName}
                          </span>
                          <span className="text-slate-400 flex-shrink-0">
                            (Qty: {item.quantity})
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 flex-shrink-0">
                          ৳{Number(item.subtotal).toLocaleString('en-BD')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Payment Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>Payment: <strong className="text-slate-700 font-semibold">{order.paymentMethod} ({order.paymentStatus})</strong></span>
                  </div>
                  <div className="truncate max-w-md">
                    <span>Delivering to: <strong className="text-slate-700 font-semibold">{order.cityArea}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
