'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, ShieldCheck, Phone, MessageCircle } from 'lucide-react';
import { getGeneralWhatsAppLink } from '@/lib/whatsapp';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ContentPageData } from '@/lib/content';

export default function PolicyView({ page }: { page: ContentPageData }) {
  const whatsappUrl = getGeneralWhatsAppLink();
  const { isBangla } = useLanguage();

  // Simple clean markdown parser for headings, lists, blockquotes, and paragraphs
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = (key: number) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1.5 text-slate-700 my-3 text-xs sm:text-sm">
            {currentList.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const formatInline = (str: string) => {
      return str
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs">$1</code>');
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        currentList.push(trimmed.substring(2));
      } else {
        flushList(index);

        if (trimmed.startsWith('### ')) {
          elements.push(
            <h3 key={index} className="text-base sm:text-lg font-bold text-slate-900 mt-6 mb-2 border-b border-slate-100 pb-1.5">
              {trimmed.substring(4)}
            </h3>
          );
        } else if (trimmed.startsWith('## ')) {
          elements.push(
            <h2 key={index} className="text-lg sm:text-xl font-extrabold text-slate-900 mt-8 mb-3 border-b border-slate-200 pb-2">
              {trimmed.substring(3)}
            </h2>
          );
        } else if (trimmed.startsWith('> ')) {
          elements.push(
            <div key={index} className="my-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div dangerouslySetInnerHTML={{ __html: formatInline(trimmed.substring(2)) }} />
            </div>
          );
        } else if (trimmed.length > 0) {
          elements.push(
            <p key={index} className="text-xs sm:text-sm text-slate-700 leading-relaxed my-2" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
          );
        }
      }
    });

    flushList(lines.length);
    return elements;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      {/* Policy Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {page.title}
          </h1>

          {page.isDraft && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              {isBangla ? 'খসড়া নীতিমালা (Draft Content)' : 'Draft Policy'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString('en-GB') : 'September 2026'}
          </span>
          <span>•</span>
          <span>Trust Computer-Moulvibazar</span>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        {page.isDraft && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs leading-relaxed">
            <strong>{isBangla ? 'বিজ্ঞপ্তি:' : 'Notice:'}</strong>{' '}
            {isBangla
              ? 'এই নীতিমালাটি খসড়া আকারে প্রস্তুত করা হয়েছে। ক্লায়েন্টের আইনি অথবা অপারেশনাল নির্দেশনার ভিত্তিতে যে কোনো সময় এটি সংশোধনযোগ্য।'
              : 'This policy is provided as draft guidance. It is subject to updates and revisions in accordance with store operational and legal standards.'}
          </div>
        )}

        <div className="prose max-w-none">
          {renderMarkdown(page.content)}
        </div>

        {/* Verification Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>
              {isBangla
                ? 'অফিসিয়াল শোরুম: টি.এস প্লাজা (২য় তলা), কুসুমবাগ, মৌলভীবাজার'
                : 'Official Showroom: T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a href="tel:01753765372" className="flex items-center gap-1 text-brand font-bold hover:underline">
              <Phone className="w-3.5 h-3.5" />
              01753-765372
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-600 font-bold hover:underline">
              <MessageCircle className="w-3.5 h-3.5" />
              {isBangla ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}
            </a>
          </div>
        </div>
      </div>

      {/* Quick Policy Switcher */}
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
        <h3 className="font-bold text-slate-800 mb-3 uppercase tracking-wider">
          {isBangla ? 'অন্যান্য পলিসি ও শর্তাবলী:' : 'Other Policies & Terms:'}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/policies/delivery" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-brand transition">
            {isBangla ? 'ডেলিভারি নীতিমালা (Delivery)' : 'Delivery Policy'}
          </Link>
          <Link href="/policies/returns" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-brand transition">
            {isBangla ? 'রিটার্ন ও রিফান্ড (Returns & Refund)' : 'Returns & Refund'}
          </Link>
          <Link href="/policies/warranty" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-brand transition">
            {isBangla ? 'ওয়ারেন্টি নীতিমালা (Warranty)' : 'Warranty Policy'}
          </Link>
          <Link href="/policies/privacy" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-brand transition">
            {isBangla ? 'প্রাইভেসি পলিসি (Privacy)' : 'Privacy Policy'}
          </Link>
          <Link href="/policies/terms" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-brand transition">
            {isBangla ? 'শর্তাবলী (Terms & Conditions)' : 'Terms & Conditions'}
          </Link>
        </div>
      </div>
    </div>
  );
}
