import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingDock from '@/components/layout/FloatingDock';
import BottomNav from '@/components/layout/BottomNav';
import { CartProvider } from '@/components/cart/CartContext';
import { WishlistProvider } from '@/components/wishlist/WishlistContext';
import { ToastProvider } from '@/components/ui/toast';

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'), {
  ssr: false,
});

const NavigationProgress = dynamic(() => import('@/components/ui/NavigationProgress'), {
  ssr: false,
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '600', '700', '800'],
});


export const viewport: Viewport = {
  themeColor: '#2A3B97',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: 'Trust Computer-Moulvibazar | - Your Trust, Our Technology -',
    template: '%s | Trust Computer-Moulvibazar',
  },
  description:
    '- Your Trust, Our Technology - | Trust Computer-Moulvibazar is your trusted destination for quality computers, laptops, components, and CCTV surveillance systems in Moulvibazar. T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar. Hotline: 01797854836.',
  keywords: [
    'Trust Computer Moulvibazar',
    'Computer shop in Moulvibazar',
    'CCTV camera Moulvibazar',
    'Laptop Moulvibazar',
    'Desktop PC Moulvibazar',
    'Hikvision Moulvibazar',
    'Dahua Moulvibazar',
    'Networking Moulvibazar',
    'Trust Computer Bangladesh',
  ],
  authors: [{ name: 'Trust Computer-Moulvibazar' }],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Trust Computer',
  },
  metadataBase: new URL(process.env.APP_URL || 'https://trustcomputermb.com'),
  icons: {
    icon: [
      { url: '/brand/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/favicon-48.png', sizes: '48x48', type: 'image/png' },
    ],
    shortcut: '/brand/favicon.png',
    apple: '/brand/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Trust Computer-Moulvibazar | - Your Trust, Our Technology -',
    description:
      '- Your Trust, Our Technology - | Quality computers, laptops, components, and CCTV surveillance systems in Moulvibazar. T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar.',
    url: 'https://trustcomputermb.com',
    siteName: 'Trust Computer-Moulvibazar',
    images: [
      {
        url: '/brand/trust-computer-logo.png',
        width: 1024,
        height: 215,
        alt: 'Trust Computer-Moulvibazar Logo',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
};

import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { getCachedCategoryCounts } from '@/lib/categories';
import { getLocalBusinessSchema, getOrganizationSchema, getWebSiteSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categoryCounts;
  try {
    categoryCounts = await getCachedCategoryCounts();
  } catch (error) {
    console.error('Failed to prefetch category counts in layout:', error);
  }

  const globalSchemas = [
    getLocalBusinessSchema(),
    getOrganizationSchema(),
    getWebSiteSchema(),
  ];

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <JsonLd data={globalSchemas} />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 touch-manipulation`}>
        <LanguageProvider>
          <ToastProvider>
            <WishlistProvider>
              <CartProvider>
                <NavigationProgress />
                <Header initialCategoryCounts={categoryCounts} />
                <main className="flex-1 pb-16 md:pb-0">{children}</main>
                <Footer />
                <CartDrawer />
                <FloatingDock />
                <BottomNav />
              </CartProvider>
            </WishlistProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
