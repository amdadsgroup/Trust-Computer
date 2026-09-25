import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { requireAuth } from '@/lib/auth';
import { brand } from '@/lib/brand';
import {
  ArrowLeft,
  Shield,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  ExternalLink,
  Smartphone,
  Eye,
  Layers,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBrandingSettingsPage() {
  const session = await requireAuth();
  const isOwner = session.role === 'OWNER';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ব্র্যান্ড আইডেন্টিটি ও লোগো ম্যানেজমেন্ট
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#2A3B97] font-mono">
                Brand Core
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trust Computer এর অফিশিয়াল লোগো, মার্ক, ফেভিকন এবং কালার টোকেন যাচাই ও নিয়ন্ত্রণ করুন।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/BRAND_GUIDELINES.md"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#2A3B97] bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>ব্র্যান্ড গাইডলাইন দেখুন</span>
          </Link>
        </div>
      </div>

      {/* Grid: Official Brand Asset Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Official Primary Logo */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <ImageIcon className="w-4 h-4 text-[#2A3B97]" />
              <span>মূল অফিশিয়াল লোগো (Primary Full Logo)</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> অনুমোদিত
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            মৌলভীবাজার শাখার অফিশিয়াল প্রাইমারি লোগো। ডেক্সটপ হেডার, ফুটার, চালান (ইনভয়েস), এবং অথেনটিকেশন পেজে প্রদর্শিত হয়।
          </p>

          {/* Light Background Preview */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">হালকা সারফেসে প্রদর্শন:</span>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
              <Image
                src={brand.assets.logo}
                alt="Trust Computer Official Logo"
                width={260}
                height={55}
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>

          {/* Dark Background Preview */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ডার্ক সারফেসে প্রদর্শন (Dark Header / Footer):</span>
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
              <Image
                src={brand.assets.logo}
                alt="Trust Computer Official Logo Dark"
                width={260}
                height={55}
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
            <span>ফাইল: {brand.assets.logo}</span>
            <span className="text-slate-400">1024 × 215 px</span>
          </div>
        </div>

        {/* Card 2: Official Circular Logo Mark & App Icons */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <Smartphone className="w-4 h-4 text-[#E91D26]" />
              <span>লোগো মার্ক, ফেভিকন ও অ্যাপ আইকন</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> অফিশিয়াল মার্ক
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            মূল লোগোর বাম পাশের বৃত্তাকার পাওয়ার-সিম্বল মার্ক। এটি ফেভিকন, অ্যাপ আইকন ও মোবাইল কম্প্যাক্ট হেডারে ব্যবহৃত হয়।
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {/* Logo Mark */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
              <div className="w-14 h-14 mx-auto relative flex items-center justify-center">
                <Image
                  src={brand.assets.logoMark}
                  alt="Logo Mark"
                  width={56}
                  height={56}
                  className="w-14 h-14 object-contain"
                />
              </div>
              <p className="font-bold text-xs text-slate-800">লোগো মার্ক</p>
              <p className="text-[10px] text-slate-400 font-mono">215 × 215 px</p>
            </div>

            {/* Apple Touch Icon */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
              <div className="w-14 h-14 mx-auto relative flex items-center justify-center p-1 bg-white rounded-2xl shadow-sm border border-slate-200">
                <Image
                  src={brand.assets.appleTouchIcon}
                  alt="Apple Touch Icon"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <p className="font-bold text-xs text-slate-800">অ্যাপল টাচ</p>
              <p className="text-[10px] text-slate-400 font-mono">180 × 180 px</p>
            </div>

            {/* PWA Icon */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
              <div className="w-14 h-14 mx-auto relative flex items-center justify-center p-1 bg-white rounded-2xl shadow-sm border border-slate-200">
                <Image
                  src={brand.assets.icon192}
                  alt="PWA Icon"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <p className="font-bold text-xs text-slate-800">PWA আইকন</p>
              <p className="text-[10px] text-slate-400 font-mono">192 × 192 px</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
            <span>ফেভিকন: {brand.assets.favicon}</span>
            <span className="text-slate-400">32 × 32 px</span>
          </div>
        </div>
      </div>

      {/* Row: Exact Color Palette Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#2A3B97]" />
            <h2 className="font-bold text-base text-slate-900">
              অফিশিয়াল কালার প্যালেট ও টোকেন (Exact Extracted Colors)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            লোগো থেকে সরাসরি স্যাম্পলকৃত সুনির্দিষ্ট আরজিবি এবং হেক্স মান
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trust Blue */}
          <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl shadow-md border-2 border-white flex-shrink-0"
                style={{ backgroundColor: brand.colors.primaryBlue }}
              />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Trust Blue (প্রাইমারি ব্র্যান্ড কালার)
                </h3>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  HEX: {brand.colors.primaryBlue}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {brand.colors.primaryBlueRgb}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-blue-100">
              <p><strong>ব্যবহারের ক্ষেত্র:</strong> প্রাইমারি বাটন, নেভিগেশন হাইলাইট, লিংক, ক্যাটাগরি মেনু, ফোকাস স্টেট।</p>
              <p><strong>কনট্রাস্ট অনুপাত:</strong> 7.5:1 (WCAG AAA কমপ্লায়েন্ট)</p>
            </div>
          </div>

          {/* Trust Red */}
          <div className="p-5 rounded-2xl border border-red-200 bg-red-50/40 space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl shadow-md border-2 border-white flex-shrink-0"
                style={{ backgroundColor: brand.colors.primaryRed }}
              />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Trust Red (ব্র্যান্ড অ্যাকসেন্ট কালার)
                </h3>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  HEX: {brand.colors.primaryRed}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {brand.colors.primaryRedRgb}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-red-100">
              <p><strong>ব্যবহারের ক্ষেত্র:</strong> স্পেশাল অফার, ডিসকাউন্ট ব্যাজ, সেল আইটেম, অ্যাকসেন্ট নোটিফিকেশন।</p>
              <p><strong>নীতিমালা:</strong> অতিরিক্ত লাল ব্যবহার নিষিদ্ধ; কেবল গুরুত্বপূর্ণ প্রমোশনে ব্যবহার্য।</p>
            </div>
          </div>
        </div>

        {/* Security & Role Policy Notice */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-800">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold text-amber-900">
              নিরাপত্তা ও পদমর্যাদা সীমাবদ্ধতা (Security Policy):
            </p>
            <p>
              ব্র্যান্ড কালার ও মূল ভিজ্যুয়াল আইডেন্টিটি পরিবর্তনের ক্ষমতা শুধুমাত্র <strong>OWNER</strong> পদমর্যাদায় সীমাবদ্ধ। সাধারণ স্টাফ অ্যাকাউন্ট থেকে লোগো বা কালার পরিবর্তন করার অনুমতি নেই।
              বর্তমান লগইন: <strong>{session.name}</strong> ({session.role}) {isOwner ? '— পূর্ণ নিয়ন্ত্রণ অনুমোদিত।' : '— শুধুমাত্র দেখার অনুমতি রয়েছে।'}
            </p>
          </div>
        </div>
      </div>

      {/* Cloud & Supabase Storage Catalog */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Layers className="w-4 h-4 text-slate-600" />
            <span>ব্র্যান্ড স্টোরেজ ডিরেক্টরি স্ট্রাকচার (Supabase / Static CDN)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                <th className="py-2.5 px-3">অ্যাসেট নাম</th>
                <th className="py-2.5 px-3">রোল / ব্যবহার</th>
                <th className="py-2.5 px-3">ফরম্যাট</th>
                <th className="py-2.5 px-3">লোকেশন পাথ</th>
                <th className="py-2.5 px-3 text-right">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-800">Primary Full Logo</td>
                <td className="py-2.5 px-3 font-sans text-slate-600">Header, Footer, Invoices</td>
                <td className="py-2.5 px-3 text-slate-500">PNG (32-bit Transparent)</td>
                <td className="py-2.5 px-3 text-slate-500">{brand.assets.logo}</td>
                <td className="py-2.5 px-3 text-right text-emerald-600 font-bold font-sans">Active</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-800">Logo Mark</td>
                <td className="py-2.5 px-3 font-sans text-slate-600">Mobile, Badges, Stamps</td>
                <td className="py-2.5 px-3 text-slate-500">PNG (215×215)</td>
                <td className="py-2.5 px-3 text-slate-500">{brand.assets.logoMark}</td>
                <td className="py-2.5 px-3 text-right text-emerald-600 font-bold font-sans">Active</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-800">Favicon</td>
                <td className="py-2.5 px-3 font-sans text-slate-600">Browser Tab Icon</td>
                <td className="py-2.5 px-3 text-slate-500">PNG (32×32)</td>
                <td className="py-2.5 px-3 text-slate-500">{brand.assets.favicon}</td>
                <td className="py-2.5 px-3 text-right text-emerald-600 font-bold font-sans">Active</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-800">Apple Touch Icon</td>
                <td className="py-2.5 px-3 font-sans text-slate-600">iOS Safari Home Screen</td>
                <td className="py-2.5 px-3 text-slate-500">PNG (180×180)</td>
                <td className="py-2.5 px-3 text-slate-500">{brand.assets.appleTouchIcon}</td>
                <td className="py-2.5 px-3 text-right text-emerald-600 font-bold font-sans">Active</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-800">PWA Mobile Icons</td>
                <td className="py-2.5 px-3 font-sans text-slate-600">PWA Manifest (Android/Desktop)</td>
                <td className="py-2.5 px-3 text-slate-500">PNG (192 & 512 px)</td>
                <td className="py-2.5 px-3 text-slate-500">{brand.assets.icon192}</td>
                <td className="py-2.5 px-3 text-right text-emerald-600 font-bold font-sans">Active</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
