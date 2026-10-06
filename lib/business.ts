/**
 * Trust Computer-Moulvibazar
 * Centralized Business Contact & Configuration
 * SINGLE SOURCE OF TRUTH for all business, sales, service, and payment contacts.
 * 
 * Official Production Domain: https://trustcomputermb.com/
 */

export const business = {
  name: 'Trust Computer',
  shortName: 'Trust Computer',
  officialFullName: 'Trust Computer-Moulvibazar',
  taglineText: 'Your Trust, Our Technology',
  taglineTextBn: 'আপনার আস্থা, আমাদের প্রযুক্তি',
  tagline: '- Your Trust, Our Technology -',
  taglineBn: '- আপনার আস্থা, আমাদের প্রযুক্তি -',
  taglineDescription: 'মানসম্মত কম্পিউটার ও সিসি ক্যামেরা জগতে মৌলভীবাজারের একটি বিশ্বস্ত প্রতিষ্ঠান।❤️',
  
  productionUrl: 'https://trustcomputermb.com',
  address: 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh',
  addressBn: 'টি.এস প্লাজা (২য় তলা), কুসুমবাগ, মৌলভীবাজার, বাংলাদেশ',
  postalCode: '3200',
  city: 'Moulvibazar',
  division: 'Sylhet',
  country: 'Bangladesh',
  geo: {
    latitude: 24.4829,
    longitude: 91.7649,
  },
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Trust+Computer+T.S+Plaza+Kusumbagh+Moulvibazar',
  googleMapsEmbedUrl: 'https://maps.google.com/maps?q=T.S%20Plaza%20Kusumbagh%20Moulvibazar&t=&z=16&ie=UTF8&iwloc=&output=embed',
  googleReviewUrl: 'https://www.google.com/maps/search/?api=1&query=Trust+Computer+T.S+Plaza+Kusumbagh+Moulvibazar',
  serviceAreas: [
    'Moulvibazar',
    'Moulvibazar Sadar',
    'Sreemangal',
    'Kulaura',
    'Rajnagar',
    'Kamalganj',
    'Juri',
    'Barlekha',
  ],
  email: 'trustcomputermb@gmail.com',
  facebookUrl: 'https://www.facebook.com/TrustComputerr/',

  // 1. SALES & CUSTOMER CARE
  sales: {
    phone: '01797854836',
    phoneFormatted: '01797-854836',
    phoneIntl: '+880 1797-854836',
    tel: 'tel:01797854836',
    whatsapp: '8801797854836',
    whatsappUrl: 'https://wa.me/8801797854836',
    title: 'Sales & Customer Care',
    titleBn: 'সেলস ও কাস্টমার কেয়ার',
    description: 'Product sales, enquiries, customer care & order assistance',
  },

  // 2. SERVICE & TECHNICAL SUPPORT
  service: {
    phone: '01608346407',
    phoneFormatted: '01608-346407',
    phoneIntl: '+880 1608-346407',
    tel: 'tel:01608346407',
    whatsapp: '8801608346407',
    whatsappUrl: 'https://wa.me/8801608346407',
    title: 'Service & Technical Support',
    titleBn: 'সার্ভিস ও টেকনিক্যাল সাপোর্ট',
    description: 'Computer servicing, CCTV setup, repair & technical maintenance',
  },

  // 3. bKASH PAYMENT / CASH OUT
  payment: {
    bkash: '01712556225',
    bkashNumber: '01712556225',
    bkashFormatted: '01712-556225',
    method: 'bKash',
    displayName: 'bKash Cash Out',
    title: 'bKash Cash Out',
    titleBn: 'বিকাশ ক্যাশ আউট',
    description: 'Manual bKash payment verification for web orders',
  },

  showroomHours: {
    en: 'Sat - Thu: 10:00 AM - 9:00 PM (Friday Closed)',
    bn: 'শনিবার - বৃহস্পতিবার: সকাল ১০:০০ টা - রাত ৯:০০ টা (শুক্রবার বন্ধ)',
  },

  management: 'Trust Computer-Moulvibazar Management',
  developer: 'Amdads Group',
  developerUrl: 'https://amdadsgroup.netlify.app/',
} as const;

export type BusinessConfig = typeof business;

// ============================================================
// WHATSAPP URL GENERATION HELPERS
// ============================================================

/**
 * General Sales & Customer Care WhatsApp link
 */
