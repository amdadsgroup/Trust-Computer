import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import {
  CheckCircle2,
  Package,
  Truck,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { getOrderInquiryWhatsAppLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

interface OrderConfirmationPageProps {
  params: {
    orderNumber: string;
  };
  searchParams: {
    token?: string;
  };
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: OrderConfirmationPageProps) {
  let order: any = null;

  try {
    order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: {
        items: true,
        payments: true,
      },
    });
  } catch (err) {
    console.error('Error fetching order confirmation:', err);
  }

  if (!order) {
    notFound();
  }

  // Security check: Validate tracking token to prevent unauthorized access
  const isAuthorized = searchParams.token && searchParams.token === order.trackingToken;

  const whatsappInquiryUrl = getOrderInquiryWhatsAppLink({
    orderNumber: order.orderNumber,
    total: Number(order.total),
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Thank you! Your order has been placed successfully.
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Thank you for shopping with Trust Computer Moulvibazar. Our customer service team will contact you shortly by phone to verify your order dispatch.
        </p>

        <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-800">
          <span>Order Number:</span>
          <span className="text-[#0084d6] font-black text-sm">{order.orderNumber}</span>
        </div>
      </div>

      {/* Security warning if accessed without secret token */}
      {!isAuthorized && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <span>
            For your privacy and security, recipient details and full delivery address are concealed. Use your order number and contact phone number on the Track Order page to view full details.
          </span>
        </div>
      )}

      {/* Order Details & Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-800">Order Summary</h2>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0084d6] border border-blue-200">
            Status: {order.status}
          </span>
        </div>

        {/* Order Items Table */}
        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-slate-50 text-xs"
            >
              <div>
                <span className="font-bold text-slate-800 text-sm">{item.productName}</span>
                <span className="text-slate-400 block font-mono">
                  SKU: {item.productSku} • Qty: {item.quantity}
                </span>
                {item.warrantyInfo && (
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Warranty: {item.warrantyInfo}
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-900 text-sm">
                ৳{Number(item.subtotal).toLocaleString('en-BD')}
              </span>
            </div>
          ))}
        </div>

        {/* Financial Breakdown */}
        <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs text-slate-700">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-bold">৳{Number(order.subtotal).toLocaleString('en-BD')}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee ({order.cityArea}):</span>
            <span className="font-bold">৳{Number(order.deliveryFee).toLocaleString('en-BD')}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
            <span>Total Payable:</span>
            <span className="text-[#0084d6]">৳{Number(order.total).toLocaleString('en-BD')}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 pt-1">
            <span>Payment Method:</span>
            <span className="font-semibold uppercase">{order.paymentMethod}</span>
          </div>
        </div>

        {/* Customer & Address if token matches */}
        {isAuthorized && (
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
            <h3 className="font-bold text-slate-800">Delivery Address:</h3>
            <p className="font-medium text-slate-800">{order.customerName}</p>
            <p>{order.deliveryAddress}</p>
            <p>Phone: {order.customerPhone}</p>
          </div>
        )}
      </div>

      {/* Next Steps & Support Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href={whatsappInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm transition shadow"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Get Order Updates on WhatsApp</span>
        </a>

        <Link
          href={`/track-order?orderNumber=${order.orderNumber}`}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm transition"
        >
          <Truck className="w-5 h-5 text-amber-400" />
          <span>Track Order Status</span>
        </Link>
      </div>

      <div className="text-center pt-4">
        <Link href="/" className="text-xs font-semibold text-[#0084d6] hover:underline">
          ← Return to Storefront Home
        </Link>
      </div>
    </div>
  );
}
