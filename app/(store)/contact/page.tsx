import React from 'react';
import type { Metadata } from 'next';
import ContactPageClient from '@/components/contact/ContactPageClient';
import { getLocalBusinessSchema, getBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Contact Us & Showroom Location | Trust Computer-Moulvibazar',
  description:
    'Trust Computer-Moulvibazar - T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar. Sales: 01797854836, Service: 01608346407. Genuine Computers, Laptops & CCTV Surveillance Solutions.',
  alternates: {
    canonical: 'https://trustcomputermb.com/contact',
  },
  openGraph: {
    title: 'Contact Trust Computer-Moulvibazar | Showroom & Service Center',
    description:
      'Visit our Kusumbagh showroom or contact our dedicated Sales & Service hotlines. T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar.',
  },
};

export default function ContactPage() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Contact & Showroom', url: '/contact' },
  ];

  return (
    <>
      <JsonLd data={[getLocalBusinessSchema(), getBreadcrumbSchema(breadcrumbs)]} />
      <ContactPageClient />
    </>
  );
}
