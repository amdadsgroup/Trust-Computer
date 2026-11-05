import React from 'react';
import { requireAuth } from '@/lib/auth';
import OffersManagementClient from '@/components/admin/OffersManagementClient';
import { getAdminOffersPageData } from '@/lib/db/admin-service';

export const dynamic = 'force-dynamic';

export default async function AdminOffersPage() {
  await requireAuth();

  const { offers, products, categories } = await getAdminOffersPageData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Homepage Offers & Promotions
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure limited-time promotional deals, badges, and discounts displayed across the storefront.
        </p>
      </div>

      <OffersManagementClient
        initialOffers={offers as any}
        products={products.map((p: any) => ({ ...p, sellingPrice: Number(p.sellingPrice) }))}
        categories={categories}
      />
    </div>
  );
}
