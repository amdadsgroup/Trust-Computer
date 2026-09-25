'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { loginAdminAction } from './actions';
import { Lock, Mail, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAdminAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ওয়েবসাইটে ফিরে যান (Back to Store)</span>
        </Link>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="relative h-12 w-auto mx-auto flex items-center justify-center">
              <Image
                src="/brand/trust-computer-logo.png"
                alt="Trust Computer Logo"
                width={210}
                height={44}
                priority
                className="h-12 w-auto object-contain"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                এডমিন ও স্টাফ পোর্টাল
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Trust Computer-Moulvibazar ম্যানেজমেন্ট কনসোল
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-800/80 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                অফিসিয়াল ইমেইল
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@trustcomputermb.com"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition placeholder-slate-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                গোপন পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition placeholder-slate-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-brand-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <span>লগইন করুন (Access Dashboard)</span>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800 text-[11px] text-slate-500">
            নিরাপত্তা নির্দেশিকা: শুধুমাত্র অনুমোদিত স্বত্বাধিকারী ও স্টাফদের জন্য সংরক্ষিত।
          </div>
        </div>
      </div>
    </div>
  );
}
