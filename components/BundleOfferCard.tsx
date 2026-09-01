"use client";

import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import BundleVariantSelector from "./BundleVariantSelector";
import { trackCustomEvent } from "@/components/MetaPixel";

interface Bundle {
  _id: string;
  productId: string;
  quantity: number;
  discount: number;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  product?: {
    name: string;
    price: number;
  } | null;
}

interface BundleVariant {
  dimension: string;
  color: string;
}

interface BundleOfferCardProps {
  bundle: Bundle;
  productPrice: number;
  productCompareAtPrice?: number;
  currentQuantity?: number;
  isSelected?: boolean;
  onSelect?: (bundle: Bundle, variants: BundleVariant[]) => void;
  availableDimensions?: string[];
  availableColors?: string[];
}

export default function BundleOfferCard({ 
  bundle, 
  productPrice, 
  productCompareAtPrice,
  currentQuantity = 0,
  isSelected = false,
  onSelect,
  availableDimensions = [],
  availableColors = []
}: BundleOfferCardProps) {
  const { locale, t } = useI18n();
  const currency = locale === 'ar' ? 'دج' : 'DZD';
  const [selectedVariants, setSelectedVariants] = useState<BundleVariant[]>([]);
  
  // Calculate discount from original price (compareAtPrice if available)
  const originalUnitPrice = productCompareAtPrice || productPrice;
  const originalPrice = originalUnitPrice * bundle.quantity;
  
  // Calculate product discount per unit (if compareAtPrice exists)
  const productDiscountPerUnit = productCompareAtPrice ? (productCompareAtPrice - productPrice) : 0;
  const totalProductDiscount = productDiscountPerUnit * bundle.quantity;
  
  // Total savings = product discount + bundle discount
  const totalSavings = totalProductDiscount + bundle.discount;
  
  // Final price after both discounts
  const newPrice = originalPrice - totalSavings;
  
  // Discount percentage from original price
  const savingsPercent = originalPrice > 0 ? Math.round((totalSavings / originalPrice) * 100) : 0;
  
  // Check if current quantity qualifies for this bundle
  const qualifies = currentQuantity >= bundle.quantity;
  const itemsNeeded = Math.max(0, bundle.quantity - currentQuantity);
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleClick = () => {
    // Track bundle selection
    trackCustomEvent("BundleSelect", {
      bundle_id: bundle._id,
      quantity: bundle.quantity,
      discount: bundle.discount,
      savings: totalSavings,
      new_price: newPrice,
      currency: "DZD",
    });

    // Don't auto-select on click - wait for variants to be configured
    if (!isSelected) {
      // Just mark as selected, variants will be configured by BundleVariantSelector
      if (onSelect) {
        // Pass current selectedVariants if any, otherwise empty array
        // The BundleVariantSelector will initialize and update via handleVariantsChange
        onSelect(bundle, selectedVariants.length > 0 ? selectedVariants : []);
      }
    }
  };

  const handleVariantsChange = (variants: BundleVariant[]) => {
    setSelectedVariants(variants);
    // Always update parent when variants change
    if (onSelect && variants.length > 0) {
      onSelect(bundle, variants);
    }
  };

  return (
    <div 
      className={`border-2 rounded-lg p-4 transition-all ${
        isSelected
          ? 'border-zak-black bg-zak-black/10 ring-2 ring-zak-black'
          : qualifies 
            ? 'border-green-500 bg-green-50 hover:border-green-600 cursor-pointer hover:shadow-lg' 
            : 'border-blue-200 bg-blue-50 hover:border-blue-300 cursor-pointer hover:shadow-lg'
      }`}
    >
      {/* Clickable header to select bundle */}
      <div onClick={handleClick} className="cursor-pointer">
        <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          <h4 className="font-semibold text-lg">
            {t('bundle.title')}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {qualifies && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
              {t('bundle.eligible')}
            </span>
          )}
          {isSelected && (
            <span className="bg-zak-black text-white px-2 py-1 rounded text-xs font-bold">
              {t('bundle.selected')}
            </span>
          )}
        </div>
        </div>
      
        <div className="space-y-2">
        <p className="text-sm font-medium text-green-600">
          {t('bundle.buy')} {bundle.quantity}, {t('bundle.save')} {totalSavings.toLocaleString()} {currency}
        </p>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-red-500 line-through">
              {originalPrice.toLocaleString()} {currency}
            </span>
            <span className="text-lg font-bold text-green-600">
              {newPrice.toLocaleString()} {currency}
            </span>
          </div>
          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            -{savingsPercent}%
          </div>
        </div>
        
        {!qualifies && itemsNeeded > 0 && (
          <p className="text-sm text-blue-600 font-medium">
            {t('bundle.addMore')} {itemsNeeded} {itemsNeeded === 1 ? t('bundle.itemMore') : t('bundle.itemsMore')} {t('bundle.toUnlock')}
          </p>
        )}
        
        {bundle.endDate && (
          <p className="text-xs text-gray-500">
            {t('bundle.validUntil')} {formatDate(bundle.endDate)}
          </p>
        )}
        </div>
      </div>

      {/* Variant Selector - Show when bundle is selected */}
      {isSelected && (
        <div onClick={(e) => e.stopPropagation()} className="mt-4">
          <BundleVariantSelector
            bundleQuantity={bundle.quantity}
            availableDimensions={availableDimensions}
            availableColors={availableColors}
            onVariantsChange={handleVariantsChange}
            locale={locale}
            t={t}
          />
        </div>
      )}
    </div>
  );
}

