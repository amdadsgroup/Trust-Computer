'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowLeft, TrendingUp, Sparkles, Clock } from 'lucide-react';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const popularSearches = [
  'Hikvision CCTV Camera',
  'Dahua 4CH XVR',
  'Gaming PC Build',
  'Core i5 12th Gen',
  'HP Laptop',
  'TP-Link Wi-Fi Router',
  '500GB NVMe SSD',
  'Gaming Keyboard & Mouse',
  '21.5 Inch Monitor',
];

export default function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleSelectTag = (tag: string) => {
    setQuery(tag);
    router.push(`/products?search=${encodeURIComponent(tag)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#081621] text-white flex flex-col pt-safe animate-in fade-in duration-200">
      {/* Top Search Input Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-800 bg-[#081621] flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-2 -ml-1 text-slate-300 hover:text-white rounded-full active:bg-slate-800 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="flex-1 relative">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search CCTV, PC, Laptop, SSD..."
            className="w-full bg-white text-slate-900 text-sm placeholder-slate-400 pl-4 pr-9 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-[#0084d6] transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <button
          onClick={handleSubmit}
          disabled={!query.trim()}
          className="bg-[#0084d6] disabled:opacity-40 text-white text-xs font-bold px-3.5 py-2.5 rounded-full transition flex-shrink-0"
        >
          Search
        </button>
      </div>

      {/* Body: Popular Searches & Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-900/60 pb-safe">
        {/* Popular Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
            <span>Popular Tech Searches</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularSearches.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectTag(item)}
                className="bg-slate-800 hover:bg-slate-700 active:bg-[#0084d6] text-xs font-medium text-slate-200 px-3.5 py-2 rounded-xl transition border border-slate-700/60 flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#0084d6]" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Category Shortcuts */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Direct Category Browse</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                router.push('/categories/cctv-surveillance');
                onClose();
              }}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left font-semibold text-slate-200"
            >
              📹 CCTV & Security
            </button>
            <button
              onClick={() => {
                router.push('/categories/desktop-components');
                onClose();
              }}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left font-semibold text-slate-200"
            >
              🖥️ Desktop & PC
            </button>
            <button
              onClick={() => {
                router.push('/categories/laptops-notebooks');
                onClose();
              }}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left font-semibold text-slate-200"
            >
              💻 All Laptops
            </button>
            <button
              onClick={() => {
                router.push('/categories/networking-equipment');
                onClose();
              }}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left font-semibold text-slate-200"
            >
              📶 Wi-Fi & Routers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
