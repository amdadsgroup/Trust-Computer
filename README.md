# Trust Computer E-Commerce Web Application

A full-stack, production-oriented e-commerce web application engineered for **Trust Computer-Moulvibazar**, the premier technology, computer accessories, CCTV, and networking equipment retail destination in Moulvibazar, Bangladesh.

---

## 🏢 Business Profile

- **Business Name:** Trust Computer
- **Business Type:** Computer, Laptop, Desktop PC Components, Accessories, CCTV Equipment, Networking Devices
- **Store Location:** T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh
- **Phone:** `01753-765372`
- **WhatsApp:** `+8801753765372`
- **Email:** `trustcomputermb@gmail.com`
- **Official Website:** `https://trustcomputermb.com`
- **Facebook:** [Trust Computer Facebook Page](https://www.facebook.com/TrustComputerr/)
- **Business Tagline:**  
  *“মানসম্মত কম্পিউটার ও সিসি ক্যামেরা জগতে মৌলভীবাজারের একটি বিশ্বস্ত প্রতিষ্ঠান।❤️”*

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components & Actions) |
| **Language** | TypeScript (Strict Mode) |
| **Styling & Design** | Tailwind CSS, Lucide Icons, Modern Clean Component Design |
| **State & Validation** | Zod (strict server-side schemas), React Hooks |
| **Database & ORM** | PostgreSQL / Supabase, Prisma ORM, Versioned Migrations |
| **Authentication** | Secure Jose/JWT & HTTP-Only Secure Cookies, Role-Based Access Control (`OWNER`, `ADMIN`, `STAFF`) |
| **Payments** | Cash on Delivery (COD), Manual / Mobile Banking Transfer (bKash/Nagad), Extensible Gateway Provider Abstraction |
| **Customer Engagement** | Direct WhatsApp Click-to-Chat Integration (+8801753765372) |
| **Testing** | Vitest for unit & server business logic tests |

---

## 📁 Architecture Overview

```
├── app/
│   ├── (store)/                 # Customer-facing storefront
│   │   ├── page.tsx             # Home: Hero, categories, featured/latest products, trust signals
│   │   ├── products/            # Product catalog, search, multi-filter, sorting, pagination
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx  # Product details, specs, stock status, gallery, WhatsApp inquiry
│   │   ├── categories/[slug]/   # Category-specific listing
│   │   ├── cart/                # Client-safe cart with server price/stock verification
│   │   ├── checkout/            # Checkout flow with atomic transactional order & stock reservation
│   │   ├── order-confirmation/  # Secure order confirmation page
│   │   ├── track-order/         # Secure order tracking (Order # + Phone verification)
│   │   ├── about/               # Verified business information
│   │   ├── contact/             # Contact information, Google Maps directions, WhatsApp
│   │   └── policies/            # Terms, Privacy, Delivery, Warranty & Returns
│   ├── admin/                   # Secure Admin Dashboard
│   │   ├── login/               # Secure admin login with rate limiting
│   │   ├── (dashboard)/         # Protected admin layout & navigation
│   │   │   ├── page.tsx         # Executive dashboard & real metrics
│   │   │   ├── products/        # Product CRUD, pricing, stock, specs, images
│   │   │   ├── categories/      # Category management
│   │   │   ├── brands/          # Brand management
│   │   │   ├── orders/          # Order processing, status transitions, invoice generation
│   │   │   ├── inventory/       # Stock tracking, ledger, adjustments, low-stock alerts
│   │   │   ├── payments/        # Payment records, verification & reconciliation
│   │   │   ├── reports/         # Sales and inventory analytics
│   │   │   └── settings/        # Store settings & staff management
│   ├── api/                     # Route handlers (webhooks, health checks, uploads)
│   ├── layout.tsx               # Root layout with SEO metadata & global styles
│   └── globals.css              # Global styles & design tokens
├── components/
│   ├── layout/                  # Header, Footer, MobileNav, WhatsAppButton
│   ├── products/                # ProductCard, ProductGrid, ProductFilters, ImageGallery
│   ├── cart/                    # CartDrawer, CartItemRow, OrderSummary
│   ├── checkout/                # CheckoutForm, AddressForm, PaymentSelector
│   └── admin/                   # AdminNavbar, AdminSidebar, DataTable, StatusBadge, MetricCard
├── lib/
│   ├── auth/                    # Password hashing, JWT verification, session management, RBAC
│   ├── db/                      # Prisma client singleton
│   ├── inventory/               # Inventory ledger & stock movement logic
│   ├── orders/                  # Order processing, status transition validation, invoice data
│   ├── payments/                # Payment gateway provider abstraction (COD, bKash, SSLCOMMERZ)
│   ├── validations/             # Zod schemas for input validation
│   └── whatsapp/                # WhatsApp link generator with contextual messages
├── prisma/
│   ├── schema.prisma            # Normalized database schema
│   └── seed.js                  # Seed script for initial setup & categories
└── tests/                       # Vitest test suite for critical business logic
```

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your database credentials:
```bash
cp .env.example .env
```

### 3. Initialize Database
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
