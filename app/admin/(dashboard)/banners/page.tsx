import React from 'react';
import BannerManagementClient from './BannerManagementClient';
import { requireAuth } from '@/lib/auth';
import { getAdminBannersPageData } from '@/lib/db/admin-service';

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  await requireAuth();
  const banners = await getAdminBannersPageData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Homepage Banner Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Create, schedule, reorder, and activate promotional banners for the storefront hero carousel.
        </p>
      </div>

      <BannerManagementClient initialBanners={banners} />
    </div>
  );
}
