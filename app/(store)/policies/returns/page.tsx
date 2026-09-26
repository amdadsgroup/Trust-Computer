import React from 'react';
import { getContentPage } from '@/lib/content';
import PolicyView from '@/components/policies/PolicyView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'রিটার্ন ও রিফান্ড নীতিমালা (Return & Refund Policy) | Trust Computer-Moulvibazar',
  description: 'Trust Computer-Moulvibazar এর রিটার্ন ও মূল্য ফেরত সংক্রান্ত নীতিমালা।',
};

export default async function ReturnPolicyPage() {
  const page = await getContentPage('returns');
  return <PolicyView page={page} />;
}
