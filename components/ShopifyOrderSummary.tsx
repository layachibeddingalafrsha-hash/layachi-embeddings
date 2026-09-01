"use client";

import { useI18n } from "@/lib/i18n";

interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  sku: string;
  qty: number;
  selectedDimension: string;
  selectedColor: string;
  image?: string;
}

interface ShopifyOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  bundleDiscount: number;
  shippingCost: number;
  loadingShipping: boolean;
  currency: string;
  locale: string;
  t: (key: string) => string;
}

export default function ShopifyOrderSummary({
  items,
  subtotal,
  bundleDiscount,
  shippingCost,
  loadingShipping,
  currency,
  locale,
  t
}: ShopifyOrderSummaryProps) {
  const total = subtotal - bundleDiscount + shippingCost;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('checkout.orderSummary')}
        </h2>
      </div>

      {/* Items List */}
      <div className="px-6 py-4 max-h-96 overflow-y-auto">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex gap-4">
              {/* Product Image */}
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                  {item.productName}
                </h3>
                <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                  {item.selectedDimension && (
                    <div>{t('checkout.size')}: {item.selectedDimension}</div>
                  )}
                  {item.selectedColor && (
                    <div>{t('checkout.color')}: {item.selectedColor}</div>
                  )}
                  <div>{t('checkout.qty')}: {item.qty}</div>
                </div>
                <div className="mt-2 text-sm font-semibold text-gray-900">
                  {(item.unitPrice * item.qty).toLocaleString()} {currency}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="px-6 py-5 border-t border-gray-200 bg-gray-50 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('checkout.subtotal')}</span>
          <span className="font-medium text-gray-900">{subtotal.toLocaleString()} {currency}</span>
        </div>

        {/* Bundle Discount */}
        {bundleDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('bundle.discount')}
            </span>
            <span className="font-medium text-green-600">
              -{bundleDiscount.toLocaleString()} {currency}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('checkout.shipping')}</span>
          <span className="font-medium text-gray-900">
            {loadingShipping ? (
              <span className="inline-flex items-center gap-1 text-gray-400">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent"></div>
                {t('checkout.calculating')}
              </span>
            ) : shippingCost > 0 ? (
              `${shippingCost.toLocaleString()} ${currency}`
            ) : (
              <span className="text-gray-400">{t('checkout.selectWilaya')}</span>
            )}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-900">{t('checkout.total')}</span>
            <span className="text-xl font-bold text-zak-black">
              {total.toLocaleString()} {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>{locale === 'ar' ? 'دفع آمن عند الاستلام' : 'Paiement sécurisé à la livraison'}</span>
        </div>
      </div>
    </div>
  );
}

