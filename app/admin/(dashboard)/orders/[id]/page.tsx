import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { ALLOWED_STATUS_TRANSITIONS } from '@/lib/orders';
import { changeOrderStatusAction, markPaymentAsPaidAction } from '../actions';
import {
  ArrowLeft,
  Printer,
  ShoppingBag,
  User,
  MapPin,
  Phone,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdminOrderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  let order: any = null;

  try {
    order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        payments: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } },
        },
      },
    });
  } catch (e) {
    console.error('Error fetching admin order detail:', e);
  }

  if (!order) {
    notFound();
  }

  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[order.status as keyof typeof ALLOWED_STATUS_TRANSITIONS] || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {order.orderNumber}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  order.status === 'DELIVERED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              অর্ডারের তারিখ:{' '}
              {new Date(order.createdAt).toLocaleString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/orders/${order.id}/invoice`}
            target="_blank"
            className="inline-flex items-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট ইনভয়েস (Print Invoice)</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order items and customer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
              অর্ডারকৃত পণ্য তালিকা
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 pb-2">
                    <th className="pb-2">পণ্য ও SKU</th>
                    <th className="pb-2">একক মূল্য</th>
                    <th className="pb-2">পরিমাণ</th>
                    <th className="pb-2 text-right">উপমোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="font-mono text-slate-400 text-[10px]">SKU: {item.productSku}</div>
                        {item.warrantyInfo && (
                          <div className="text-[10px] text-emerald-600">
                            ওয়ারেন্টি: {item.warrantyInfo}
                          </div>
                        )}
                      </td>
                      <td className="py-3 font-semibold text-slate-700">
                        ৳{Number(item.unitPrice).toLocaleString('en-BD')}
                      </td>
                      <td className="py-3 font-bold text-slate-900">{item.quantity} টি</td>
                      <td className="py-3 text-right font-black text-slate-900">
                        ৳{Number(item.subtotal).toLocaleString('en-BD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs text-slate-700 border border-slate-100">
              <div className="flex justify-between">
                <span>আইটেম উপমোট:</span>
                <span className="font-bold">৳{Number(order.subtotal).toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি ফি ({order.cityArea}):</span>
                <span className="font-bold">৳{Number(order.deliveryFee).toLocaleString('en-BD')}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>সর্বমোট বিল:</span>
                <span className="text-brand">৳{Number(order.total).toLocaleString('en-BD')}</span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Address Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-brand" />
              <span>গ্রাহক ও ডেলিভারির তথ্য</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block mb-0.5">গ্রাহকের নাম:</span>
                <span className="font-bold text-slate-900 text-sm">{order.customerName}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">মোবাইল নম্বর:</span>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="font-bold text-brand hover:underline font-mono text-sm"
                >
                  {order.customerPhone}
                </a>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">ডেলিভারি এলাকা:</span>
                <span className="font-semibold text-slate-800">{order.cityArea}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">পেমেন্ট মেথড:</span>
                <span className="font-bold uppercase text-slate-900">{order.paymentMethod}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 block mb-0.5">পূর্ণাঙ্গ ঠিকানা:</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                  {order.deliveryAddress}
                </p>
              </div>

              {order.notes && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block mb-0.5">গ্রাহকের নোট:</span>
                  <p className="italic text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                    "{order.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Status Machine */}
        <div className="space-y-6">
          {/* Status Change Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
              অর্ডার স্ট্যাটাস পরিবর্তন
            </h2>

            {allowedNextStatuses.length > 0 ? (
              <form
                action={async (formData: FormData) => {
                  'use server';
                  await changeOrderStatusAction(formData);
                }}
                className="space-y-3 text-xs"
              >
                <input type="hidden" name="orderId" value={order.id} />

                <div>
                  <label className="block font-bold text-slate-700 mb-1">নতুন স্ট্যাটাস:</label>
                  <select
                    name="newStatus"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-semibold text-slate-800"
                  >
                    {allowedNextStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">মন্তব্য / নোট (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    name="note"
                    placeholder="যেমন: কুরিয়ার ট্র্যাকিং #SA12345"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow text-xs"
                >
                  স্ট্যাটাস আপডেট করুন
                </button>
              </form>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                এই অর্ডারটি <strong>{order.status}</strong> অবস্থায় আছে (চূড়ান্ত অবস্থা, পরিবর্তনযোগ্য নয়)।
              </div>
            )}

            {/* Payment Status Action */}
            {order.paymentStatus !== 'PAID' && (
              <div className="pt-3 border-t border-slate-100">
                <form
                  action={async () => {
                    'use server';
                    await markPaymentAsPaidAction(order.id);
                  }}
                >
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
                  >
                    পেমেন্ট সম্পন্ন হিসেবে চিহ্নিত করুন (Mark as Paid)
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
              স্ট্যাটাস হিস্ট্রি ও অডিট ট্রেইল
            </h2>

            <div className="space-y-3 text-xs">
              {order.statusHistory.map((hist: any) => (
                <div key={hist.id} className="pb-3 border-b border-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {hist.fromStatus} → {hist.toStatus}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(hist.createdAt).toLocaleTimeString('bn-BD', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {hist.note && <p className="text-slate-600 text-[11px]">{hist.note}</p>}
                  {hist.user?.name && (
                    <span className="text-[10px] text-brand">স্টাফ: {hist.user.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
