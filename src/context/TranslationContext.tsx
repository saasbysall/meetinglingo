
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import translation files
import enTranslations from '@/translations/en.json';
import esTranslations from '@/translations/es.json';
import ptTranslations from '@/translations/pt.json';
import trTranslations from '@/translations/tr.json';
import jaTranslations from '@/translations/ja.json';
import arTranslations from '@/translations/ar.json';
import zhTranslations from '@/translations/zh.json';
import koTranslations from '@/translations/ko.json';
import frTranslations from '@/translations/fr.json';
import itTranslations from '@/translations/it.json';

type TranslationsType = {
  [key: string]: string;
};

// Mapping of language codes to translation objects
const translations: { [key: string]: TranslationsType } = {
  en: enTranslations,
  es: esTranslations,
  pt: ptTranslations,
  tr: trTranslations,
  ja: jaTranslations,
  ar: arTranslations,
  zh: zhTranslations,
  ko: koTranslations,
  fr: frTranslations,
  it: itTranslations,
};

// Default language
const DEFAULT_LANG = 'en';

interface TranslationContextType {
  t: (key: string, params?: Record<string, string | number>) => string;
  currentLanguage: string;
  setLanguage: (lang: string) => void;
}

// Create the context
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Provider component
export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('lang') || DEFAULT_LANG
  );

  // Function to translate text
  const t = (key: string, params?: Record<string, string | number>): string => {
    // Get the translations for the current language
    const langTranslations = translations[currentLanguage] || translations[DEFAULT_LANG];
    
    // Get the translation or fallback to the key itself
    let translation = langTranslations[key] || translations[DEFAULT_LANG][key] || key;
    
    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, String(value));
      });
    }
    
    return translation;
  };

  // Update language when it changes
  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  // Listen for language changes from the LanguageDropdown component
  useEffect(() => {
    const storedLang = localStorage.getItem('lang');
    if (storedLang && storedLang !== currentLanguage) {
      setCurrentLanguage(storedLang);
    }
  }, []);

  return (
    <TranslationContext.Provider value={{ t, currentLanguage, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use the translation context
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
