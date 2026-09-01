'use client';

import React from 'react';
import { I18nProvider, translations } from '@/lib/i18n';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <I18nProvider initialLocale={'ar'} translations={translations}>{children}</I18nProvider>;
}
