import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { logoutAdminAction } from '../login/actions';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Boxes,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  ImageIcon,
  Gift,
  Sliders,
  Tag,
  Star,
  Users,
} from 'lucide-react';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  const navItems = [
    { label: 'Overview Dashboard', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Products & Stock', href: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { label: 'Categories & Brands', href: '/admin/categories', icon: <Layers className="w-4 h-4" /> },
    { label: 'Order Management', href: '/admin/orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Customers', href: '/admin/customers', icon: <Users className="w-4 h-4" /> },
    { label: 'Homepage Banners', href: '/admin/banners', icon: <ImageIcon className="w-4 h-4" /> },
    { label: 'Promotional Offers', href: '/admin/offers', icon: <Gift className="w-4 h-4" /> },
    { label: 'Coupons', href: '/admin/coupons', icon: <Tag className="w-4 h-4" /> },
    { label: 'Homepage Control', href: '/admin/homepage', icon: <Sliders className="w-4 h-4" /> },
    { label: 'Reviews', href: '/admin/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Inventory Ledger', href: '/admin/inventory', icon: <Boxes className="w-4 h-4" /> },
    { label: 'Payments & Gateway', href: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Sales & Reports', href: '/admin/reports', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Store Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Logo & Brand */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="relative h-8 w-auto">
                <Image
                  src="/brand/trust-computer-logo.png"
                  alt="Trust Computer Admin"
                  width={150}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono border border-blue-700/50">
                ADMIN
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                <span className="text-slate-400">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-800 text-blue-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {session.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{session.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-bold uppercase">
                  {session.role}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{session.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 text-slate-400 hover:text-white transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Store</span>
            </Link>

            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 sm:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
