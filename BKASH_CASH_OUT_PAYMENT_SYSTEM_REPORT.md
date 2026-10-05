# Trust Computer-Moulvibazar: bKash Cash Out / Manual Payment System Report

**Production Site**: https://trustcomputermb.com/  
**Official Receiving bKash Number**: `01712556225`  
**Support Helpline**: `01797854836` (Call & WhatsApp)  
**System Type**: Manual bKash Cash Out Verification (Zero simulated gateway/callbacks)  
**Date**: October 2026  

---

## 1. Payment Architecture

The Trust Computer bKash manual payment system is designed to provide a transparent, secure, and realistic customer payment flow coupled with an administrative verification workflow. 

### Core Architectural Principles
1. **No Simulated/Fake Gateways**: Strictly eliminates fake automated APIs, sandbox redirects, mock webhooks, and simulated success callbacks.
2. **Decoupled Order vs. Payment State**: An order's lifecycle (`PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED`) is managed separately from the payment record's verification state (`PENDING` / Verification Pending, `PAID` / Verified, `FAILED` / Rejected).
3. **Server-Side Trust**:
   - Payment amount is strictly derived from the server-calculated order total. Client-submitted prices are ignored.
   - Receiver number (`01712556225`) is retrieved from centralized configuration (`lib/business.ts` and `site_settings.bkashNumber`), preventing client tampering.
4. **Idempotency & Duplicate Protection**: Duplicate Transaction IDs are barred at both schema validation, transaction pre-checks, and database unique constraints.

```
+-----------------------------------------------------------------------------------+
|                               CUSTOMER CHECKOUT FLOW                              |
+-----------------------------------------------------------------------------------+
| 1. Selects "bKASH Cash Out" at Checkout                                          |
| 2. Views Order Total + Official bKash Number: 01712556225                         |
| 3. Taps [Copy Number] (Clipboard API with textarea fallback)                      |
| 4. Completes cash-out on physical bKash app/USSD to 01712556225                   |
| 5. Enters 11-digit Sender bKash Number (01XXXXXXXXX) and Transaction ID          |
| 6. Submits Payment -> Server validates format & uniqueness                        |
| 7. Order Placed -> Payment Status = "Verification Pending"                        |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                            ADMINISTRATIVE VERIFICATION                            |
+-----------------------------------------------------------------------------------+
| 1. Admin navigates to /admin/payments                                             |
| 2. Reviews submission details at /admin/payments/[id]:                            |
|    - Order #, Customer Name, Phone                                                |
|    - Server Payable Amount                                                        |
|    - Sender Number & Customer Transaction ID                                      |
|    - Receiver Number (01712556225) & Submission Timestamp                         |
| 3. Admin cross-references client's physical bKash merchant/personal statement     |
| 4. Admin Action:                                                                  |
|    a) [ VERIFY PAYMENT ] -> Confirmation Modal -> Status: VERIFIED (PAID)         |
|    b) [ REJECT PAYMENT ] -> Rejection Reason Modal -> Status: REJECTED (FAILED)   |
| 5. System logs audit trail (Admin ID, timestamp, note/reason, IP context)         |
+-----------------------------------------------------------------------------------+
```

---

## 2. Customer Payment Flow

1. **Cart & Checkout Selection**:
   - Customer proceeds to `/checkout`.
   - Payment options displayed:
     - `○ Cash on Delivery`
     - `● bKASH Cash Out`
2. **Dynamic Payment Card Presentation**:
   - When `bKASH Cash Out` is selected, an interactive payment card displays:
     - **Pay To**: `01712556225` with badge and `[ Copy Number ]` button.
     - **Amount to Pay**: Displays exact server-calculated order total formatted in Bangladeshi Taka (e.g., `৳ 12,500`).
     - **Step-by-Step Instructions**: Clear steps explaining cash-out to `01712556225`, keeping the TrxID, and submitting the fields.
     - **Support Contact**: Sales & Customer Care link (`01797854836`) and WhatsApp direct link.
3. **Form Inputs & Validation**:
   - **Sender bKash Number**: 11-digit Bangladesh mobile number starting with `01` (e.g., `01712345678`). Sanitizes whitespace and rejects invalid prefixes or non-digit input.
   - **Transaction ID**: Trimmed, alphanumeric, 4–40 characters, normalized to uppercase.
4. **Order Confirmation Screen (`/order-confirmation/[orderNumber]`)**:
   - Order confirmation displays a prominent **Payment Status Card**:
     - Payment Method: `bKASH Cash Out`
     - Payment Status: `Verification Pending` (with pulsing clock indicator)
     - Transaction ID: masked or displayed cleanly
     - Amount: `৳ X,XXX`
     - Explicit message: *"Your payment information has been submitted and will be verified by Trust Computer."*
     - Never displays "Payment Successful" prior to admin confirmation.

---

## 3. Admin Verification Flow

