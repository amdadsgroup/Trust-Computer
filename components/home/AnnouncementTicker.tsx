'use client';

import React from 'react';
import Link from 'next/link';
import { Megaphone } from 'lucide-react';

export default function AnnouncementTicker() {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="w-full bg-white rounded-full py-2.5 px-6 shadow-sm border border-slate-200/80 flex items-center overflow-hidden">
      <div className="text-xs text-slate-700 font-medium whitespace-nowrap overflow-x-auto scrollbar-none flex items-center gap-3">
        <span className="font-bold text-slate-900 flex-shrink-0">
          {currentDate} ,
        </span>
        <span className="text-slate-600">
          All our activities and showroom at T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar are open and fully operational. Home & office CCTV camera installation and desktop PC servicing available. Hotline: <strong className="text-brand">01753-765372</strong>.
        </span>
        <Link href="/contact" className="text-brand font-bold hover:underline flex-shrink-0 ml-2">
          View showroom map →
        </Link>
      </div>
    </div>
  );
}
