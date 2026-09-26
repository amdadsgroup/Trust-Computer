import React from 'react';
import { getContentPage } from '@/lib/content';
import PolicyView from '@/components/policies/PolicyView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Return & Refund Policy | Trust Computer-Moulvibazar',
  description: 'Official return, replacement, and refund policy of Trust Computer-Moulvibazar.',
};

export default async function ReturnPolicyPage() {
  const page = await getContentPage('returns');
  return <PolicyView page={page} />;
}
