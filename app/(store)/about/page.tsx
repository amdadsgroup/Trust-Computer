import React from 'react';
import AboutPageClient from '@/components/about/AboutPageClient';

export const metadata = {
  title: 'About Us | Trust Computer-Moulvibazar',
  description:
    'Trust Computer-Moulvibazar: Your trusted technology partner for genuine computers, laptops, and CCTV security systems at Kusumbagh, Moulvibazar, Bangladesh.',
  alternates: {
    canonical: 'https://trustcomputermb.com/about',
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
