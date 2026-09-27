# Performance Root Cause Report — Trust Computer Moulvibazar

**Date:** 2026-09-27  
**Platform:** Next.js 14 App Router, Prisma ORM, Supabase PostgreSQL, Vercel Serverless  
**Production URL:** https://trustcomputer.vercel.app/  

---

## Executive Summary of Root Causes

The primary performance problem observed across the site — where the UI shell (Header, Navigation, Search, Skeletons) renders quickly while actual content takes several seconds to appear — has been traced to **five structural bottlenecks**:

1. **Uncached Server-Side Data Fetching on Public Pages:**
   - Homepage (`app/(store)/page.tsx`), Catalog (`app/(store)/products/page.tsx`), and Category pages (`app/(store)/categories/[slug]/page.tsx`) were marked with `export const dynamic = 'force-dynamic'` and `revalidate = 0`.
   - On every request, Next.js serverless functions initiated fresh cross-network database connections to Supabase pooler over TCP/TLS (measured at ~680ms initial connection, plus ~340ms per query round-trip).
   - In Next.js App Router, when `loading.tsx` exists alongside a slow dynamic server component, Next.js instantly flushes the Suspense fallback (the skeleton screens) to the browser. The browser remains stuck on skeletons until the serverless function finishes executing all database queries (2.1s - 5.0s).

2. **Repetitive Client-Side Waterfall in Global Layout Header:**
   - In `components/layout/Header.tsx`, a `useEffect` triggered `fetch('/api/categories/counts')` on mount and on **every route change** (`[pathname]`).
   - `/api/categories/counts` was also marked `force-dynamic` with uncached `prisma.product.count()` and `prisma.category.findMany()`, taking ~3,724ms to complete and saturating serverless pool connections while blocking the client thread.

3. **Absence of Stale-While-Revalidate Caching for Read-Heavy Catalog Data:**
   - Frequently requested static and catalog data (featured products, new arrivals, category counts, brand listings) were queried from the database on every hit instead of utilizing Next.js `unstable_cache` with tagged cache invalidation (`tags: ['products', 'categories', 'banners']`).

4. **Sequential Query Waterfalls:**
   - In `/products/[slug]`, related products were awaited sequentially after product details instead of utilizing parallel fetching or cached data structures.
   - In `/admin/login`, an artificial delay `Promise.race([..., setTimeout(..., 3000)])` was present in the authentication flow.

5. **Full Page Reloads in Admin Actions:**
   - `OffersManagementClient.tsx` and `BannerManagementClient.tsx` invoked `window.location.reload()`, destroying application state and forcing full-page re-fetching instead of optimistic local state updates.

---

## Detailed Page-by-Page Audit & Measurements

### 1. Homepage (`/`)
- **Request:** `GET /`
- **Initial Measured Duration:** **2,120ms - 3,345ms**
- **Root Cause:**
  - `force-dynamic` + `revalidate = 0` forced dynamic execution on every user request.
  - Skeletons streamed immediately from `app/(store)/loading.tsx` via Next.js Suspense boundary.
  - Serverless function executed 6 database queries sequentially/in-parallel across the internet to Supabase:
    1. `prisma.product.findMany` (isFeatured)
    2. `prisma.product.findMany` (new arrivals)
    3. `prisma.category.findMany`
    4. `prisma.banner.findMany`
    5. `prisma.offer.findMany`
    6. `prisma.homepageSection.findMany`
  - Uncached product queries took ~350ms each over network roundtrips.
- **Components Responsible:** `app/(store)/page.tsx`, `app/(store)/loading.tsx`
- **Fix:**
  - Implement `unstable_cache` with tagged revalidation (`['homepage-data', 'products', 'categories']`) for initial featured products and new arrivals.
  - Set revalidation window (`revalidate = 60`) enabling Vercel Edge caching and instant TTFB.
  - Invalidate selectively via `revalidateTag('products')` during admin product mutations.
- **Before Measurement:** 3,345 ms TTFB / 2,120 ms warm
- **Target After Measurement:** < 120 ms cached / < 400 ms dynamic revalidate

---

