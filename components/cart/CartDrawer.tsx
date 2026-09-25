'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartContext';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, MessageCircle } from 'lucide-react';
import { getCartInquiryWhatsAppLink } from '@/lib/whatsapp';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const { t, isBangla } = useLanguage();

  if (!isOpen) return null;

  const whatsappInquiryUrl = getCartInquiryWhatsAppLink(
    items.map((i) => ({ name: i.name, quantity: i.quantity })),
    subtotal
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand" />
              <h2 className="font-bold text-slate-800 text-lg">
                {t('cart.title', 'Shopping Bag')} ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700">
                  {t('cart.empty_title', 'Your Bag is Empty')}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {t('cart.empty_desc', 'Looks like you have not added anything yet. Explore our catalog!')}
                </p>
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="mt-6 inline-block bg-brand hover:bg-brand-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition"
                >
                  {t('cart.browse_products', 'Browse Products')}
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="relative w-20 h-20 bg-white rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-xs text-slate-400 font-mono">No Image</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">SKU: {item.sku}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 text-slate-700 rounded-l-xl transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 text-slate-700 rounded-r-xl disabled:opacity-30 transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">
                          ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-slate-400 hover:text-rose-600 p-2 -mr-1 self-start transition rounded-lg active:bg-slate-200"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>{t('cart.subtotal', 'Subtotal')}:</span>
                <span className="font-extrabold text-lg text-slate-900">
                  ৳{subtotal.toLocaleString('en-BD')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {t('cart.shipping_note', '* Delivery charge will be calculated at checkout based on your area.')}
              </p>

              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-md active:scale-[0.99]"
                >
                  <span>{t('cart.proceed_checkout', 'Proceed to Checkout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('cart.order_whatsapp', 'Order / Inquire via WhatsApp')}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
