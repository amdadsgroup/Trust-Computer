import React from 'react';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import CategoriesManagementClient from './CategoriesManagementClient';
import { getAdminCategoriesPageData } from '@/lib/db/admin-service';
import { DEFAULT_CATEGORIES } from '@/lib/categories-data';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  await requireAuth();

  let { categories, brands } = await getAdminCategoriesPageData();

  if (!categories || categories.length === 0) {
    categories = DEFAULT_CATEGORIES.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      description: d.description,
      sortOrder: d.sortOrder,
      isActive: true,
      _count: { products: 0 },
    }));
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Category & Brand Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Organize store inventory by creating and managing product categories and brands.
        </p>
      </div>

      <CategoriesManagementClient
        initialCategories={categories}
        initialBrands={brands}
      />
    </div>
  );
}
