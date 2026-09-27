import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { submitStockAdjustmentAction } from './actions';
import {
  Boxes,
  PlusCircle,
  ArrowDownRight,
  ArrowUpRight,
  History,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import InventoryProductSelector from './InventoryProductSelector';

export const dynamic = 'force-dynamic';

interface AdminInventoryPageProps {
  searchParams: {
    productId?: string;
    page?: string;
    search?: string;
    type?: string;
  };
}

const MOVEMENTS_PER_PAGE = 30;

export default async function AdminInventoryPage({ searchParams }: AdminInventoryPageProps) {
  const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10));
  const typeFilter = searchParams.type || '';
  const searchFilter = searchParams.search?.trim() || '';

  const movementsWhere: any = {};
  if (typeFilter) movementsWhere.type = typeFilter;
  if (searchFilter) {
    movementsWhere.product = {
      OR: [
        { name: { contains: searchFilter, mode: 'insensitive' } },
        { sku: { contains: searchFilter, mode: 'insensitive' } },
      ],
    };
  }

  let movements: any[] = [];
  let totalMovements = 0;

  try {
    const [fetchedMovements, movementsCount] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where: movementsWhere,
        orderBy: { createdAt: 'desc' },
        take: MOVEMENTS_PER_PAGE,
        skip: (currentPage - 1) * MOVEMENTS_PER_PAGE,
        select: {
          id: true,
          type: true,
          quantity: true,
          previousStock: true,
          newStock: true,
          reason: true,
          referenceId: true,
          createdAt: true,
          product: { select: { name: true, sku: true } },
          user: { select: { name: true } },
        },
      }),
      prisma.inventoryMovement.count({ where: movementsWhere }),
    ]);

    movements = fetchedMovements;
    totalMovements = movementsCount;
  } catch (e) {
    console.error('Error fetching inventory page data:', e);
  }

  const totalMovementPages = Math.ceil(totalMovements / MOVEMENTS_PER_PAGE);

  const buildPaginationUrl = (p: number) => {
    const params = new URLSearchParams();
    params.set('page', String(p));
    if (typeFilter) params.set('type', typeFilter);
    if (searchFilter) params.set('search', searchFilter);
    if (searchParams.productId) params.set('productId', searchParams.productId);
    return `/admin/inventory?${params.toString()}`;
  };

  const movementTypes = ['INITIAL', 'RECEIVE', 'SALE', 'RETURN', 'ADJUSTMENT', 'RESERVATION_RELEASE'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Inventory &amp; Stock Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete audit trail of stock receipts, adjustments, order sales, and returns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stock Adjustment Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-brand" />
            <span>Stock Adjustment &amp; Receiving</span>
          </h2>

          <form
            action={async (formData: FormData) => {
              'use server';
              await submitStockAdjustmentAction(formData);
            }}
            className="space-y-4 text-xs sm:text-sm"
          >
            {/* Searchable product selector (client component) */}
            <InventoryProductSelector defaultProductId={searchParams.productId || ''} />

            <div>
              <label className="block font-bold text-slate-700 mb-1">Adjustment Type *</label>
              <select
                name="type"
                required
                defaultValue="RECEIVE"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand cursor-pointer text-xs"
              >
                <option value="RECEIVE">RECEIVE (New stock arrival / purchase)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (Audit count correction)</option>
                <option value="RETURN">RETURN (Customer return / restock)</option>
                <option value="INITIAL">INITIAL (Initial inventory setup)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Quantity Change *
              </label>
              <input
                type="number"
                name="quantity"
                required
                placeholder="e.g. 10 (to add) or -2 (to reduce)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Enter a positive number to add stock, or a negative number (-) to reduce stock.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason / Voucher Note *</label>
              <input
                type="text"
                name="reason"
                required
                placeholder="e.g. Invoice #HIK-5012 received or damaged in transit"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Reference ID / Invoice # (Optional)
              </label>
              <input
                type="text"
                name="referenceId"
                placeholder="INV-9921"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl transition shadow text-xs"
            >
              Record in Stock Ledger
            </button>
          </form>
        </div>

        {/* Right Column: Ledger Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-brand" />
              <span>Stock Movement History</span>
              <span className="text-xs font-normal text-slate-400">({totalMovements} records)</span>
            </h2>
          </div>

          {/* Filters */}
          <form method="GET" action="/admin/inventory" className="flex flex-col sm:flex-row gap-2">
            {searchParams.productId && (
              <input type="hidden" name="productId" value={searchParams.productId} />
            )}
            <div className="relative flex-1">
              <input
                type="text"
                name="search"
                defaultValue={searchFilter}
                placeholder="Search by product name or SKU..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs outline-none focus:border-brand"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <select
              name="type"
              defaultValue={typeFilter}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand cursor-pointer"
            >
              <option value="">All Types</option>
              {movementTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Filter
            </button>
            {(searchFilter || typeFilter) && (
              <Link
                href="/admin/inventory"
                className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-xs font-semibold rounded-xl transition hover:bg-slate-50 text-center"
              >
                Clear
              </Link>
            )}
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 font-semibold">
                  <th className="pb-2.5">Date &amp; Time</th>
                  <th className="pb-2.5">Product</th>
                  <th className="pb-2.5">Type</th>
                  <th className="pb-2.5">Change</th>
                  <th className="pb-2.5">New Balance</th>
                  <th className="pb-2.5">Reason / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.length > 0 ? (
                  movements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-3 text-[10px] text-slate-400 font-mono">
                          {new Date(m.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3">
                          <span className="font-bold text-slate-800 block line-clamp-1">
                            {m.product.name}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            SKU: {m.product.sku}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                            {m.type}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`font-black flex items-center gap-0.5 ${
                              isPositive ? 'text-emerald-600' : 'text-accent-600'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            <span>{isPositive ? `+${m.quantity}` : m.quantity}</span>
                          </span>
                        </td>
                        <td className="py-3 font-bold text-slate-900">{m.newStock}</td>
                        <td className="py-3 text-[11px] text-slate-600">
                          <div>{m.reason}</div>
                          {m.referenceId && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ref: {m.referenceId}
                            </span>
                          )}
                          {m.user?.name && (
                            <span className="text-[10px] text-slate-400 block">
                              By: {m.user.name}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No stock movement records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalMovementPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>
                Page {currentPage} of {totalMovementPages} ({totalMovements} records)
              </span>
              <div className="flex items-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={buildPaginationUrl(currentPage - 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center gap-1 transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 flex items-center gap-1 cursor-not-allowed">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </span>
                )}
                {currentPage < totalMovementPages ? (
                  <Link
                    href={buildPaginationUrl(currentPage + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center gap-1 transition"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 flex items-center gap-1 cursor-not-allowed">
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
