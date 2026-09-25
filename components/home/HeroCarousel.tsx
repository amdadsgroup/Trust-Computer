'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ActiveBanner } from '@/lib/banners';

interface HeroCarouselProps {
  banners?: ActiveBanner[];
}

// Fallback banners when database has no configured banners yet
const defaultFallbackBanners: ActiveBanner[] = [
  {
    id: 'default-1',
    title: 'TECH MEGA DEAL FEST',
    subtitle: 'Special discounts & official warranty on laptops, CCTV & accessories',
    description: null,
    desktopImageUrl: '/images/hero-banner-1.jpg',
    mobileImageUrl: null,
    buttonText: 'Shop Tech Deals',
    buttonUrl: '/products?offer=true',
    type: 'PROMOTIONAL',
    priority: 10,
  },
  {
    id: 'default-2',
    title: 'HIGH PERFORMANCE PC & CCTV SOLUTIONS',
    subtitle: 'Trusted computer showroom & surveillance installation in Moulvibazar',
    description: null,
    desktopImageUrl: '/images/hero-banner-2.jpg',
    mobileImageUrl: null,
    buttonText: 'Explore CCTV & PC',
    buttonUrl: '/categories/cctv-surveillance',
    type: 'PROMOTIONAL',
    priority: 5,
  },
];

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  const activeSlides = banners && banners.length > 0 ? banners : defaultFallbackBanners;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // Autoplay timer with pause on hover
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const timer = setInterval(nextSlide, 5500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, activeSlides.length]);

  // Touch swipe support for smartphones
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  if (activeSlides.length === 0) {
    return null;
  }

  const currentSlide = activeSlides[current];

  return (
    <div
      role="region"
      aria-label="Promotional Banners Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="relative w-full h-[240px] sm:h-[340px] md:h-[400px] lg:h-[440px] rounded-2xl overflow-hidden shadow-lg group bg-slate-950 outline-none focus:ring-2 focus:ring-brand-600 touch-pan-y"
    >
      {/* Slides */}
      {activeSlides.map((slide, index) => {
        const isCurrent = index === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Desktop & Mobile Responsive Image */}
            <div className="relative w-full h-full">
              <Image
                src={slide.desktopImageUrl}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center hidden sm:block"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              <Image
                src={slide.mobileImageUrl || slide.desktopImageUrl}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center sm:hidden"
                sizes="100vw"
              />

              {/* Gradient Scrim for readable text overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 sm:p-8">
                <div className="max-w-xl space-y-2">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 drop-shadow">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.buttonUrl && (
                    <div className="pt-2">
                      <Link
                        href={slide.buttonUrl}
                        className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-lg transform hover:scale-105"
                      >
                        <span>{slide.buttonText || 'Shop Now'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition focus:opacity-100 focus:outline-none"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition focus:opacity-100 focus:outline-none"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                idx === current ? 'w-8 bg-accent-500' : 'w-5 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
