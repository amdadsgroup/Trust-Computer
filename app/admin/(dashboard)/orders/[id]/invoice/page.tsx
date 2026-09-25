import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { brand } from '@/lib/brand';
import { ArrowLeft, Printer } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface InvoicePageProps {
  params: {
    id: string;
  };
}

export default async function OrderInvoicePage({ params }: InvoicePageProps) {
  let order: any = null;

  try {
    order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        payments: true,
      },
    });
  } catch (e) {
    console.error('Error fetching order for invoice:', e);
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:p-0 print:bg-white text-slate-800">
      {/* Top action bar - Hidden during print */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>অর্ডার বিবরণে ফিরে যান (Back to Order)</span>
        </Link>

        <button
          onClick={undefined}
          className="inline-flex items-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition"
          id="print-btn"
        >
          <Printer className="w-4 h-4" />
          <span>ইনভয়েস প্রিন্ট করুন (Print Invoice)</span>
        </button>
      </div>

      {/* Invoice Card */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-2">
            <div className="relative h-12 w-auto">
              <Image
                src="/brand/trust-computer-logo.png"
                alt="Trust Computer-Moulvibazar"
                width={220}
                height={46}
                priority
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              {brand.address}
            </p>
            <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              <span><strong>হটলাইন:</strong> {brand.phone}</span>
              <span><strong>ইমেইল:</strong> {brand.email}</span>
            </div>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-blue-50 text-[#2A3B97] text-xs font-black tracking-widest uppercase rounded-lg border border-blue-200">
              INVOICE / ক্যাশ মেমো
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500">
              তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs font-semibold text-slate-700">
              পেমেন্ট স্ট্যাটাস: <span className={order.paymentStatus === 'PAID' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{order.paymentStatus}</span>
            </p>
          </div>
        </div>

        {/* Customer Information Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-2">গ্রাহকের বিবরণ (Bill To)</h3>
            <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
            <p className="text-slate-600 font-mono mt-0.5">{order.customerPhone}</p>
            {order.customerEmail && <p className="text-slate-500">{order.customerEmail}</p>}
          </div>

          <div>
            <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-2">ডেলিভারি ঠিকানা (Ship To)</h3>
            <p className="text-slate-700 leading-relaxed">{order.deliveryAddress}</p>
            <p className="text-slate-500 font-semibold mt-1">এরিয়া: {order.cityArea}</p>
            <p className="text-slate-500">পদ্ধতি: {order.deliveryMethod}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">আইটেম বিবরণী</th>
                <th className="py-3 px-3">SKU কোড</th>
                <th className="py-3 px-3 text-right">একক মূল্য</th>
                <th className="py-3 px-3 text-center">পরিমাণ</th>
                <th className="py-3 px-4 text-right">মোট (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item: any, idx: number) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{item.productName}</p>
                    {item.warrantyInfo && (
                      <p className="text-[10px] text-blue-700 font-medium mt-0.5">
                        ওয়ারেন্টি: {item.warrantyInfo}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                    {item.productSku}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    ৳{Number(item.unitPrice).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center font-bold font-mono">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">
                    ৳{Number(item.subtotal).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-6">
          <div className="text-xs text-slate-500 max-w-sm space-y-2">
            <p className="font-bold text-slate-700">শর্তাবলী ও ওয়ারেন্টি নীতি:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
              <li>অফিসিয়াল ওয়ারেন্টি দাবি করার জন্য অনুগ্রহ করে এই ক্যাশমেমো ও পণ্যের বক্স সংরক্ষণ করুন।</li>
              <li>ফিজিক্যাল ড্যামেজ বা পোড়া অংশে কোনো ওয়ারেন্টি প্রযোজ্য নয়।</li>
              <li>পণ্য পৌঁছানোর পর আনবক্সিং ভিডিও তৈরি রাখার অনুরোধ করা যাচ্ছে।</li>
            </ul>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>সাবটোটাল:</span>
              <span className="font-mono">৳{Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-mono">৳{Number(order.deliveryFee).toLocaleString()}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>ছাড় (Discount):</span>
                <span className="font-mono">-৳{Number(order.discount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900">
              <span>সর্বমোট প্রদেয়:</span>
              <span className="font-mono text-[#2A3B97]">৳{Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        <div className="mt-16 pt-8 border-t border-dashed border-slate-200 flex justify-between items-end text-xs text-slate-500">
          <div className="text-center w-40">
            <div className="border-t border-slate-300 pt-1">গ্রাহকের স্বাক্ষর</div>
          </div>
          <div className="text-center w-48">
            <div className="border-t border-slate-300 pt-1 font-bold text-slate-700">
              অনুমোদিত স্বাক্ষরকারী<br />
              <span className="text-[10px] font-normal text-slate-500">Trust Computer-Moulvibazar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Client print script injection */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const btn = document.getElementById('print-btn');
            if (btn) {
              btn.addEventListener('click', () => window.print());
            }
          `,
        }}
      />
    </div>
  );
}
