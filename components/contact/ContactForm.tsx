'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const { t, isBangla } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <h3 className="font-bold text-slate-900 text-sm">
          {t('contact.form_success_title', 'Message Sent Successfully!')}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {isBangla
            ? `ধন্যবাদ ${name}। আমাদের কাস্টমার সাপোর্ট প্রতিনিধি শীঘ্রই ${phone} নম্বরে আপনার সাথে যোগাযোগ করবেন।`
            : `Thank you ${name}. Our customer support specialist will contact you at ${phone} very soon.`}
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setName('');
            setPhone('');
            setMessage('');
          }}
          className="text-xs text-brand font-bold underline pt-2"
        >
          {t('contact.form_send_another', 'Send Another Message')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {t('contact.form_name', 'Your Full Name *')}
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('contact.form_name_ph', 'Enter your full name')}
          className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand focus:bg-white transition"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {t('contact.form_phone', 'Mobile Number *')}
        </label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('contact.form_phone_ph', '01XXXXXXXXX')}
          className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand focus:bg-white transition"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {t('contact.form_message', 'Message or Product Details *')}
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('contact.form_message_ph', 'Tell us which product, CCTV setup, or service you are interested in...')}
          className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand focus:bg-white transition"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-brand hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        <span>{t('contact.form_send', 'Send Inquiry Message')}</span>
      </button>
    </form>
  );
}
