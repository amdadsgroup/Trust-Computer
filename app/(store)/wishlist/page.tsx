'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { useWishlist } from '@/components/wishlist/WishlistContext';
import { useCart } from '@/components/cart/CartContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem, setIsOpen } = useCart();
  const { success } = useToast();
  const { isBangla, t } = useLanguage();

  const handleMoveToCart = (item: any) => {
    addItem({
      productId: item.id,
      name: item.name,
      slug: item.slug,
      sku: item.sku || '',
      price: item.price,
      image: item.image,
      stock: item.stock,
    });
    removeFromWishlist(item.id);
    success(
      isBangla
        ? `"${item.name}" কার্টে যোগ করা হয়েছে!`
        : `Added "${item.name}" to your cart!`
    );
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-4 md:pt-6">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            {isBangla ? 'হোম' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">
            {isBangla ? 'পছন্দের তালিকা (Wishlist)' : 'Wishlist'}
          </span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-accent-50 text-accent-500 border border-accent-100">
                <Heart className="w-6 h-6 fill-accent-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {isBangla ? 'আমার উইশলিস্ট' : 'My Wishlist'}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isBangla
                ? `আপনার সংরক্ষিত পছন্দের পণ্যসমূহ (${items.length} টি আইটেম)`
                : `Your saved favorite items (${items.length} ${items.length === 1 ? 'item' : 'items'})`}
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-accent-600 transition-colors self-start sm:self-auto py-2 px-3 rounded-lg hover:bg-white border border-transparent hover:border-slate-200"
            >
              <Trash2 className="w-4 h-4" />
              {isBangla ? 'সব মুছুন' : 'Clear All'}
            </button>
          )}
        </div>

        {/* Wishlist Items List */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/70 shadow-sm max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-5">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {isBangla ? 'আপনার উইশলিস্ট খালি' : 'Your Wishlist is Empty'}
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {isBangla
                ? 'পছন্দের কোনো পণ্য এখনো সেভ করা হয়নি। ব্রাউজ করার সময় হার্ট আইকনে ক্লিক করে যে কোনো আইটেম সেভ করে রাখতে পারেন।'
                : 'You have not saved any items yet. Browse products and tap the heart icon to save items to your wishlist.'}
            </p>
            <Link href="/products">
              <Button size="lg" className="gap-2">
                {isBangla ? 'পণ্য দেখুন' : 'Explore Products'}{' '}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const isOutOfStock = item.stock <= 0;
              const hasDiscount = item.regularPrice && item.regularPrice > item.price;
              const discountPercent = hasDiscount
                ? Math.round(((item.regularPrice! - item.price) / item.regularPrice!) * 100)
                : 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image & Quick Badges */}
                    <div className="relative aspect-square w-full rounded-xl bg-slate-50 overflow-hidden mb-3 border border-slate-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag className="w-12 h-12" />
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-accent-500 hover:bg-white shadow-sm border border-slate-200/50 transition-all"
                        title={isBangla ? 'তালিকা থেকে সরান' : 'Remove from wishlist'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {hasDiscount && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="accent">-{discountPercent}%</Badge>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1 mb-3">
                      {item.categoryName && (
                        <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
                          {item.categoryName}
                        </span>
                      )}
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 hover:text-brand-600 transition-colors leading-snug">
                          {item.name}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  <div>
                    {/* Price and Stock */}
                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 mb-4">
                      <div>
                        <span className="text-lg font-bold text-slate-900">
                          ৳{item.price.toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                          <span className="ml-2 text-xs text-slate-400 line-through">
                            ৳{item.regularPrice!.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <div>
                        {isOutOfStock ? (
                          <Badge variant="outline" className="text-slate-400 border-slate-200">
                            {isBangla ? 'স্টক আউট' : 'Out of Stock'}
                          </Badge>
                        ) : (
                          <Badge variant="success">
                            {isBangla ? 'স্টকে আছে' : 'In Stock'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleMoveToCart(item)}
                        disabled={isOutOfStock}
                        className="flex-1 gap-2"
                        size="sm"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {isBangla ? 'কার্টে নিন' : 'Add to Cart'}
                      </Button>
                      <Link href={`/products/${item.slug}`}>
                        <Button variant="outline" size="sm">
                          {isBangla ? 'বিস্তারিত' : 'Details'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Showroom guarantee footer strip */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {isBangla
                  ? '১০০% জেনুইন প্রোডাক্ট গ্যারান্টি — Trust Computer মৌলভীবাজার'
                  : '100% Genuine Product Guarantee — Trust Computer Moulvibazar'}
              </p>
              <p className="text-xs text-slate-500">
                {isBangla
                  ? 'টি.এস প্লাজা (২য় তলা), কুসুমবাগ, মৌলভীবাজার শোরুম থেকে সরাসরি কালেকশন অথবা ক্যাশ অন ডেলিভারি'
                  : 'Direct collection from showroom at T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar or Cash on Delivery nationwide'}
              </p>
            </div>
          </div>
          <Link href="/products">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              {isBangla ? 'আরও পণ্য দেখুন' : 'Browse More Products'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
