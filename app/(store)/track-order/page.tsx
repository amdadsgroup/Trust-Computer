import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { orderTrackingSchema } from '@/lib/validations';
import {
  Truck,
  Search,
  CheckCircle,
  Clock,
  Package,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import { getOrderInquiryWhatsAppLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

interface TrackOrderPageProps {
  searchParams: {
    orderNumber?: string;
    phone?: string;
  };
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  let order: any = null;
  let error: string | null = null;

  if (searchParams.orderNumber && searchParams.phone) {
    const validation = orderTrackingSchema.safeParse({
      orderNumber: searchParams.orderNumber.trim(),
      phone: searchParams.phone.trim(),
    });

    if (!validation.success) {
      error = 'Please provide a valid Order Number and an 11-digit Bangladesh phone number.';
    } else {
      try {
        order = await prisma.order.findFirst({
          where: {
            orderNumber: searchParams.orderNumber.trim(),
            customerPhone: searchParams.phone.trim(),
          },
          include: {
            items: true,
            statusHistory: { orderBy: { createdAt: 'desc' } },
          },
        });

        if (!order) {
          error =
            'No matching order found for the provided Order Number and contact phone. Please verify your details.';
        }
      } catch (e) {
        console.error('Track order query error:', e);
        error = 'An error occurred while tracking your order. Please try again.';
      }
    }
  }

  const steps = [
    { key: 'PENDING', label: 'Order Received', desc: 'Order logged into the system' },
    { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Verified by customer support representative' },
    { key: 'PROCESSING', label: 'Packaging & QC', desc: 'Inspecting warranty seals & packing securely' },
    { key: 'SHIPPED', label: 'Dispatched to Courier', desc: 'In transit with delivery rider' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Package successfully handed over to customer' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return -1;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : -1;

  const whatsappInquiryUrl = order
    ? getOrderInquiryWhatsAppLink({
        orderNumber: order.orderNumber,
        total: Number(order.total),
      })
    : null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-[#0084d6] mb-2">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Enter your order number and the phone number used during checkout to check real-time progress.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <form method="GET" action="/track-order" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Order Number *
              </label>
              <input
                type="text"
                name="orderNumber"
                required
                placeholder="e.g. TC-20260924-1234"
                defaultValue={searchParams.orderNumber || ''}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Customer Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="01XXXXXXXXX"
                defaultValue={searchParams.phone || ''}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition shadow-md"
          >
            <Search className="w-4 h-4" />
            <span>Track Order Status</span>
          </button>
        </form>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Status Result */}
      {order && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs text-slate-400 font-mono">Order Number:</span>
              <h2 className="text-lg font-black text-slate-900">{order.orderNumber}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Current Status</span>
              <span className="inline-block bg-blue-50 text-[#0084d6] border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
                {order.status}
              </span>
            </div>
          </div>

          {/* Timeline Visualizer */}
          <div className="space-y-4 py-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Delivery Progress
            </h3>

            <div className="relative pl-6 space-y-6 border-l-2 border-slate-200">
              {steps.map((s, idx) => {
                const isPassed = currentStep >= idx;
                const isCurrent = currentStep === idx;

                return (
                  <div key={s.key} className="relative">
                    <div
                      className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 bg-white transition ${
                        isPassed
                          ? 'border-[#0084d6] bg-[#0084d6]'
                          : 'border-slate-300 bg-white'
                      }`}
                    />
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          isCurrent
                            ? 'text-[#0084d6]'
                            : isPassed
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {s.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered Products Snapshot */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-700">Order Items:</h3>
            <div className="space-y-2">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50"
                >
                  <span className="font-medium text-slate-800">
                    {item.productName} (x{item.quantity})
                  </span>
                  <span className="font-bold text-slate-900">
                    ৳{Number(item.subtotal).toLocaleString('en-BD')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between text-xs font-bold text-slate-900 border-t border-slate-100">
              <span>Total Payable:</span>
              <span className="text-[#0084d6]">৳{Number(order.total).toLocaleString('en-BD')}</span>
            </div>
          </div>

          {/* WhatsApp Support Button */}
          {whatsappInquiryUrl && (
            <div className="pt-2">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire About This Order on WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
