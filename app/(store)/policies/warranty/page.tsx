import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'ওয়ারেন্টি ও রিটার্ন নীতিমালা (Warranty & Return Policy)',
  description: 'Trust Computer-Moulvibazar এর অফিসিয়াল ওয়ারেন্টি ও রিপ্লেসমেন্ট নীতিমালা।',
};

export default function WarrantyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ওয়ারেন্টি ও রিটার্ন নীতিমালা
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Trust Computer-Moulvibazar | স্বচ্ছ ও বিশ্বস্ত গ্রাহক সেবা
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            ১. অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি
          </h2>
          <p>
            Trust Computer-Moulvibazar এ বিক্রিত সকল মূল কম্পিউটার পার্টস, সিসি ক্যামেরা, ডিভিআর এবং নেটওয়ার্কিং ডিভাইসে প্রস্তুতকারক কোম্পানির অফিসিয়াল ওয়ারেন্টি কার্ড প্রদান করা হয়। পণ্যের ইনভয়েসে ওয়ারেন্টির মেয়াদ (যেমন: ১ বছর, ২ বছর বা ৩ বছর) স্পষ্টভাবে উল্লেখ থাকে।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            ২. ওয়ারেন্টি প্রাপ্তির নিয়মাবলী
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
            <li>ওয়ারেন্টি সেবার জন্য মূল ইনভয়েস/বিল কপি এবং ওয়ারেন্টি স্টিকার অক্ষত থাকতে হবে।</li>
            <li>পণ্য পোড়া (Burn), পানিতে ভেজা (Liquid damage), ফাটা বা শারীরিক ক্ষতি (Physical damage) হলে ওয়ারেন্টি প্রযোজ্য হবে না।</li>
            <li>ওয়ারেন্টির আওতাধীন পণ্য কোম্পানি সার্ভিস সেন্টারে পাঠিয়ে প্রয়োজনীয় মেরামত বা রিপ্লেসমেন্ট করে দেওয়া হয়।</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            ৩. রিটার্ন ও পরিবর্তন (Returns & Replacements)
          </h2>
          <p>
            ডেলিভারি গ্রহণের পর যদি কোনো পণ্য প্রস্তুতকালীন ত্রুটিযুক্ত (Manufacturing defect) থাকে, তবে অনতিবিলম্বে আমাদের হটলাইন <strong>01753-765372</strong> অথবা সরাসরি শোরুমে নিয়ে আসার অনুরোধ করা হচ্ছে।
          </p>
        </section>
      </div>
    </div>
  );
}
