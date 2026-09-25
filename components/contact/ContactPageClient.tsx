'use client';

import React from 'react';
import { Phone, Mail, MapPin, Facebook, MessageCircle, Clock } from 'lucide-react';
import { getGeneralWhatsAppLink } from '@/lib/whatsapp';
import ContactForm from '@/components/contact/ContactForm';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ContactPageClient() {
  const whatsappUrl = getGeneralWhatsAppLink();
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('contact.title', 'Contact & Showroom Location')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          {t('contact.subtitle', 'Visit our Kusumbagh showroom directly or contact us via phone/WhatsApp for any computer hardware, CCTV camera, or servicing inquiries.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              {t('contact.address_title', 'Direct Showroom Contact')}
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
                    {t('brand.address', 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh.')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-brand rounded-2xl border border-blue-100 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    {t('contact.hotline_label', 'Hotline / Mobile')}
                  </h3>
                  <a
                    href="tel:01753765372"
                    className="text-slate-900 font-bold hover:text-brand transition block mt-0.5"
                  >
                    01753-765372
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    {t('contact.whatsapp_label', 'WhatsApp Support')}
                  </h3>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 font-bold hover:underline transition block mt-0.5"
                  >
                    {t('contact.whatsapp_direct', '+880 1753-765372 (Direct Chat)')}
                  </a>
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
                    href="mailto:trustcomputermb@gmail.com"
                    className="text-slate-600 hover:text-slate-900 transition block mt-0.5"
                  >
                    trustcomputermb@gmail.com
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
                    href="https://www.facebook.com/TrustComputerr/"
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
                    {t('contact.schedule_timing', 'Saturday to Thursday: 10:00 AM - 9:00 PM')}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t('contact.schedule_note', '(Showroom closed on Friday, online orders and WhatsApp inquiries remain active)')}
                  </p>
                </div>
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
              href={whatsappUrl}
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
