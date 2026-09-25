# Trust Computer — Official Brand Identity Guidelines

> **Authority Statement**: This document constitutes the definitive internal reference and visual identity standard for **Trust Computer-Moulvibazar**. All customer websites, admin portals, mobile experiences, progressive web apps (PWA), invoices, receipts, and promotional materials must strictly adhere to the guidelines set forth herein.

---

## 1. Official Brand Asset & Logo Anatomy

The official Trust Computer logo is the authoritative, immutable brand asset for Trust Computer-Moulvibazar.

```
       [  CIRCULAR LOGO MARK  ]      TRUST       (Red)
   (Blue Ring with Red Power Accent)  COMPUTER    (Blue)
```

### Components:
1. **Circular / Abstract Logo Mark**:
   - Outer Power / Connection Ring: **Primary Blue (`#2A3B97`)**
   - Inner Angled Power Slash: **Primary Red (`#E91D26`)**
2. **Wordmark**:
   - **`TRUST`**: Set in bold modern geometric sans-serif in **Primary Red (`#E91D26`)**
   - **`COMPUTER`**: Positioned directly below "TRUST" in **Primary Blue (`#2A3B97`)**

---

## 2. Exact Brand Color Palette

The brand palette is sampled directly from the dominant solid pixels of the official uploaded asset (`media_1790234960095.jpg`).

| Semantic Role | Color Name | HEX Code | RGB Values | HSL Values | Usage & Application |
|---|---|---|---|---|---|
| **Primary Brand Color** | Trust Blue | **`#2A3B97`** | `rgb(42, 59, 151)` | `hsl(231°, 57%, 38%)` | Primary buttons, links, header accents, active navigation, product highlights |
| **Brand Accent Color** | Trust Red | **`#E91D26`** | `rgb(233, 29, 38)` | `hsl(357°, 82%, 51%)` | Promotional badges, sale indicators, limited offers, callouts, notifications |
| **Neutral White** | Pure White | **`#FFFFFF`** | `rgb(255, 255, 255)` | `hsl(0°, 0%, 100%)` | Content card surfaces, body background, high-contrast button labels |
| **Surface Background** | Slate White | **`#F8FAFC`** | `rgb(248, 250, 252)` | `hsl(210°, 40%, 98%)` | Page background, alternating table rows, card backings |
| **Primary Text** | Slate Dark | **`#0F172A`** | `rgb(15, 23, 42)` | `hsl(222°, 47%, 11%)` | Primary headings, body text, readable descriptions |
| **Muted Text** | Slate Muted | **`#64748B`** | `rgb(100, 116, 139)` | `hsl(215°, 16%, 47%)` | Meta labels, subtitles, timestamps, breadcrumbs |
| **Border / Divider** | Slate Border | **`#E2E8F0`** | `rgb(226, 232, 240)` | `hsl(214°, 32%, 91%)` | Card borders, table dividers, input borders |

### Centralized CSS Variables (`:root`)
```css
:root {
  --brand-blue: #2A3B97;
  --brand-blue-hover: #212F7A;
  --brand-blue-light: #EEF2FF;
  --brand-red: #E91D26;
  --brand-red-hover: #C5141C;
  --brand-red-light: #FEF2F2;
  --background: #F8FAFC;
  --foreground: #0F172A;
  --muted: #64748B;
  --border: #E2E8F0;
}
```

---

## 3. Brand Asset Catalog (`/public/brand/`)

All approved brand graphics are located under `/public/brand/`:

| File Path | Description | Recommended Usage |
|---|---|---|
| `/brand/trust-computer-logo.png` | Full primary logo with transparent background (1024×215 px) | Desktop header, footer, auth screens, invoices, reports |
| `/brand/trust-computer-logo-dark.png` | Full primary logo on solid dark background | Dark theme hero banners, dark marketing collateral |
| `/brand/trust-computer-logo-original.jpg` | Bit-for-bit master archive of uploaded source | Master reference archive |
| `/brand/trust-computer-logo-mark.png` | Circular symbol mark only (215×215 px) | Mobile compact header, navbar badges, avatar stamps |
| `/brand/favicon.png` | Standard 32×32 px favicon | Browser tab icon |
| `/brand/favicon-48.png` | High-res 48×48 px favicon | Browser bookmark bar, Windows shortcuts |
| `/brand/apple-touch-icon.png` | 180×180 px iOS home screen icon | Apple iOS Safari bookmark / home screen |
| `/brand/icon-192.png` | 192×192 px PWA icon | Android home screen, PWA splash |
| `/brand/icon-512.png` | 512×512 px PWA icon | Progressive Web App store icon, high-density splash |

---

## 4. Color Usage & Ratio Rules (60 - 30 - 10 Principle)

