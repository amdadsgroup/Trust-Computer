import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { updateStoreSettingsAction } from './actions';
import { Settings, Save, Store, Truck, Phone, MapPin, Facebook, Palette, CreditCard } from 'lucide-react';

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
    phone: '01797854836',
    email: 'trustcomputermb@gmail.com',
    address: 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh',
    facebookUrl: 'https://www.facebook.com/TrustComputerr/',
    whatsappNumber: '+8801797854836',
    servicePhone: '01608346407',
    serviceWhatsapp: '+8801608346407',
    bkashNumber: '01712556225',
    deliveryFeeInsideMoulvibazar: 60.0,
    deliveryFeeOutsideMoulvibazar: 120.0,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Store & Business Contact Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure showroom contacts (Sales, Service, bKash), location, and regional delivery charges.
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
              <span>Official Business Contacts (Sales, Service & bKash)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sales & Customer Care */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sales & Customer Care Phone *
                </label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={current.phone || '01797854836'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Official number for product sales and general queries
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sales WhatsApp Number *
                </label>
                <input
                  type="text"
                  name="whatsappNumber"
                  defaultValue={current.whatsappNumber || '+8801797854836'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  International format (e.g. +8801797854836)
                </span>
              </div>

              {/* Service & Technical Support */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Service & Technical Support Phone *
                </label>
                <input
                  type="text"
                  name="servicePhone"
                  defaultValue={current.servicePhone || '01608346407'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Specific hotline for computer & CCTV servicing, repair, technical maintenance
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Service WhatsApp Number *
                </label>
                <input
                  type="text"
                  name="serviceWhatsapp"
                  defaultValue={current.serviceWhatsapp || '+8801608346407'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  International format (e.g. +8801608346407)
                </span>
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

          {/* Payment Settings */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-pink-600" />
              <span>Payment Settings</span>
            </h2>

            <div className="p-5 rounded-2xl bg-white border-2 border-pink-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                    bKASH CASH OUT
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manual bKash cash-out & payment system for customer orders
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>Status: Enabled</span>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  bKASH Receiver Number:
                </label>
                <input
                  type="text"
                  name="bkashNumber"
                  defaultValue={current.bkashNumber || '01712556225'}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-pink-600 focus:bg-white font-mono font-black text-slate-900 text-sm"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Centralized official bKash number (01712556225). Read by Checkout, Order Confirmation, Customer Dashboard, and Admin Verification.
                </span>
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
