import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

export const metadata = {
  title: 'ডেলিভারি নীতিমালা (Delivery Policy)',
  description: 'Trust Computer-Moulvibazar এর ডেলিভারি নীতিমালা ও চার্জ সংক্রান্ত নিয়মাবলী।',
};

export default function DeliveryPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ডেলিভারি নীতিমালা (Delivery Policy)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          সর্বশেষ হালনাগাদ: সেপ্টেম্বর ২০২৬ | Trust Computer-Moulvibazar
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            ১. ডেলিভারি এলাকা এবং চার্জ
          </h2>
          <p>
            Trust Computer মৌলভীবাজার শহরের কুসুমবাগ টি.এস প্লাজা আউটলেট থেকে স্থানীয় এবং কুরিয়ার সার্ভিসের মাধ্যমে সারাদেশে পণ্য সরবরাহ করে থাকে:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
            <li>
              <strong>মৌলভীবাজার সদর ও পৌর এলাকা:</strong> ডেলিভারি চার্জ ৬০ (৳৬০) টাকা। সাধারণত ২৪ ঘণ্টার মধ্যে পণ্য হস্তান্তর করা হয়।
            </li>
            <li>
              <strong>মৌলভীবাজার জেলার অন্যান্য উপজেলা:</strong> (শ্রীমঙ্গল, কুলাউড়া, বড়লেখা, কমলগঞ্জ, রাজনগর, জুড়ী) ডেলিভারি চার্জ ১২০ (৳১২০) টাকা।
            </li>
            <li>
              <strong>মৌলভীবাজার জেলার বাহিরে / সারা দেশ:</strong> সুন্দরবন, এসএ পরিবহন বা নির্ভরযোগ্য কুরিয়ারের মাধ্যমে ডেলিভারি ফি ১২০ (৳১২০) টাকা। ২-৩ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            ২. সরাসরি শোরুম থেকে সংগ্রহ (Pick-up from Store)
          </h2>
          <p>
            গ্রাহকগণ ওয়েবসাইট থেকে অর্ডার করে কোনো ডেলিভারি চার্জ ছাড়াই সরাসরি আমাদের শোরুম থেকে পণ্য সংগ্রহ করতে পারবেন:
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <strong>শোরুম ঠিকানা:</strong> টি.এস প্লাজা (২য় তলা), কুসুমবাগ, মৌলভীবাজার, বাংলাদেশ।
            <br />
            <strong>ফোন:</strong> 01753-765372
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            ৩. ক্যাশ অন ডেলিভারি ও প্রোডাক্ট যাচাই
          </h2>
          <p>
            ক্যাশ অন ডেলিভারিতে পণ্য পাওয়ার সময় ডেলিভারি রাইডারের সামনে প্যাকেট অক্ষত রয়েছে কিনা তা যাচাই করার অনুরোধ করা হচ্ছে। সিসিটিভি ক্যামেরা বা সংবেদনশীল হার্ডওয়্যারের ক্ষেত্রে ইনস্টলেশন সুবিধার জন্য আমাদের কারিগরি দলের সাথে সরাসরি যোগাযোগ করতে পারেন।
          </p>
        </section>
      </div>
    </div>
  );
}
