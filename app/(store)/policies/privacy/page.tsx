import React from 'react';

export const metadata = {
  title: 'গোপনীয়তা নীতি (Privacy Policy)',
  description: 'Trust Computer-Moulvibazar এর গ্রাহক তথ্যের নিরাপত্তা ও গোপনীয়তা নীতি।',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          গোপনীয়তা নীতি (Privacy Policy)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Trust Computer-Moulvibazar আপনার তথ্যের সুরক্ষায় প্রতিশ্রুতিবদ্ধ
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            ১. গ্রাহক তথ্যের ব্যবহার
          </h2>
          <p>
            আমরা শুধুমাত্র অর্ডার প্রক্রিয়াকরণ, পণ্য ডেলিভারি এবং কাস্টমার সাপোর্টের প্রয়োজনে আপনার নাম, মোবাইল নম্বর এবং ঠিকানা সংরক্ষণ করি।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            ২. তথ্যের নিরাপত্তা
          </h2>
          <p>
            গ্রাহকের ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না। শুধুমাত্র অর্ডার ডেলিভারির স্বার্থে দায়িত্বপ্রাপ্ত কুরিয়ার প্রতিনিধি বা রাইডারের সাথে প্রয়োজনীয় ঠিকানা ও ফোন নম্বর শেয়ার করা হয়।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            ৩. যোগাযোগ
          </h2>
          <p>
            গোপনীয়তা বিষয়ক যেকোনো প্রশ্নের জন্য সরাসরি ইমেইল করুন:{' '}
            <a href="mailto:trustcomputermb@gmail.com" className="text-brand font-semibold underline">
              trustcomputermb@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
