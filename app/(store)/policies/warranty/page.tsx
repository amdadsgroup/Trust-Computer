import React from 'react';
import { getContentPage } from '@/lib/content';
import PolicyView from '@/components/policies/PolicyView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Warranty Policy | Trust Computer-Moulvibazar',
  description: 'Official warranty and after-sales service policy of Trust Computer-Moulvibazar.',
};

export default async function WarrantyPolicyPage() {
  const page = await getContentPage('warranty');
  return <PolicyView page={page} />;
}
