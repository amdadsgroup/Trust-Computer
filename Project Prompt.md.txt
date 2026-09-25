# MASTER PROJECT PROMPT: TRUST COMPUTER-MOULVIBAZAR E-COMMERCE WEB APPLICATION

## 1. YOUR ROLE

Act as a senior full-stack software engineer, UI/UX designer, database architect, security engineer, and QA engineer.

Build a complete, production-oriented e-commerce web application for my client, Trust Computer-Moulvibazar.

Do not create only a static design or frontend prototype. Build a functional application with a real database, working customer flows, admin management, inventory tracking, order processing, and properly structured backend logic.

Work directly in the existing project workspace. First inspect the workspace, understand the current files and installed dependencies, and then implement the project without unnecessarily overwriting existing work.

If the project is empty, initialize it using the technology stack described below.

Do not stop after creating a plan. Implement the application in small, testable phases.

---

# 2. CLIENT AND BUSINESS INFORMATION

Business name: Trust Computer-Moulvibazar

Owner: Shiblu Ahmed

Business type: Computer, computer accessories, CCTV, networking equipment, and related technology products.

Location: T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh.

Phone: 01753-765372

Email: [trustcomputermb@gmail.com](mailto:trustcomputermb@gmail.com)

Website: https://trustcomputermb.com

Facebook: https://www.facebook.com/TrustComputerr/

Facebook audience: Approximately 52,000 followers at the time this information was provided. Do not hardcode this number into the website unless the client confirms it is current.

Business description:
“মানসম্মত কম্পিউটার ও সিসি ক্যামেরা জগতে মৌলভীবাজারের একটি বিশ্বস্ত প্রতিষ্ঠান।❤️”

Use this information consistently in the website, contact section, footer, SEO metadata, and business information settings.

Do not invent business claims, product specifications, certifications, warranties, discounts, customer reviews, or delivery promises.

---

# 3. PROJECT OBJECTIVE

Create a modern, responsive e-commerce website that allows customers to:

* Browse computer products, accessories, CCTV equipment, and other products.
* Search, filter, sort, and compare relevant product information.
* View detailed product pages, images, specifications, prices, and availability.
* Add products to a shopping cart.
* Place orders through a straightforward checkout process.
* Choose available payment methods.
* Receive an order number and order confirmation.
* Contact the business through WhatsApp or phone.
* View order status when order tracking is enabled.

The owner and authorized staff must be able to:

* Manage products and categories.
* Upload and organize product images.
* Manage prices, stock, and product visibility.
* Receive and process customer orders.
* Update order status.
* Record and reconcile payments.
* View sales and inventory reports.
* Manage business settings and authorized staff accounts.

The website must be easy for customers to use on mobile phones, especially in Bangladesh.

---

# 4. TECHNOLOGY STACK

Use the following stack unless the existing project already has a suitable, working equivalent.

Frontend:

* Next.js with App Router.
* React.
* TypeScript with strict mode.
* Tailwind CSS.
* shadcn/ui where useful.
* Lucide icons.

Backend:

* Next.js server components.
* Server actions or route handlers where appropriate.
* Zod for input validation.
* Secure server-side business logic.

Database:

* PostgreSQL.
* Prisma ORM.
* Versioned Prisma migrations.

Authentication:

* Secure admin authentication.
* Use a maintained authentication library compatible with the selected Next.js version.
* Support role-based access control.

Image storage:

* Use a suitable external object-storage provider or managed image service.
* Keep provider credentials on the server.
* Store image URLs and metadata in the database.
* Do not depend on temporary local uploads for production.

Testing:

* Vitest or Jest for unit tests.
* Playwright for essential end-to-end flows.

Deployment:

* Prepare the application for deployment on a compatible platform such as Vercel with a managed PostgreSQL database.
* Provide environment variable documentation and production setup instructions.

Use current stable, mutually compatible package versions. Check existing dependencies before installing alternatives.

---

# 5. DESIGN SYSTEM AND BRANDING

Create a clean, professional technology-store design.

Brand colors:

* Primary blue.
* Red accent.
* White backgrounds.
* Neutral gray for borders, muted text, and secondary surfaces.

Use the actual Trust Computer logo if it is available in the project assets. Otherwise, create a simple temporary text-based brand mark that can easily be replaced.

Do not invent an official logo.

Design requirements:

