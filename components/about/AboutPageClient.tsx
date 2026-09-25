'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck, CheckCircle2, Heart, MessageCircle } from 'lucide-react';
import { getGeneralWhatsAppLink } from '@/lib/whatsapp';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AboutPageClient() {
  const whatsappUrl = getGeneralWhatsAppLink();
  const { t, isBangla } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12">
      {/* Intro Header */}
      <div className="text-center space-y-4">
        <div className="relative h-14 w-auto mx-auto flex items-center justify-center py-1">
          <Image
            src="/brand/trust-computer-logo.png"
            alt="Trust Computer-Moulvibazar Logo"
            width={240}
            height={50}
            priority
            className="h-14 w-auto object-contain"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Trust Computer-Moulvibazar
        </h1>

        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-accent-700 text-xs sm:text-sm font-semibold">
          <Heart className="w-4 h-4 fill-accent-600 text-accent-600" />
          <span>{t('about.hero_badge', 'Your Trusted Destination for Quality Computers & CCTV Surveillance in Moulvibazar.')}</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            {t('about.intro_heading', 'Who We Are & Our Commitment')}
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed mb-4">
            {t('about.intro_p1')}
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">
            {t('about.intro_p2')}
          </p>
        </div>

        {/* Business Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <ShieldCheck className="w-6 h-6 text-brand" />
            <h3 className="font-bold text-slate-800 text-sm">
              {t('about.pillar1_title', '100% Genuine Products')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('about.pillar1_desc', 'Authentic tech hardware from top global brands including Hikvision, Dahua, TP-Link, Intel, Asus, and HP.')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {t('about.pillar2_title', 'CCTV Security Solutions')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('about.pillar2_desc', 'Precision CCTV camera installation, configuration, and technical maintenance for homes, offices, and industries.')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <MapPin className="w-6 h-6 text-accent-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {t('about.pillar3_title', 'Central Showroom Location')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('about.pillar3_desc', 'Convenient physical outlet located at T.S Plaza (2nd Floor), Kusumbagh Point in Moulvibazar.')}
            </p>
          </div>
        </div>

        {/* Verified Profile Card */}
        <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl space-y-3 text-xs">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            {t('about.credentials_heading', 'Verified Business Credentials')}
          </h3>
          <p><strong className="text-white">{t('about.cred_name', 'Enterprise Name:')}</strong> Trust Computer-Moulvibazar</p>
          <p><strong className="text-white">{t('about.cred_type', 'Business Type:')}</strong> Computer, Laptop, CCTV & Networking Showroom</p>
          <p><strong className="text-white">{t('about.cred_address', 'Showroom Address:')}</strong> {t('brand.address', 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh')}</p>
          <p><strong className="text-white">{t('about.cred_phone', 'Hotline / Phone:')}</strong> 01753-765372</p>
          <p><strong className="text-white">{t('about.cred_email', 'Official Email:')}</strong> trustcomputermb@gmail.com</p>
          <p><strong className="text-white">{t('about.cred_web', 'Official Website:')}</strong> https://trustcomputermb.com</p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
          <Link
            href="/contact"
            className="flex-1 text-center bg-brand hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition shadow"
          >
            {t('about.contact_btn', 'Get in Touch / Showroom Map')}
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition shadow"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('about.whatsapp_btn', 'Instant WhatsApp Consultation')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
