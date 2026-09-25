import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Plus, Tag, CheckCircle2, XCircle, Calendar, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const session = await requireAuth().catch(() => null);
  if (!session) redirect('/admin/login');

  let coupons: any[] = [];

  try {
    coupons = await prisma.coupon.findMany({
      include: {
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
  }

  const now = new Date();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Coupon Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create and manage discount coupons for Trust Computer.
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-2 bg-brand hover:bg-brand-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          New Coupon
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Coupons',
            value: coupons.length,
            icon: Tag,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            label: 'Active',
            value: coupons.filter(
              (c) =>
                c.isActive &&
                (!c.endAt || c.endAt > now) &&
                (!c.startAt || c.startAt <= now)
            ).length,
            icon: CheckCircle2,
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            label: 'Expired',
            value: coupons.filter((c) => c.endAt && c.endAt < now).length,
            icon: XCircle,
            color: 'text-rose-600 bg-rose-50',
          },
          {
            label: 'Total Uses',
            value: coupons.reduce((acc, c) => acc + c.usedCount, 0),
            icon: Users,
            color: 'text-amber-600 bg-amber-50',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {coupons.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No coupons yet</p>
            <p className="text-sm mt-1">Create your first coupon to offer discounts to customers.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Value</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Uses</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Validity</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {coupons.map((coupon) => {
                const isExpired = coupon.endAt && coupon.endAt < now;
                const isScheduled = coupon.startAt && coupon.startAt > now;
                const isActive = coupon.isActive && !isExpired && !isScheduled;

                return (
                  <tr key={coupon.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3">
                      <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 capitalize">
                      {coupon.type.toLowerCase().replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-900">
                      {coupon.type === 'PERCENTAGE'
                        ? `${coupon.value}%`
                        : coupon.type === 'FIXED_AMOUNT'
                        ? `৳${Number(coupon.value).toLocaleString('en-BD')}`
                        : 'Free Delivery'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {coupon.usedCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' (unlimited)'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {coupon.startAt || coupon.endAt ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {coupon.startAt
                              ? new Date(coupon.startAt).toLocaleDateString('en-BD')
                              : 'Now'}
                            {' → '}
                            {coupon.endAt
                              ? new Date(coupon.endAt).toLocaleDateString('en-BD')
                              : 'Always'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">No expiry</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          Expired
                        </span>
                      ) : isScheduled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Calendar className="w-3 h-3" />
                          Scheduled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/coupons/${coupon.id}/edit`}
                        className="text-xs text-brand-600 hover:underline font-semibold"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
