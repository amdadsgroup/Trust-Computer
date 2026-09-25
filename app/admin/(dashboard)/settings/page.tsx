import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { updateStoreSettingsAction } from './actions';
import { Settings, Save, Store, Truck, Phone, MapPin, Facebook, Palette } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  let settings: any = null;
  try {
    settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });
  } catch (e) {
    console.error('Error fetching settings:', e);
  }

  const current = settings || {
    storeName: 'Trust Computer-Moulvibazar',
    ownerName: 'Shiblu Ahmed',
    phone: '01753-765372',
    email: 'trustcomputermb@gmail.com',
    address: 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh',
    facebookUrl: 'https://www.facebook.com/TrustComputerr/',
    whatsappNumber: '+8801753765372',
    deliveryFeeInsideMoulvibazar: 60.0,
    deliveryFeeOutsideMoulvibazar: 120.0,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            শোরুম ও ব্যবসা সেটিংস (Store Settings)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Trust Computer এর যোগাযোগের ঠিকানা, ফোন নম্বর ও ডেলিভারি চার্জ নির্ধারণ করুন।
          </p>
        </div>

        <Link
          href="/admin/settings/branding"
          className="inline-flex items-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition self-start sm:self-auto"
        >
          <Palette className="w-4 h-4" />
          <span>ব্র্যান্ড ও লোগো সেটিংস</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form
          action={async (formData: FormData) => {
            'use server';
            await updateStoreSettingsAction(formData);
          }}
          className="space-y-6 text-xs sm:text-sm"
        >
          {/* Business Info */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <Store className="w-4 h-4 text-brand" />
              <span>প্রতিষ্ঠান ও স্বত্বাধিকারীর তথ্য</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠানের নাম</label>
                <input
                  type="text"
                  name="storeName"
                  defaultValue={current.storeName}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">স্বত্বাধিকারীর নাম</label>
                <input
                  type="text"
                  name="ownerName"
                  defaultValue={current.ownerName}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>যোগাযোগ ও সোশ্যাল মিডিয়া</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">হটলাইন / ফোন নম্বর</label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={current.phone}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">অফিসিয়াল ইমেইল</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={current.email}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp নম্বর</label>
                <input
                  type="text"
                  name="whatsappNumber"
                  defaultValue={current.whatsappNumber}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ফেসবুক পেজ লিংক</label>
                <input
                  type="url"
                  name="facebookUrl"
                  defaultValue={current.facebookUrl}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">শোরুমের সম্পূর্ণ ঠিকানা</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={current.address}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          {/* Delivery Pricing */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-accent-600" />
              <span>ডেলিভারি ফি কনফিগারেশন</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  মৌলভীবাজার সদর ডেলিভারি ফি (BDT) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="deliveryFeeInsideMoulvibazar"
                  defaultValue={Number(current.deliveryFeeInsideMoulvibazar)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  মৌলভীবাজার উপজেলা ও জেলার বাহিরে ফি (BDT) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="deliveryFeeOutsideMoulvibazar"
                  defaultValue={Number(current.deliveryFeeOutsideMoulvibazar)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-brand hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>সেটিংস পরিবর্তন সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
