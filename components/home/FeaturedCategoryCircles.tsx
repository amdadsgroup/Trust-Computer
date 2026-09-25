'use client';

import React from 'react';
import Link from 'next/link';
import {
  Laptop,
  Cpu,
  Camera,
  Wifi,
  Keyboard,
  Monitor,
  HardDrive,
  Printer,
  Headphones,
  Shield,
  Zap,
  Boxes,
} from 'lucide-react';

const categories = [
  { name: 'Desktop PC', slug: 'desktop-components', icon: <Cpu className="w-6 h-6" /> },
  { name: 'All Laptops', slug: 'laptops-notebooks', icon: <Laptop className="w-6 h-6" /> },
  { name: 'CCTV Camera', slug: 'cctv-surveillance', icon: <Camera className="w-6 h-6" /> },
  { name: 'DVR & XVR', slug: 'cctv-surveillance', icon: <Shield className="w-6 h-6" /> },
  { name: 'Networking', slug: 'networking-equipment', icon: <Wifi className="w-6 h-6" /> },
  { name: 'Storage / SSD', slug: 'desktop-components', icon: <HardDrive className="w-6 h-6" /> },
  { name: 'Power & UPS', slug: 'desktop-components', icon: <Zap className="w-6 h-6" /> },
  { name: 'Monitors', slug: 'desktop-components', icon: <Monitor className="w-6 h-6" /> },
  { name: 'Keyboard / Mouse', slug: 'computer-accessories', icon: <Keyboard className="w-6 h-6" /> },
  { name: 'Sound & Headset', slug: 'computer-accessories', icon: <Headphones className="w-6 h-6" /> },
  { name: 'Printers', slug: 'printers-scanners', icon: <Printer className="w-6 h-6" /> },
  { name: 'Accessories', slug: 'computer-accessories', icon: <Boxes className="w-6 h-6" /> },
];

export default function FeaturedCategoryCircles() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Featured Category
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Get Your Desired Product from Featured Category!
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3 sm:gap-4">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-brand-300 hover:-translate-y-1 transition-all duration-200 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-brand-50 text-slate-700 group-hover:text-brand-600 flex items-center justify-center transition border border-slate-100 mb-2 group-hover:scale-110 duration-200">
              {cat.icon}
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-brand-600 transition line-clamp-2 leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
