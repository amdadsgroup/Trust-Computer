import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import ProductCard from '@/components/products/ProductCard';
import ProductDetailActions from './ProductDetailActions';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
  Home,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { getProductInquiryWhatsAppLink } from '@/lib/whatsapp';
import { getProductReviews, getProductReviewStats } from '@/lib/reviews';
import ReviewsSection from '@/components/products/ReviewsSection';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: { images: true, category: true },
    });

    if (!product) return { title: 'Product Not Found' };

    return {
      title: `${product.name} | Trust Computer-Moulvibazar`,
      description: `${product.name} - ৳${Number(product.sellingPrice).toLocaleString('en-BD')}. Available at Trust Computer-Moulvibazar. ${product.warrantyInfo || ''}`,
      openGraph: {
        title: product.name,
        description: product.description.slice(0, 160),
        images: product.images[0]?.url ? [{ url: product.images[0].url }] : [],
      },
    };
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  let product: any = null;
  let relatedProducts: any[] = [];
  let reviews: any[] = [];
  let reviewStats: any = { averageRating: 0, totalReviews: 0, breakdown: [] };

  try {
    product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        specifications: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true,
        brand: true,
      },
    });

    if (!product || !product.isActive) {
      notFound();
    }

    // Related products from same category
    relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        category: true,
        brand: true,
      },
      take: 4,
    });

    // Fetch approved reviews and stats in parallel
    const [reviewResult, stats] = await Promise.all([
      getProductReviews({ productId: product.id, limit: 10 }),
      getProductReviewStats(product.id),
    ]);
    reviews = reviewResult.reviews;
    reviewStats = stats;
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
  const jsonLd = {
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
      seller: {
        '@type': 'Organization',
        name: 'Trust Computer-Moulvibazar',
      },
    },
  };

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
          <span>হোম</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-brand">
          পণ্যসমূহ
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
                className="object-contain p-4"
              />
            ) : (
              <div className="text-slate-300 font-mono text-sm">Trust Computer Moulvibazar</div>
            )}
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-accent-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                {discountPercent}% ছাড়
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
                  <Image src={img.url} alt={product.name} fill className="object-cover p-1" />
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
                  <span className="text-slate-600 font-medium">ব্র্যান্ড: {product.brand.name}</span>
                </>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h1>

            {/* SKU & Stock Availability */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono">
                SKU: {product.sku}
              </span>

              {product.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>স্টকে আছে ({product.stock} টি উপলব্ধ)</span>
                </span>
              ) : (
                <span className="text-accent-600 font-bold bg-accent-50 px-2.5 py-1 rounded-md border border-accent-200">
                  স্টক শেষ (Out of Stock)
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
              <span>মৌলভীবাজার সদর এবং সারা দেশে কুরিয়ার ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>১০০% অফিসিয়াল এবং অথেনটিক পণ্য নিশ্চয়তা</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
            পণ্য বিবরণী (Product Description)
          </h2>
          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>

        {/* Specifications Table */}
        {product.specifications.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
              কারিগরি বৈশিষ্ট্য (Technical Specifications)
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

      {/* Reviews Section */}
      <ReviewsSection
        productId={product.id}
        initialReviews={reviews.map((r: any) => ({
          id: r.id,
          reviewerName: r.reviewerName,
          rating: r.rating,
          title: r.title,
          body: r.body,
          isVerifiedPurchase: r.isVerifiedPurchase,
          createdAt: r.createdAt.toISOString(),
          images: r.images,
        }))}
        stats={reviewStats}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              সম্পর্কিত অন্যান্য পণ্য (Related Products)
            </h2>
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="text-xs font-semibold text-brand hover:underline"
              >
                ক্যাটাগরির সব পণ্য
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
