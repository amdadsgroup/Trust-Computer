import { business } from './business';

const BASE_URL = process.env.APP_URL || business.productionUrl;

/**
 * Trust Computer-Moulvibazar
 * Authoritative Schema.org Structured Data
 *
 * Adheres strictly to Google Local SEO guidelines:
 * - Real, verified business NAP (Name, Address, Phone)
 * - Real geo-coordinates for Kusumbagh, Moulvibazar
 * - Opening hours: Sat - Thu (10:00 AM - 9:00 PM), Friday closed
 * - No fake branches, no personal names, no invented data
 */

export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ComputerStore',
    '@id': `${BASE_URL}/#store`,
    name: business.officialFullName,
    alternateName: [
      business.name,
      'Trust Computer Moulvibazar',
      'Trust Computer Kusumbagh',
    ],
    url: BASE_URL,
    logo: `${BASE_URL}/brand/trust-computer-logo.png`,
    image: [
      `${BASE_URL}/brand/trust-computer-logo.png`,
      `${BASE_URL}/images/hero-banner-1.jpg`,
      `${BASE_URL}/images/hero-banner-2.jpg`,
    ],
    description:
      'Trust Computer-Moulvibazar is the trusted computer showroom, laptop shop, and CCTV security camera solution center in Moulvibazar. Located at T.S Plaza (2nd Floor), Kusumbagh Point.',
    telephone: business.sales.phoneIntl,
    email: business.email,
    priceRange: '৳৳',
    paymentAccepted: ['Cash', 'bKash', 'Bank Transfer'],
    currenciesAccepted: 'BDT',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'T.S Plaza (2nd Floor), Kusumbagh',
      addressLocality: 'Moulvibazar',
      addressRegion: 'Sylhet Division',
      postalCode: business.postalCode,
      addressCountry: 'BD',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    },
    hasMap: business.googleMapsUrl,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Saturday',
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
        ],
        opens: '10:00',
        closes: '21:00',
      },
    ],
    areaServed: business.serviceAreas.map((area) => ({
      '@type': 'AdministrativeArea',
      name: area,
    })),
    sameAs: [business.facebookUrl],
    department: [
      {
        '@type': 'ComputerStore',
        name: 'Trust Computer Sales & Showroom',
        telephone: business.sales.phoneIntl,
        image: `${BASE_URL}/brand/trust-computer-logo.png`,
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${BASE_URL}/#technical-service`,
        name: 'Trust Computer Technical Service & CCTV Installation',
        telephone: business.service.phoneIntl,
      },
    ],
  };
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: business.officialFullName,
    alternateName: business.name,
    url: BASE_URL,
    logo: `${BASE_URL}/brand/trust-computer-logo.png`,
    email: business.email,
    sameAs: [business.facebookUrl],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: business.sales.phoneIntl,
        contactType: 'sales',
        areaServed: 'BD',
        availableLanguage: ['Bengali', 'English'],
      },
      {
        '@type': 'ContactPoint',
        telephone: business.service.phoneIntl,
        contactType: 'technical support',
        areaServed: 'BD',
        availableLanguage: ['Bengali', 'English'],
      },
    ],
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: business.officialFullName,
    alternateName: 'Trust Computer Moulvibazar',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
