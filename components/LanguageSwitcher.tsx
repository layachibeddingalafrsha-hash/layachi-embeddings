'use client';

import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname() || '/';

  const handleToggle = () => {
    const newLocale = locale === 'ar' ? 'fr' : 'ar';
    setLocale(newLocale);
    // setLocale will update cookie and push new URL
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors"
      aria-label={t('language.switchTo', 'Switch language')}
    >
      <span className="text-sm font-medium">
        {locale === 'ar' ? 'FR' : 'AR'}
      </span>
    </button>
  );
}
