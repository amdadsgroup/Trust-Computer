'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../cart/CartContext';
import { useWishlist } from '../wishlist/WishlistContext';
import { useCompare } from '../compare/CompareContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageToggle from '../ui/LanguageToggle';
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Gift,
  User,
  GitCompare,
  Heart,
} from 'lucide-react';

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navCategories = [
    { key: 'cat.desktop', name: t('cat.desktop', 'Desktop'), href: '/categories/desktop-components' },
    { key: 'cat.laptop', name: t('cat.laptop', 'Laptop'), href: '/categories/laptops-notebooks' },
    { key: 'cat.component', name: t('cat.component', 'Component'), href: '/categories/desktop-components' },
    { key: 'cat.monitor', name: t('cat.monitor', 'Monitor'), href: '/products?category=monitor' },
    { key: 'cat.power_ups', name: t('cat.power_ups', 'Power / UPS'), href: '/products?category=ups' },
    { key: 'cat.phone', name: t('cat.phone', 'Phone'), href: '/products?category=phone' },
    { key: 'cat.tablet', name: t('cat.tablet', 'Tablet'), href: '/products?category=tablet' },
    { key: 'cat.office_equipment', name: t('cat.office_equipment', 'Office Equipment'), href: '/categories/printers-scanners' },
    { key: 'cat.camera', name: t('cat.camera', 'Camera'), href: '/categories/cctv-surveillance' },
    { key: 'cat.security', name: t('cat.security', 'Security'), href: '/categories/cctv-surveillance' },
    { key: 'cat.networking', name: t('cat.networking', 'Networking'), href: '/categories/networking-equipment' },
    { key: 'cat.software', name: t('cat.software', 'Software'), href: '/products?category=software' },
    { key: 'cat.server_storage', name: t('cat.server_storage', 'Server & Storage'), href: '/products?category=storage' },
    { key: 'cat.accessories', name: t('cat.accessories', 'Accessories'), href: '/categories/computer-accessories' },
    { key: 'cat.gadget', name: t('cat.gadget', 'Gadget'), href: '/products?category=gadget' },
    { key: 'cat.gaming', name: t('cat.gaming', 'Gaming'), href: '/products?category=gaming' },
    { key: 'cat.tv', name: t('cat.tv', 'TV'), href: '/products?category=tv' },
    { key: 'cat.appliance', name: t('cat.appliance', 'Appliance'), href: '/products?category=appliance' },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* 1. Main Dark Navy Header Bar */}
      <div className="bg-[#081621] text-white py-2.5 px-4 border-b border-slate-800">
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Left: Official Brand Logo */}
          <Link href="/" className="flex items-center group flex-shrink-0 py-0.5">
            <div className="relative h-9 sm:h-11 w-auto group-hover:opacity-95 transition">
              <Image
                src="/brand/trust-computer-logo.png"
                alt="Trust Computer-Moulvibazar"
                width={200}
                height={42}
                priority
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Center: Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl mx-4 relative"
          >
            <input
              type="text"
              placeholder={t('nav.search_placeholder', 'Search CCTV, PC, Laptop, Router...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 text-sm placeholder-slate-400 pl-5 pr-12 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-sky-400 transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-slate-700 hover:text-slate-900 transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Compare */}
            <Link
              href="/compare"
              className="hidden lg:flex items-center gap-2 group text-left relative"
            >
              <div className="text-slate-300 group-hover:text-brand-400 transition relative">
                <GitCompare className="w-5 h-5" />
                {compareCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {compareCount}
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold block text-white group-hover:text-brand-300 transition">
                  {t('nav.compare', 'Compare')}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">({compareCount})</span>
              </div>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="hidden lg:flex items-center gap-2 group text-left relative"
            >
              <div className="text-accent-400 group-hover:text-accent-300 transition relative">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-accent-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold block text-white group-hover:text-accent-400 transition">
                  {t('nav.wishlist', 'Wishlist')}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">({wishlistCount})</span>
              </div>
            </Link>

            {/* Offers */}
            <Link
              href="/products?offer=true"
              className="hidden xl:flex items-center gap-2.5 group text-left"
            >
              <div className="text-orange-400 group-hover:text-orange-300 transition">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white group-hover:text-orange-300 transition">
                  {t('nav.offers', 'Offers')}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">{t('nav.special_deals', 'Special Deals')}</span>
              </div>
            </Link>

            {/* Customer Account */}
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-2.5 group text-left"
            >
              <div className="text-slate-300 group-hover:text-white transition">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white group-hover:text-brand-300 transition">
                  {t('nav.account', 'Account')}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">{t('nav.register_login', 'Register / Login')}</span>
              </div>
            </Link>

            {/* Desktop PC CTA Button */}
            <Link
              href="/categories/desktop-components"
              className="hidden sm:flex bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-md items-center gap-1.5"
            >
              <span>{t('nav.desktop_pcs', 'Desktop PCs')}</span>
            </Link>

            {/* Mobile Compare Button with live counter */}
            <Link
              href="/compare"
              className="md:hidden relative p-1.5 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition"
              aria-label="Compare Products"
              title={t('nav.compare', 'Compare')}
            >
              <GitCompare className="w-5 h-5 text-sky-400" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {compareCount > 9 ? '9+' : compareCount}
                </span>
              )}
            </Link>

            {/* Mobile Wishlist Button with live counter */}
            <Link
              href="/wishlist"
              className="md:hidden relative p-1.5 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition"
              aria-label="Wishlist"
              title={t('nav.wishlist', 'Wishlist')}
            >
              <Heart className="w-5 h-5 text-accent-400" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Mobile Cart Trigger with Live Counter */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden relative p-1.5 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Row */}
        <form onSubmit={handleSearchSubmit} className="mt-2 md:hidden relative px-1">
          <input
            type="text"
            placeholder={t('nav.search_placeholder', 'Search CCTV, PC, Laptop, Router...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-900 text-xs placeholder-slate-400 pl-4 pr-10 py-2 rounded-full outline-none focus:ring-2 focus:ring-[#0084d6]"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 p-1"
            aria-label="Submit Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Mobile Horizontal Swipeable Category Bar */}
      <div className="md:hidden bg-[#0d2030] border-b border-slate-800 overflow-x-auto py-2 px-3 flex items-center gap-2 scrollbar-none whitespace-nowrap text-xs">
        {navCategories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="bg-slate-800/80 text-slate-300 hover:text-white font-medium px-3 py-1.5 rounded-full text-[11px] flex-shrink-0 transition active:bg-[#2A3B97] active:text-white"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* 2. White Horizontal Category Navigation Bar */}
      <nav className="hidden md:block bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-between overflow-x-auto text-[13px] font-bold text-slate-800 whitespace-nowrap py-1">
            {navCategories.map((cat, idx) => (
              <li key={idx}>
                <Link
                  href={cat.href}
                  className="px-2.5 py-2.5 inline-block hover:text-[#2A3B97] transition text-[12px] xl:text-[13px]"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700">{t('nav.language', 'Language')}</span>
            <LanguageToggle variant="pill" />
          </div>

          {/* Quick Access Utility Cards (Desktop PCs, Offers, Compare, Wishlist) */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              Quick Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Desktop PCs Button */}
              <Link
                href="/categories/desktop-components"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-gradient-to-br from-[#2A3B97] to-[#1E2B6C] text-white shadow-sm flex flex-col justify-between gap-1 group active:scale-[0.98] transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                    Popular
                  </span>
                  <span className="text-base">🖥️</span>
                </div>
                <div>
                  <span className="font-black text-xs block leading-tight">
                    {t('nav.desktop_pcs', 'Desktop PCs')}
                  </span>
                  <span className="text-[10px] text-white/80 block mt-0.5">Pre-built & Parts</span>
                </div>
              </Link>

              {/* Special Offers Button */}
              <Link
                href="/products?offer=true"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-gradient-to-br from-[#E91D26] to-[#C5141C] text-white shadow-sm flex flex-col justify-between gap-1 group active:scale-[0.98] transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                    Deals
                  </span>
                  <Gift className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-black text-xs block leading-tight">
                    {t('nav.offers', 'Offers')}
                  </span>
                  <span className="text-[10px] text-white/80 block mt-0.5">{t('nav.special_deals', 'Special Deals')}</span>
                </div>
              </Link>

              {/* Compare Products */}
              <Link
                href="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200/80 flex items-center justify-between gap-2 active:scale-[0.98] transition"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-100 text-[#2A3B97]">
                    <GitCompare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">{t('nav.compare', 'Compare')}</span>
                    <span className="text-[10px] text-slate-500">Side-by-side</span>
                  </div>
                </div>
                {compareCount > 0 && (
                  <span className="bg-[#2A3B97] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {compareCount}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200/80 flex items-center justify-between gap-2 active:scale-[0.98] transition"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-100 text-[#E91D26]">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">{t('nav.wishlist', 'Wishlist')}</span>
                    <span className="text-[10px] text-slate-500">Saved items</span>
                  </div>
                </div>
                {wishlistCount > 0 && (
                  <span className="bg-[#E91D26] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              Categories
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
              {navCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition truncate"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2 text-xs font-semibold">
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-2"
            >
              <span>🚚</span>
              <span>{t('nav.track_order', 'Track Order')}</span>
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-[#2A3B97] hover:bg-[#212F7A] text-white transition text-center font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <User className="w-4 h-4" />
              <span>{t('nav.account', 'My Account')} ({t('nav.register_login', 'Register / Login')})</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
