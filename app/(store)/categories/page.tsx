import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import {
  Home,
  ChevronRight,
  Cpu,
  Laptop,
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
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Server,
  Gamepad2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export const metadata = {
  title: 'All Product Categories | Trust Computer Moulvibazar',
  description:
    'Browse all tech product categories at Trust Computer Moulvibazar. Laptops, Desktops, CCTV Cameras, Networking, Components, Printers & Accessories at best prices.',
};

// Map known slugs or names to icons & vibrant theme accents
function getCategoryIconAndStyle(slug: string, name: string) {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();

  // 1. Laptop & Computer
  if (s.includes('laptop') || s.includes('computer') || s.includes('desktop') || n.includes('laptop') || n.includes('computer')) {
    return {
      icon: <Laptop className="w-7 h-7 text-brand-600" />,
      bg: 'bg-blue-50 border-blue-100 group-hover:border-blue-300',
      badge: 'bg-blue-100 text-blue-700',
      accent: 'from-blue-500/10 to-transparent',
    };
  }

  // 2. Monitor
  if (s.includes('monitor') || s.includes('display') || n.includes('monitor')) {
    return {
      icon: <Monitor className="w-7 h-7 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-100 group-hover:border-indigo-300',
      badge: 'bg-indigo-100 text-indigo-700',
      accent: 'from-indigo-500/10 to-transparent',
    };
  }

  // 3. Gaming
  if (s.includes('gaming') || n.includes('gaming')) {
    return {
      icon: <Gamepad2 className="w-7 h-7 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-100 group-hover:border-rose-300',
      badge: 'bg-rose-100 text-rose-700',
      accent: 'from-rose-500/10 to-transparent',
    };
  }

  // 4. Computer Accessories
  if (s.includes('accessories') || s.includes('keyboard') || s.includes('mouse') || n.includes('accessories')) {
    return {
      icon: <Keyboard className="w-7 h-7 text-sky-600" />,
      bg: 'bg-sky-50 border-sky-100 group-hover:border-sky-300',
      badge: 'bg-sky-100 text-sky-700',
      accent: 'from-sky-500/10 to-transparent',
    };
  }

  // 5. CCTV & Security
  if (s.includes('cctv') || s.includes('security') || s.includes('surveillance') || s.includes('camera') || n.includes('cctv')) {
    return {
      icon: <ShieldCheck className="w-7 h-7 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100 group-hover:border-emerald-300',
      badge: 'bg-emerald-100 text-emerald-700',
      accent: 'from-emerald-500/10 to-transparent',
    };
  }

  // 6. Networking
  if (s.includes('network') || s.includes('router') || s.includes('wifi') || n.includes('network')) {
    return {
      icon: <Wifi className="w-7 h-7 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-100 group-hover:border-teal-300',
      badge: 'bg-teal-100 text-teal-700',
      accent: 'from-teal-500/10 to-transparent',
    };
  }

  // 7. Power & Electronics
  if (s.includes('power') || s.includes('electronic') || s.includes('ups') || n.includes('power')) {
    return {
      icon: <Zap className="w-7 h-7 text-amber-500" />,
      bg: 'bg-amber-50 border-amber-100 group-hover:border-amber-300',
      badge: 'bg-amber-100 text-amber-700',
      accent: 'from-amber-500/10 to-transparent',
    };
  }

  // Default
  return {
    icon: <Boxes className="w-7 h-7 text-brand-600" />,
    bg: 'bg-slate-50 border-slate-200 group-hover:border-brand-300',
    badge: 'bg-brand-50 text-brand-700',
    accent: 'from-brand-500/10 to-transparent',
  };
}

export default async function CategoriesPage() {
  let categories: any[] = [];
  let totalProductsCount = 0;

  try {
    const [fetchedCats, totalCount] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          _count: {
            select: {
              products: {
                where: { isActive: true },
              },
            },
          },
          children: {
            where: { isActive: true },
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    categories = fetchedCats;
    totalProductsCount = totalCount;
  } catch (error) {
    console.error('Error loading categories:', error);
  }

  // Fallback defaults if DB has few or empty categories
  if (!categories || categories.length === 0) {
    categories = [
      {
        id: '1',
        name: 'Laptop & Computer',
        slug: 'laptop-computer',
        description: 'Brand new official laptops, desktop systems, processors, motherboards, RAM and PC components in Moulvibazar.',
        _count: { products: 0 },
      },
      {
        id: '2',
        name: 'Monitor',
        slug: 'monitor',
        description: 'IPS, LED, 100Hz-180Hz gaming and office monitors with crisp resolution and eye-care technology.',
        _count: { products: 0 },
      },
      {
        id: '3',
        name: 'Gaming',
        slug: 'gaming',
        description: 'Gaming peripherals, RGB mechanical keyboards, high DPI precision mice, and performance headsets.',
        _count: { products: 0 },
      },
      {
        id: '4',
        name: 'Computer Accessories',
        slug: 'computer-accessories',
        description: 'Ergonomic keyboards, mice, soundbars, headphones, webcams, cables, adapters, and daily PC peripherals.',
        _count: { products: 0 },
      },
      {
        id: '5',
        name: 'CCTV & Security',
        slug: 'cctv-security',
        description: 'High definition CCTV cameras, ColorVu night vision, DVR/XVR, surveillance hard drives & installation.',
        _count: { products: 0 },
      },
      {
        id: '6',
        name: 'Networking',
        slug: 'networking',
        description: 'Dual-band Wi-Fi routers, Gigabit network switches, Cat6 cables, range extenders, and connectivity gear.',
        _count: { products: 0 },
      },
      {
        id: '7',
        name: 'Power & Electronics',
        slug: 'power-electronics',
        description: 'Reliable offline and online UPS systems, surge protectors, voltage stabilizers, and power backup units.',
        _count: { products: 0 },
      },
    ];
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 space-y-8 max-w-7xl">
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-600 flex items-center gap-1 transition">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900">Categories</span>
      </nav>

      {/* 2. Hero Header Banner */}
      <div className="bg-gradient-to-br from-[#081621] via-[#0f283d] to-[#0084d6] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-sky-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>Official Technology Store & CCTV Specialist</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            All Product Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
            Explore complete collection of authentic laptops, desktop computers, CCTV surveillance systems, networking gear, and genuine IT accessories in Moulvibazar.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-100">
            <Layers className="w-4 h-4 text-sky-300" />
            <span>{categories.length} Categories Available</span>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-sky-50 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2.5 Quick Navigation Tabs: Categories vs All Products */}
      <div className="flex items-center gap-2">
        <span className="px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs shadow-xs flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          <span>Categories</span>
        </span>
        <Link
          href="/products"
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand hover:border-brand-300 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Browse All Products</span>
        </Link>
      </div>

      {/* 3. Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Browse by Category
            </h2>
            <p className="text-xs text-slate-500">
              Select a category to explore models, specifications, and warranty details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const style = getCategoryIconAndStyle(cat.slug, cat.name);
            const productCount = cat._count?.products ?? 0;

            return (
              <Link
                key={cat.id || cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-brand-400 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle top corner gradient */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${style.accent} rounded-bl-full pointer-events-none group-hover:scale-125 transition duration-500`}
                />

                <div className="space-y-4 relative z-10">
                  {/* Icon & Count Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-14 h-14 rounded-2xl ${style.bg} flex items-center justify-center border shadow-xs group-hover:scale-110 transition duration-300`}
                    >
                      {style.icon}
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${style.badge}`}
                    >
                      {productCount} {productCount === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {/* Subcategories (if any) */}
                  {cat.children && cat.children.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {cat.children.slice(0, 3).map((sub: any) => (
                        <span
                          key={sub.id}
                          className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600 group-hover:text-brand-700 relative z-10">
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition duration-200" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. Showroom & Consultation Banner */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Need a Custom PC Build or CCTV Package in Moulvibazar?
            </h4>
            <p className="text-xs text-slate-600">
              Visit our showroom at T.S. Plaza (2nd Floor), Kusumbag or call Hotline: 01753-765372 / 01711-137517.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/contact"
            className="flex-1 md:flex-initial text-center bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            Contact & Location
          </Link>
        </div>
      </div>
    </div>
  );
}
