"use client";

import { useI18n } from "@/lib/i18n";
import { useState } from "react";

interface ShopifyCheckoutFormProps {
  form: {
    customerName: string;
    customerPhone: string;
    wilayaId: string;
    commune?: string;
    deliveryType: string;
  };
  errors: {[key: string]: string};
  wilayas: any[];
  communes?: string[];
  stopdesks?: string[];
  loadingCommunes?: boolean;
  loadingShipping: boolean;
  onChange: (field: string, value: string) => void;
  locale: string;
  t: (key: string) => string;
}

export default function ShopifyCheckoutForm({
  form,
  errors,
  wilayas,
  communes = [],
  stopdesks = [],
  loadingCommunes = false,
  loadingShipping,
  onChange,
  locale,
  t
}: ShopifyCheckoutFormProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Contact Information Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-full bg-zak-black text-white flex items-center justify-center text-sm font-semibold">
            1
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {locale === 'ar' ? 'معلومات الاتصال' : 'Informations de contact'}
          </h2>
        </div>

        <div className="space-y-5">
          {/* Full Name */}
          <div className="relative">
            <label 
              htmlFor="customerName"
              className={`block text-sm font-medium mb-2 transition-colors ${
                focusedField === 'customerName' 
                  ? 'text-zak-black' 
                  : errors.customerName 
                    ? 'text-red-600' 
                    : 'text-gray-700'
              }`}
            >
              {t('checkout.form.name')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="customerName"
                type="text"
                value={form.customerName}
                onChange={(e) => onChange('customerName', e.target.value)}
                onFocus={() => setFocusedField('customerName')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3.5 border rounded-lg text-base transition-all duration-200 ${
                  errors.customerName
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : focusedField === 'customerName'
                      ? 'border-zak-black ring-2 ring-zak-black/20'
                      : 'border-gray-300 focus:border-zak-black focus:ring-2 focus:ring-zak-black/20'
                } outline-none bg-white`}
                placeholder={t('checkout.form.namePlaceholder')}
              />
              {focusedField === 'customerName' && (
                <div className="absolute inset-0 border-2 border-zak-black rounded-lg pointer-events-none animate-pulse-subtle" />
              )}
            </div>
            {errors.customerName && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.customerName}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="relative">
            <label 
              htmlFor="customerPhone"
              className={`block text-sm font-medium mb-2 transition-colors ${
                focusedField === 'customerPhone' 
                  ? 'text-zak-black' 
                  : errors.customerPhone 
                    ? 'text-red-600' 
                    : 'text-gray-700'
              }`}
            >
              {t('checkout.form.phone')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                id="customerPhone"
                type="tel"
                value={form.customerPhone}
                onChange={(e) => onChange('customerPhone', e.target.value)}
                onFocus={() => setFocusedField('customerPhone')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-3.5 border rounded-lg text-base transition-all duration-200 ${
                  errors.customerPhone
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : focusedField === 'customerPhone'
                      ? 'border-zak-black ring-2 ring-zak-black/20'
                      : 'border-gray-300 focus:border-zak-black focus:ring-2 focus:ring-zak-black/20'
                } outline-none bg-white`}
                placeholder={t('checkout.form.phonePlaceholder')}
              />
            </div>
            {errors.customerPhone && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.customerPhone}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Delivery Information Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-full bg-zak-black text-white flex items-center justify-center text-sm font-semibold">
            2
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {t('checkout.deliveryInfo')}
          </h2>
        </div>

        <div className="space-y-5">
          {/* Wilaya */}
          <div className="relative">
            <label 
              htmlFor="wilaya-select"
              className={`block text-sm font-medium mb-2 transition-colors ${
                focusedField === 'wilayaId' 
                  ? 'text-zak-black' 
                  : errors.wilayaId 
                    ? 'text-red-600' 
                    : 'text-gray-700'
              }`}
            >
              {t('checkout.form.wilaya')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <select
                id="wilaya-select"
                value={form.wilayaId}
                onChange={(e) => onChange('wilayaId', e.target.value)}
                onFocus={() => setFocusedField('wilayaId')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-10 py-3.5 border rounded-lg text-base appearance-none transition-all duration-200 ${
                  errors.wilayaId
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : focusedField === 'wilayaId'
                      ? 'border-zak-black ring-2 ring-zak-black/20'
                      : 'border-gray-300 focus:border-zak-black focus:ring-2 focus:ring-zak-black/20'
                } outline-none bg-white cursor-pointer`}
              >
                <option value="">{t('checkout.form.selectWilaya')}</option>
                {wilayas.map((wilaya) => (
                  <option key={wilaya._id} value={wilaya._id}>
                    {wilaya.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.wilayaId && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.wilayaId}
              </p>
            )}
          </div>

          {/* Commune or Stop-Desk - conditional based on delivery type */}
          <div className="relative">
            <label
              htmlFor="commune-select"
              className={`block text-sm font-medium mb-2 transition-colors ${
                focusedField === 'commune'
                  ? 'text-zak-black'
                  : errors.commune
                    ? 'text-red-600'
                    : 'text-gray-700'
              }`}
            >
              {form.deliveryType === 'to_desk'
                ? (locale === 'ar' ? 'نقطة الاستلام' : 'Point de retrait (Stop-Desk)')
                : (locale === 'ar' ? 'البلدية' : 'Commune')
              } <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <select
                id="commune-select"
                value={form.commune || ''}
                onChange={(e) => onChange('commune', e.target.value)}
                onFocus={() => setFocusedField('commune')}
                onBlur={() => setFocusedField(null)}
                disabled={!form.wilayaId || loadingCommunes}
                className={`w-full pl-12 pr-10 py-3.5 border rounded-lg text-base appearance-none transition-all duration-200 ${
                  errors.commune
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : focusedField === 'commune'
                      ? 'border-zak-black ring-2 ring-zak-black/20'
                      : 'border-gray-300 focus:border-zak-black focus:ring-2 focus:ring-zak-black/20'
                } outline-none bg-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {!form.wilayaId
                    ? (locale === 'ar' ? 'اختر الولاية أولاً' : 'Sélectionnez d\'abord une wilaya')
                    : loadingCommunes
                      ? (locale === 'ar' ? 'جاري التحميل...' : 'Chargement...')
                      : form.deliveryType === 'to_desk'
                        ? (stopdesks.length === 0
                          ? (locale === 'ar' ? 'لا توجد نقاط استلام لهذه الولاية' : 'Aucun stop-desk pour cette wilaya')
                          : (locale === 'ar' ? 'اختر نقطة الاستلام' : 'Sélectionner un stop-desk'))
                        : (locale === 'ar' ? 'اختر البلدية' : 'Sélectionner une commune')}
                </option>
                {form.deliveryType === 'to_desk' 
                  ? stopdesks.map((sd) => (
                      <option key={sd} value={sd}>{sd}</option>
                    ))
                  : communes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))
                }
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {form.deliveryType === 'to_desk' && stopdesks.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {stopdesks.length} {locale === 'ar' ? 'نقطة استلام متاحة' : 'stop-desks disponibles'}
              </p>
            )}
            {form.deliveryType === 'to_home' && communes.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {communes.length} {locale === 'ar' ? 'بلدية متاحة' : 'communes disponibles'}
              </p>
            )}
            {errors.commune && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.commune}
              </p>
            )}
          </div>

          {/* Delivery Type */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">
              {t('checkout.form.deliveryType')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                form.deliveryType === 'to_home' 
                  ? 'border-zak-black bg-zak-black/5 shadow-md' 
                  : 'border-gray-200 hover:border-zak-black/50 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="deliveryType"
                  value="to_home"
                  checked={form.deliveryType === 'to_home'}
                  onChange={(e) => onChange('deliveryType', e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    form.deliveryType === 'to_home'
                      ? 'border-zak-black bg-zak-black'
                      : 'border-gray-300'
                  }`}>
                    {form.deliveryType === 'to_home' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{t('checkout.delivery.toHome')}</div>
                    {form.wilayaId && loadingShipping && form.deliveryType === 'to_home' && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-zak-black border-t-transparent"></div>
                        {t('checkout.calculating')}
                      </div>
                    )}
                  </div>
                  <svg className={`w-6 h-6 transition-colors ${
                    form.deliveryType === 'to_home' ? 'text-zak-black' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </label>
              
              <label className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                form.deliveryType === 'to_desk' 
                  ? 'border-zak-black bg-zak-black/5 shadow-md' 
                  : 'border-gray-200 hover:border-zak-black/50 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="deliveryType"
                  value="to_desk"
                  checked={form.deliveryType === 'to_desk'}
                  onChange={(e) => onChange('deliveryType', e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    form.deliveryType === 'to_desk'
                      ? 'border-zak-black bg-zak-black'
                      : 'border-gray-300'
                  }`}>
                    {form.deliveryType === 'to_desk' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{t('checkout.delivery.toDesk')}</div>
                    {form.wilayaId && loadingShipping && form.deliveryType === 'to_desk' && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-zak-black border-t-transparent"></div>
                        {t('checkout.calculating')}
                      </div>
                    )}
                  </div>
                  <svg className={`w-6 h-6 transition-colors ${
                    form.deliveryType === 'to_desk' ? 'text-zak-black' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

