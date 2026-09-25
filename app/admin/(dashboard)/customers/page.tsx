import React from 'react';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Users, ShoppingBag, MapPin, Mail, Phone, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const session = await requireAuth().catch(() => null);
  if (!session) redirect('/admin/login');

  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const pageSize = 20;
  const search = searchParams.search?.trim() || '';

  let customers: any[] = [];
  let totalCount = 0;

  try {
    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    [customers, totalCount] = await Promise.all([
      prisma.customerProfile.findMany({
        where,
        include: {
          _count: { select: { orders: true, addresses: true } },
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true, total: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.customerProfile.count({ where }),
    ]);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {totalCount.toLocaleString()} registered customers
          </p>
        </div>
      </div>

      {/* Search */}
      <form className="flex items-center gap-3">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by name, email, or phone..."
          className="flex-1 max-w-md px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand-300"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition"
        >
          Search
        </button>
        {search && (
          <a
            href="/admin/customers"
            className="px-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition"
          >
            Clear
          </a>
        )}
      </form>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">{search ? 'No customers found' : 'No customers yet'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Orders</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">Last Order</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand/10 text-brand-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {customer.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{customer.fullName}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {customer._count.addresses} address{customer._count.addresses !== 1 ? 'es' : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {customer.email}
                      </p>
                      {customer.phone && (
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {customer.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-900">{customer._count.orders}</span>
                      <span className="text-xs text-slate-400">order{customer._count.orders !== 1 ? 's' : ''}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {customer.orders[0] ? (
                      <div className="text-xs">
                        <p className="font-semibold text-slate-900">
                          ৳{Number(customer.orders[0].total).toLocaleString('en-BD')}
                        </p>
                        <p className="text-slate-400">
                          {new Date(customer.orders[0].createdAt).toLocaleDateString('en-BD')}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No orders</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(customer.createdAt).toLocaleDateString('en-BD')}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={`/admin/customers?page=${page - 1}${search ? `&search=${search}` : ''}`}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition text-xs font-semibold"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/customers?page=${page + 1}${search ? `&search=${search}` : ''}`}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition text-xs font-semibold"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
