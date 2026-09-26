# Database Performance Indexes & Optimization Strategy

**Repository:** Trust Computer-Moulvibazar E-Commerce  
**Database:** PostgreSQL (Supabase) via Prisma ORM  
**Date:** September 2026  

---

## 1. Index Strategy Overview

In high-traffic e-commerce systems, unindexed queries cause sequential table scans, high disk I/O, and CPU saturation. All indexes added below are grounded in **actual application query patterns** identified across the customer catalog, category navigation, order management, and administrative dashboards.

---

## 2. Table-by-Table Performance Index Inventory

### 2.1 Products Table (`products`)
Frequently queried by the homepage, catalog browsing, and search filtering:

| Index Fields | Index Type | Query / Feature Supported | Rationale |
|---|---|---|---|
| `categoryId` | B-tree | Product category browsing (`/categories/[slug]`) | Filters products belonging to a given category |
| `brandId` | B-tree | Brand filtering (`/products?brand=...`) | Quick lookup of brand-filtered products |
| `slug` | Unique B-tree | Product detail page (`/products/[slug]`) | O(1) single-product lookups by URL slug |
| `sku` | Unique B-tree | Search by SKU, inventory scanning, order items | Fast exact-match lookups |
| `[isActive, isFeatured]` | Compound B-tree | Homepage Featured Products section | Avoids full table scan when querying active featured products |
| `[isActive, isNewArrival]` | Compound B-tree | Homepage New Arrivals section | Filters newest highlighted arrivals directly |
| `[isActive, isBestSeller]` | Compound B-tree | Best seller recommendations | Instant filtering of top catalog products |
| `[isActive, createdAt]` | Compound B-tree | Catalog default sorting (`/products?sort=newest`) | Index-ordered pagination without runtime filesort |
| `[isActive, sellingPrice]` | Compound B-tree | Price sorting (`sort=price_asc` / `price_desc`) | Satisfies range queries and price-ordered fetches |
| `[isActive, categoryId]` | Compound B-tree | Category page active catalog items | Direct index seek for active products under category |
| `[isActive, brandId]` | Compound B-tree | Brand-specific product catalog | Direct index seek for active products under brand |

### 2.2 Categories Table (`categories`)
| Index Fields | Index Type | Query / Feature Supported | Rationale |
|---|---|---|---|
| `slug` | Unique B-tree | Category routing (`/categories/[slug]`) | Fast category resolution |
| `[isActive, sortOrder]` | Compound B-tree | Header, mobile nav, and category browse bar | Retrieves sorted store navigation without database sorting overhead |

### 2.3 Brands Table (`brands`)
| Index Fields | Index Type | Query / Feature Supported | Rationale |
|---|---|---|---|
| `slug` | Unique B-tree | Brand routing & filter URL matching | Direct lookup by slug |

### 2.4 Orders Table (`orders`)
High-write and mission-critical read access patterns:

| Index Fields | Index Type | Query / Feature Supported | Rationale |
|---|---|---|---|
| `orderNumber` | Unique B-tree | Order tracking (`/track-order`) & invoices | Exact-match lookup by human-readable number |
| `customerId` | B-tree | Customer account order history | Filters orders for authenticated customer |
| `customerPhone` | B-tree | Fast telephone lookup during customer service calls | Quick customer history lookup |
| `status` | B-tree | Admin order filtering by status | Fast grouping and status counting |
| `createdAt` | B-tree | Sales reporting & chronological order logs | Range-based time queries |
| `[customerId, createdAt]` | Compound B-tree | `/account/orders` customer order pagination | Eliminates in-memory sort for customer orders |
| `[status, createdAt]` | Compound B-tree | Admin pending/confirmed processing queues | Instant queue extraction for pending operations |

### 2.5 Order Items Table (`order_items`)
| Index Fields | Index Type | Query / Feature Supported | Rationale |
|---|---|---|---|
| `orderId` | B-tree | Order details, packing slips, invoices | Fast child record extraction |
| `productId` | B-tree | Product sales reporting, inventory movements | Aggregations and top-selling queries |

### 2.6 Reviews Table (`reviews`)
| Index Fields | Index Type | Query / Feature Supported | Rationale |
|---|---|---|---|
| `productId` | B-tree | Product detail review section | Aggregates all reviews for a product |
| `customerId` | B-tree | Customer profile review history | Verified customer lookups |
| `status` | B-tree | Admin review moderation dashboard | Filter by `PENDING` or `APPROVED` |
| `rating` | B-tree | Rating distribution statistics | Quick rating aggregation |
| `[productId, status, createdAt]` | Compound B-tree | Public product review feed | Only pulls approved reviews ordered by newest |

### 2.7 Banners & Offers Tables (`banners`, `offers`)
| Index Fields | Index Type | Query / Feature Supported | Rationale |
|---|---|---|---|
| `[isActive, priority]` | Compound B-tree | Active promotional banners & hero carousel | Returns top-priority active banners immediately |
| `[startAt, endAt]` | Compound B-tree | Time-bounded promotions | Handles date-window filtering without table scans |

### 2.8 Stock Reservations (`stock_reservations`)
| Index Fields | Index Type | Query / Feature Supported | Rationale |
|---|---|---|---|
| `productId` | B-tree | Available stock calculation | Sums active reservations |
| `sessionKey` | B-tree | Checkout session management | Releases expired reservations |
| `[status, expiresAt]` | Compound B-tree | Periodic cron or cleanup query | Identifies expired locks to return to inventory |

---

## 3. Maintenance & Query Optimization Rules

1. **Selective Projections:** Always prefer `select: { ... }` over unbounded `include: { ... }` to prevent dragging large `description` or binary metadata into memory.
2. **Limit & Pagination:** Every list query must specify `take` (maximum 12–24 for customer catalogs) and `skip` for deterministic pagination.
3. **Cache Invalidation:** Static taxonomies (`categories`, `brands`, `banners`, `sections`) are cached with Next.js `unstable_cache` and revalidated via tags upon admin mutations.
