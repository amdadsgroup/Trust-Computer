'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

export default function MoulvibazarFaqAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition shadow-xs"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-blue-700 transition"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{faq.question}</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
