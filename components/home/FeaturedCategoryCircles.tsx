'use client';

import React from 'react';
import Link from 'next/link';
import {
  Laptop,
  Monitor,
  Gamepad2,
  Keyboard,
  ShieldCheck,
  Wifi,
  Zap,
} from 'lucide-react';

const categories = [
  { name: 'Laptop & Computer', slug: 'laptop-computer', icon: <Laptop className="w-6 h-6 text-brand-600" /> },
  { name: 'Monitor', slug: 'monitor', icon: <Monitor className="w-6 h-6 text-indigo-600" /> },
  { name: 'Gaming', slug: 'gaming', icon: <Gamepad2 className="w-6 h-6 text-rose-600" /> },
  { name: 'Computer Accessories', slug: 'computer-accessories', icon: <Keyboard className="w-6 h-6 text-sky-600" /> },
  { name: 'CCTV & Security', slug: 'cctv-security', icon: <ShieldCheck className="w-6 h-6 text-emerald-600" /> },
  { name: 'Networking', slug: 'networking', icon: <Wifi className="w-6 h-6 text-teal-600" /> },
  { name: 'Power & Electronics', slug: 'power-electronics', icon: <Zap className="w-6 h-6 text-amber-500" /> },
];

export default function FeaturedCategoryCircles() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Featured Categories
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Get Your Desired Product from Official Categories
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-brand-300 hover:-translate-y-1 transition-all duration-200 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-brand-50 text-slate-700 group-hover:text-brand-600 flex items-center justify-center transition border border-slate-100 mb-2 group-hover:scale-110 duration-200">
              {cat.icon}
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-brand-600 transition line-clamp-2 leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
