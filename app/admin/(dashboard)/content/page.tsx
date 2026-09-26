import React from 'react';
import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { getContentPage, DEFAULT_POLICY_PAGES } from '@/lib/content';
import { savePolicyContentAction } from './actions';
import { FileText, Save, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  await requireRole(['OWNER', 'ADMIN']);

  const activeTab = searchParams?.tab || 'delivery';
  const validTabs = ['delivery', 'returns', 'warranty', 'privacy', 'terms'];
  const currentTab = validTabs.includes(activeTab) ? activeTab : 'delivery';

  const currentPageData = await getContentPage(currentTab);

  const policyTabs = [
    { key: 'delivery', label: 'ডেলিভারি নীতিমালা (Delivery)', url: '/policies/delivery' },
    { key: 'returns', label: 'রিটার্ন ও রিফান্ড (Returns)', url: '/policies/returns' },
    { key: 'warranty', label: 'ওয়ারেন্টি নীতিমালা (Warranty)', url: '/policies/warranty' },
    { key: 'privacy', label: 'প্রাইভেসি পলিসি (Privacy)', url: '/policies/privacy' },
    { key: 'terms', label: 'শর্তাবলী (Terms & Conditions)', url: '/policies/terms' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            পলিসি ও কন্টেন্ট ব্যবস্থাপনা (Legal & Policy Pages Editor)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            গ্রাহক-মুখী সমস্ত নীতিমালা ও শর্তাবলী সরাসরি ডাটাবেজে সম্পাদনা এবং ড্রাফট স্ট্যাটাস পরিচালনা করুন।
          </p>
        </div>

        <Link
          href={`/policies/${currentTab}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand hover:border-brand transition shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>ওয়েবসাইটে দেখুন (Live Preview)</span>
        </Link>
      </div>

      {/* Policy Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {policyTabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/content?tab=${tab.key}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              currentTab === tab.key
                ? 'bg-brand text-white shadow'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>

      {/* Editor Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-800">
              সম্পাদনা: {currentPageData.title}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              স্লাগ: /policies/{currentTab}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentPageData.isDraft ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                খসড়া / ড্রাফট মোড সক্রিয়
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                প্রকাশিত (Published)
              </span>
            )}
          </div>
        </div>

        <form
          action={async (formData: FormData) => {
            'use server';
            await savePolicyContentAction(formData);
          }}
          className="space-y-5 text-xs"
        >
          <input type="hidden" name="slug" value={currentTab} />

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">পৃষ্ঠার শিরোনাম *</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={currentPageData.title}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-brand"
            />
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>খসড়া স্ট্যাটাস (Draft Status):</strong> যদি নীতিমালাটি ক্লায়েন্ট কর্তৃক এখনো আনুষ্ঠানিকভাবে অনুমোদিত না হয়ে থাকে, তবে ড্রাফট রাখুন। এতে ওয়েবসাইটে স্পষ্ট নোটিশ প্রদর্শিত হবে এবং কোনো কাল্পনিক আইনি প্রতিশ্রুতি গ্রাহককে দেওয়া হবে না।
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer flex-shrink-0 font-bold">
              <input
                type="checkbox"
                name="isDraft"
                value="true"
                defaultChecked={currentPageData.isDraft}
                className="w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <span>ড্রাফট হিসেবে রাখুন</span>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">পলিসি কন্টেন্ট (Markdown ফরম্যাট সমর্থিত) *</label>
              <span className="text-[11px] text-slate-400">## হেডিং, ### সাবহেডিং, - বুলেট পয়েন্ট, **বোল্ড**</span>
            </div>
            <textarea
              name="content"
              required
              rows={16}
              defaultValue={currentPageData.content}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-800 leading-relaxed outline-none focus:border-brand resize-y"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <p className="text-slate-400 text-[11px]">
              সংরক্ষণ করলে তাৎক্ষণিকভাবে লাইভ ওয়েবসাইটে হালনাগাদ হবে এবং অডিট ট্রেইলে সংরক্ষিত থাকবে।
            </p>

            <button
              type="submit"
              className="bg-brand hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow text-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>পলিসি হালনাগাদ সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