export function getSalesWhatsAppLink(customMessage?: string, isBangla = false): string {
  const defaultText = isBangla
    ? `আসসালামু আলাইকুম, Trust Computer Moulvibazar-এ যোগাযোগ করতে চাচ্ছি।`
    : `Hello Trust Computer Moulvibazar, I would like to get more information about your products and services.`;
  const text = customMessage || defaultText;
  return `https://wa.me/${business.sales.whatsapp}?text=${encodeURIComponent(text)}`;
}

/**
 * Service & Technical Support WhatsApp link
 */
export function getServiceWhatsAppLink(customMessage?: string, isBangla = false): string {
  const defaultText = isBangla
    ? `আসসালামু আলাইকুম Trust Computer, আমার কম্পিউটার / সিসিটিভি সার্ভিসিং সংক্রান্ত সহায়তা প্রয়োজন।`
    : `Hello Trust Computer, I need technical service assistance for my computer / CCTV.`;
  const text = customMessage || defaultText;
  return `https://wa.me/${business.service.whatsapp}?text=${encodeURIComponent(text)}`;
}

/**
 * Product-specific Sales WhatsApp link with product details
 */
export function getProductSalesWhatsAppLink(product: {
  name: string;
  sku: string;
  price: number;
  slug: string;
  baseUrl?: string;
  isBangla?: boolean;
}): string {
  const host = product.baseUrl || business.productionUrl;
  const url = `${host}/products/${product.slug}`;
  const text = product.isBangla
    ? `আসসালামু আলাইকুম Trust Computer,\nআমি এই পণ্যটি অর্ডার / জানতে আগ্রহী:\n- পণ্য: ${product.name}\n- SKU: ${product.sku}\n- মূল্য: ৳${product.price.toLocaleString('en-BD')}\n- লিংক: ${url}`
    : `Hello Trust Computer Moulvibazar,\nI am interested in purchasing this product:\n- Product: ${product.name}\n- SKU: ${product.sku}\n- Price: ৳${product.price.toLocaleString('en-BD')}\n- Link: ${url}`;
  return `https://wa.me/${business.sales.whatsapp}?text=${encodeURIComponent(text)}`;
}

/**
 * Order status inquiry WhatsApp link
 */
export function getOrderWhatsAppLink(
  order: {
    orderNumber: string;
    total: number;
  },
  isBangla = false
): string {
  const text = isBangla
    ? `আসসালামু আলাইকুম Trust Computer,\nআমার অর্ডার সম্পর্কিত তথ্য জানতে চাচ্ছি:\n- অর্ডার নং: ${order.orderNumber}\n- সর্বমোট: ৳${order.total.toLocaleString('en-BD')}`
    : `Hello Trust Computer Moulvibazar,\nI would like to track/inquire about my order:\n- Order #: ${order.orderNumber}\n- Total: ৳${order.total.toLocaleString('en-BD')}`;
  return `https://wa.me/${business.sales.whatsapp}?text=${encodeURIComponent(text)}`;
}

/**
 * Cart inquiry WhatsApp link
 */
export function getCartWhatsAppLink(
  items: Array<{ name: string; quantity: number }>,
  total: number,
  isBangla = false
): string {
  const itemsText = items.map((i) => `• ${i.name} (x${i.quantity})`).join('\n');
  const text = isBangla
    ? `আসসালামু আলাইকুম Trust Computer,\nআমি নিম্নলিখিত পণ্যগুলো অর্ডার করতে চাচ্ছি:\n${itemsText}\nআনুমানিক সর্বমোট: ৳${total.toLocaleString('en-BD')}`
    : `Hello Trust Computer Moulvibazar,\nI would like to inquire about ordering these items:\n${itemsText}\nEstimated Subtotal: ৳${total.toLocaleString('en-BD')}`;
  return `https://wa.me/${business.sales.whatsapp}?text=${encodeURIComponent(text)}`;
}

/**
 * Standardizes tagline with exactly ONE hyphen on each side: - TAGLINE -
 */
export function formatTagline(rawText?: string): string {
  const base = (rawText || business.taglineText || 'Your Trust, Our Technology').trim();
  // Strip any accidental leading or trailing hyphens, en-dashes, em-dashes, or quotes
  const cleaned = base.replace(/^[\s\-—–“"'`]+|[\s\-—–”"'`]+$/g, '').trim();
  return `- ${cleaned} -`;
}
