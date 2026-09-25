'use client';

import React from 'react';
import Link from 'next/link';
import { Laptop, MessageSquare, Camera, Wrench } from 'lucide-react';

const utilities = [
  {
    title: 'Laptop / PC Finder',
    subtitle: 'Find Your Device Easily',
    href: '/products?category=laptops-notebooks',
    icon: <Laptop className="w-6 h-6 text-white" />,
    color: 'bg-[#ef4444]',
  },
  {
    title: 'Raise a Complain',
    subtitle: 'Share your experience',
    href: '/contact',
    icon: <MessageSquare className="w-6 h-6 text-white" />,
    color: 'bg-[#f97316]',
  },
  {
    title: 'CCTV Setup Calculator',
    subtitle: 'Find Perfect Security System',
    href: '/categories/cctv-surveillance',
    icon: <Camera className="w-6 h-6 text-white" />,
    color: 'bg-[#ea580c]',
  },
  {
    title: 'Servicing Center',
    subtitle: 'Repair & Maintain Your Device',
    href: '/contact',
    icon: <Wrench className="w-6 h-6 text-white" />,
    color: 'bg-[#dc2626]',
  },
];

export default function QuickUtilityCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {utilities.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all duration-200 flex items-center gap-4 group hover:-translate-y-0.5"
        >
          <div
            className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition transform`}
          >
            {item.icon}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 group-hover:text-brand-600 transition leading-tight">
              {item.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
