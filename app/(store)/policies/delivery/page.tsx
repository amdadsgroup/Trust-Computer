import React from 'react';
import { getContentPage } from '@/lib/content';
import PolicyView from '@/components/policies/PolicyView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ডেলিভারি নীতিমালা (Delivery Policy) | Trust Computer-Moulvibazar',
  description: 'Trust Computer-Moulvibazar এর অফিসিয়াল ডেলিভারি নীতিমালা ও চার্জ সংক্রান্ত তথ্যাবলী।',
};

export default async function DeliveryPolicyPage() {
  const page = await getContentPage('delivery');
  return <PolicyView page={page} />;
}