* Mobile-first responsive layout.
* Professional computer and technology retail appearance.
* Clear typography.
* Strong visual hierarchy.
* Consistent spacing.
* Reusable components.
* Accessible color contrast.
* Keyboard-accessible navigation and forms.
* Visible focus states.
* Loading, empty, error, and success states.
* Skeleton loading where appropriate.
* Useful error messages.
* Consistent buttons, cards, badges, tables, forms, and dialogs.

Avoid:

* Excessive gradients.
* Unnecessary animations.
* Overcrowded layouts.
* Fake statistics.
* Fake testimonials.
* Fake ratings.
* Placeholder links that appear functional but do nothing.
* Unnecessary dashboard widgets.

Use Bengali and English business information appropriately. Make the interface ready for future Bengali localization.

---

# 6. CUSTOMER-FACING WEBSITE

Implement the following pages.

## 6.1 Home page: /

Include:

* Header with logo, navigation, search, account/cart links where supported.
* Mobile navigation.
* Hero section introducing Trust Computer.
* Product category shortcuts.
* Featured products selected from the database.
* Latest products.
* Relevant promotional banners managed by the admin.
* Customer benefits only when verified by the owner.
* WhatsApp contact button.
* Business address and contact information.
* Footer with navigation, contact details, policies, and social links.

Do not show empty sections or fake products.

If the database has no products, show a professional empty state instead of fabricated inventory.

## 6.2 Product listing: /products

Features:

* Product grid.
* Search.
* Pagination.
* Category filtering.
* Brand filtering.
* Price range filtering.
* Availability filtering.
* Sorting by newest, price ascending, and price descending.
* Responsive filters.
* Clear-filter functionality.
* URL query parameters for shareable search and filter states.

Use database queries with appropriate pagination and validation.

## 6.3 Category pages: /categories/[slug]

Display:

* Category name and description.
* Category-specific products.
* Relevant filters.
* Pagination.
* Breadcrumb navigation.

Categories must be manageable by admins.

## 6.4 Product detail: /products/[slug]

Display:

* Product name.
* Product images and gallery.
* Current selling price.
* Compare-at price only when valid.
* Stock availability.
* SKU.
* Brand and category.
* Product description.
* Technical specifications.
* Warranty information only when supplied by the business.
* Product variants where applicable.
* Quantity selector.
* Add-to-cart button.
* WhatsApp inquiry button.
* Related products when available.

Validate product availability and price on the server before creating an order.

Never trust prices submitted by the browser.

## 6.5 Shopping cart: /cart

Features:

* Display cart items.
* Update quantities.
* Remove items.
* Show item subtotals.
* Show estimated order total.
* Handle unavailable products.
* Validate quantities and current prices.
* Continue shopping.
* Proceed to checkout.

For guest carts, use a safe client-side persistence mechanism or server-backed cart design. Never store sensitive information in browser storage.

## 6.6 Checkout: /checkout

Collect only necessary information:

* Customer name.
* Phone number.
* Email, optional if not required.
* Delivery address.
* City or area.
* Optional order notes.
* Delivery method if the business provides multiple verified options.
* Payment method.

Support:

* Cash on delivery, if approved by the business.
* Online payment options only after merchant onboarding and integration are completed.

Checkout must:

* Validate all fields on the server.
* Recalculate product prices and totals.
* Verify stock.
* Calculate delivery fees from configured rules.
* Create the order transactionally.
* Prevent duplicate order submissions.
* Display clear validation errors.
* Show the final total before order submission.

Do not collect card details directly.

## 6.7 Order confirmation: /order-confirmation/[orderNumber]

Display:

* Order number.
* Order summary.
* Customer-facing order status.
* Payment status.
* Next steps.
* Contact options.

Do not expose private order information based only on a guessable order number. Require a secure access token, authenticated ownership, or another appropriate verification mechanism.

## 6.8 Order tracking: /track-order

Allow customers to check their order status using an appropriate combination of order number and securely verified customer information.

Do not reveal customer addresses, email addresses, payment details, or other sensitive information.

## 6.9 About page: /about

Use only verified business information. Include the business name, owner, location, and business description provided above.

Do not invent a founding date, company history, awards, certifications, or number of customers.

## 6.10 Contact page: /contact

Include:

* Business phone.
* Email.
* Address.
* WhatsApp link.
* Facebook link.
* Map embed only if configured with an accurate location.
* Contact form if implemented with server-side validation and spam protection.

