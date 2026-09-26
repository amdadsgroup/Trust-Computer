import React from 'react';
import prisma from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { Users, UserPlus, ShieldCheck, Mail, Phone, Clock, AlertCircle } from 'lucide-react';
import { createUserAction, toggleUserStatusAction, updateUserRoleAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const currentSession = await requireRole(['OWNER', 'ADMIN']);

  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (err) {
    console.error('Error fetching admin users:', err);
  }

  const roleBadges: Record<string, { bg: string; text: string; label: string }> = {
    OWNER: { bg: 'bg-purple-50 border-purple-200 text-purple-700', text: 'text-purple-700', label: 'মালিক (Owner)' },
    ADMIN: { bg: 'bg-blue-50 border-blue-200 text-blue-700', text: 'text-blue-700', label: 'এডমিন (Admin)' },
    STAFF: { bg: 'bg-slate-100 border-slate-200 text-slate-700', text: 'text-slate-700', label: 'স্টাফ (Staff)' },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            স্টাফ ও অ্যাডমিন অ্যাকাউন্ট ব্যবস্থাপনা (Staff & Role Management)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Trust Computer-Moulvibazar অ্যাডমিন প্যানেলে অনুমোদিত কর্মীদের তালিকা, রোল ও পারমিশন পরিচালনা করুন।
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-brand rounded-xl border border-blue-200">
          মোট অনুমোদিত ইউজার: {users.length} জন
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create User Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-6">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-brand" />
              <span>নতুন স্টাফ অ্যাকাউন্ট তৈরি করুন</span>
            </h2>

            <form
              action={async (formData: FormData) => {
                'use server';
                await createUserAction(formData);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="যেমন: Shiblu Ahmed"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ইমেইল ঠিকানা *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="staff@trustcomputermb.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পাসওয়ার্ড *</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="কমপক্ষে ৮ অক্ষরের শক্তিশালী পাসওয়ার্ড"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ফোন নম্বর (ঐচ্ছিক)</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="01753-XXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">রোল ও পারমিশন *</label>
                <select
                  name="role"
                  required
                  defaultValue="STAFF"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand"
                >
                  <option value="STAFF">STAFF — অর্ডার ও ইনভেন্টরি ভিউ/প্রসেসিং</option>
                  <option value="ADMIN">ADMIN — প্রোডাক্ট, ইনভেন্টরি, অর্ডার ও রিপোর্ট পরিচালনা</option>
                  {currentSession.role === 'OWNER' && (
                    <option value="OWNER">OWNER — পূর্ণ অধিকার ও স্টাফ অ্যাকাউন্ট কন্ট্রোল</option>
                  )}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow text-xs flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                অ্যাকাউন্ট তৈরি করুন
              </button>
            </form>
          </div>
        </div>

        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">
                অনুমোদিত ব্যবহারকারী তালিকা ({users.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {users.map((u) => {
                const badge = roleBadges[u.role] || roleBadges.STAFF;
                const isCurrent = u.id === currentSession.userId;

                return (
                  <div key={u.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                            আপনি (Current)
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {u.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {u.email}
                        </span>
                        {u.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {u.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          যুক্ত: {new Date(u.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isCurrent && (
                        <form
                          action={async () => {
                            'use server';
                            await toggleUserStatusAction(u.id);
                          }}
                        >
                          <button
                            type="submit"
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                              u.isActive
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
