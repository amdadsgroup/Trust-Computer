import React from 'react';
import { getContentPage } from '@/lib/content';
import PolicyView from '@/components/policies/PolicyView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ওয়ারেন্টি নীতিমালা (Warranty Policy) | Trust Computer-Moulvibazar',
  description: 'Trust Computer-Moulvibazar এর পণ্য ওয়ারেন্টি ও বিক্রয়োত্তর সেবার নীতিমালা।',
};

export default async function WarrantyPolicyPage() {
  const page = await getContentPage('warranty');
  return <PolicyView page={page} />;
}
