import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import EditProductForm from '@/components/admin/EditProductForm';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getAdminCategories } from '@/lib/categories';

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  let product: any = null;
  let categories: any[] = [];
  let brands: any[] = [];

  try {
    const [fetchedProduct, fetchedCategories, fetchedBrands] = await Promise.all([
      prisma.product.findUnique({
        where: { id: params.id },
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          images: { orderBy: { sortOrder: 'asc' } },
        },
      }),
      getAdminCategories(),
      prisma.brand
        .findMany({
          where: { isActive: true },
          orderBy: { name: 'asc' },
          select: { id: true, name: true },
        })
        .catch((err) => {
          console.warn('Brand fetch warning on edit product page:', err);
          return [];
        }),
    ]);

    product = fetchedProduct;
    categories = fetchedCategories;
    brands = fetchedBrands;
  } catch (error) {
    console.error('Error on edit product page:', error);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-2xs"
            title="Back to Product Inventory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Edit Product
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              SKU: <span className="font-bold text-slate-700">{product.sku}</span> &bull; Slug:{' '}
              <span className="text-slate-600">{product.slug}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-brand hover:border-brand/40 text-xs font-semibold shadow-2xs transition"
          >
            <span>View in Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <EditProductForm
          product={product}
          categories={categories}
          brands={brands}
        />
      </div>
    </div>
  );
}
