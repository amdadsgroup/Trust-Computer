# Trust Computer-Moulvibazar E-Commerce Deployment & Setup Guide

**Client:** Shiblu Ahmed  
**Platform:** Next.js 14 (App Router) + PostgreSQL (Supabase) + Prisma ORM + Tailwind CSS  
**Store Location:** T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh  
**Phone:** `01753-765372` | **WhatsApp:** `+8801753765372`  
**Developer:** Amdads Group

---

## 1. Prerequisites

- **Node.js:** v18.17.0+ or v20+ (Tested on Node v24.15)
- **PostgreSQL Database:** Supabase, Neon, or Managed PostgreSQL instance
- **npm** or **pnpm**

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the following critical production variables are set:

| Variable | Description | Example / Recommendation |
|---|---|---|
| `DATABASE_URL` | PostgreSQL pooler connection URL | `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?schema=public` |
| `AUTH_SECRET` | 32+ character random secret for JWT signing | `openssl rand -base64 32` |
| `AUTH_COOKIE_NAME` | Session cookie name | `trust_admin_session` |
| `APP_URL` | Canonical public store URL | `https://trustcomputermb.com` |
| `NEXT_PUBLIC_WHATSAPP` | Store WhatsApp number | `+8801753765372` |
| `PAYMENT_GATEWAY_PROVIDER` | Active gateway | `COD_MANUAL` (or `BKASH`, `SSLCOMMERZ`) |

---

## 3. Database Migration & Initial Catalog Seeding

### Step 1: Generate Prisma Client
```bash
npx prisma generate
```

### Step 2: Push Schema to Database
```bash
npx prisma db push
```

### Step 3: Seed Verified Categories, Brands & Settings
```bash
node prisma/seed.js
```
*Seeds verified categories (CCTV & Surveillance, Desktop & Components, Laptops, Networking, Accessories, Printers), genuine brands (Hikvision, Dahua, TP-Link, Intel, Asus, AMD), and official store settings.*

---

## 4. Initial Owner Account Setup

Create the primary administrator account for Shiblu Ahmed:
```bash
node scripts/create-owner.js "trustcomputermb@gmail.com" "YourSecurePassword2026!" "Shiblu Ahmed" "01753-765372"
```

Once executed:
1. Navigate to `/admin/login`.
2. Login with the email and password created above.
3. Access the executive dashboard, inventory ledger, and order management console.

---

## 5. Automated Testing

Run the test suite to verify price recalculation, order state machines, and validation rules:
```bash
npm test
```
All 29 test cases will execute and validate:
- SKU duplication prevention
- Cart quantity bounds
- Server-side delivery fee calculation (৳60 inside Moulvibazar, ৳120 outside)
- Immutable order snapshot integrity
- State transition rules (e.g. Disallowing cancellation after shipment)
- WhatsApp international URL encoding with `+880` prefix

---

## 6. Vercel Deployment Instructions

1. Push the repository to your private GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial production release of Trust Computer-Moulvibazar E-commerce"
   git remote add origin https://github.com/[your-org]/trust-computer-ecommerce.git
   git push -u origin main
   ```
2. Import the project in [Vercel](https://vercel.com).
3. In Project Settings -> **Environment Variables**, add the variables from `.env`.
4. Build command:
   ```bash
   npm run build
   ```
5. Deploy! Vercel will automatically provision edge endpoints, server actions, and image optimization.

---

## 7. Payment Gateway Onboarding Checklist

### Cash on Delivery (COD) & Manual bKash
- **Status:** **ACTIVE & FUNCTIONAL**. Customers can place orders immediately with Cash on Delivery or manual bKash personal send-money instructions.

### bKash Merchant Gateway (Automated Checkout)
- Apply for a bKash Merchant Account at `https://www.bkash.com/business`.
- Once approved, set:
  - `BKASH_APP_KEY`
  - `BKASH_APP_SECRET`
  - `BKASH_USERNAME`
  - `BKASH_PASSWORD`
- The system will automatically transition from manual instructions to tokenized redirect checkout without requiring codebase refactoring.

### SSLCOMMERZ Gateway
- Apply for SSLCOMMERZ merchant onboarding.
- Set `SSLCOMMERZ_STORE_ID` and `SSLCOMMERZ_STORE_PASSWORD`.
- In SSLCOMMERZ merchant panel, set IPN webhook URL: `https://trustcomputermb.com/api/webhooks/sslcommerz`.
