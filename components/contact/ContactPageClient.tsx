'use client';

import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  MessageCircle,
  Clock,
  Wrench,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';
import { business, getSalesWhatsAppLink, getServiceWhatsAppLink } from '@/lib/business';
import ContactForm from '@/components/contact/ContactForm';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ContactPageClient() {
  const salesWhatsAppUrl = getSalesWhatsAppLink();
  const serviceWhatsAppUrl = getServiceWhatsAppLink();
  const { t, isBangla } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2A3B97] text-xs font-bold mb-1">
          <span>{t('brand.tagline', '- Your Trust, Our Technology -')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('contact.title', 'Contact & Showroom Location')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Visit our Kusumbagh showroom directly or reach out through our dedicated Sales or Service channels.
        </p>
      </div>

      {/* 2 Dedicated Business Contact Cards: Sales & Service */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* 1. SALES & CUSTOMER CARE */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-blue-100 hover:border-blue-300 shadow-sm transition space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#2A3B97] px-2.5 py-1 rounded-full border border-blue-200">
                Sales & Orders
              </span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#2A3B97]">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-base font-extrabold text-slate-900">
              {business.sales.title}
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed">
              {business.sales.description}
            </p>

            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Sales Number:
              </span>
              <span className="text-xl font-black font-mono text-slate-900 tracking-wider">
                {business.sales.phone}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            <a
              href={business.sales.tel}
              className="w-full flex items-center justify-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Sales: {business.sales.phone}</span>
            </a>

            <a
              href={salesWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Sales WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 2. SERVICE & TECHNICAL SUPPORT */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-emerald-100 hover:border-emerald-300 shadow-sm transition space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                Repairs & CCTV
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Wrench className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-base font-extrabold text-slate-900">
              {business.service.title}
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed">
              {business.service.description}
            </p>

            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Service Number:
              </span>
              <span className="text-xl font-black font-mono text-slate-900 tracking-wider">
                {business.service.phone}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            <a
              href={business.service.tel}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call Service: {business.service.phone}</span>
            </a>

            <a
              href={serviceWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Service WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Showroom Details & Contact Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Address & Hours Info Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Showroom Location & General Inquiries
          </h2>

          <div className="space-y-5 text-xs sm:text-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-accent-600 rounded-2xl border border-red-100 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">
                  {t('contact.full_address_label', 'Full Showroom Address')}
                </h3>
                <p className="text-slate-600 leading-relaxed mt-0.5">
                  {business.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">
                  {t('contact.email_label', 'Official Email')}
                </h3>
                <a
                  href={`mailto:${business.email}`}
                  className="text-slate-600 hover:text-slate-900 transition block mt-0.5"
                >
                  {business.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 flex-shrink-0">
                <Facebook className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">
                  {t('contact.facebook_label', 'Facebook Page')}
                </h3>
                <a
                  href={business.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-bold hover:underline transition block mt-0.5"
                >
                  facebook.com/TrustComputerr
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">
                  {t('contact.schedule_label', 'Showroom Schedule')}
                </h3>
                <p className="text-slate-600 mt-0.5">
                  {isBangla ? business.showroomHours.bn : business.showroomHours.en}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  (Showroom closed on Friday; online orders and WhatsApp inquiries remain active)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              {t('contact.form_title', 'Send an Inquiry / Message')}
            </h2>
            <ContactForm />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <a
              href={salesWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t('contact.whatsapp_reply_btn', 'Get Instant Reply on WhatsApp')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
