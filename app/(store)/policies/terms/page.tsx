import React from 'react';
import { getContentPage } from '@/lib/content';
import PolicyView from '@/components/policies/PolicyView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terms & Conditions | Trust Computer-Moulvibazar',
  description: 'Terms and conditions for purchasing products and services from Trust Computer-Moulvibazar.',
};

export default async function TermsPolicyPage() {
  const page = await getContentPage('terms');
  return <PolicyView page={page} />;
}