## 6.11 Policy pages

Create editable pages for:

* Privacy policy.
* Terms and conditions.
* Delivery policy.
* Return and refund policy.
* Warranty policy.

Use clearly marked draft content where legal or operational details have not been supplied.

Do not invent return periods, warranty terms, delivery times, or legal promises. Make these settings editable by authorized admins before launch.

---

# 7. ADMIN DASHBOARD

Create a protected admin dashboard under /admin.

Suggested pages:

/admin
/admin/products
/admin/products/new
/admin/products/[id]/edit
/admin/categories
/admin/brands
/admin/orders
/admin/orders/[id]
/admin/inventory
/admin/customers
/admin/payments
/admin/reports
/admin/banners
/admin/content
/admin/settings
/admin/users
/admin/audit-logs

Require authentication and authorization for every protected server operation, not just the page UI.

## 7.1 Dashboard overview

Show useful real database metrics:

* Total orders.
* Orders awaiting processing.
* Sales within a selected period.
* Completed orders.
* Low-stock products.
* Recent orders.
* Inventory summary.

Clearly distinguish order value, paid revenue, refunds, and pending payments.

Do not use hardcoded dashboard numbers.

## 7.2 Product management

Admins can:

* Create products.
* Edit products.
* Archive or deactivate products.
* Manage product names and slugs.
* Assign categories and brands.
* Set SKU.
* Set selling price.
* Set compare-at price where valid.
* Add descriptions.
* Manage specifications.
* Upload and reorder images.
* Manage variants.
* Configure stock tracking.
* Set low-stock thresholds.
* Set warranty information.
* Control product visibility.
* Mark featured products.

Prevent duplicate SKUs and invalid prices.

Use soft deletion or archival when product history must be preserved.

## 7.3 Category and brand management

Admins can:

* Create categories.
* Edit categories.
* Manage category slugs.
* Create parent and child categories where needed.
* Create and edit brands.
* Prevent invalid or duplicate slugs.
* Avoid deleting categories or brands that are still referenced by products without an explicit reassignment strategy.

## 7.4 Order management

Admins can:

* View orders.
* Search by order number or customer details.
* Filter by date, status, and payment status.
* Open order details.
* View immutable item and price snapshots.
* Update order status according to allowed transitions.
* Add internal notes.
* View order status history.
* Record permitted manual payment updates.
* Print or export an order invoice.

Require confirmation for consequential actions such as cancellation or refund recording.

Keep an audit trail of administrative changes.

## 7.5 Inventory management

Implement proper inventory tracking.

Requirements:

* Track available stock.
* Track reserved stock if reservations are used.
* Track stock movements.
* Record movement type, quantity, reason, timestamp, and responsible admin where applicable.
* Support stock adjustments.
* Support receiving new stock.
* Support returns and restocking through explicit workflows.
* Show low-stock alerts.
* Prevent stock from becoming negative through concurrent checkout requests.

Use database transactions and atomic updates.

Maintain an inventory ledger instead of silently overwriting stock quantities.

## 7.6 Payment management

Create a payment records page.

Support:

* Cash on delivery.
* Manual payment confirmation where authorized.
* Online payment records.
* Payment status history.
* Transaction references.
* Refund records where applicable.

Payment statuses should distinguish pending, authorized, paid, failed, cancelled, and refunded as appropriate.

Never mark an online payment as paid simply because the customer returned to a success page.

Verify payment results through the payment provider's server-side verification mechanism and authenticated webhook handling.

## 7.7 Reports

Create reports for:

* Sales by date range.
* Orders by status.
* Product sales.
* Best-selling products based on actual data.
* Low-stock products.
* Inventory movements.
* Payment summaries.
* Refund summaries.

Use real database queries.

Provide CSV export where useful, with authorization and safe handling of spreadsheet formula injection.

Clearly document how sales and revenue are calculated.

---

# 8. WHATSAPP INTEGRATION

Business WhatsApp number: 01753-765372

Generate the correct international WhatsApp destination using Bangladesh's country code.

Provide:

* Floating WhatsApp contact button.
* Product inquiry button.
* Order inquiry button.
* Optional checkout-to-WhatsApp handoff.

Use URL-encoded message text.

Product inquiry messages may include:

* Product name.
* Product SKU.
* Product page URL.

