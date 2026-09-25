'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/CartContext';
import { useCompare } from '@/components/compare/CompareContext';
import { useWishlist } from '@/components/wishlist/WishlistContext';
import { useToast } from '@/components/ui/toast';
import { ShoppingBag, MessageCircle, Plus, Minus, Check, Zap, Heart, GitCompare } from 'lucide-react';

interface ProductDetailActionsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    compareAtPrice?: number | null;
    image?: string;
    stock: number;
    category?: { name: string; slug: string } | null;
    brand?: { name: string } | null;
    warranty?: string | null;
  };
  whatsappUrl: string;
}

export default function ProductDetailActions({ product, whatsappUrl }: ProductDetailActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, setIsOpen } = useCart();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success, info } = useToast();
  const router = useRouter();

  const isOutOfStock = product.stock <= 0;
  const inCompare = isInCompare(product.id);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        image: product.image,
        stock: product.stock,
        warranty: product.warranty || undefined,
      },
      quantity
    );

    setAdded(true);
    success(`"${product.name}" (${quantity} টি) কার্টে যোগ করা হয়েছে!`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;

    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        image: product.image,
        stock: product.stock,
        warranty: product.warranty || undefined,
      },
      quantity
    );

    router.push('/checkout');
  };

  const handleToggleWishlist = () => {
    const isAdded = toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      regularPrice: product.compareAtPrice,
      image: product.image,
      stock: product.stock,
      categoryName: product.category?.name,
      brandName: product.brand?.name,
    });

    if (isAdded) {
      success('উইশলিস্টে যোগ করা হয়েছে!');
    } else {
      info('উইশলিস্ট থেকে সরানো হয়েছে');
    }
  };

  const handleToggleCompare = () => {
    if (inCompare) {
      removeFromCompare(product.id);
      info('তুলনা তালিকা থেকে সরানো হয়েছে');
    } else {
      const ok = addToCompare({
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        sellingPrice: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        images: product.image ? [{ url: product.image }] : [],
        category: product.category,
        brand: product.brand,
        warrantyInfo: product.warranty,
      });

      if (ok) {
        success('তুলনা তালিকায় যোগ করা হয়েছে!');
      } else {
        info('সর্বোচ্চ ৪টি পণ্য একসাথে তুলনা করা যাবে');
      }
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <label className="text-xs font-bold text-slate-700">পরিমাণ (Quantity):</label>
        <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-l-xl disabled:opacity-30 transition"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-sm font-bold text-slate-900">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={quantity >= product.stock || isOutOfStock}
            className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-r-xl disabled:opacity-30 transition"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-slate-400">
          সর্বোচ্চ: {product.stock > 0 ? product.stock : 0} টি
        </span>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-sm font-bold transition shadow-md ${
            added
              ? 'bg-emerald-600 text-white'
              : isOutOfStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-lg hover:shadow-brand-600/20 active:scale-98'
          }`}
        >
          {added ? (
            <>
              <Check className="w-5 h-5 stroke-[3]" />
              <span>কার্টে যোগ হয়েছে!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              <span>কার্টে যোগ করুন</span>
            </>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={`flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-sm font-bold transition shadow-md ${
            isOutOfStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-accent-500 hover:bg-accent-600 text-white hover:shadow-lg hover:shadow-accent-500/20 active:scale-98'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span>এখনই অর্ডার করুন</span>
        </button>
      </div>

      {/* Secondary Quick Actions: Wishlist + Compare */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          onClick={handleToggleWishlist}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition ${
            inWishlist
              ? 'bg-rose-50 text-accent-600 border-accent-200'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-accent-500 text-accent-500' : 'text-slate-400'}`} />
          <span>{inWishlist ? 'উইশলিস্টে সংরক্ষিত' : 'উইশলিস্টে রাখুন'}</span>
        </button>

        <button
          onClick={handleToggleCompare}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition ${
            inCompare
              ? 'bg-brand-50 text-brand-700 border-brand-200'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <GitCompare className={`w-4 h-4 ${inCompare ? 'text-brand-600' : 'text-slate-400'}`} />
          <span>{inCompare ? 'তুলনা তালিকায় আছে' : 'অন্য পণ্যের সাথে তুলনা'}</span>
        </button>
      </div>

      {/* WhatsApp Direct Inquiry */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition shadow-sm"
      >
        <MessageCircle className="w-4 h-4" />
        <span>হোয়াটসঅ্যাপে সরাসরি কথা বলুন (WhatsApp Inquiry)</span>
      </a>

      {/* Sticky Mobile Purchase Bar (App-like UX) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 px-4 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-slate-500 font-medium">সর্বমোট:</span>
          <span className="text-base font-black text-slate-900 truncate">
            ৳{(product.price * quantity).toLocaleString('en-BD')}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
              added
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 active:bg-brand-700 text-white'
            }`}
            aria-label="Add to cart"
          >
            {added ? <Check className="w-4 h-4 stroke-[3]" /> : <ShoppingBag className="w-4 h-4" />}
            <span>{added ? 'যোগ হয়েছে' : 'কার্টে নিন'}</span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-accent-500 active:bg-accent-600 text-white font-bold'
            }`}
            aria-label="Buy Now"
          >
            <Zap className="w-4 h-4" />
            <span>এখনই কিনুন (Buy Now)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
