import React from 'react';
import Link from 'next/link';
import { PackageOpen, Home, Search, Phone } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-sm">
        <PackageOpen className="w-10 h-10 text-brand" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-accent-600 tracking-wider uppercase">
          404 — Page Not Found
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          The requested page or product could not be located. It may have been moved or is currently unavailable in our catalog.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow"
        >
          <Search className="w-4 h-4" />
          <span>Browse Catalog</span>
        </Link>

        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl transition"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="pt-6 border-t border-slate-100 text-xs text-slate-400">
        <span>Need assistance? Hotline: </span>
        <a href="tel:01753765372" className="font-bold text-brand hover:underline">
          01753-765372
        </a>
      </div>
    </div>
  );
}
