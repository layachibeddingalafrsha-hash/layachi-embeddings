"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { trackAddToCart, trackViewContent, trackCustomEvent } from "@/components/MetaPixel";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  description: string;
  variants: any[];
  tags?: string[];
  hasBundles?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const { locale, t } = useI18n();

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const currency = "DZD";

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    trackAddToCart(product._id, product.price, 1);
    trackCustomEvent("QuickBuy", { product_id: product._id, value: product.price });

    const variant = product.variants?.[0] ?? {
      sku: `${product._id}-default`,
      dimension: "Standard",
      color: "Default",
      stock: 1,
    };

    localStorage.setItem("quickBuyItem", JSON.stringify([{
      productId: product._id,
      productName: product.name,
      unitPrice: product.price,
      sku: variant.sku,
      qty: 1,
      selectedDimension: variant.dimension,
      selectedColor: variant.color,
    }]));

    window.location.href = `/products/${product.slug}`;
  };

  const badge = () => {
    if (!product.tags?.length && !discount) return null;
    if (product.tags?.includes("new"))
      return <span className="product-card__badge badge-new">{t("badge.new") || "Nouveau"}</span>;
    if (product.tags?.includes("featured"))
      return <span className="product-card__badge badge-featured">{t("badge.featured") || "Vedette"}</span>;
    if (discount > 0)
      return <span className="product-card__badge badge-sale">-{discount}%</span>;
    return null;
  };

  const img1 = product.images?.[0];
  const img2 = product.images?.[1];

  return (
    <div
      className="product-card group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Media */}
      <Link
        href={`/products/${product.slug}`}
        className="block product-card__media"
        onClick={() => {
          trackViewContent(product._id, product.name, product.price);
          trackCustomEvent("ProductClick", { product_id: product._id, value: product.price });
        }}
      >
        {/* Badge */}
        {badge()}

        {/* Image */}
        {img1 ? (
          <>
            <Image
              src={img1}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-700 ease-out ${
                hovered && img2 ? "opacity-0" : "opacity-100"
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {img2 && (
              <Image
                src={img2}
                alt={`${product.name} — vue 2`}
                fill
                className={`object-cover transition-all duration-700 ease-out absolute inset-0 ${
                  hovered ? "opacity-100 scale-[1.04]" : "opacity-0 scale-100"
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
            {!img2 && (
              <div
                className={`absolute inset-0 transition-transform duration-700 ease-out`}
                style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Quick-add overlay (Shopify Dawn) */}
        <div className="product-card__quick-add" onClick={handleQuickBuy}>
          <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          {t("buttons.quickBuy") || "Acheter — Commander"}
        </div>
      </Link>

      {/* Info */}
      <div className="product-card__info">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="product-card__title">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <span className="product-card__price">
              {product.price.toLocaleString()} {currency}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="product-card__compare-price">
                {product.compareAtPrice.toLocaleString()} {currency}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}