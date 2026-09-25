'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  MessageCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { getCartInquiryWhatsAppLink } from '@/lib/whatsapp';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();

  const whatsappInquiryUrl = getCartInquiryWhatsAppLink(
    items.map((i) => ({ name: i.name, quantity: i.quantity })),
    subtotal
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your selected products, update quantities, or proceed to checkout.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4 shadow-sm">
          <ShoppingBag className="w-20 h-20 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our computer catalog, CCTV components, and accessories to add items to your cart.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow"
            >
              <span>Browse Catalog (Shop Now)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-mono">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-bold text-sm text-slate-800 hover:text-[#0084d6] line-clamp-2 transition"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                    <p className="text-xs text-slate-600 font-semibold mt-1">
                      Unit Price: ৳{item.price.toLocaleString('en-BD')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-2 hover:bg-slate-200 text-slate-600 rounded-l-xl transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-2 hover:bg-slate-200 text-slate-600 rounded-r-xl disabled:opacity-30 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[80px]">
                    <span className="block text-sm font-extrabold text-slate-900">
                      ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-red-50 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/products"
                className="text-xs font-bold text-[#0084d6] hover:underline flex items-center gap-1"
              >
                <span>← Continue Shopping for More Products</span>
              </Link>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Items ({totalItems}):</span>
                  <span className="font-semibold text-slate-800">
                    ৳{subtotal.toLocaleString('en-BD')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge:</span>
                  <span className="text-slate-500 italic">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-800">Subtotal:</span>
                <span className="text-2xl font-black text-slate-900">
                  ৳{subtotal.toLocaleString('en-BD')}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-md hover:shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-medium py-3 px-4 rounded-xl text-xs transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire via WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Guarantees Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0084d6] flex-shrink-0" />
                <span>৳60 in Moulvibazar Sadar, ৳120 nationwide</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Cash on delivery with official warranty</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
