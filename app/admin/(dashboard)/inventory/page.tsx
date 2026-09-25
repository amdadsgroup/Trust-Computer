import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { submitStockAdjustmentAction } from './actions';
import { Boxes, PlusCircle, ArrowDownRight, ArrowUpRight, History, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdminInventoryPageProps {
  searchParams: {
    productId?: string;
  };
}

export default async function AdminInventoryPage({ searchParams }: AdminInventoryPageProps) {
  let products: any[] = [];
  let movements: any[] = [];

  try {
    const [fetchedProducts, fetchedMovements] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, sku: true, stock: true },
      }),
      prisma.inventoryMovement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: {
          product: { select: { name: true, sku: true } },
          user: { select: { name: true } },
        },
      }),
    ]);
    products = fetchedProducts;
    movements = fetchedMovements;
  } catch (e) {
    console.error('Error fetching inventory page data:', e);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          ইনভেন্টরি ও স্টক লেজার (Stock Ledger)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          পণ্য গ্রহণ (Receive), সমন্বয় (Adjustment) ও স্টক ওঠানামার সম্পূর্ণ অডিট লগ।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stock Adjustment Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-brand" />
            <span>স্টক সমন্বয় ও গ্রহণ ফর্ম</span>
          </h2>

          <form
            action={async (formData: FormData) => {
              'use server';
              await submitStockAdjustmentAction(formData);
            }}
            className="space-y-4 text-xs sm:text-sm"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">পণ্য নির্বাচন করুন *</label>
              <select
                name="productId"
                required
                defaultValue={searchParams.productId || ''}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand cursor-pointer text-xs"
              >
                <option value="">পণ্য বেছে নিন...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (মজুত: {p.stock} টি) - SKU: {p.sku}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">সমন্বয়ের ধরন (Type) *</label>
              <select
                name="type"
                required
                defaultValue="RECEIVE"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand cursor-pointer text-xs"
              >
                <option value="RECEIVE">RECEIVE (নতুন স্টক গ্রহণ / ক্রয়)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (স্টক গণনা বা সংশোধন)</option>
                <option value="RETURN">RETURN (গ্রাহক কর্তৃক ফেরত / রিস্টক)</option>
                <option value="INITIAL">INITIAL (প্রাথমিক এন্ট্রি)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                পরিমাণ (Quantity Change) *
              </label>
              <input
                type="number"
                name="quantity"
                required
                placeholder="যেমন: 10 (বাড়াতে) অথবা -2 (কমাতে)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                স্টক যোগ করতে পজিটিভ সংখ্যা দিন, বাদ দিতে মাইনাস (-) দিয়ে লিখুন।
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">কারণ বা ভাউচার নোট *</label>
              <input
                type="text"
                name="reason"
                required
                placeholder="যেমন: চালান #HIK-5012 গ্রহণ অথবা ইনস্পেকশন ঘাটতি"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                রেফারেন্স আইডি / ইনভয়েস নং (ঐচ্ছিক)
              </label>
              <input
                type="text"
                name="referenceId"
                placeholder="INV-9921"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl transition shadow text-xs"
            >
              স্টক লেজারে রেকর্ড করুন
            </button>
          </form>
        </div>

        {/* Right Column: Ledger Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-brand" />
              <span>সাম্প্রতিক স্টক মুভমেন্ট লেজার (Movement History)</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 font-semibold">
                  <th className="pb-2.5">তারিখ ও সময়</th>
                  <th className="pb-2.5">পণ্য</th>
                  <th className="pb-2.5">টাইপ</th>
                  <th className="pb-2.5">পরিবর্তন</th>
                  <th className="pb-2.5">নতুন ব্যালেন্স</th>
                  <th className="pb-2.5">কারণ / রেফারেন্স</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.length > 0 ? (
                  movements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-3 text-[10px] text-slate-400 font-mono">
                          {new Date(m.createdAt).toLocaleString('bn-BD', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3">
                          <span className="font-bold text-slate-800 block line-clamp-1">
                            {m.product.name}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            SKU: {m.product.sku}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                            {m.type}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`font-black flex items-center gap-0.5 ${
                              isPositive ? 'text-emerald-600' : 'text-accent-600'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            <span>{isPositive ? `+${m.quantity}` : m.quantity}</span>
                          </span>
                        </td>
                        <td className="py-3 font-bold text-slate-900">{m.newStock} টি</td>
                        <td className="py-3 text-[11px] text-slate-600">
                          <div>{m.reason}</div>
                          {m.referenceId && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ref: {m.referenceId}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      কোনো মুভমেন্ট হিস্ট্রি নেই।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