Do **not** flood every interface surface with red and blue. The visual presentation must evoke a high-end, clean technology retailer:

1. **60% Whites & Light Neutrals (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`)**:
   - Dominates backgrounds, product grids, cards, modals, and readable areas.
2. **30% Trust Blue (`#2A3B97`) & Dark Slate (`#0F172A`)**:
   - Navigation bars, primary CTAs, links, search triggers, category tabs, and headers.
3. **10% Trust Red (`#E91D26`)**:
   - Reserved strictly for urgency, flash deals, sale discounts, stock alerts, and promotional accents. Red must remain scarce so actions retain visual punch.

---

## 5. UI Component System

### 5.1 Button System
* **Primary Button**:
  - Background: `bg-[#2A3B97]` (`hover:bg-[#212F7A]`)
  - Text: `text-white font-bold`
  - Usage: *Add to Cart, Checkout, Continue, Save, Confirm*
* **Accent / Promotional Button**:
  - Background: `bg-[#E91D26]` (`hover:bg-[#C5141C]`)
  - Text: `text-white font-bold`
  - Usage: *Special Offer, Flash Sale, Grab Deal*
* **Secondary / Outline Button**:
  - Background: `bg-white hover:bg-slate-50 border border-slate-200`
  - Text: `text-slate-700 hover:text-[#2A3B97]`
  - Usage: *Filter, Cancel, View Details, Back*

### 5.2 Badge System
* **Promotional Badges**:
  - `SALE`, `OFFER`, `HOT DEAL`, `LIMITED STOCK`:
  - Style: `bg-red-50 text-[#E91D26] border border-red-200 font-extrabold`
* **Informational & Feature Badges**:
  - `NEW`, `FEATURED`, `OFFICIAL WARRANTY`, `IN STOCK`:
  - Style: `bg-blue-50 text-[#2A3B97] border border-blue-200 font-bold`
* **Status Badges**:
  - Standard neutral or semantic colors (e.g. `DELIVERED`: emerald, `PENDING`: amber).

### 5.3 Links
* Default text links must use `text-[#2A3B97]` (`hover:underline`).
* Secondary navigation links use `text-slate-600` (`hover:text-[#2A3B97]`).

---

## 6. Implementation Across All Platform Touchpoints

1. **Customer Desktop Header**:
   - Prominently displays the full `/brand/trust-computer-logo.png` (height: 38-44px).
   - Never replaced with plain text.
2. **Customer Mobile Header**:
   - Displays `/brand/trust-computer-logo.png` or compact `/brand/trust-computer-logo-mark.png`.
3. **Customer Footer**:
   - Official full logo with business credentials:
     - **Proprietor**: Shiblu Ahmed
     - **Address**: T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh
     - **Hotline**: 01753-765372 | **Email**: trustcomputermb@gmail.com
4. **Authentication Pages (Customer & Admin)**:
   - Login, registration, password reset, and admin authentication screens feature `/brand/trust-computer-logo.png`.
5. **Admin Portal**:
   - Admin sidebar and header feature `/brand/trust-computer-logo.png`.
   - Admin settings page at `/admin/settings/branding` for asset verification.
6. **Invoices & Receipts**:
   - Printable order invoice at `/admin/orders/[id]/invoice` featuring official logo header, barcodes, and company details.
7. **PWA (Progressive Web App)**:
   - Configured via `app/manifest.ts` with `#2A3B97` theme color and official `/brand/icon-192.png` and `/brand/icon-512.png`.

---

## 7. Absolute Prohibitions (Never Do These)

* ❌ **Never** redesign, redraw, or recreate the official logo mark or typography.
* ❌ **Never** stretch, squash, shear, rotate, or distort the logo aspect ratio.
* ❌ **Never** replace the official logo with arbitrary text like `<h1>Trust Computer</h1>`.
* ❌ **Never** change Trust Blue (`#2A3B97`) to generic light blues or cyan.
* ❌ **Never** change Trust Red (`#E91D26`) to orange, magenta, or pink.
* ❌ **Never** add dropshadows, bevels, outlines, or glow filters to the logo image.
* ❌ **Never** place the logo on busy, low-contrast photographic backgrounds without a clean container.
* ❌ **Never** create an AI-generated icon or generic computer clip art to represent the company.

---

## 8. Accessibility & Dark Mode Standards

* **Contrast Ratios**: Trust Blue (`#2A3B97`) on White achieves a contrast ratio of **7.5:1** (exceeding WCAG AAA). Trust Red (`#E91D26`) on White achieves **4.5:1** for bold/large text. For small body text, dark neutral (`#0F172A`) must be used for maximum readability.
* **Dark Mode**: The official logo is not inverted or recolored. On dark backgrounds, use `/brand/trust-computer-logo.png` or `/brand/trust-computer-logo-dark.png` with original colors intact.