Order inquiry messages may include the order number only after the order is created.

Do not expose private customer information in WhatsApp URLs.

WhatsApp handoff must not be described as a completed order unless the order has actually been saved in the database.

Automated WhatsApp notifications require an approved WhatsApp Business API provider and configuration. Do not pretend that ordinary click-to-chat provides automated messaging.

---

# 9. DATABASE DESIGN

Use Prisma and PostgreSQL.

Design a normalized, maintainable schema with suitable relations, constraints, indexes, and timestamps.

Consider the following entities:

* User
* Role or role assignments
* Category
* Brand
* Product
* ProductVariant
* ProductImage
* ProductSpecification
* Cart
* CartItem
* Order
* OrderItem
* Payment
* PaymentWebhookEvent
* InventoryMovement
* StockReservation, if required
* OrderStatusHistory
* Address, if customer accounts are implemented
* Banner
* SiteSettings
* ContentPage
* AdminAuditLog
* ReturnRequest, if returns are included
* Refund, if refunds are included

You may adjust the schema when there is a sound technical reason.

Requirements:

* Use appropriate IDs.
* Use unique constraints for SKUs, slugs, and order numbers.
* Use decimal-safe monetary values.
* Use explicit currency handling, defaulting to BDT.
* Store timestamps consistently.
* Store an immutable snapshot of product name, SKU, unit price, and relevant item information in order items.
* Keep payment records separate from orders.
* Keep inventory movements auditable.
* Use appropriate indexes for search, filtering, and reporting.
* Define deletion behavior intentionally.
* Use database transactions for checkout and stock changes.

Provide the complete Prisma schema and migrations.

---

# 10. ORDER AND INVENTORY WORKFLOW

Implement the following core workflow.

1. Customer browses products.
2. Customer adds products to cart.
3. Customer submits checkout.
4. Server validates customer details and cart contents.
5. Server fetches current product prices and verifies availability.
6. Server calculates all totals.
7. Server creates the order and order items.
8. Inventory is updated or reserved using a safe transactional strategy.
9. Payment record is created.
10. Customer receives an order confirmation.
11. Admin sees the new order.
12. Admin processes the order and updates status.
13. Inventory and payment history remain auditable.

For online payment:

* Create the pending order/payment safely.
* Initiate payment through the provider's server-side API.
* Verify the provider response.
* Process webhooks idempotently.
* Update payment status only after verified confirmation.
* Handle failed, cancelled, duplicate, and delayed payment notifications.
* Release stock reservations safely when an order expires or is cancelled, if reservations are used.

Document and test the exact stock reservation and cancellation rules.

---

# 11. PAYMENT INTEGRATION

Prepare a provider abstraction so a supported Bangladesh payment gateway can be integrated without rewriting checkout.

Possible providers include:

* SSLCOMMERZ.
* bKash.
* Nagad.

Do not claim any provider is active until the business has completed the necessary merchant onboarding and credentials are configured.

Implement the payment integration only when official API documentation and merchant credentials are available.

Requirements:

* Server-only secrets.
* Verified callback handling.
* Webhook signature or authenticity validation as supported by the provider.
* Idempotency.
* Transaction reference storage.
* Amount and currency verification.
* Payment status reconciliation.
* Clear test and production configuration.
* No real charges in development or test mode.

If credentials are unavailable, complete the payment abstraction and working COD/manual-payment workflow, then document exactly what remains for online payment activation.

Never fabricate successful payment responses.

---

# 12. AUTHENTICATION AND AUTHORIZATION

Implement secure admin access.

Requirements:

* No public admin registration.
* Secure password hashing if passwords are used.
* Secure session handling.
* Server-side authorization.
* Role-based permissions.
* Login rate limiting.
* Safe logout.
* Protection against unauthorized data access.
* Strong production secret configuration.
* Optional password reset only if a secure email delivery service is configured.

Suggested roles:

* OWNER
* ADMIN
* STAFF

Define permissions carefully.

Only authorized users may change product prices, inventory, order status, payment records, settings, or staff access.

Do not include default production admin credentials in the repository.

Provide a secure setup process for creating the initial owner account.

---

# 13. SECURITY REQUIREMENTS

Implement security throughout the application.

