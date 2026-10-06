import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import { business, getSalesWhatsAppLink, getServiceWhatsAppLink } from '@/lib/business';
import { getLocalBusinessSchema, getBreadcrumbSchema, getFAQSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import GoogleMapEmbed from '@/components/moulvibazar/GoogleMapEmbed';
import MoulvibazarFaqAccordion from '@/components/moulvibazar/MoulvibazarFaqAccordion';
import ProductCard from '@/components/products/ProductCard';
import {
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  Star,
  Laptop,
  Monitor,
  Camera,
  Wifi,
  Keyboard,
  Cpu,
  Printer,
  Zap,
  Wrench,
  BookOpen,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Computer Shop in Moulvibazar | Laptop, CCTV & Computer Products | Trust Computer',
  description:
    'Looking for the trusted computer shop in Moulvibazar? Trust Computer at T.S Plaza, Kusumbagh offers laptops, desktop PCs, CCTV cameras, accessories, and expert computer servicing. Hotline: 01797854836.',
  keywords: [
    'computer shop Moulvibazar',
    'computer shop in Moulvibazar',
    'laptop shop Moulvibazar',
    'computer store Moulvibazar',
    'computer accessories Moulvibazar',
    'CCTV camera Moulvibazar',
    'CCTV shop Moulvibazar',
    'laptop price Moulvibazar',
    'computer price Moulvibazar',
    'desktop price Moulvibazar',
    'monitor price Moulvibazar',
    'router price Moulvibazar',
    'SSD price Moulvibazar',
    'printer price Moulvibazar',
    'computer service Moulvibazar',
    'CCTV service Moulvibazar',
    'computer dealer Moulvibazar',
    'computer showroom Moulvibazar',
    'best computer shop in Moulvibazar',
    'best laptop shop in Moulvibazar',
    'computer products in Moulvibazar',
    'where to buy laptop in Moulvibazar',
    'where to buy CCTV camera in Moulvibazar',
  ],
  alternates: {
    canonical: 'https://trustcomputermb.com/moulvibazar',
  },
  openGraph: {
    title: 'Computer Shop in Moulvibazar | Laptop, CCTV & Computer Products | Trust Computer',
    description:
      'Looking for the trusted computer shop in Moulvibazar? Trust Computer at T.S Plaza, Kusumbagh offers genuine laptops, desktop PCs, CCTV cameras, accessories & computer servicing.',
    url: 'https://trustcomputermb.com/moulvibazar',
    siteName: 'Trust Computer-Moulvibazar',
    images: [
      {
        url: '/brand/trust-computer-logo.png',
        width: 1024,
        height: 215,
        alt: 'Trust Computer Moulvibazar Showroom',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
};

const localFaqs = [
  {
    question: 'Where is Trust Computer located in Moulvibazar?',
    answer:
      'Trust Computer-Moulvibazar is physically located at T.S Plaza (2nd Floor), Kusumbagh Point, Moulvibazar, Bangladesh. It is located right at Kusumbagh center, easily reachable from Chandnighat, Court Road, Shamshernagar Road, and Moulvibazar Sadar Bus Stand (about 5-7 minutes by rickshaw/tomtom).',
  },
  {
    question: 'What computer and technology products does Trust Computer sell in Moulvibazar?',
    answer:
      'We offer 100% authentic tech products across 8 major categories: Brand Laptops (HP, Dell, Asus, Lenovo, Acer), Custom Desktop PCs & Workstations, Computer Components (Processors, Motherboards, RAM, NVMe/SATA SSDs, Power Supplies, Casings), Computer Accessories (Keyboards, Mice, Headsets, Webcams), CCTV Camera Surveillance Packages (Hikvision, Dahua HD/IP cameras, DVRs, NVRs), Wi-Fi Routers & Networking Equipment (TP-Link, Tenda, Netgear), Printers & Toners (Epson, Canon, HP), and Power Electronics (UPS, Voltage Protectors).',
  },
  {
    question: 'Does Trust Computer provide CCTV camera installation and computer servicing in Moulvibazar?',
    answer:
      'Yes, we have a dedicated Technical Service Department. Our trained technicians provide on-site CCTV camera installation, cable routing, mobile app remote-viewing configuration, laptop hardware repairs, display panel replacements, motherboard servicing, OS setup, and high-speed SSD upgrades. You can call our technical team directly at 01608346407.',
  },
  {
    question: 'Does Trust Computer deliver to Sreemangal, Kulaura, and other Upazilas in Moulvibazar?',
    answer:
      'Yes! We provide same-day showroom pickup at Kusumbagh and reliable courier delivery across Moulvibazar Sadar within 24 hours. Furthermore, we deliver via trusted couriers to all Upazilas of Moulvibazar district including Sreemangal, Kulaura, Rajnagar, Kamalganj, Juri, and Barlekha, as well as nationwide across Bangladesh.',
  },
  {
    question: 'Are all products sold at Trust Computer genuine with official warranty?',
    answer:
      'Absolutely. Every computer, laptop, SSD, router, monitor, and CCTV camera sold at Trust Computer is 100% genuine and sourced through authorized brand channels. Products come with official manufacturer warranties, and our showroom actively facilitates warranty claims and RMA processing for our customers.',
  },
  {
    question: 'What are the showroom opening hours and how can I contact sales?',
    answer:
      'Our Kusumbagh showroom is open Saturday to Thursday from 10:00 AM to 9:00 PM (Friday showroom is closed; online orders and WhatsApp inquiries remain active). You can call Sales at 01797854836, Service at 01608346407, or chat with us on WhatsApp.',
  },
];

export default async function MoulvibazarLandingPage() {
  const salesWhatsAppUrl = getSalesWhatsAppLink();
  const serviceWhatsAppUrl = getServiceWhatsAppLink();

  // Fetch some active featured products for local showroom display
  let localProducts: any[] = [];
  try {
    localProducts = await prisma.product.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        sellingPrice: true,
        compareAtPrice: true,
        stock: true,
        lowStockThreshold: true,
        warrantyInfo: true,
        images: {
          select: { url: true, altText: true },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
    });
  } catch (e) {
    console.error('Error fetching products for /moulvibazar page:', e);
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Moulvibazar Computer Shop', url: '/moulvibazar' },
  ];

  const structuredData = [
    getLocalBusinessSchema(),
    getBreadcrumbSchema(breadcrumbs),
    getFAQSchema(localFaqs),
  ];

  return (
    <div className="space-y-12 pb-16">
      <JsonLd data={structuredData} />

      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#081621] via-[#0E2038] to-[#122B4D] text-white pt-8 pb-14 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-white font-medium">Moulvibazar Computer Shop</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Computer Shop in Moulvibazar
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Trust Computer-Moulvibazar is the trusted local destination for authentic laptops, custom desktop PCs, CCTV surveillance systems, networking routers, and computer accessories. Serving students, home users, and businesses across Moulvibazar.
              </p>

              <div className="text-xs sm:text-sm text-blue-200 font-semibold tracking-wide">
                - Your Trust, Our Technology -
              </div>

              {/* Direct Quick Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`tel:${business.sales.phone}`}
                  className="inline-flex items-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white font-bold py-3 px-5 rounded-xl text-xs sm:text-sm transition shadow-md"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call Sales: {business.sales.phone}</span>
                </a>

                <a
                  href={salesWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl text-xs sm:text-sm transition shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Sales</span>
                </a>

                <a
                  href={business.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm border border-slate-700 transition"
                >
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>Get Directions</span>
                </a>

                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm backdrop-blur transition"
                >
                  <span>Browse Products</span>
                </Link>
              </div>
            </div>

            {/* Quick Showroom Highlights Card */}
            <div className="lg:col-span-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-blue-300 border-b border-white/10 pb-3">
                Showroom Fast Facts
              </h2>

              <div className="space-y-3 text-xs text-slate-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Location</span>
                    <span className="text-slate-300">T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Opening Hours</span>
                    <span className="text-slate-300">Saturday – Thursday: 10:00 AM – 9:00 PM (Friday Closed)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Hotlines</span>
                    <span className="text-slate-300">Sales: {business.sales.phone} | Service: {business.service.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Authenticity</span>
                    <span className="text-slate-300">100% Genuine with Official Brand Warranty</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <a
                  href={`tel:${business.service.phone}`}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-900 text-white font-bold py-2 px-3 rounded-xl text-xs transition border border-slate-700"
                >
                  <Wrench className="w-3.5 h-3.5 text-blue-400" />
                  <span>Call Service: {business.service.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHO TRUST COMPUTER IS */}
      <section className="container mx-auto max-w-6xl px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              About Trust Computer-Moulvibazar
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Your Trusted Technology Partner in Kusumbagh, Moulvibazar
            </h2>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
              Founded on the belief that customers deserve genuine technology products backed by truthful advice, <strong>Trust Computer-Moulvibazar</strong> has grown into one of Moulvibazar&apos;s leading computer showrooms and security surveillance providers.
            </p>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
              Conveniently located on the 2nd Floor of T.S Plaza at Kusumbagh Point, our showroom serves customers from Moulvibazar Sadar, Sreemangal, Kulaura, Rajnagar, Kamalganj, Juri, and Barlekha. Whether you are a student buying your first laptop, a freelancer building a high-performance PC, or a business owner securing your premises with high-definition CCTV cameras, Trust Computer provides authentic products, transparent prices, and dedicated post-sales technical support.
            </p>
          </div>

          {/* Pillars grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">100% Genuine Tech</h3>
              <p className="text-xs text-slate-600">
                Official distribution stock with legitimate manufacturer warranties.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <Camera className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">CCTV Surveillance</h3>
              <p className="text-xs text-slate-600">
                Expert camera setup, DVR/NVR configuration & mobile live viewing.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <Wrench className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Dedicated Service</h3>
              <p className="text-xs text-slate-600">
                Laptop hardware repair, SSD speed boosts & desktop maintenance.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <Truck className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-sm">Moulvibazar Delivery</h3>
              <p className="text-xs text-slate-600">
                Same-day showroom pickup or fast courier delivery across all upazilas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCTS AVAILABLE IN MOULVIBAZAR */}
      <section className="container mx-auto max-w-6xl px-4 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Product Catalog
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Products Available at Trust Computer Moulvibazar
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Browse our full range of genuine technology products available for showroom pickup at Kusumbagh or delivery across Moulvibazar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Laptops */}
          <Link
            href="/categories/laptop-computer"
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-700 transition">
                Laptops & Notebooks
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Latest laptops from HP, Dell, Asus, Lenovo, and Acer. Ideal for students, freelancers, office work, and gaming.
              </p>
            </div>
            <div className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline pt-2">
              <span>View Laptop Prices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 2. Desktop Computers */}
          <Link
            href="/categories/laptop-computer"
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-700 transition">
                Desktop Computers & Custom Builds
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pre-built desktop PCs and custom workstation rigs for video editing, graphics design, accounting, and gaming.
              </p>
            </div>
            <div className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline pt-2">
              <span>Explore Desktop PCs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 3. CCTV & Security */}
          <Link
            href="/categories/cctv-security"
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition">
                CCTV Camera & Security
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hikvision & Dahua HD analog cameras, IP network cameras, DVRs, NVRs, and complete surveillance setups for home & shop.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:underline pt-2">
              <span>View CCTV Prices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 4. Computer Components */}
          <Link
            href="/categories/computer-accessories"
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-700 transition">
                Components & Upgrades
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Intel & AMD processors, motherboards, DDR4/DDR5 RAM, high-speed NVMe SSDs, graphics cards, power supplies & casings.
              </p>
            </div>
            <div className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline pt-2">
              <span>Check Components</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 5. Accessories */}
          <Link
            href="/categories/computer-accessories"
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                <Keyboard className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-700 transition">
                Computer Accessories
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Keyboards, optical mice, headsets, webcams, Bluetooth speakers, USB hubs, HDMI cables & computer peripherals.
              </p>
            </div>
            <div className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline pt-2">
              <span>View Accessories</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 6. Networking & Routers */}
          <Link
            href="/categories/networking"
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-teal-700 transition">
                Networking & Wi-Fi Routers
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-performance dual-band & Wi-Fi 6 routers from TP-Link, Tenda, Netgear, Gigabit switches, and network cables.
              </p>
            </div>
            <div className="text-xs font-bold text-teal-600 flex items-center gap-1 group-hover:underline pt-2">
              <span>View Router Prices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 7. Monitors */}
          <Link
            href="/categories/monitor"
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-700 transition">
                Monitors & Displays
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                IPS, LED, curved and high-refresh-rate gaming monitors from leading global brands in sizes from 19-inch to 27-inch+.
              </p>
            </div>
            <div className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline pt-2">
              <span>View Monitor Prices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 8. Power Electronics & UPS */}
          <Link
            href="/categories/power-electronics"
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-rose-700 transition">
                Power Electronics & UPS
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Offline and online UPS systems, surge protectors, voltage stabilizers, and power adapters to safeguard your electronics.
              </p>
            </div>
            <div className="text-xs font-bold text-rose-600 flex items-center gap-1 group-hover:underline pt-2">
              <span>View UPS Options</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. CURRENT PRODUCTS ON DISPLAY (Dynamic from Prisma) */}
      {localProducts.length > 0 && (
        <section className="container mx-auto max-w-6xl px-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Featured Tech Available in Moulvibazar
              </h2>
              <p className="text-xs text-slate-500">
                Check current prices and reserve for in-store pickup at Kusumbagh
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Full Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {localProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  sku: p.sku,
                  sellingPrice: Number(p.sellingPrice),
                  compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
                  stock: p.stock,
                  lowStockThreshold: p.lowStockThreshold,
                  images: p.images,
                  category: p.category,
                  brand: p.brand,
                  warrantyInfo: p.warrantyInfo,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. SERVICES ACTUALLY OFFERED */}
      <section className="container mx-auto max-w-6xl px-4">
        <div className="bg-gradient-to-br from-slate-900 via-[#1E2B6C] to-[#0A1633] text-white rounded-3xl p-6 sm:p-10 shadow-lg space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-700/80 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
                Technical Support & Servicing
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                Computer Servicing & CCTV Setup in Moulvibazar
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Trust Computer offers professional in-house and on-site technical repair services managed by our experienced hardware engineers.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={business.service.tel}
                className="inline-flex items-center gap-2 bg-white text-slate-950 hover:bg-slate-100 font-extrabold py-3 px-5 rounded-xl text-xs transition shadow"
              >
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Call Service: {business.service.phone}</span>
              </a>

              <a
                href={serviceWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Service WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-300">
            <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Laptop & PC Hardware Repair</h3>
              <p className="leading-relaxed">
                Chip-level diagnostics, broken display panel replacement, hinge fixing, cooling fan cleaning, and thermal paste renewal for all major laptop brands.
              </p>
            </div>

            <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">CCTV Installation & Maintenance</h3>
              <p className="leading-relaxed">
                Comprehensive site assessment, cabling, DVR/NVR configuration, camera angle optimization, and live mobile phone surveillance setup.
              </p>
            </div>

            <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">SSD & RAM Speed Upgrade</h3>
              <p className="leading-relaxed">
                Transform slow computers with high-speed NVMe or SATA SSD installation, RAM expansion, clean OS installation, and secure data migration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DELIVERY & PICKUP INFORMATION */}
      <section className="container mx-auto max-w-6xl px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Convenient Shopping
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Delivery & Showroom Pickup Options
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              We make purchasing computers, parts, and CCTV equipment seamless and reliable across Moulvibazar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 w-fit">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Same-Day Showroom Pickup
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Order online or over the phone and pick up directly from our Kusumbagh showroom at T.S Plaza (2nd Floor). Inspect your product in person before finalizing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 w-fit">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Moulvibazar Sadar Delivery
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Fast local delivery within Moulvibazar Sadar. Cash on Delivery is available with standard local delivery within 24 hours.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Upazila & District Delivery
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Secure courier delivery to Sreemangal, Kulaura, Rajnagar, Kamalganj, Juri, and Barlekha. Payment via bKash Cash Out or verified courier COD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LOCAL TECH BUYING GUIDES */}
      <section className="container mx-auto max-w-6xl px-4 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Local Technology Guides
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Buying Guides for Moulvibazar Tech Customers
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Honest advice to help you select the right laptop, CCTV setup, and components for your requirements and budget.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
              <BookOpen className="w-4 h-4" />
              <span>Guide #1</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Laptop Buying Guide for Students & Freelancers in Moulvibazar
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When choosing a laptop in Moulvibazar, prioritize processors (Core i3/i5 or Ryzen 5), a minimum of 8GB–16GB RAM, and NVMe SSD storage. For remote work and online classes, battery endurance and keyboard durability are essential. Trust Computer stocks genuine laptops from HP, Dell, and Asus with official warranties so your investment remains secure.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <BookOpen className="w-4 h-4" />
              <span>Guide #2</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              CCTV Camera Buying Guide for Homes and Shops in Moulvibazar
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              For homes and retail shops in Moulvibazar, 2MP to 5MP Full HD cameras from Hikvision or Dahua offer ideal clarity. If night surveillance is critical, choose cameras with ColorVu or full-color night vision. Pair with a reliable surveillance hard drive (WD Purple or Seagate SkyHawk) to guarantee 24/7 continuous recording without dropouts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-teal-600 font-bold text-xs">
              <BookOpen className="w-4 h-4" />
              <span>Guide #3</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              How to Choose a Wi-Fi Router for Concrete Homes in Moulvibazar
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Due to thick brick and concrete walls common in Bangladeshi buildings, standard single-band routers often suffer from dead spots. We recommend Gigabit Dual-Band AC1200 or Wi-Fi 6 routers (such as the TP-Link Archer series) with high-gain antennas to maintain stable high-speed connectivity across multiple rooms.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
              <BookOpen className="w-4 h-4" />
              <span>Guide #4</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Computer Servicing & Speed Upgrades at Kusumbagh
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Is your desktop PC or laptop taking minutes to boot? Upgrading your mechanical hard drive to an SSD is the most cost-effective way to multiply system responsiveness by 5x to 10x. Our service engineers at T.S Plaza can install the drive, clone your operating system, and clean your fans while preserving your data.
            </p>
          </div>
        </div>
      </section>

      {/* 8. GOOGLE REVIEWS & CUSTOMER SATISFACTION */}
      <section className="container mx-auto max-w-6xl px-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-800 ml-1">Authentic Customer Feedback</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Experienced Service at Trust Computer Moulvibazar?
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              We value genuine feedback from real customers. If you recently purchased a laptop, components, or had CCTV installed, please share your authentic experience on our official Google Business Profile.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href={business.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition shadow-sm"
            >
              <span>Review Us on Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 9. GOOGLE MAPS LOCATION & DIRECTIONS */}
      <section className="container mx-auto max-w-6xl px-4 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Find Trust Computer in Moulvibazar
          </h2>
          <p className="text-xs text-slate-500">
            Located conveniently on the 2nd floor of T.S Plaza at Kusumbagh Point
          </p>
        </div>

        <GoogleMapEmbed />
      </section>

      {/* 10. LOCAL FREQUENTLY ASKED QUESTIONS */}
      <section className="container mx-auto max-w-6xl px-4 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Questions About Trust Computer Moulvibazar
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Common questions answered directly by our showroom and technical team.
          </p>
        </div>

        <MoulvibazarFaqAccordion faqs={localFaqs} />
      </section>

      {/* 11. MOBILE STICKY ACTION STRIP (visible on smaller screens) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2 sm:hidden flex items-center justify-between gap-2 shadow-lg">
        <a
          href={business.sales.tel}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#2A3B97] text-white font-bold py-2.5 px-3 rounded-xl text-xs"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-300" />
          <span>Call Sales</span>
        </a>

        <a
          href={salesWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>

        <a
          href={business.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 text-white font-bold py-2.5 px-3 rounded-xl text-xs"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-400" />
          <span>Directions</span>
        </a>
      </div>
    </div>
  );
}
