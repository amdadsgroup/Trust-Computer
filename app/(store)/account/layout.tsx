import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentCustomer } from '@/lib/customer';
import { logoutCustomerAction } from '../auth/actions';
import {
  User,
  ShoppingBag,
  MapPin,
  Settings,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect('/login?redirect=/account');
  }

  const navItems = [
    { label: 'Overview', href: '/account', icon: LayoutDashboard },
    { label: 'Order History', href: '/account/orders', icon: ShoppingBag },
    { label: 'Profile Information', href: '/account/profile', icon: User },
    { label: 'Saved Addresses', href: '/account/addresses', icon: MapPin },
    { label: 'Security & Password', href: '/account/settings', icon: Settings },
  ];

  return (
    <div className="bg-[#f2f4f8] min-h-[85vh] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Customer Account Sidebar */}
          <aside className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
            {/* Customer Avatar & Bio */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0084d6] to-[#00a8e8] text-white flex items-center justify-center font-black text-xl shadow-md">
                {customer.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-extrabold text-base text-slate-900 truncate">
                  {customer.fullName}
                </h2>
                <p className="text-xs text-slate-500 truncate">{customer.email}</p>
                {customer.phone && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{customer.phone}</p>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0084d6] hover:bg-blue-50/60 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-[#0084d6] transition" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0084d6] transition" />
                  </Link>
                );
              })}
            </nav>

            {/* Logout Action */}
            <div className="pt-4 border-t border-slate-100">
              <form action={logoutCustomerAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Customer Account</span>
            </div>
          </aside>

          {/* Main Account Content */}
          <main className="lg:col-span-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
