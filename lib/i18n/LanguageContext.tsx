'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  isBangla: boolean;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'tc_lang_pref_v1';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English ('en') so when user uses English, all text is guaranteed in English
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (stored === 'en' || stored === 'bn') {
        setLanguageState(stored);
        document.documentElement.lang = stored;
      } else {
        // Default to English
        setLanguageState('en');
        document.documentElement.lang = 'en';
      }
    } catch (e) {
      console.error('Failed to load language preference:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next: Language = prev === 'en' ? 'bn' : 'en';
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
        document.documentElement.lang = next;
      } catch (e) {
        console.error('Failed to toggle language preference:', e);
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const item = translations[key];
      if (item && item[language]) {
        return item[language];
      }
      if (fallback !== undefined) {
        return fallback;
      }
      // If key is missing translation in current language, try English, then key itself
      return item?.en || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isBangla: language === 'bn',
        isEnglish: language === 'en',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
