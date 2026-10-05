'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';

interface PaymentFiltersProps {
  currentSearch?: string;
  currentMethod?: string;
  currentStatus?: string;
}

export default function PaymentFilters({
  currentSearch = '',
  currentMethod = 'ALL',
  currentStatus = 'ALL',
}: PaymentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch);
  const [method, setMethod] = useState(currentMethod);
  const [status, setStatus] = useState(currentStatus);

  const applyFilters = (newSearch: string, newMethod: string, newStatus: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (newSearch.trim()) {
      params.set('q', newSearch.trim());
    } else {
      params.delete('q');
    }

    if (newMethod && newMethod !== 'ALL') {
      params.set('method', newMethod);
    } else {
      params.delete('method');
    }

    if (newStatus && newStatus !== 'ALL') {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }

    params.set('page', '1');

    startTransition(() => {
      router.push(`/admin/payments?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, method, status);
  };

  const handleReset = () => {
    setSearch('');
    setMethod('ALL');
    setStatus('ALL');
    startTransition(() => {
      router.push('/admin/payments');
    });
  };

  const hasActiveFilters = Boolean(search.trim() || method !== 'ALL' || status !== 'ALL');

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            placeholder="Search Order #, Transaction ID, Customer, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-brand focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Method Filter */}
        <div className="sm:col-span-3">
          <select
            value={method}
            onChange={(e) => {
              const val = e.target.value;
              setMethod(val);
              applyFilters(search, val, status);
            }}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand transition cursor-pointer"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="BKASH">bKash (Mobile)</option>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="NAGAD">Nagad</option>
            <option value="SSLCOMMERZ">SSLCOMMERZ</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={status}
            onChange={(e) => {
              const val = e.target.value;
              setStatus(val);
              applyFilters(search, method, val);
            }}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand transition cursor-pointer"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PENDING">Verification Pending</option>
            <option value="PAID">Verified / Paid</option>
            <option value="FAILED">Rejected / Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </form>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
          <span>Active filters applied</span>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
