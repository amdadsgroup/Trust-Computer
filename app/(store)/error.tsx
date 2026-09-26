'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { getGeneralWhatsAppLink } from '@/lib/whatsapp';

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const whatsappUrl = getGeneralWhatsAppLink(
    'Hello Trust Computer, I encountered an issue on your website. Please assist.'
  );

  useEffect(() => {
    console.error('Store error occurred:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          সাময়িক ত্রুটি দেখা দিয়েছে (Something went wrong)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          পৃষ্ঠাটি লোড হতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা সরাসরি আমাদের সাথে যোগাযোগ করুন।
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow"
        >
          <RefreshCw className="w-4 h-4" />
          <span>পুনরায় চেষ্টা করুন (Retry)</span>
        </button>

        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl transition"
        >
          <Home className="w-4 h-4" />
          <span>মূল পাতা (Home)</span>
        </Link>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <MessageCircle className="w-4 h-4" />
          <span>সরাসরি হোয়াটসঅ্যাপে সাহায্য নিন</span>
        </a>
      </div>
    </div>
  );
}
