import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import FloatingDock from '@/components/layout/FloatingDock';
import BottomNav from '@/components/layout/BottomNav';
import { CartProvider } from '@/components/cart/CartContext';
import { CompareProvider } from '@/components/compare/CompareContext';
import { WishlistProvider } from '@/components/wishlist/WishlistContext';
import { ToastProvider } from '@/components/ui/toast';
import CompareBar from '@/components/compare/CompareBar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
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
    default: 'Trust Computer-Moulvibazar | কম্পিউটার ও সিসি ক্যামেরা শোরুম',
    template: '%s | Trust Computer-Moulvibazar',
  },
  description:
    'মানসম্মত কম্পিউটার ও সিসি ক্যামেরা জগতে মৌলভীবাজারের একটি বিশ্বস্ত প্রতিষ্ঠান। টি.এস প্লাজা (২য় তলা), কুসুমবাগ, মৌলভীবাজার। ফোন: 01753-765372।',
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
    title: 'Trust Computer-Moulvibazar | বিশ্বস্ত কম্পিউটার ও সিসি ক্যামেরা প্রতিষ্ঠান',
    description:
      'মানসম্মত কম্পিউটার ও সিসি ক্যামেরা জগতে মৌলভীবাজারের একটি বিশ্বস্ত প্রতিষ্ঠান। টি.এস প্লাজা (২য় তলা), কুসুমবাগ, মৌলভীবাজার।',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 touch-manipulation`}>
        <LanguageProvider>
          <ToastProvider>
            <WishlistProvider>
              <CompareProvider>
                <CartProvider>
                  <Header />
                  <main className="flex-1 pb-16 md:pb-0">{children}</main>
                  <Footer />
                  <CartDrawer />
                  <CompareBar />
                  <FloatingDock />
                  <BottomNav />
                </CartProvider>
              </CompareProvider>
            </WishlistProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
