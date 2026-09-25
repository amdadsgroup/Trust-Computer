import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCustomer, getCustomerOrderDetails } from '@/lib/customer';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomerOrderDetailsPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const customer = await requireCustomer();
  const order = await getCustomerOrderDetails(customer.id, params.orderNumber);

  if (!order) {
    notFound();
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-8">
      {/* Back button and title */}
      <div className="space-y-4 border-b border-slate-100 pb-5">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0084d6] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
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
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Placed on {formattedDate}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-semibold">Total Paid / Payable</span>
            <span className="text-2xl font-black text-[#0084d6]">
              ৳{order.total.toLocaleString('en-BD')}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Ordered Products ({order.items.length})
        </h2>

        <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50 transition"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#0084d6] flex-shrink-0" />
                  <span className="font-bold text-slate-900 text-sm">
                    {item.productName}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] flex flex-wrap gap-x-3">
                  <span>SKU: {item.productSku}</span>
                  {item.warrantyInfo && (
                    <span className="text-emerald-700 font-medium">
                      Warranty: {item.warrantyInfo}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0">
                <span className="text-slate-500">
                  ৳{item.unitPrice.toLocaleString('en-BD')} × {item.quantity}
                </span>
                <span className="font-extrabold text-sm text-slate-900">
                  ৳{item.subtotal.toLocaleString('en-BD')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary & Delivery Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping & Customer Details */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0084d6]" />
            <span>Delivery Information</span>
          </h3>

          <div className="space-y-1.5 text-xs text-slate-700">
            <p>
              <strong className="text-slate-900">Recipient:</strong> {order.customerName}
            </p>
            <p>
              <strong className="text-slate-900">Phone:</strong> {order.customerPhone}
            </p>
            {order.customerEmail && (
              <p>
                <strong className="text-slate-900">Email:</strong> {order.customerEmail}
              </p>
            )}
            <p>
              <strong className="text-slate-900">Address:</strong> {order.deliveryAddress}
            </p>
            <p>
              <strong className="text-slate-900">Zone:</strong> {order.cityArea}
            </p>
          </div>
        </div>

        {/* Payment & Totals Breakdown */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0084d6]" />
            <span>Payment Summary</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Payment Method:</span>
              <span className="font-bold text-slate-800">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Status:</span>
              <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">
                ৳{order.subtotal.toLocaleString('en-BD')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-slate-800">
                ৳{order.deliveryFee.toLocaleString('en-BD')}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span className="font-semibold">-৳{order.discount.toLocaleString('en-BD')}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-black text-slate-900">
              <span className="text-sm">Final Total:</span>
              <span className="text-lg text-[#0084d6]">
                ৳{order.total.toLocaleString('en-BD')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status History Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0084d6]" />
            <span>Order Progress Timeline</span>
          </h3>

          <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
            {order.timeline.map((step) => (
              <div key={step.id} className="relative group">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-4 border-[#0084d6]" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      Status: {step.toStatus}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(step.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {step.note && (
                    <p className="text-xs text-slate-600 mt-1">{step.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help & Support Footer */}
      <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-blue-900 font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#0084d6] flex-shrink-0" />
          <span>Need assistance with this order? Contact our helpline at 01753-765372.</span>
        </div>
        <Link
          href={`/order-confirmation/${order.orderNumber}?token=${encodeURIComponent(order.trackingToken)}`}
          className="text-[#0084d6] font-bold hover:underline self-start sm:self-auto"
        >
          View Public Receipt →
        </Link>
      </div>
    </div>
  );
}