* Validate all user input on the server.
* Enforce authentication and authorization server-side.
* Use safe database queries through Prisma.
* Protect against common injection and cross-site scripting risks.
* Apply appropriate CSRF protection where required by the chosen architecture.
* Rate-limit login, checkout, and public forms.
* Secure file uploads by validating file types, size, and content.
* Do not trust browser-submitted prices, roles, stock, or payment statuses.
* Keep secrets out of source code and client bundles.
* Avoid exposing internal errors to customers.
* Avoid leaking private customer information through order lookup.
* Log important admin actions without storing passwords or sensitive payment credentials.
* Configure secure cookies and production security headers.
* Handle environment variables safely.
* Protect payment webhook endpoints.
* Avoid logging complete payment credentials or unnecessary personal data.

Do not claim that the system is secure merely because it has a login page. Verify authorization on protected operations.

---

# 14. SEO AND PERFORMANCE

Implement:

* Unique page titles and meta descriptions.
* Canonical URLs where appropriate.
* Open Graph metadata.
* Product metadata.
* Product structured data using accurate database values.
* Organization and LocalBusiness structured data using verified business information.
* Sitemap.
* robots.txt.
* Clean, readable product slugs.
* Breadcrumbs.
* Responsive images.
* Lazy loading where appropriate.
* Appropriate caching and revalidation.
* Server-rendered product content where beneficial.
* Pagination and database query optimization.

Do not invent product ratings, review counts, availability, prices, or shipping information in structured data.

Do not index private admin pages, checkout details, or customer-specific pages.

---

# 15. USER EXPERIENCE AND ACCESSIBILITY

Ensure:

* Responsive behavior on mobile, tablet, and desktop.
* Accessible forms with labels.
* Keyboard navigation.
* Meaningful button labels.
* Accessible dialogs.
* Clear validation messages.
* Empty states.
* Loading states.
* Error states.
* Success confirmation.
* Confirmation before destructive actions.
* Usable tables on small screens.
* Appropriate contrast and focus indicators.

Use real application data in all functional screens.

---

# 16. TESTING REQUIREMENTS

Write automated tests for critical business logic.

At minimum, test:

1. Product creation validation.
2. Duplicate SKU prevention.
3. Cart quantity validation.
4. Price recalculation on the server.
5. Checkout with valid data.
6. Checkout with invalid data.
7. Stock shortage handling.
8. Concurrent checkout / overselling protection.
9. Duplicate checkout submission prevention.
10. Order creation and order-item snapshots.
11. Order status transition rules.
12. Admin authorization.
13. Unauthorized inventory changes.
14. Payment webhook authenticity and idempotency.
15. Payment amount verification.
16. Inventory movement recording.
17. Cancellation and stock release rules.
18. Secure order tracking.
19. Product search and filtering.
20. Essential mobile checkout flow.

Do not claim tests passed unless they have actually been run.

Fix failures before proceeding where practical. Clearly document any tests that could not be run and why.

---

# 17. DEVELOPMENT PHASES

Build the application in the following phases.

## Phase 1: Inspect and initialize

* Inspect the current workspace.
* Confirm the framework and dependencies.
* Set up TypeScript, Tailwind, linting, and project structure.
* Configure environment variables.
* Set up Prisma and PostgreSQL.
* Create README and architecture notes.

## Phase 2: Database and authentication

* Design and implement the schema.
* Create migrations.
* Set up secure admin authentication.
* Implement authorization helpers.
* Create initial owner setup instructions.

## Phase 3: Storefront

* Build shared header, footer, navigation, and reusable components.
* Build home page.
* Build product catalog and category pages.
* Build product details.
* Add search, filtering, sorting, and pagination.

## Phase 4: Cart and checkout

* Implement cart behavior.
* Implement server-side price validation.
* Implement checkout forms.
* Implement order creation.
* Implement safe inventory updates.
* Implement order confirmation and secure tracking.

## Phase 5: Admin dashboard

* Implement product management.
* Implement categories and brands.
* Implement order management.
* Implement inventory management.
* Implement payment records.
* Implement reports and settings.

## Phase 6: WhatsApp and payments

* Implement WhatsApp click-to-chat.
* Implement COD/manual payment workflows if approved.
* Integrate an online payment provider only when documentation and credentials are available.
* Test payment failure and duplicate callback scenarios.

## Phase 7: SEO, security, and testing

