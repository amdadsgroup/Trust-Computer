'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../cart/CartContext';
import { useCompare } from '../compare/CompareContext';
import { useWishlist } from '../wishlist/WishlistContext';
import { ShoppingBag, GitCompare, Heart, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function FloatingDock() {
  const { totalItems, setIsOpen } = useCart();
  const { compareCount } = useCompare();
  const { wishlistCount } = useWishlist();
  const { t, isBangla } = useLanguage();

  return (
    <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3 pointer-events-none">
      {/* Happy Hour Floating Circle */}
      <Link
        href="/products?offer=true"
        className="pointer-events-auto mr-3 sm:mr-4 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-accent-600 to-orange-500 text-white flex flex-col items-center justify-center shadow-2xl hover:scale-105 transition transform group animate-pulse border-2 border-white/80"
        title={isBangla ? 'বিশেষ অফারসমূহ' : 'Special Offers'}
      >
        <GraduationCap className="w-5 h-5 text-white" />
        <span className="text-[9px] font-black uppercase tracking-tight text-center leading-none mt-0.5">
          SPECIAL<br />OFFER
        </span>
      </Link>

      {/* Vertical Right Dock */}
      <div className="pointer-events-auto flex flex-col bg-[#081621] text-white rounded-l-2xl shadow-2xl border-l-2 border-y-2 border-slate-700/60 overflow-hidden divide-y divide-slate-800">
        {/* Wishlist Button */}
        <Link
          href="/wishlist"
          className="relative flex flex-col items-center justify-center p-3 sm:p-3.5 hover:bg-slate-800 transition group w-14 sm:w-16"
          title={isBangla ? 'পছন্দের তালিকা (Wishlist)' : 'Wishlist'}
        >
          {wishlistCount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-accent-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
              {wishlistCount}
            </span>
          )}
          <Heart className="w-5 h-5 text-slate-300 group-hover:text-accent-400 transition-colors" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-slate-300 group-hover:text-white">
            WISH
          </span>
        </Link>

        {/* Compare Button */}
        <Link
          href="/compare"
          className="relative flex flex-col items-center justify-center p-3 sm:p-3.5 hover:bg-slate-800 transition group w-14 sm:w-16"
          title={isBangla ? 'পণ্য তুলনা (Compare Products)' : 'Compare Products'}
        >
          {compareCount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-brand-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {compareCount}
            </span>
          )}
          <GitCompare className="w-5 h-5 text-slate-300 group-hover:text-brand-300 transition-colors" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-slate-300 group-hover:text-white">
            COMPARE
          </span>
        </Link>

        {/* Cart Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex flex-col items-center justify-center p-3 sm:p-3.5 hover:bg-slate-800 transition group w-14 sm:w-16"
          title={isBangla ? 'শপিং ব্যাগ (Shopping Cart)' : 'Shopping Cart'}
          aria-label="Open Shopping Bag"
        >
          <span className="absolute top-1.5 right-1.5 bg-accent-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {totalItems}
          </span>
          <ShoppingBag className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-slate-300 group-hover:text-white">
            CART
          </span>
        </button>
      </div>
    </div>
  );
}
