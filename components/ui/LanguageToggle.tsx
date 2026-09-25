'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  variant?: 'header' | 'footer' | 'pill' | 'compact';
  className?: string;
}

export default function LanguageToggle({
  variant = 'header',
  className = '',
}: LanguageToggleProps) {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition border ${
          language === 'en'
            ? 'bg-blue-50 text-brand-700 border-blue-200 hover:bg-blue-100'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
        } ${className}`}
        title={`Switch to ${language === 'en' ? 'বাংলা' : 'English'}`}
        aria-label="Toggle language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{language === 'en' ? 'BN' : 'EN'}</span>
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center p-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-full transition ${
            language === 'en'
              ? 'bg-brand-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage('bn')}
          className={`px-3 py-1 rounded-full transition ${
            language === 'bn'
              ? 'bg-brand-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          বাংলা
        </button>
      </div>
    );
  }

  // Default header style
  return (
    <div className={`inline-flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-0.5 text-xs ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
          language === 'en'
            ? 'bg-brand-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="English Language"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
          language === 'bn'
            ? 'bg-brand-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Bangla Language"
      >
        বাংলা
      </button>
    </div>
  );
}
