import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import ProductCard from '@/components/products/ProductCard';
import HeroCarousel from '@/components/home/HeroCarousel';
import AnnouncementTicker from '@/components/home/AnnouncementTicker';
import QuickUtilityCards from '@/components/home/QuickUtilityCards';
import FeaturedCategoryCircles from '@/components/home/FeaturedCategoryCircles';
import { getActiveBanners } from '@/lib/banners';
import { getActiveOffers } from '@/lib/offers';
import { getHomepageSections } from '@/lib/homepage';
import {
  Sparkles,
  ArrowRight,
  Gift,
  PackageOpen,
} from 'lucide-react';
import ShowroomInfoSection from '@/components/home/ShowroomInfoSection';
import { getGeneralWhatsAppLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

async function getHomePageData() {
  try {
    const [featuredProducts, newArrivals, categories, activeBanners, activeOffers, sections] =
      await Promise.all([
        prisma.product.findMany({
          where: { isActive: true, isFeatured: true },
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            category: true,
            brand: true,
          },
          take: 8,
        }),
        prisma.product.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            category: true,
            brand: true,
          },
          take: 8,
        }),
        prisma.category.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          take: 12,
        }),
        getActiveBanners(),
        getActiveOffers(),
        getHomepageSections(),
      ]);

    return {
      featuredProducts,
      newArrivals,
      categories,
      activeBanners,
      activeOffers,
      sections,
    };
  } catch (error) {
    console.error('Database fetch error on home page:', error);
    return {
      featuredProducts: [],
      newArrivals: [],
      categories: [],
      activeBanners: [],
      activeOffers: [],
      sections: [],
    };
  }
}

