'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, MessageCircle, ShieldCheck, Clock } from 'lucide-react';
import { getGeneralWhatsAppLink } from '@/lib/whatsapp';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageToggle from '../ui/LanguageToggle';

export default function Footer() {
  const whatsappUrl = getGeneralWhatsAppLink();
  const { t, isBangla } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-auto">
      {/* Upper Footer: Value Props */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/40 text-blue-400 border border-blue-800/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white">{t('footer.prop1_title', '100% Genuine Products')}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('footer.prop1_desc', 'Official brand warranty & verified authentic tech components')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-950/40 text-rose-400 border border-red-800/50">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white">{t('footer.prop2_title', 'Central Showroom in Moulvibazar')}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('footer.prop2_desc', 'T.S Plaza (2nd Floor), Kusumbagh Point')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white">{t('footer.prop3_title', 'Direct WhatsApp Consultation')}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('footer.prop3_desc', 'Real-time technical advice & CCTV setup assistance')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-800/50">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white">{t('footer.prop4_title', 'Fast Nationwide Delivery')}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('footer.prop4_desc', 'Moulvibazar local express & reliable courier delivery')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-auto">
                <Image
                  src="/brand/trust-computer-logo.png"
                  alt="Trust Computer-Moulvibazar"
                  width={190}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>

            <p className="text-sm text-slate-300 italic leading-relaxed">
              {t('brand.tagline', 'Your Trusted Destination for Quality Computers & CCTV Surveillance Systems in Moulvibazar.')}
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p><strong className="text-slate-300">Showroom Hours:</strong> {t('brand.hours', 'Sat - Thu: 10:00 AM - 9:00 PM')}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/TrustComputerr/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <div className="ml-auto">
                <LanguageToggle variant="pill" />
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-[#0084d6] pl-2">
              {t('footer.categories_title', 'Product Categories')}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/categories/cctv-surveillance" className="hover:text-white transition">
                  {t('cat.security', 'CCTV & Surveillance Cameras')}
                </Link>
              </li>
              <li>
                <Link href="/categories/desktop-components" className="hover:text-white transition">
                  {t('cat.desktop', 'Desktop PC & Components')}
                </Link>
              </li>
              <li>
                <Link href="/categories/laptops-notebooks" className="hover:text-white transition">
                  {t('cat.laptop', 'Laptops & Notebooks')}
                </Link>
              </li>
              <li>
                <Link href="/categories/networking-equipment" className="hover:text-white transition">
                  {t('cat.networking', 'Routers & Networking Equipment')}
                </Link>
              </li>
              <li>
                <Link href="/categories/computer-accessories" className="hover:text-white transition">
                  {t('cat.accessories', 'Keyboards, Mice & Accessories')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition">
                  {t('product.view_all_catalog', 'All Products Catalog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Account */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-rose-500 pl-2">
              {t('footer.support_title', 'Customer Support & Policies')}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/account" className="hover:text-white transition">
                  {t('nav.account', 'Customer Account Dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition">
                  {t('nav.track_order', 'Track Order')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  {isBangla ? 'আমাদের সম্পর্কে (About Us)' : 'About Trust Computer'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  {isBangla ? 'যোগাযোগ ও শোরুম (Contact Us)' : 'Contact & Showroom Location'}
                </Link>
              </li>
              <li>
                <Link href="/policies/delivery" className="hover:text-white transition">
                  Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-white transition">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/warranty" className="hover:text-white transition">
                  Warranty Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-white transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Contact Info */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-[#0084d6] pl-2">
              {t('footer.contact_title', 'Showroom Contact')}
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 mt-1 flex-shrink-0" />
                <span className="text-xs leading-relaxed">
                  {t('brand.address', 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh.')}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="tel:01753765372" className="text-xs hover:text-white font-medium">
                  01753-765372
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="mailto:trustcomputermb@gmail.com"
                  className="text-xs hover:text-white break-all"
                >
                  trustcomputermb@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:underline"
                >
                  {isBangla ? 'হোয়াটসঅ্যাপে সরাসরি চ্যাট করুন' : 'Chat with Us on WhatsApp'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 bg-black/60 py-4 text-xs text-slate-400">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} <strong>Trust Computer-Moulvibazar</strong>. {t('footer.all_rights', 'All rights reserved.')}
          </p>
          <p className="text-slate-400">
            {t('footer.dev_partner', 'Software Developed BY Amdads Group')}
          </p>
        </div>
      </div>
    </footer>
  );
}
