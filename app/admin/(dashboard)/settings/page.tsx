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
    ownerName: 'Trust Computer Management',
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
            Store & Showroom Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure showroom contact information, location, and regional delivery charges.
          </p>
        </div>

        <Link
          href="/admin/settings/branding"
          className="inline-flex items-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition self-start sm:self-auto"
        >
          <Palette className="w-4 h-4" />
          <span>Branding & Logo Settings</span>
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
              <span>Business Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  defaultValue={current.storeName}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Proprietor / Representative Name</label>
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
              <span>Contact Details & Social Media</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hotline / Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={current.phone}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={current.email}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsappNumber"
                  defaultValue={current.whatsappNumber}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Facebook Page URL</label>
                <input
                  type="url"
                  name="facebookUrl"
                  defaultValue={current.facebookUrl}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Full Showroom Address</label>
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
              <span>Delivery Fee Configuration</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Inside Moulvibazar Sadar Fee (BDT) *
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
                  Outside Moulvibazar / Upazilas Fee (BDT) *
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
              <span>Save Store Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
