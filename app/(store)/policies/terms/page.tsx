import React from 'react';
import { getContentPage } from '@/lib/content';
import PolicyView from '@/components/policies/PolicyView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'শর্তাবলী (Terms & Conditions) | Trust Computer-Moulvibazar',
  description: 'Trust Computer-Moulvibazar থেকে পণ্য ক্রয় এবং সেবা গ্রহণের সাধারণ নিয়ম ও শর্তাবলী।',
};

export default async function TermsPolicyPage() {
  const page = await getContentPage('terms');
  return <PolicyView page={page} />;
}
