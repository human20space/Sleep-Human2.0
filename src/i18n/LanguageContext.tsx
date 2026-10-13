import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { type Language, type TranslationDictionary, TRANSLATIONS } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  isRtl: boolean;
}

const STORAGE_KEY = 'human2_language';

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === 'en' || saved === 'ar' || saved === 'hi')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const isRtl = language === 'ar';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language, isRtl]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: TRANSLATIONS[language] || TRANSLATIONS.en,
      isRtl,
    }),
    [language, setLanguage, isRtl]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for components rendered outside the provider (e.g. in test suites)
    return {
      language: 'en',
      setLanguage: () => {},
      t: TRANSLATIONS.en,
      isRtl: false,
    };
  }
  return context;
}
