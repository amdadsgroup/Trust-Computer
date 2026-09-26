# Trust Computer-Moulvibazar: Performance & Responsive Audit

**Project:** Trust Computer-Moulvibazar E-Commerce Web Application  
**Production URL:** https://trustcomputer.vercel.app/  
**Audit Date:** September 2026  
**Auditor:** Amdads Group 

---

## 1. Executive Summary

This audit assesses the architecture, runtime performance, server-side data fetching, image optimization, responsive UX, database access patterns, and Core Web Vitals targets for the Trust Computer Moulvibazar web application.

The application is built on **Next.js 14.2 (App Router)**, **React 18**, **Prisma ORM**, **PostgreSQL (Supabase)**, and **Tailwind CSS**. While the core functional architecture is well-structured, several critical performance bottlenecks and architectural inefficiencies were discovered across server rendering, client bundling, database queries, and media assets.

---

## 2. Baseline Measurements (Before Optimization)

### Production Build Footprint (Initial Measurement)
* **First Load JS shared by all routes:** `87.1 kB`
* **Route Bundle Sizes:**
  * Homepage (`/`): `124 kB` First Load JS (5.72 kB route code)
  * Product Catalog (`/products`): `124 kB` First Load JS (5.4 kB route code)
  * Product Detail (`/products/[slug]`): `124 kB` First Load JS (4.87 kB route code)
  * Category Page (`/categories/[slug]`): `119 kB` First Load JS
  * Shopping Cart (`/cart`): `110 kB` First Load JS
  * Checkout (`/checkout`): `100 kB` First Load JS
  * About Page (`/about`): `109 kB` First Load JS

### Latency & Loading Issues
* **Navigation Transition State:** No route-level `loading.tsx` or `error.tsx` boundary existed. Route transitions kept the old screen static without immediate visual feedback.
* **Server TTFB:** All main store pages (`/`, `/products`, `/products/[slug]`, `/categories/[slug]`) configured with `export const dynamic = 'force-dynamic'`, resulting in uncached PostgreSQL queries on every single request.
* **Metadata Query Duplication:** `generateMetadata` and `ProductDetailPage` both issued identical un-memoized queries to Prisma for `/products/[slug]`.

---

## 3. Detailed Audit Matrix: Problems, Root Causes, Impact & Fixes

