import React from 'react';
import { getContentPage } from '@/lib/content';
import PolicyView from '@/components/policies/PolicyView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'প্রাইভেসি পলিসি (Privacy Policy) | Trust Computer-Moulvibazar',
  description: 'Trust Computer-Moulvibazar এর গ্রাহক তথ্যের গোপনীয়তা রক্ষা সংক্রান্ত নীতিমালা।',
};

export default async function PrivacyPolicyPage() {
  const page = await getContentPage('privacy');
  return <PolicyView page={page} />;
}