export default async function HomePage() {
  const { featuredProducts, newArrivals, categories, activeBanners, activeOffers, sections } =
    await getHomePageData();
  const whatsappUrl = getGeneralWhatsAppLink();

  // Only display verified products fetched from the database
  const displayProducts = featuredProducts.map((p) => ({
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
    specs: [
      p.warrantyInfo ? `Warranty: ${p.warrantyInfo}` : 'Official Brand Warranty',
      `Model / SKU: ${p.sku}`,
      'Direct dispatch from Moulvibazar showroom',
      'Professional setup & technical support',
    ],
  }));

  const displayNewArrivals =
    newArrivals.length > 0
      ? newArrivals.map((p) => ({
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
          specs: [
            p.warrantyInfo ? `Warranty: ${p.warrantyInfo}` : 'Official Warranty',
            `SKU: ${p.sku}`,
          ],
        }))
      : [];

  // Section visibility map
  const sectionMap = new Map(sections.map((s) => [s.sectionKey, s]));
  const isSectionVisible = (key: string) => {
    const s = sectionMap.get(key);
    return s ? s.isVisible : true;
  };

  return (
    <div className="bg-[#f2f4f8] min-h-screen py-5 sm:py-6 space-y-6 sm:space-y-8">
      <div className="container mx-auto px-4 space-y-6 sm:space-y-8">
        {/* 1. Hero Banner Carousel & Side Cards */}
        {isSectionVisible('HERO_BANNER') && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
            {/* Left: Dynamic Carousel Banner */}
            <div className="lg:col-span-8 flex flex-col">
              <HeroCarousel banners={activeBanners} />
            </div>

            {/* Right: Side Promotion Cards (Desktop view) */}
            {(() => {
              const sideBanner1 =
                activeBanners.find(
                  (b) =>
                    b.id === 'banner-customer-support' ||
                    b.desktopImageUrl.includes('feedback') ||
                    b.desktopImageUrl.includes('support')
                ) ||
                activeBanners[2] || {
                  desktopImageUrl: '/images/side-banner-feedback.jpg',
                  title: 'Customer Care & Warranty Support',
                  buttonUrl: '/contact',
                };

              const sideBanner2 =
                activeBanners.find(
                  (b) =>
                    b.id === 'banner-custom-setup' ||
                    b.desktopImageUrl.includes('service') ||
                    b.desktopImageUrl.includes('setup') ||
                    b.desktopImageUrl.includes('custom')
                ) ||
                activeBanners[3] || {
                  desktopImageUrl: '/images/side-banner-service.jpg',
                  title: 'Custom PC Building & Workstations',
                  buttonUrl: '/categories/cctv-surveillance',
                };

              return (
                <div className="hidden lg:grid lg:col-span-4 grid-cols-1 gap-4 h-full">
                  <Link
                    href={sideBanner1.buttonUrl || '/contact'}
                    className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-[210px] block border border-slate-200"
                    title={sideBanner1.title}
                  >
                    <Image
                      src={sideBanner1.desktopImageUrl}
                      alt={sideBanner1.title}
                      fill
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <Link
                    href={sideBanner2.buttonUrl || '/categories/cctv-surveillance'}
                    className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-[210px] block border border-slate-200"
                    title={sideBanner2.title}
                  >
                    <Image
                      src={sideBanner2.desktopImageUrl}
                      alt={sideBanner2.title}
                      fill
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                </div>
              );
            })()}
          </section>
        )}

        {/* 2. Announcement Notice Ticker */}
        <section>
          <AnnouncementTicker />
        </section>

        {/* 3. Quick Utility 4-Column Cards */}
        <section>
          <QuickUtilityCards />
        </section>

        {/* 4. Active Promotional Offers Section (Automatically hidden if no active offers exist) */}
        {isSectionVisible('FEATURED_OFFERS') && activeOffers.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Gift className="w-5 h-5 text-orange-500" />
                  <span>Special Offers & Limited Deals</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exclusive promotions currently running at Trust Computer Moulvibazar
                </p>
              </div>

              <Link
                href="/products?offer=true"
                className="text-xs font-bold text-[#0084d6] hover:underline flex items-center gap-1"
              >
                <span>View All Offers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start gap-4">
                    {offer.imageUrl ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        <Image
                          src={offer.imageUrl}
                          alt={offer.title}
                          fill
                          className="object-cover group-hover:scale-105 transition"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0 text-orange-500">
                        <Gift className="w-7 h-7" />
                      </div>
                    )}

                    <div className="space-y-1 min-w-0 flex-1">
                      {offer.badge && (
                        <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase inline-block">
                          {offer.badge}
                        </span>
                      )}
                      <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0084d6] transition truncate">
                        {offer.title}
                      </h3>
                      {offer.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{offer.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {offer.discountValue && (
                        <span className="text-xs font-bold text-emerald-600">
                          {offer.discountType === 'PERCENTAGE'
                            ? `${offer.discountValue}% Discount`
                            : `Save ৳${offer.discountValue}`}
                        </span>
                      )}
                    </div>

                    <Link
                      href={offer.buttonUrl || (offer.product ? `/products/${offer.product.slug}` : '/products')}
                      className="inline-flex items-center gap-1.5 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm"
                    >
                      <span>{offer.buttonText || 'View Offer'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Featured Category Circles */}
        {isSectionVisible('FEATURED_CATEGORIES') && (
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
            <FeaturedCategoryCircles />
          </section>
        )}

        {/* 6. Featured Products Section */}
        {isSectionVisible('FEATURED_PRODUCTS') && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Featured Products
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Check & Get Your Desired Product from Trust Computer Moulvibazar!
              </p>
            </div>

            {displayProducts.length > 0 ? (
              <>
                {/* Product Cards Grid (2-column on mobile) */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {displayProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        sku: product.sku,
                        sellingPrice: product.sellingPrice,
                        compareAtPrice: product.compareAtPrice,
                        stock: product.stock,
                        lowStockThreshold: product.lowStockThreshold,
                        images: product.images,
                        category: product.category,
                        brand: product.brand,
                        warrantyInfo: product.warrantyInfo,
                        specs: product.specs,
                      }}
                    />
                  ))}
                </div>

                <div className="text-center pt-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold px-8 py-3 rounded-xl text-sm transition shadow-md hover:shadow-lg"
                  >
                    <span>View All Products in Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
                <PackageOpen className="w-14 h-14 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">Showroom Inventory Syncing</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our live catalog is currently updating with verified stocks and prices directly from our Moulvibazar showroom.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
                  >
                    <span>Instant WhatsApp Inquiry</span>
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition"
                  >
                    <span>Visit Showroom</span>
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 7. New Arrivals Section (if available) */}
        {isSectionVisible('NEW_ARRIVALS') && displayNewArrivals.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  New Arrivals
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest computer components, accessories & CCTV technology in stock
                </p>
              </div>

              <Link
                href="/products?sort=newest"
                className="text-xs font-bold text-[#0084d6] hover:underline flex items-center gap-1"
              >
                <span>Explore All New Arrivals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {displayNewArrivals.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    sku: product.sku,
                    sellingPrice: product.sellingPrice,
                    compareAtPrice: product.compareAtPrice,
                    stock: product.stock,
                    lowStockThreshold: product.lowStockThreshold,
                    images: product.images,
                    category: product.category,
                    brand: product.brand,
                    warrantyInfo: product.warrantyInfo,
                    specs: product.specs,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* 8. Physical Showroom & Verified Trust Section */}
        {isSectionVisible('SHOWROOM_INFO') && (
          <ShowroomInfoSection whatsappUrl={whatsappUrl} />
        )}
      </div>
    </div>
  );
}
