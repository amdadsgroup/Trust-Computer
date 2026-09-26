import React from 'react';
import { getContentPage } from '@/lib/content';
import PolicyView from '@/components/policies/PolicyView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Privacy Policy | Trust Computer-Moulvibazar',
  description: 'Official customer privacy and data protection policy of Trust Computer-Moulvibazar.',
};

export default async function PrivacyPolicyPage() {
  const page = await getContentPage('privacy');
  return <PolicyView page={page} />;
}
