import React from 'react';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import CategoriesManagementClient from './CategoriesManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  await requireAuth();

  let categories: any[] = [];
  let brands: any[] = [];

  try {
    const [fetchedCategories, fetchedBrands] = await Promise.all([
      prisma.category.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { products: true } } },
      }),
      prisma.brand.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
    ]);
    categories = fetchedCategories;
    brands = fetchedBrands;
  } catch (error) {
    console.error('Error fetching categories/brands:', error);
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
