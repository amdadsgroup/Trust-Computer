import React from 'react';

export const metadata = {
  title: 'ব্যবহারের শর্তাবলী (Terms & Conditions)',
  description: 'Trust Computer-Moulvibazar ব্যবহারের সাধারণ নিয়মাবলী ও শর্তাবলী।',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ব্যবহারের শর্তাবলী (Terms & Conditions)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          সর্বশেষ সংস্করণ: সেপ্টেম্বর ২০২৬ | Trust Computer-Moulvibazar
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            ১. সাধারণ শর্ত
          </h2>
          <p>
            https://trustcomputermb.com ওয়েবসাইটে প্রবেশ বা পণ্য অর্ডারের মাধ্যমে আপনি এই শর্তাবলীর সাথে সম্মতি প্রকাশ করছেন। আন্তর্জাতিক ও জাতীয় বাজারদরের পরিবর্তনের কারণে পণ্যের মূল্যে পরিবর্তন হতে পারে।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            ২. স্টক ও অর্ডার নিশ্চিতকরণ
          </h2>
          <p>
            ওয়েবসাইটে প্রদর্শিত প্রতিটি পণ্যের প্রাপ্যতা এবং চূড়ান্ত মূল্য অর্ডার গ্রহণের পর আমাদের প্রতিনিধি কর্তৃক যাচাই সাপেক্ষে নিশ্চিত করা হয়। অপ্রত্যাশিত স্টক ঘাটতির ক্ষেত্রে গ্রাহককে দ্রুত অবগত করে সমাধান করা হয়।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            ৩. পেমেন্ট ও দায়বদ্ধতা
          </h2>
          <p>
            ক্যাশ অন ডেলিভারিতে অর্ডারের ক্ষেত্রে পণ্য বুঝে নেওয়ার সময় নির্ধারিত মূল্য পরিশোধ করতে হবে। মোবাইল ব্যাংকিং বা ডিজিটাল মাধ্যমে পেমেন্টের ক্ষেত্রে অফিসিয়াল অ্যাকাউন্টের বাইরে কোনো অননুমোদিত লেনদেনের দায়ভার Trust Computer গ্রহণ করবে না।
          </p>
        </section>
      </div>
    </div>
  );
}
