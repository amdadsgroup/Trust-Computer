'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Check, Heart, ShieldCheck, Laptop, Star } from 'lucide-react';
import { useCart } from '../cart/CartContext';
import { useWishlist } from '../wishlist/WishlistContext';
import { useToast } from '@/components/ui/toast';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    sellingPrice: number | string;
    compareAtPrice?: number | string | null;
    stock: number;
    lowStockThreshold?: number;
    images?: Array<{ url: string; altText?: string | null }>;
    category?: { name: string; slug: string } | null;
    brand?: { name: string } | null;
    warrantyInfo?: string | null;
    specs?: string[] | null;
    rating?: number;
    reviewCount?: number;
  };
}

const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success, info } = useToast();
  const { t, isBangla } = useLanguage();

  const [added, setAdded] = React.useState(false);

  const inWishlist = isInWishlist(product.id);

  const price = Number(product.sellingPrice);
  const comparePrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= (product.lowStockThreshold || 3);
  const primaryImage = product.images?.[0]?.url;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price,
      image: primaryImage,
      stock: product.stock,
      warranty: product.warrantyInfo || undefined,
    });

    setAdded(true);
    success(
      isBangla
        ? `"${product.name}" কার্টে যোগ করা হয়েছে!`
        : `Added "${product.name}" to your cart!`
    );
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const addedToWishlist = toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price,
      regularPrice: comparePrice,
      image: primaryImage,
      stock: product.stock,
      categoryName: product.category?.name,
      brandName: product.brand?.name,
    });

    if (addedToWishlist) {
      success(isBangla ? 'উইশলিস্টে যোগ করা হয়েছে!' : 'Added to your wishlist!');
    } else {
      info(isBangla ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist');
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-200/80 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative h-full">
      {/* Top Floating Badges & Wishlist Action */}
      <div className="absolute top-2.5 inset-x-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 items-start pointer-events-auto">
          {hasDiscount && (
            <span className="bg-accent-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock ? (
            <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {t('product.out_of_stock', 'Out of Stock')}
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {isBangla ? `সীমিত স্টক (${product.stock})` : `Low Stock (${product.stock})`}
            </span>
          ) : (
            <span className="bg-emerald-600/95 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
              {t('product.in_stock', 'In Stock')}
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            inWishlist
              ? 'bg-rose-50 text-accent-600 border border-accent-200'
              : 'bg-white/90 text-slate-400 hover:text-accent-500 hover:bg-white border border-slate-200/60'
          }`}
          title={inWishlist ? (isBangla ? 'উইশলিস্ট থেকে সরান' : 'Remove from wishlist') : (isBangla ? 'উইশলিস্টে রাখুন' : 'Add to wishlist')}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 transition-transform duration-200 ${inWishlist ? 'fill-accent-600 scale-110' : 'hover:scale-110'}`} />
        </button>
      </div>

      {/* Product Image Area (Compact 4:3) */}
      <Link href={`/products/${product.slug}`} prefetch={true} className="block relative w-full aspect-[4/3] bg-slate-50/80 overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2.5 text-center bg-gradient-to-b from-slate-50 to-slate-100/60">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Laptop className="w-5 h-5 text-brand-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 line-clamp-1 max-w-[85%]">
              {product.name}
            </span>
            <span className="text-[8px] text-slate-400 uppercase tracking-widest">
              Trust Computer
            </span>
          </div>
        )}
      </Link>

      {/* Product Body */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            {product.category && (
              <span className="text-brand-600 font-semibold tracking-wide uppercase text-[10px]">
                {product.category.name}
              </span>
            )}
            {product.brand && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium text-[10px]">{product.brand.name}</span>
              </>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} prefetch={true}>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-brand-700 transition leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating Display if available */}
          {product.rating !== undefined && product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-slate-700">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              {product.reviewCount !== undefined && (
                <span className="text-slate-400 font-normal">({product.reviewCount})</span>
              )}
            </div>
          )}

          {/* Warranty Info if available */}
          {product.warrantyInfo && (
            <p className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{product.warrantyInfo}</span>
            </p>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2.5 border-t border-slate-100 mt-2.5">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                ৳{price.toLocaleString('en-BD')}
              </span>
              {hasDiscount && (
                <span className="text-[11px] text-slate-400 line-through">
                  ৳{comparePrice.toLocaleString('en-BD')}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                {isBangla ? `সাশ্রয় ৳${(comparePrice - price).toLocaleString('en-BD')}` : `Save ৳${(comparePrice - price).toLocaleString('en-BD')}`}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition shadow-sm ${
              added
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-md hover:shadow-brand-600/20 active:scale-[0.98]'
            }`}
            aria-label="Add product to cart"
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t('product.added', 'Added!')}</span>
              </>
            ) : isOutOfStock ? (
              <span>{t('product.out_of_stock', 'Out of Stock')}</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('product.add_to_cart', 'Add to Cart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