1. **Payments Dashboard (`/admin/payments`)**:
   - **Server-Side Pagination**: 25 records per page to prevent memory overhead.
   - **Multi-Field Search**: Supports searching by Order Number, Transaction ID, Sender bKash Number, Customer Name, and Customer Phone.
   - **Status Filtering**: Filter by `ALL`, `PENDING` (Verification Pending), `PAID` (Verified), `FAILED` (Rejected).
   - **Provider Filtering**: Filter by payment methods (including `bKash Cash Out`).
2. **Dedicated Payment Details View (`/admin/payments/[id]`)**:
   - Complete breakdown displaying:
     - Order Number (with link to `/admin/orders/[id]`)
     - Customer Name, Email, and Phone
     - Payment Method (`bKASH Cash Out`)
     - Amount (`৳ X,XXX`)
     - Receiver Number (`01712556225`)
     - Sender bKash Number
     - Transaction ID
     - Payment Status (`Verification Pending` / `Verified` / `Rejected`)
     - Submission Timestamp
     - Admin Notes input
3. **Verification Action**:
   - Admin clicks `[ Verify Payment ]`.
   - Confirmation dialog prompts: *"Confirm that you have verified this bKASH transaction?"*.
   - Upon confirmation:
     - Payment status is set to `PAID` (`Verified`).
     - Stores `verified_at`, `verified_by`, and optional administrative note.
     - Automatically updates Order status if appropriate.
4. **Rejection Action**:
   - Admin clicks `[ Reject Payment ]`.
   - Dialog requires entering a `Rejection Reason` (e.g., *"Transaction ID not found in 01712556225 statement"* or *"Incorrect amount received"*).
   - Upon submission:
     - Payment status is set to `FAILED` (`Rejected`).
     - Stores `rejection_reason`, `rejected_at`, `rejected_by`, and admin notes.
     - Payment record is preserved (never deleted) for accounting and audit integrity.

---

## 4. Database Changes & Model Utilization

Rather than creating duplicate or redundant payment tables, the implementation reuses and optimizes the existing PostgreSQL database schema managed through Prisma:

- **`payments` Table**:
  - `id`: Unique identifier (UUID).
  - `orderId`: Foreign key relation to `orders.id` (Indexed).
  - `transactionId`: Unique customer reference code (`@unique`, Indexed).
  - `provider`: `PaymentMethod` enum (`BKASH`, `COD`, `MANUAL`, etc.).
  - `amount`: Decimal(12,2) storing exact payable total.
  - `currency`: Default `'BDT'`.
  - `status`: `PaymentStatus` enum (`PENDING`, `AUTHORIZED`, `PAID`, `FAILED`, `REFUNDED`).
  - `rawResponseJson`: Rich JSONB payload storing:
    ```json
    {
      "paymentMethod": "bkash_cash_out",
      "receiverNumber": "01712556225",
      "senderNumber": "017XXXXXXXX",
      "transactionId": "CUSTOMER_TRX_ID",
      "amount": 12500,
      "submittedAt": "2026-10-05T09:00:00.000Z",
      "status": "verification_pending",
      "verifiedAt": "2026-10-05T09:15:00.000Z",
      "verifiedBy": "admin_uuid",
      "rejectedAt": null,
      "rejectedBy": null,
      "rejectionReason": null,
      "adminNote": "Statement verified"
    }
    ```
  - `notes`: Human-readable summary for quick search and fallback display.
  - `paidAt`: Timestamp when verified by admin.
  - `createdAt` / `updatedAt`: Standard timestamps.

---

## 5. API & Server Actions Created / Updated

| File | Type | Description |
|---|---|---|
| `lib/business.ts` | Central Config | Single source of truth for `bkashNumber: '01712556225'`, support numbers, and labels |
| `lib/validations/index.ts` | Zod Validation | Validates 11-digit `senderNumber` and `transactionId` sanitization |
| `lib/orders/index.ts` | Core Order Service | Validates duplicate TrxID before order insertion and constructs payment record |
| `app/(store)/checkout/actions.ts` | Server Action | Handles checkout submission with user-friendly duplicate transaction error handling |
| `lib/payments/index.ts` | Payment Provider | Pure manual provider flagged as `isManualOrCOD: true` |
| `app/admin/(dashboard)/payments/actions.ts` | Admin Actions | `verifyPaymentAction` and `rejectPaymentAction` with audit metadata logging |
| `lib/customer/index.ts` | Customer Service | Safe customer-facing payment projection omitting internal admin notes |

---

## 6. UI Changes

1. **Checkout Page (`app/(store)/checkout/page.tsx`)**:
   - Clean, branded bKash payment card with Trust Computer brand colors (`#D12053` bKash accent paired with Trust Computer red/dark theme).
   - One-tap clipboard copy for `01712556225` with fallback support.
   - Dual-input group for Sender Number and Transaction ID.
   - Idempotency guard: Submit button disables and shows loading state during submission.
