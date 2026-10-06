import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import ProductCard from '@/components/products/ProductCard';
import ProductDetailActions from './ProductDetailActions';
import ReviewsSection from '@/components/products/ReviewsSection';
import { getProductReviewStats } from '@/lib/reviews';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
  Home,
  MessageCircle,
  HelpCircle,
  Star,
  MapPin,
  Phone,
} from 'lucide-react';
import { getProductInquiryWhatsAppLink } from '@/lib/whatsapp';

import { unstable_cache } from 'next/cache';

export const revalidate = 60;

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

const getProductBySlug = unstable_cache(
  async (slug: string) => {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        specifications: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true,
        brand: true,
      },
    });
  },
  ['product-detail-data'],
  { revalidate: 60, tags: ['products'] }
);

const getRelatedProducts = unstable_cache(
  async (categoryId: string, productId: string) => {
    return await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
        isActive: true,
      },
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
      take: 4,
    });
  },
  ['related-products-data'],
  { revalidate: 120, tags: ['products'] }
);

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
      take: 100,
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  try {
    const product = await getProductBySlug(params.slug);

    if (!product) return { title: 'Product Not Found' };

    const formattedPrice = Number(product.sellingPrice).toLocaleString('en-BD');
    return {
      title: `${product.name} Price in Moulvibazar | Trust Computer`,
      description: `Customers looking for ${product.name} in Moulvibazar can check current price (৳${formattedPrice}) and availability at Trust Computer. 100% genuine with official warranty. Kusumbagh Showroom. Hotline: 01797854836.`,
      openGraph: {
        title: `${product.name} Price in Moulvibazar | Trust Computer`,
        description: `Buy ${product.name} in Moulvibazar at Trust Computer. Genuine product, official warranty. Showroom at T.S Plaza, Kusumbagh.`,
        images: product.images[0]?.url ? [{ url: product.images[0].url }] : [],
      },
    };
  } catch {
    return { title: 'Product | Trust Computer-Moulvibazar' };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  let product: any = null;
  let relatedProducts: any[] = [];
  let reviewStats: any = {
    averageRating: 0,
    totalReviews: 0,
    recommendedPercentage: 100,
    breakdown: {
      5: { count: 0, percentage: 0 },
      4: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 },
      2: { count: 0, percentage: 0 },
      1: { count: 0, percentage: 0 },
    },
  };

  try {
    product = await getProductBySlug(params.slug);

    if (!product || !product.isActive) {
      notFound();
    }

    if (product.categoryId) {
      relatedProducts = await getRelatedProducts(product.categoryId, product.id);
    }

    reviewStats = await getProductReviewStats(product.id);
  } catch (e) {
    console.error('Error fetching product detail:', e);
  }

  if (!product) {
    notFound();
  }

  const price = Number(product.sellingPrice);
  const comparePrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const whatsappInquiryUrl = getProductInquiryWhatsAppLink({
    name: product.name,
    sku: product.sku,
    price,
    slug: product.slug,
  });

  // Schema.org JSON-LD Structured Data
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((img: any) => img.url),
    description: product.description,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: price.toString(),
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      areaServed: 'Moulvibazar, Bangladesh',
      seller: {
        '@type': 'ComputerStore',
        name: 'Trust Computer-Moulvibazar',
        telephone: '+8801797854836',
        url: 'https://trustcomputermb.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'T.S Plaza (2nd Floor), Kusumbagh',
          addressLocality: 'Moulvibazar',
          postalCode: '3200',
          addressCountry: 'BD',
        },
      },
    },
  };

  if (reviewStats.totalReviews > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviewStats.averageRating.toFixed(1),
      reviewCount: reviewStats.totalReviews,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-10 sm:space-y-12 pb-28 md:pb-12">
      {/* Insert JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-brand">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/categories/${product.category.slug}`} className="hover:text-brand">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-6">
            {product.images[0]?.url ? (
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-4"
              />
            ) : (
              <div className="text-slate-300 font-mono text-sm">Trust Computer Moulvibazar</div>
            )}
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-accent-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail list if multiple images exist */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: any, idx: number) => (
                <div
                  key={img.id || idx}
                  className="relative w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0 cursor-pointer hover:border-brand transition"
                >
                  <Image src={img.url} alt={product.name} fill sizes="80px" className="object-cover p-1" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions Column */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            {/* Category & Brand Header */}
            <div className="flex items-center gap-2 text-xs">
              {product.category && (
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="text-brand font-semibold hover:underline"
                >
                  {product.category.name}
                </Link>
              )}
              {product.brand && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-medium">Brand: {product.brand.name}</span>
                </>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h1>

            {/* Reviews Rating Quick Link */}
            <a
              href="#customer-reviews"
              className="inline-flex items-center gap-2 text-xs group cursor-pointer w-fit py-0.5"
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(reviewStats.averageRating || 5)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-slate-800 group-hover:text-brand-600 transition">
                {reviewStats.totalReviews > 0 ? reviewStats.averageRating.toFixed(1) : '5.0'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 group-hover:text-brand-600 group-hover:underline transition">
                {reviewStats.totalReviews > 0
                  ? `(${reviewStats.totalReviews} customer review${reviewStats.totalReviews === 1 ? '' : 's'})`
                  : 'Write first review'}
              </span>
            </a>

            {/* SKU & Stock Availability */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono">
                SKU: {product.sku}
              </span>

              {product.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In Stock ({product.stock} available)</span>
                </span>
              ) : (
                <span className="text-accent-600 font-bold bg-accent-50 px-2.5 py-1 rounded-md border border-accent-200">
                  Out of Stock
                </span>
              )}

              {product.warrantyInfo && (
                <span className="flex items-center gap-1.5 text-slate-700 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                  <span>{product.warrantyInfo}</span>
                </span>
              )}
            </div>

            {/* Pricing Section */}
            <div className="pt-2 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                ৳{price.toLocaleString('en-BD')}
              </span>
              {hasDiscount && (
                <span className="text-lg text-slate-400 line-through">
                  ৳{comparePrice.toLocaleString('en-BD')}
                </span>
              )}
            </div>
          </div>

          {/* Interactive Client Add to Cart Component */}
          <ProductDetailActions
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              price,
              compareAtPrice: comparePrice,
              image: product.images[0]?.url,
              stock: product.stock,
              category: product.category,
              brand: product.brand,
              warranty: product.warrantyInfo,
            }}
            whatsappUrl={whatsappInquiryUrl}
          />

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand flex-shrink-0" />
              <span>Courier Delivery in Moulvibazar Sadar & Nationwide</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>100% Authentic & Genuine Products Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Local Showroom Availability in Moulvibazar */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A3B97] bg-white px-2.5 py-1 rounded-full border border-blue-200 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Moulvibazar Showroom Availability</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Kusumbagh Point
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Customers looking for <strong>{product.name}</strong> in Moulvibazar can verify current showroom availability and price at Trust Computer. Available for same-day in-store pickup at our Kusumbagh showroom (T.S Plaza, 2nd Floor) or express courier delivery across Moulvibazar Sadar, Sreemangal, Kulaura, and nearby areas with official brand warranty.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <a
            href="tel:01797854836"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-300" />
            <span>Call 01797854836</span>
          </a>
          <Link
            href="/moulvibazar"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold py-2.5 px-3.5 rounded-xl transition shadow-2xs"
          >
            <span>Moulvibazar Hub</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
            Product Description
          </h2>
          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>

        {/* Specifications Table */}
        {product.specifications.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
              Technical Specifications
            </h2>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <tbody>
                  {product.specifications.map((spec: any, idx: number) => (
                    <tr
                      key={spec.id || idx}
                      className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-700 w-1/3 border-b border-slate-200/80">
                        {spec.key}
                      </td>
                      <td className="py-3 px-4 text-slate-800 border-b border-slate-200/80">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <ReviewsSection
        productId={product.id}
        productName={product.name}
        initialStats={reviewStats}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Related Products
            </h2>
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="text-xs font-semibold text-brand hover:underline"
              >
                View All in Category
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={{
                  id: rel.id,
                  name: rel.name,
                  slug: rel.slug,
                  sku: rel.sku,
                  sellingPrice: Number(rel.sellingPrice),
                  compareAtPrice: rel.compareAtPrice ? Number(rel.compareAtPrice) : null,
                  stock: rel.stock,
                  lowStockThreshold: rel.lowStockThreshold,
                  images: rel.images,
                  category: rel.category,
                  brand: rel.brand,
                  warrantyInfo: rel.warrantyInfo,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