### 2. Category Counts API & Header (`/api/categories/counts` & `Header.tsx`)
- **Request:** `GET /api/categories/counts`
- **Initial Measured Duration:** **3,724ms**
- **Root Cause:**
  - Fired on initial page load and on every URL change via `Header.tsx` `useEffect`.
  - Uncached `prisma.product.count()` and `prisma.category.findMany()` executed against Supabase on every route change.
- **Components Responsible:** `components/layout/Header.tsx`, `app/api/categories/counts/route.ts`
- **Fix:**
  - Cache the category counts computation using `unstable_cache` with a 300s TTL and tag `['categories', 'products']`.
  - Add client-side in-memory singleton cache in `Header.tsx` so counts are fetched once per session instead of every navigation.
  - Add HTTP header `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`.
- **Before Measurement:** 3,724 ms
- **Target After Measurement:** < 25 ms

---

### 3. Products Catalog Listing (`/products`)
- **Request:** `GET /products`
- **Initial Measured Duration:** **5,061ms**
- **Root Cause:**
  - Page marked `force-dynamic` with `maxDuration = 30`.
  - Default catalog queries (`page=1`, no filters) executed cold uncached queries: `findMany(take: 12)` + `count()`.
  - Network latency between serverless runtime and PostgreSQL pooler added ~700ms pure query delay.
- **Components Responsible:** `app/(store)/products/page.tsx`
- **Fix:**
  - Cache the default (unfiltered) catalog page 1 using `unstable_cache`.
  - Optimize Prisma `select` projection to retrieve strictly necessary card fields (`id, name, slug, sku, sellingPrice, compareAtPrice, stock, lowStockThreshold, images, category, brand, warrantyInfo`).
  - Cache filter metadata (brands, categories count) with `tags: ['categories', 'brands']`.
- **Before Measurement:** 5,061 ms
- **Target After Measurement:** < 150 ms (default catalog)

---

### 4. Category Pages (`/categories/[slug]`)
- **Request:** `GET /categories/laptop-computer`
- **Initial Measured Duration:** **4,209ms**
- **Root Cause:**
  - `prisma.category.findFirst` with `mode: 'insensitive'` bypassed PostgreSQL B-Tree index on `slug`.
  - Loaded full product relation without separate cached query.
  - Page marked `force-dynamic` bypassing Edge CDN cache.
- **Components Responsible:** `app/(store)/categories/[slug]/page.tsx`
- **Fix:**
  - Normalize slug input (`slug.toLowerCase()`) and use exact indexed matching (`mode: 'default'`).
  - Cache the category lookup and product query for standard views via `unstable_cache`.
  - Add `revalidate = 120`.
- **Before Measurement:** 4,209 ms
- **Target After Measurement:** < 150 ms

---

### 5. Product Detail Page (`/products/[slug]`)
- **Request:** `GET /products/[slug]`
- **Root Cause:**
  - Sequential waterfall: `getProductBySlug` awaited first, then `prisma.product.findMany` for related products awaited sequentially.
- **Components Responsible:** `app/(store)/products/[slug]/page.tsx`
- **Fix:**
  - Cache `getProductBySlug` using `unstable_cache` with tag `product-[slug]` and `['products']`.
  - Cache category-related products.
- **Before Measurement:** ~1,800 ms
- **Target After Measurement:** < 120 ms

---

### 6. Admin Panel Actions & Refresh Bottlenecks
- **Affected Endpoints:**
  - `components/admin/OffersManagementClient.tsx`
  - `app/admin/(dashboard)/banners/BannerManagementClient.tsx`
  - `app/admin/login/actions.ts`
- **Root Cause:**
  - `window.location.reload()` invoked after every banner/offer save/delete, wiping browser cache and re-fetching the entire admin page.
  - Artificial 3000ms delay in `app/admin/login/actions.ts` inside `Promise.race([..., setTimeout(..., 3000)])`.
- **Fix:**
  - Replace `window.location.reload()` with local state modification and non-blocking `router.refresh()`.
  - Eliminate artificial timeouts from `admin/login/actions.ts`.
  - Add `unstable_cache` with selective tag invalidation to category/brand helpers (`lib/categories.ts`).
