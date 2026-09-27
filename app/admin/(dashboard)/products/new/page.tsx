import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import NewProductForm from '@/components/admin/NewProductForm';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  let categories: any[] = [];
  let brands: any[] = [];

  try {
    const [fetchedCategories, fetchedBrands] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      }),
      prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      }),
    ]);
    categories = fetchedCategories;
    brands = fetchedBrands;
  } catch (error) {
    console.error('Error fetching categories/brands on new product page:', error);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Add New Product
          </h1>
          <p className="text-xs text-slate-500">
            Add a new product with specifications, pricing, and initial stock to the catalog.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <NewProductForm categories={categories} brands={brands} />
      </div>
    </div>
  );
}