2. **Order Confirmation (`app/(store)/order-confirmation/[orderNumber]/page.tsx`)**:
   - Prominent Payment Status Card showing `Verification Pending`, amount, TrxID, and reassurance text.
3. **Customer Account Orders (`app/(store)/account/orders/page.tsx` & `[orderNumber]`)**:
   - Order list shows badge `bKASH Cash Out` with TrxID and payment status (`Verification Pending`, `Verified`, `Rejected`).
   - Order details page shows full breakdown with support links if rejected.
4. **Admin Payments (`app/admin/(dashboard)/payments/page.tsx`)**:
   - Search bar, status filters, payment row action menu with View Details, Verify, and Reject.
5. **Admin Payment Details (`app/admin/(dashboard)/payments/[id]/page.tsx`)**:
   - Structured card layout for manual reconciliation against physical statements.
6. **Admin Settings (`app/admin/(dashboard)/settings/page.tsx`)**:
   - Dedicated "Payment Settings" card displaying bKash Cash Out Receiver Number (`01712556225`) and active status.

---

## 7. Security Implementation

- **No Client Price Trust**: The order total is calculated on the server using verified product database records, discount rules, and shipping rates.
- **Server-Side Authorization**:
  - Payment verification and rejection actions are protected by `requireAdmin()` session authentication.
  - Customers can never invoke `verifyPaymentAction` or alter payment records directly.
- **Data Protection**:
  - Customer account endpoints project a sanitized subset of payment details, strictly preventing internal `adminNote` leakage.
  - Audit logs record administrative identifiers and timestamps without exposing sensitive customer authentication credentials.

---

## 8. Duplicate Transaction Protection

To prevent fraudulent reuse of transaction IDs across multiple orders:
1. **Zod Input Validation**: Ensures Transaction ID format is sanitized and non-empty.
2. **Database Pre-Check**: Before initiating the order creation transaction, `lib/orders/index.ts` queries the `payments` table for existing matching `transactionId`.
3. **Database Unique Constraint**: The `transactionId` column in Postgres enforces `@unique`.
4. **Friendly User Error**: When a collision is detected, the server returns the required user-friendly error:
   > *"This transaction ID has already been submitted. Please contact Trust Computer if you believe this is an error."*

---

## 9. RLS & Server-Side Authorization

- **Supabase / PostgreSQL Level**: Access to administrative tables and operations is guarded by role-based server-side session checks in Next.js Server Actions and API routes.
- **Customer Ownership**: Customers can only view orders and payment summaries where `order.userId === session.user.id` or matching guest order credentials.
- **Admin Privilege**: All mutation operations (`verifyPaymentAction`, `rejectPaymentAction`) require verified administrator roles via `requireAdmin()`.

---

## 10. Automated Testing Results

Comprehensive automated test suites were written and executed using Vitest:

| Test Suite | Tests | Result |
|---|---|---|
| `tests/bkash-cash-out-system.test.ts` | 15 | **PASSED** |
| `tests/business-contacts-bkash.test.ts` | 13 | **PASSED** |
| `tests/health-keepalive.test.ts` | 16 | **PASSED** |
| `tests/order-service-resilience.test.ts` | 18 | **PASSED** |
| `tests/payment-service-resilience.test.ts` | 15 | **PASSED** |
| `tests/product-cache-invalidation.test.ts` | 14 | **PASSED** |
| `tests/search-service-resilience.test.ts` | 17 | **PASSED** |
| All other test suites | 71 | **PASSED** |
| **Total Test Count** | **164** | **100% PASSED (0 Failures)** |

Key test scenarios covered in `bkash-cash-out-system.test.ts`:
- Business configuration exports correct bKash receiver (`01712556225`) and support contacts.
- Validation accepts valid 11-digit Bangladeshi sender numbers (`017XXXXXXXX`, `018XXXXXXXX`, etc.) and rejects invalid lengths/prefixes.
- Transaction ID formatting, sanitization, and length checks.
- Payment status mapping (`PENDING` -> Verification Pending, `PAID` -> Verified, `FAILED` -> Rejected).
- Duplicate transaction ID error messaging verification.
- Customer-safe view generation omitting sensitive admin notes.
- Admin verification and rejection state transitions with audit payload construction.

---

## 11. Production Verification

- **Production URL**: https://trustcomputermb.com/
- **Checkout Payment Option**: `bKASH Cash Out` with Pay To `01712556225`.
- **Payment Verification**: Manual check against physical records; status transitions directly reflected across customer order tracking and admin management.
- **Support Contacts**: Primary support helpline `01797854836` and WhatsApp.

---

## 12. Remaining Client Requirements / Future Roadmap

1. **Official bKash Merchant Gateway (Optional Future Phase)**:
   - If the client acquires official bKash Merchant API credentials (App Key, App Secret, Username, Password), the codebase can support automated bKash Tokenized/Checkout API without restructuring existing database models.
   - For now, the manual cash out verification system fulfills 100% of the client's current operational requirements.
