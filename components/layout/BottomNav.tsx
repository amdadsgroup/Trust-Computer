'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Search, ShoppingBag, User, Heart, GitCompare } from 'lucide-react';
import { useCart } from '../cart/CartContext';
import { useWishlist } from '../wishlist/WishlistContext';
import { useCompare } from '../compare/CompareContext';
import MobileSearchModal from '../search/MobileSearchModal';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { t } = useLanguage();

  // Hide on admin routes or when on individual product page where sticky purchase bar takes priority
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // On individual product detail pages, the Sticky Purchase Bar is shown
  const isProductDetailPage = pathname.startsWith('/products/') && pathname !== '/products';

  // Support Search action modal if needed by quick triggers
  const _searchLabel = t('nav.search_placeholder', 'Search');

  const navItems = [
    {
      label: t('nav.home', 'Home'),
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: t('nav.products', 'Products'),
      href: '/products',
      icon: Package,
      isActive: pathname.startsWith('/products') || pathname.startsWith('/categories'),
    },
    {
      label: t('nav.wishlist', 'Wishlist'),
      href: '/wishlist',
      icon: Heart,
      badge: wishlistCount,
      isActive: pathname.startsWith('/wishlist'),
    },
    {
      label: t('nav.compare', 'Compare'),
      href: '/compare',
      icon: GitCompare,
      badge: compareCount,
      isActive: pathname.startsWith('/compare'),
    },
    {
      label: t('nav.cart', 'Cart'),
      isAction: true,
      onClick: () => setIsOpen(true),
      icon: ShoppingBag,
      badge: totalItems,
      isActive: false,
    },
    {
      label: t('nav.account', 'Account'),
      href: '/account',
      icon: User,
      isActive: pathname.startsWith('/account') || pathname.startsWith('/login') || pathname.startsWith('/register'),
    },
  ];

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className={`fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-transform duration-300 ${
          isProductDetailPage ? 'translate-y-full pointer-events-none' : 'translate-y-0'
        }`}
      >
        <div className="grid grid-cols-6 h-14 items-center">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const content = (
              <div
                className={`relative flex flex-col items-center justify-center h-full w-full py-1 tap-highlight-transparent transition-colors ${
                  item.isActive
                    ? 'text-brand-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${item.isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-accent-500 text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] mt-0.5 tracking-tight leading-tight truncate max-w-full px-0.5 text-center">
                  {item.label}
                </span>
                {item.isActive && (
                  <span className="absolute bottom-0 w-6 h-0.5 bg-brand-600 rounded-full" />
                )}
              </div>
            );

            if (item.isAction) {
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="flex items-center justify-center h-full w-full focus:outline-none"
                  aria-label={item.label}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={idx}
                href={item.href!}
                className="flex items-center justify-center h-full w-full focus:outline-none"
                aria-label={item.label}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Global Mobile Search Modal */}
      <MobileSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
