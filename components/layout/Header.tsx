'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useWishlist } from '../wishlist/WishlistContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageToggle from '../ui/LanguageToggle';
import {
  Search,
  Menu,
  X,
  User,
  Heart,
  PackageSearch,
  Gift,
  Boxes,
  Laptop,
  Monitor,
  Gamepad2,
  Keyboard,
  Camera,
  Wifi,
  Zap,
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { wishlistCount } = useWishlist();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const [catCounts, setCatCounts] = useState<{ total: number; counts: Record<string, number> }>({
    total: 1,
    counts: {
      'laptop-computer': 1,
      monitor: 0,
      gaming: 0,
      'computer-accessories': 0,
      'cctv-security': 0,
      networking: 0,
      'power-electronics': 0,
    },
  });

  const [searchParamCategory, setSearchParamCategory] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParamCategory(params.get('category'));
    }
  }, [pathname]);

  useEffect(() => {
    fetch('/api/categories/counts')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.total === 'number') {
          setCatCounts(data);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const isPillActive = (catSlug: string | null) => {
    if (!pathname) return false;
    if (catSlug === null || catSlug === 'all') {
      return pathname === '/products' && !searchParamCategory;
    }
    return (
      pathname === `/categories/${catSlug}` ||
      (pathname === '/products' && searchParamCategory === catSlug)
    );
  };

  const navCategories = [
    {
      slug: 'all',
      key: 'cat.all_products',
      name: t('cat.all_products', 'All Products'),
      href: '/products',
      icon: (active: boolean) => (
        <Boxes className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-[#2644a6]'}`} />
      ),
      count: catCounts.total ?? 0,
    },
    {
      slug: 'laptop-computer',
      key: 'cat.laptop_computer',
      name: t('cat.laptop_computer', 'Laptop & Computer'),
      href: '/categories/laptop-computer',
      icon: (active: boolean) => (
        <Laptop className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-indigo-600'}`} />
      ),
      count: catCounts.counts['laptop-computer'] ?? 0,
    },
    {
      slug: 'monitor',
      key: 'cat.monitor',
      name: t('cat.monitor', 'Monitor'),
      href: '/categories/monitor',
      icon: (active: boolean) => (
        <Monitor className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-blue-600'}`} />
      ),
      count: catCounts.counts['monitor'] ?? 0,
    },
    {
      slug: 'gaming',
      key: 'cat.gaming',
      name: t('cat.gaming', 'Gaming'),
      href: '/categories/gaming',
      icon: (active: boolean) => (
        <Gamepad2 className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-rose-500'}`} />
      ),
      count: catCounts.counts['gaming'] ?? 0,
    },
    {
      slug: 'computer-accessories',
      key: 'cat.accessories',
      name: t('cat.accessories', 'Computer Accessories'),
      href: '/categories/computer-accessories',
      icon: (active: boolean) => (
        <Keyboard className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-blue-700'}`} />
      ),
      count: catCounts.counts['computer-accessories'] ?? 0,
    },
    {
      slug: 'cctv-security',
      key: 'cat.cctv_security',
      name: t('cat.cctv_security', 'CCTV & Security'),
      href: '/categories/cctv-security',
      icon: (active: boolean) => (
        <Camera className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-emerald-600'}`} />
      ),
      count: catCounts.counts['cctv-security'] ?? 0,
    },
    {
      slug: 'networking',
      key: 'cat.networking',
      name: t('cat.networking', 'Networking'),
      href: '/categories/networking',
      icon: (active: boolean) => (
        <Wifi className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-teal-500'}`} />
      ),
      count: catCounts.counts['networking'] ?? 0,
    },
    {
      slug: 'power-electronics',
      key: 'cat.power_electronics',
      name: t('cat.power_electronics', 'Power & Electronics'),
      href: '/categories/power-electronics',
      icon: (active: boolean) => (
        <Zap className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-amber-500'}`} />
      ),
      count: catCounts.counts['power-electronics'] ?? 0,
    },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* 1. Main Dark Navy Header Bar */}
      <div className="bg-[#081621] text-white py-2.5 px-4 border-b border-slate-800">
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Left: Official Brand Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0 py-0.5">
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
            <div className="hidden xl:flex flex-col border-l border-slate-700/80 pl-3 justify-center">
              <span className="text-[11px] font-semibold text-slate-300 tracking-wide">
                {t('brand.tagline', 'Your Trust, Our Technology')}
              </span>
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

            {/* Track Order CTA Button */}
            <Link
              href="/track-order"
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-md"
            >
              <PackageSearch className="w-4 h-4 flex-shrink-0" />
              <span>{t('nav.track_order', 'Track Order')}</span>
            </Link>

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

      {/* 2. Topbar Category Navigation Bar (Pill Design) */}
      <nav className="bg-[#f8fafc] border-b border-slate-200/90 py-2 sm:py-2.5">
        <div className="container mx-auto px-3 sm:px-4">
          <ul className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none py-0.5 whitespace-nowrap">
            {navCategories.map((cat, idx) => {
              const active = isPillActive(cat.slug);
              return (
                <li key={idx} className="shrink-0">
                  <Link
                    href={cat.href}
                    className={`group px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-[13px] font-bold flex items-center gap-2 transition-all duration-150 border ${
                      active
                        ? 'bg-[#2644a6] text-white border-[#2644a6] shadow-sm'
                        : 'bg-white text-slate-800 border-slate-200/90 hover:border-brand-300 hover:bg-slate-50/80 hover:text-brand-700 shadow-xs'
                    }`}
                  >
                    <span>{cat.icon(active)}</span>
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full ml-0.5 min-w-[20px] text-center ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </Link>
                </li>
              );
            })}
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

          {/* Quick Access Utility Cards (Desktop PCs, Offers, Wishlist) */}
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

              {/* Wishlist */}
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200/80 flex items-center justify-between gap-2 active:scale-[0.98] transition"
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
              {navCategories.map((cat, idx) => {
                const active = isPillActive(cat.slug);
                return (
                  <Link
                    key={idx}
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-2 rounded-xl transition flex items-center justify-between border ${
                      active
                        ? 'bg-[#2644a6] text-white border-[#2644a6]'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span>{cat.icon(active)}</span>
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-slate-500 border border-slate-200/60'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </Link>
                );
              })}
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

          {/* Mobile Drawer Tagline */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 italic">
              “{t('brand.tagline', 'Your Trust, Our Technology')}”
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
