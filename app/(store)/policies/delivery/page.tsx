import React from 'react';
import { getContentPage } from '@/lib/content';
import PolicyView from '@/components/policies/PolicyView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Delivery Policy | Trust Computer-Moulvibazar',
  description: 'Official delivery policy, shipping timelines and courier charges of Trust Computer-Moulvibazar.',
};

export default async function DeliveryPolicyPage() {
  const page = await getContentPage('delivery');
  return <PolicyView page={page} />;
}
