import React from 'react';
import { getHomepageSections } from '@/lib/homepage';
import { requireAuth } from '@/lib/auth';
import HomepageControlClient from './HomepageControlClient';

export const dynamic = 'force-dynamic';

export default async function AdminHomepageControlPage() {
  await requireAuth();
  const sections = await getHomepageSections();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Homepage Layout & Section Control
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize section visibility, display titles, and layout ordering without touching code.
        </p>
      </div>

      <HomepageControlClient initialSections={sections} />
    </div>
  );
}
