/**
 * Trust Computer - Centralized Brand Configuration
 * Single Source of Truth for Visual Identity & Brand Assets
 * 
 * Generated and validated from the official primary brand asset:
 * C:\Users\NEED ELECTRO\.gemini\antigravity-ide\brain\...\media_1790234960095.jpg
 */

export const brand = {
  name: 'Trust Computer',
  shortName: 'Trust Computer',
  officialFullName: 'Trust Computer-Moulvibazar',
  tagline: 'মানসম্মত কম্পিউটার ও সিসি ক্যামেরা জগতে মৌলভীবাজারের একটি বিশ্বস্ত প্রতিষ্ঠান।❤️',
  owner: 'Trust Computer',
  phone: '01753-765372',
  email: 'trustcomputermb@gmail.com',
  address: 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh',
  facebook: 'https://www.facebook.com/TrustComputerr/',
  whatsapp: '+8801753765372',

  // Official Brand Assets
  assets: {
    // Primary Full Logo (Desktop header, footer, auth, invoices, marketing)
    logo: '/brand/trust-computer-logo.png',
    // Full Logo on Dark Background
    logoDark: '/brand/trust-computer-logo-dark.png',
    // Original unmodified asset
    logoOriginal: '/brand/trust-computer-logo-original.jpg',
    // Circular Symbol Logo Mark (Favicon, app icon, compact mobile header)
    logoMark: '/brand/trust-computer-logo-mark.png',
    // Favicons & Touch Icons
    favicon: '/brand/favicon.png',
    favicon48: '/brand/favicon-48.png',
    appleTouchIcon: '/brand/apple-touch-icon.png',
    icon192: '/brand/icon-192.png',
    icon512: '/brand/icon-512.png',
  },

  // Authoritative Brand Colors (Exact Hex values sampled directly from official logo)
  colors: {
    // Primary Brand Color (Sampled from "COMPUTER" and outer circular mark)
    primaryBlue: '#2A3B97',
    primaryBlueRgb: 'rgb(42, 59, 151)',
    primaryBlueHover: '#212F7A',
    primaryBlueLight: '#EEF2FF',

    // Brand Accent Color (Sampled from "TRUST" and inner circular power slash)
    primaryRed: '#E91D26',
    primaryRedRgb: 'rgb(233, 29, 38)',
    primaryRedHover: '#C5141C',
    primaryRedLight: '#FEF2F2',

    // Backgrounds & Neutrals
    white: '#FFFFFF',
    background: '#F8FAFC',
    foreground: '#0F172A',
    muted: '#64748B',
    border: '#E2E8F0',
    card: '#FFFFFF',

    // Semantic Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#E91D26',
    info: '#2A3B97',
  },

  // Typography Rules
  typography: {
    fontFamilySans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
} as const;

export type BrandConfig = typeof brand;
