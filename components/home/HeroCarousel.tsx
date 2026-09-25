'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ActiveBanner } from '@/lib/banners';

interface HeroCarouselProps {
  banners?: ActiveBanner[];
}

// Fallback banners with all promotional and service banners
const defaultFallbackBanners: ActiveBanner[] = [
  {
    id: 'banner-tech-deals',
    title: 'PREMIUM LAPTOPS & WORKSTATIONS',
    subtitle: 'Official warranty, Intel Core & AMD Ryzen laptops, mechanical keyboards & accessories',
    description: null,
    desktopImageUrl: '/images/hero-banner-1.jpg',
    mobileImageUrl: '/images/hero-banner-1.jpg',
    buttonText: 'Shop Tech Deals',
    buttonUrl: '/products?offer=true',
    type: 'PROMOTIONAL',
    priority: 10,
  },
  {
    id: 'banner-pc-cctv',
    title: 'CCTV & SECURITY SURVEILLANCE SOLUTIONS',
    subtitle: '4K IP & ColorVu cameras, NVR monitoring systems & professional installation in Moulvibazar',
    description: null,
    desktopImageUrl: '/images/hero-banner-2.jpg',
    mobileImageUrl: '/images/hero-banner-2.jpg',
    buttonText: 'Explore CCTV & Security',
    buttonUrl: '/categories/cctv-surveillance',
    type: 'PROMOTIONAL',
    priority: 8,
  },
  {
    id: 'banner-customer-support',
    title: 'CUSTOMER CARE & WARRANTY SUPPORT',
    subtitle: 'Expert technical assistance, genuine warranty & trusted after-sales service',
    description: null,
    desktopImageUrl: '/images/side-banner-feedback.jpg',
    mobileImageUrl: '/images/side-banner-feedback.jpg',
    buttonText: 'Contact Support',
    buttonUrl: '/contact',
    type: 'PROMOTIONAL',
    priority: 6,
  },
  {
    id: 'banner-custom-setup',
    title: 'CUSTOM PC BUILDING & WORKSTATIONS',
    subtitle: 'Precision hardware assembly, liquid cooling & high-performance rigs',
    description: null,
    desktopImageUrl: '/images/side-banner-service.jpg',
    mobileImageUrl: '/images/side-banner-service.jpg',
    buttonText: 'Get Custom Build',
    buttonUrl: '/categories/cctv-surveillance',
    type: 'PROMOTIONAL',
    priority: 4,
  },
];

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  // Use database banners managed by admin if available, or fall back to high-res defaults
  const activeSlides = banners && banners.length > 0 ? banners : defaultFallbackBanners;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // Autoplay timer: auto-swiping with smooth 0.40s transition
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const timer = setInterval(nextSlide, 3800);
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
      className="relative w-full h-[180px] xs:h-[210px] sm:h-[280px] md:h-[360px] lg:h-[440px] rounded-2xl overflow-hidden shadow-md group bg-slate-950 outline-none focus:ring-2 focus:ring-brand-600 touch-pan-y"
    >
      {/* Slides */}
      {activeSlides.map((slide, index) => {
        const isCurrent = index === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-400 ease-in-out ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Link
              href={slide.buttonUrl || '/products'}
              className="relative w-full h-full block cursor-pointer"
            >
              {/* Desktop Image */}
              <Image
                src={slide.desktopImageUrl}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center hidden sm:block"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              {/* Mobile Image */}
              <Image
                src={slide.mobileImageUrl || slide.desktopImageUrl}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center sm:hidden"
                sizes="100vw"
              />
            </Link>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition focus:opacity-100 focus:outline-none"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition focus:opacity-100 focus:outline-none"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