| ID | Component / Area | Current Problem | Root Cause | Impact | Recommended Fix | Priority |
|---|---|---|---|---|---|---|
| **AUD-01** | `app/(store)/page.tsx`, `products/[slug]` | Cold DB hits on every request; `generateMetadata` duplicate queries | `export const dynamic = 'force-dynamic'` without ISR/caching or React `cache()` | High server TTFB (>1s under load), unnecessary DB load | Configure `revalidate = 60`, wrap slug queries in React `cache()`, cache taxonomies with `unstable_cache` | **CRITICAL** |
| **AUD-02** | `components/products/ProductCard.tsx` | Next.js Image rendered with `fill` but without `sizes` attribute | Missing `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"` | Browser falls back to `100vw`, downloading desktop-sized 1200px+ images on 170px mobile cards | Add explicit responsive `sizes` attribute to ProductCard and banner images | **CRITICAL** |
| **AUD-03** | `next.config.mjs` | Images delivered in legacy formats without AVIF/WebP configuration | Missing `formats: ['image/avif', 'image/webp']` | Larger payload transfers on mobile 3G/4G networks | Enable AVIF & WebP image formats, package import optimization for `lucide-react` | **HIGH** |
| **AUD-04** | `components/home/HeroCarousel.tsx` | Double hero preloading & mounting all slide DOM elements immediately | Both desktop and mobile `<Image priority>` rendered concurrently in DOM | Wasted network bandwidth, competing with LCP resource | Conditional image rendering for active slide only, lazy-load remaining slides | **HIGH** |
| **AUD-05** | `components/home/*` | Static components marked with `'use client'` | Unnecessary `'use client'` on `FeaturedCategoryCircles`, `QuickUtilityCards`, `AnnouncementTicker` | Inflated client JS bundle size | Convert static homepage components to Server Components | **HIGH** |
| **AUD-06** | `app/layout.tsx` | Heavy interactive components statically imported in global root layout | `CartDrawer` and `CompareBar` statically bundled into all 53 routes | Bloated initial First Load JS | Use `next/dynamic` with `ssr: false` for drawer/modal overlays | **MEDIUM** |
| **AUD-07** | `components/cart/CartContext.tsx`, `WishlistContext`, `CompareContext` | Global contexts re-render all subscribers on every change | Context `value={{ ... }}` object recreated without `useMemo` | Frequent cascading re-renders across header, buttons, and cards | Wrap context values in `useMemo` and memoize `ProductCard` with `React.memo` | **MEDIUM** |
| **AUD-08** | `app/` navigation & UX | No route loading skeletons or error boundaries | Missing `loading.tsx` and `error.tsx` across route groups | Navigation feels sluggish, blank flashes or frozen UI during network delays | Add layout-matching `loading.tsx` skeletons and robust `error.tsx` handlers | **HIGH** |
| **AUD-09** | `prisma/schema.prisma` | Missing composite database indexes for sorting & filtering | No composite index on `Product(isActive, createdAt)`, `Product(isActive, sellingPrice)`, `Order(customerId, createdAt)` | Table scans as product catalog and orders grow | Add targeted compound indexes in `schema.prisma` and document in `performance-indexes.md` | **HIGH** |
| **AUD-10** | Database queries (`lib/`, `app/(store)/`) | Over-fetching fields (`SELECT *`) | Prisma queries include entire product entity instead of selective columns | Extra bandwidth, higher memory footprint on serverless lambdas | Specify `select: { id, name, slug, sku, sellingPrice, ... }` in query projections | **MEDIUM** |
| **AUD-11** | `components/about/AboutPageClient.tsx` | Owner personal name exposed on public website | Line 92 displays `Shiblu Ahmed` under Verified Business Credentials | Violates strict requirement #49 (Owner Name Must Remain Removed) | Remove owner personal name from public view, retain verified store business credentials | **CRITICAL** |
| **AUD-12** | `app/layout.tsx` | Excess Google Fonts weights loaded | `Inter` loaded with `800` and `900` weights | Unnecessary font file downloads | Streamline font weights to `['400', '500', '600', '700']` | **LOW** |

---

## 4. Performance Targets & Core Web Vitals SLA

| Metric | Target (Mobile) | Target (Desktop) | Status Prior to Optimization |
|---|---|---|---|
| **First Contentful Paint (FCP)** | < 1.5s | < 1.2s | Needs Improvement |
| **Largest Contentful Paint (LCP)** | < 2.5s | < 1.8s | Needs Improvement (Unsized images, double hero load) |
| **Cumulative Layout Shift (CLS)** | < 0.1 | < 0.05 | At Risk (Missing aspect ratios / skeletons) |
| **Interaction to Next Paint (INP)**| < 200ms | < 100ms | Needs Improvement (Unmemoized contexts & cards) |
| **Time to First Byte (TTFB)** | < 800ms | < 500ms | Needs Improvement (`force-dynamic` DB queries) |

---

## 5. Optimization Roadmap

1. **Step 1:** Fix Critical Compliance: Remove owner personal name from `AboutPageClient.tsx`.
2. **Step 2:** Next.js Image & Config Optimization: Update `next.config.mjs` with AVIF/WebP formats, lucide package import optimization, cache TTL.
3. **Step 3:** Component Refactoring: Remove `'use client'` from static components, dynamic import for `CartDrawer` and `CompareBar`, memoize `ProductCard`.
4. **Step 4:** Context & Re-render Optimization: `useMemo` for `CartContext`, `WishlistContext`, `CompareContext`.
5. **Step 5:** Responsive Images & Sizes: Add explicit `sizes` attributes across `ProductCard`, `HeroCarousel`, banners.
6. **Step 6:** Caching & Data Fetching: Add `revalidate = 60`, React `cache()` deduplication, selective column querying.
7. **Step 7:** Skeleton & Loading UX: Implement `loading.tsx` and `error.tsx` with matching geometry to eliminate layout shift.
8. **Step 8:** Database Indexes: Update `prisma/schema.prisma` and document in `prisma/performance-indexes.md`.
9. **Step 9:** Production Verification: Run test suite (`npm test`), production build (`npm run build`), and verify all business logic.
