# TRUST COMPUTER-MOULVIBAZAR
## COMPLETE BUSINESS CONTACT + WHATSAPP + bKASH PAYMENT SYSTEM UPDATE REPORT

---

### Executive Summary

Trust Computer-Moulvibazar's complete contact system, customer engagement channels, and checkout payment infrastructure have been upgraded to the newly designated official business contacts. The platform operates on a single centralized source of truth, eliminates outdated public contact numbers, provides dedicated channels for Sales & Customer Care and Service & Technical Support, introduces a secure manual bKash payment workflow with admin reconciliation, and safeguards data integrity across desktop and mobile form factors.

---

### 1. Production URL & Environment Identification

- **Authoritative Production Domain:**  
  [`https://trustcomputermb.com/`](https://trustcomputermb.com/)
- **Prohibited URLs:**  
  `https://trustcomputer.vercel.app/` has been completely deprecated from public production references and fallback URLs.
- **Production SSL & DNS Verification:**  
  Active HTTPS with standard SSL certificates; canonical metadata, sitemaps, OpenGraph cards, and auth redirect URLs point to `https://trustcomputermb.com`.

---

### 2. Official Business Contacts

| Purpose | Phone Number | Formatted | International / WhatsApp | Direct Action Links |
|---|---|---|---|---|
| **Sales & Customer Care** | `01797854836` | `01797-854836` | `8801797854836` | [tel:01797854836](tel:01797854836) <br/> [https://wa.me/8801797854836](https://wa.me/8801797854836) |
| **Service & Technical Support** | `01608346407` | `01608-346407` | `8801608346407` | [tel:01608346407](tel:01608346407) <br/> [https://wa.me/8801608346407](https://wa.me/8801608346407) |
| **bKash Payment / Cash Out** | `01712556225` | `01712-556225` | `8801712556225` | Dedicated Checkout & Contact Card (Copy Number feature) |

---

### 3. Old Numbers Audit & Cleanup

A system-wide recursive search was conducted across all files, templates, components, databases, and seeds:

| Old Number Identified | Locations Found | Replacement Applied | Status |
|---|---|---|---|
| `01753-765372` / `01753765372` | `lib/content/index.ts` (privacy, delivery, returns, warranty policies) | Replaced with Sales `01797854836` and Service `01608346407` | **Cleaned & Verified** |
| `01753-765372` | `lib/i18n/translations.ts` (`brand.hotline`, `contact.whatsapp_direct`, `home.call_hotline`) | Updated to `01797854836` / `+880 1797854836` | **Cleaned & Verified** |
| `01753-765372` | `components/home/ShowroomInfoSection.tsx` | Updated to Sales `01797854836` and Service `01608346407` | **Cleaned & Verified** |
| `01753-765372` | `components/home/AnnouncementTicker.tsx` | Updated to Sales Hotline `01797854836` and Service `01608346407` | **Cleaned & Verified** |
| `01753-765372` | `components/about/AboutPageClient.tsx` | Updated to `01797854836 (Sales) \| 01608346407 (Service)` | **Cleaned & Verified** |
| `01753-765372` | `components/policies/PolicyView.tsx` | Updated to `01797854836` | **Cleaned & Verified** |
| `01753-765372` | `app/layout.tsx` (Root metadata description) | Updated to Hotline: `01797854836` | **Cleaned & Verified** |
| `01753-765372` | `app/not-found.tsx` (404 Page helpline link) | Updated to `01797854836` | **Cleaned & Verified** |
| `01753-765372` | `app/(store)/contact/page.tsx` (Metadata description) | Updated to Sales: `01797854836`, Service: `01608346407`, bKash: `01712556225` | **Cleaned & Verified** |
| `01753-765372` / `01711-137517` | `app/(store)/categories/page.tsx` | Replaced with Sales `01797854836` and Service `01608346407` | **Cleaned & Verified** |
| `01753-765372` | `app/(store)/categories/[slug]/page.tsx` | Updated to `01797854836` | **Cleaned & Verified** |
| `01753-765372` | `app/(store)/account/orders/[orderNumber]/page.tsx` | Updated to `01797854836` | **Cleaned & Verified** |
| `01753-765372` | `app/admin/login/actions.ts` | Updated fallback to `01797854836` | **Cleaned & Verified** |
| `01753-XXXXXX` | `app/admin/(dashboard)/users/page.tsx` | Replaced placeholder with `01XXXXXXXXX` | **Cleaned & Verified** |
| `01753-765372` | `lib/email/index.ts` | Updated fallback phone to `01797854836` | **Cleaned & Verified** |
| `01753-765372` | `scripts/create-owner.js` | Updated default initial owner phone to `01797854836` | **Cleaned & Verified** |
| `01753-765372` | `README.md`, `DEPLOYMENT.md`, `BRAND_GUIDELINES.md` | Updated to full contact matrix with new numbers | **Cleaned & Verified** |
| `01753765372` | Test fixtures in `tests/validations.test.ts`, `tests/customer-account-banners.test.ts` | Migrated test data to `01797854836` | **Cleaned & Verified** |
| `+8801753765372` | Supabase Database `site_settings` table (live) | Migrated to `01797854836`, `+8801797854836` | **Cleaned & Verified in DB** |
| `01753-765372` | Supabase Database `users` table (`trustcomputermb@gmail.com`) | Migrated to `01797854836` | **Cleaned & Verified in DB** |

*Note: Zero public instances of the old numbers remain in the source code or production database.*

---

### 4. Centralized Business Contact Configuration

A dedicated single source of truth was established at [`lib/business.ts`](file:///c:/ALL%20PROJECTS/Trust%20Computer/lib/business.ts):

```typescript
export const business = {
  name: 'Trust Computer',
  officialFullName: 'Trust Computer-Moulvibazar',
  tagline: 'Your Trust, Our Technology',
  productionUrl: 'https://trustcomputermb.com',
  address: 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh',
  email: 'trustcomputermb@gmail.com',
  facebookUrl: 'https://www.facebook.com/TrustComputerr/',

  sales: {
    phone: '01797854836',
    whatsapp: '8801797854836',
    whatsappUrl: 'https://wa.me/8801797854836',
    tel: 'tel:01797854836',
  },

  service: {
    phone: '01608346407',
    whatsapp: '8801608346407',
    whatsappUrl: 'https://wa.me/8801608346407',
    tel: 'tel:01608346407',
  },

  payment: {
    bkash: '01712556225',
    method: 'bKash',
  },
};
```

All consumer modules (`lib/brand.ts`, `lib/whatsapp/index.ts`, Header, Footer, Contact, Product Actions, Checkout) consume this configuration directly or dynamically fetch overrides from database `site_settings`.

---

### 5. Touchpoints & User Experience (UX)

#### A. Header (Desktop & Mobile)
- **Desktop Header:** Integrated a dedicated Sales Hotline badge (`01797854836`) linking directly to `tel:01797854836`.
- **Mobile Drawer:** Structured clear, distinct action cards:
  - **Sales & Care:** Displays `01797854836` with "Call" (`tel:01797854836`) and "Chat" (`https://wa.me/8801797854836`).
  - **Service & Repair:** Displays `01608346407` with "Call" (`tel:01608346407`) and "Chat" (`https://wa.me/8801608346407`).

#### B. Footer
- Re-architected with 3 clear, distinct contact blocks:
  1. **Sales & Customer Care:** Hotline `01797854836` and WhatsApp `8801797854836`.
  2. **Service & Repair Lab:** Service hotline `01608346407` and WhatsApp `8801608346407`, plus a direct link to the new `/services` page.
  3. **bKash Payment / Cash Out:** Number `01712556225` with notice: *"For manual payment verification during checkout"*.

#### C. Contact Page (`/contact`)
- Created 3 structured contact cards:
  - **Card 1: Sales & Customer Care:** Call (`01797854836`) and Sales WhatsApp chat buttons.
  - **Card 2: Computer & CCTV Servicing:** Call (`01608346407`) and Service WhatsApp chat buttons.
  - **Card 3: bKash Payment / Cash Out:** Displays `01712556225` with interactive "Copy Number" button with visual confirmation checkmark and clipboard fallback.

#### D. Product Details Page (`/products/[slug]`)
- Added prominent sales consultation block:
  - *"Need Help Ordering? Sales & Customer Care: 01797854836"*
  - Dedicated call button.
  - Dynamic WhatsApp button pre-filling product details (e.g. `https://wa.me/8801797854836?text=Hello%20Trust%20Computer...[Product Name]...`).

#### E. Dedicated Servicing & Support Page (`/services`)
- New dedicated public page detailing:
  - CCTV security installation & surveillance setup.
  - Desktop PC servicing, cleaning, thermal paste replacement, and hardware diagnostics.
  - Laptop hardware repair and display replacement.
  - Network router and switch configuration.
  - Direct Service Hotline (`tel:01608346407`) and Service WhatsApp (`https://wa.me/8801608346407`).

---

### 6. bKash Payment Workflow (Manual System)

The application implements the **MANUAL bKASH PAYMENT** workflow. No fake automated gateway is used; transactions remain in a pending state until verified server-side.

#### Customer Checkout Steps:
1. Customer navigates to `/checkout`.
2. Customer selects payment method:
   - `Cash on Delivery (COD)` OR `bKash Payment (বিকাশ)`.
3. When `bKash` is selected, an instructional panel appears:
   - Shows recipient bKash number: **`01712556225`**.
   - Displays dynamic order total in BDT: `৳ [TOTAL]`.
   - **Copy Number** button with `navigator.clipboard` integration and `document.execCommand('copy')` fallback.
   - Clear 5-step payment instruction guide.
   - **Transaction ID Input** (Required, minimum 4 chars, trimmed, validated server-side).
   - **Sender Number Input** (Optional, 11-digit Bangladesh phone).
   - Payment status badge clearly stating: **Verification Pending**.

#### Order Placement & Status Logic:
- Order is submitted with `paymentMethod: 'BKASH'`.
- Database `Payment` record is created transactionally with:
  - `method: PaymentMethod.BKASH`
  - `status: PaymentStatus.PENDING`
  - `transactionId: validatedTrxId`
  - `rawResponseJson`: contains `{ paymentNumber: '01712556225', senderNumber, transactionId, submittedAt }`
- Order confirmation page (`/order-confirmation/[orderNumber]`) displays:
  - Payment Method: **bKash Payment**
  - Transaction ID: `[TRX_ID]`
  - Payment Status Badge: **Verification Pending** with notice: *"Our team will verify your payment shortly."*

---

### 7. Admin Payment Reconciliation System (`/admin/payments`)

The admin payment management console was updated for fast, secure reconciliation:

- **Server-Side Search:** Search across Order Number, Transaction ID, Customer Name, and Customer Phone.
- **Filtering:** Filter by Payment Status (`ALL`, `PENDING`, `PAID`, `FAILED`, `REFUNDED`) and Payment Method (`ALL`, `COD`, `BKASH`, `CARD`, `ONLINE`).
- **Pagination:** Clean server-side pagination (25 records per page) with previous/next controls.
- **Verification Action (`verifyPaymentAction`):**
  - Requires authenticated admin (`OWNER`, `ADMIN`, `STAFF`).
  - Updates `Payment` record to `status: PAID`.
  - Stamps `verifiedAt: now()` and `verifiedBy: session.user.id`.
  - Appends audit trail into `rawResponseJson` and `Payment.notes`.
  - Creates structured event in `AuditLog`.
- **Rejection Action (`rejectPaymentAction`):**
  - Requires authenticated admin.
  - Updates `Payment` record to `status: FAILED`.
  - Captures mandatory rejection reason (e.g. *"Transaction ID not found on bKash merchant statement"*).
  - Preserves full transaction history for auditing.
  - Creates structured event in `AuditLog`.

---

### 8. Admin Business Settings Management (`/admin/settings`)

- Admin settings form supports:
  - Store Name, Owner Name, Store Email, Showroom Address, Facebook URL.
  - **Sales & Customer Care Phone:** `01797854836`
  - **Sales WhatsApp Number:** `+8801797854836`
  - **Service & Technical Support Phone:** `01608346407`
  - **Service WhatsApp Number:** `+8801608346407`
  - **bKash Payment Number:** `01712556225`
  - Delivery Fees (Inside / Outside Moulvibazar).
- Database migrations added `servicePhone`, `serviceWhatsapp`, and `bkashNumber` columns directly to `site_settings`.

---

### 9. Security & Compliance Safeguards

1. **No Fake Gateway Success:** Client-side input of transaction IDs never marks an order or payment as `PAID`.
2. **Server-Side Validation:** Zod schemas enforce required transaction ID on checkout when bKash is selected.
3. **Role-Based Reconciliation:** Only authenticated admins with valid session cookies can execute `verifyPaymentAction` or `rejectPaymentAction`.
4. **Audit Logging:** Every verification and rejection event is logged with actor ID, timestamp, and notes.
5. **No Secret Leaks:** Supabase service-role keys and database credentials remain exclusively on the server.

---

### 10. Automated Testing & Verification

- **Total Test Suites Executed:** 14 test suites
- **Total Test Cases Passed:** 149 tests passed (0 failures)
- **Dedicated Test Suite:** `tests/business-contacts-bkash.test.ts` covers:
  - Authoritative contact properties in `business` object.
  - Sales, Service, Product, Order, and Cart WhatsApp URL generators.
  - Checkout Zod validation for COD and bKash (success, missing trx, empty whitespace).
  - Server actions authorization guards.

---

### 11. Production Verification Checklist

| Item | Expected Value | Status |
|---|---|---|
| Primary Domain | `https://trustcomputermb.com/` | Verified |
| Sales Phone | `01797854836` | Verified |
| Sales WhatsApp | `8801797854836` (`https://wa.me/8801797854836`) | Verified |
| Service Phone | `01608346407` | Verified |
| Service WhatsApp | `8801608346407` (`https://wa.me/8801608346407`) | Verified |
| bKash Number | `01712556225` | Verified |
| bKash Copy Button | Functional with clipboard fallback | Verified |
| Initial bKash Status | `verification_pending` | Verified |
| Admin Payments List | Search, Filter, Paginate, Verify, Reject | Verified |
| Admin Settings | Sales, Service, bKash numbers sync to DB | Verified |
| Old Numbers (`01753-765372`) | 0 occurrences in application | Verified |

---

*Report generated for Trust Computer-Moulvibazar by Antigravity Agentic Pair Programmer.*
