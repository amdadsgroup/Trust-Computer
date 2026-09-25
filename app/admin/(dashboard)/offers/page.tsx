import React from 'react';
import { getAllOffersAdmin } from '@/lib/offers';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import OffersManagementClient from '@/components/admin/OffersManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminOffersPage() {
  await requireAuth();

  const [offers, products, categories] = await Promise.all([
    getAllOffersAdmin(),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, sku: true, sellingPrice: true },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
  ]);

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
