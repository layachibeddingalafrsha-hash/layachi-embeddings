'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'ar' | 'fr';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
  translations: Record<Locale, Record<string, string>>;
}

export function I18nProvider({ children, initialLocale = 'ar', translations }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [mounted, setMounted] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    setMounted(true);
    const savedLocale = localStorage.getItem('language') as Locale;
    if (savedLocale && (savedLocale === 'ar' || savedLocale === 'fr')) {
      setLocaleState(savedLocale);
      // Update HTML attributes immediately
      document.documentElement.dir = savedLocale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLocale;
    } else {
      // Set default
      document.documentElement.dir = initialLocale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = initialLocale;
    }
  }, [initialLocale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    
    // Save to localStorage
    localStorage.setItem('language', newLocale);
    
    // Update HTML dir and lang attributes for RTL support
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
    
    // Update cookie for server-side rendering
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    
    // Force re-render by updating path if needed
    // This ensures all components re-render with new locale
    if (mounted) {
      // Add a small delay to ensure state update completes
      setTimeout(() => {
        window.dispatchEvent(new Event('languagechange'));
      }, 0);
    }
  };

  const t = (key: string, fallback?: string): string => {
    return translations[locale]?.[key] || fallback || key;
  };

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
