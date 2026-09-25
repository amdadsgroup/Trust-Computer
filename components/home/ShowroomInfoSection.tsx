'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Phone, Clock, Wrench, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ShowroomInfoSection({ whatsappUrl }: { whatsappUrl: string }) {
  const { t } = useLanguage();

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('home.showroom_badge', 'Trusted IT & Security Solutions in Moulvibazar')}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('home.showroom_heading', 'Welcome to Trust Computer-Moulvibazar Showroom')}
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {t('home.showroom_desc')}
          </p>

          <p className="text-slate-500 text-xs italic">
            “{t('brand.tagline', 'Your Trusted Destination for Quality Computers & CCTV Surveillance Systems in Moulvibazar.')}”
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{t('brand.address', 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar')}</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Hotline: 01753-765372</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>{t('brand.hours', 'Hours: Saturday - Thursday (10:00 AM - 9:00 PM)')}</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Wrench className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Home & Office CCTV Camera Setup & Servicing</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-3 justify-center items-stretch bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <h4 className="font-bold text-sm text-slate-800 text-center">
            {t('home.direct_orders_title', 'Direct Inquiries & Fast Orders')}
          </h4>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('home.send_whatsapp', 'Send WhatsApp Message')}</span>
          </a>
          <a
            href="tel:01753765372"
            className="flex items-center justify-center gap-2 bg-[#081621] hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition"
          >
            <Phone className="w-4 h-4" />
            <span>{t('home.call_hotline', 'Call Hotline: 01753-765372')}</span>
          </a>
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-300 transition"
          >
            <span>{t('home.directions', 'Showroom Map & Directions')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