* Implement metadata and structured data.
* Add sitemap and robots.txt.
* Review authorization and data privacy.
* Run linting, type checking, migrations, and automated tests.
* Fix errors.
* Test mobile responsiveness and essential customer flows.

## Phase 8: Deployment preparation

* Prepare production environment variables.
* Document database migration and backup procedures.
* Document image storage configuration.
* Document owner account setup.
* Prepare deployment instructions.
* Provide a final checklist for client approval.

At the end of each phase:

* Summarize completed work.
* List files and major modules created.
* Report tests actually run and their results.
* Identify blockers and missing credentials.
* Continue to the next phase unless a genuine dependency requires clarification.

---

# 18. PROJECT STRUCTURE

Use a clean modular architecture.

Organize the code into sensible areas such as:

app/
(store)/
admin/
api/
products/
categories/
cart/
checkout/
track-order/

components/
ui/
layout/
products/
cart/
checkout/
admin/
forms/

lib/
auth/
db/
validations/
services/
payments/
inventory/
orders/
whatsapp/
utils/

prisma/
schema.prisma
migrations/

types/
tests/

public/
images/

The exact structure may change to match Next.js conventions and implementation needs.

Keep business logic out of presentation components. Avoid giant files and unnecessary duplication.

Use reusable components and clearly separated service functions.

Do not create empty placeholder files merely to inflate the file count.

---

# 19. ENVIRONMENT VARIABLES

Create a documented .env.example file.

Include only the variables needed by the chosen implementation, such as:

DATABASE_URL
AUTH_SECRET
APP_URL
IMAGE_STORAGE_PROVIDER
IMAGE_STORAGE credentials
PAYMENT_PROVIDER
PAYMENT_PROVIDER credentials
EMAIL_PROVIDER credentials, if email is implemented

Use appropriate names based on the actual libraries and providers selected.

Do not put real secrets in .env.example, source code, documentation, or client-side bundles.

Never invent valid credentials.

---

# 20. IMPORTANT IMPLEMENTATION RULES

1. Build a real, working application, not merely a visual mockup.
2. Do not hardcode product inventory or sales metrics.
3. Do not invent client business policies.
4. Do not expose secrets in frontend code.
5. Do not bypass server-side validation.
6. Do not trust client-submitted prices or payment statuses.
7. Do not allow unauthorized admin operations.
8. Do not create fake payment success.
9. Do not claim a feature is complete unless it has been implemented and verified.
10. Do not replace working project code without inspecting it first.
11. Do not install unnecessary dependencies.
12. Do not generate an excessive number of files without a purpose.
13. Use strict TypeScript and maintainable code.
14. Prefer simple, reliable implementations over unnecessary complexity.
15. Keep the interface responsive and accessible.
16. Use real database data throughout the application.
17. Make all unfinished integrations and assumptions explicit.
18. Never deploy to production, purchase services, or initiate real payments without explicit authorization.

If information is missing, make a safe, reversible development assumption, document it, and continue. Ask me only when a missing decision blocks implementation or could cause a consequential business, security, financial, or legal issue.

---

# 21. DEFINITION OF DONE

The project is ready for client review when:

* The application runs locally using documented instructions.
* Database schema and migrations are present.
* Owner account setup is documented.
* Storefront pages work with database-backed products.
* Product search, filtering, and pagination work.
* Product details display accurate data.
* Cart and checkout validate data server-side.
* Orders are stored correctly.
* Inventory updates are transaction-safe.
* Admin can manage products, categories, orders, and stock.
* Payment records work correctly for implemented methods.
* WhatsApp links work.
* Online payment is either verified in test mode or explicitly documented as awaiting credentials and onboarding.
* Customer data is appropriately protected.
* Essential tests have been run and results documented.
* SEO metadata and responsive design are implemented.
* Environment variables and deployment instructions are documented.
* Remaining limitations are listed honestly.

---

# 22. FIRST ACTION

Start by inspecting the current workspace.

Then:

1. Report the existing framework and project structure.
2. Identify what is already implemented.
3. Create a concise implementation plan.
4. Identify any blocking dependencies.
5. Begin Phase 1 immediately.
6. Continue implementing the application phase by phase.

Do not respond with only an explanation or a list of recommendations. Work on the actual project files and build the application.

PROJECT NAME: Trust Computer-Moulvibazar E-commerce
CLIENT: Shiblu Ahmed
DEVELOPMENT COMPANY: Amdads Group
