import type { Locale } from './i18n-context';
import arTranslations from './translations/ar.json';
import frTranslations from './translations/fr.json';

// Export translations
export const translations = {
  ar: arTranslations,
  fr: frTranslations,
};

export { useI18n, I18nProvider } from './i18n-context';
export type { Locale } from './i18n-context';
