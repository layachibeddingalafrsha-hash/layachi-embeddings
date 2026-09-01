"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import ProductGrid from "@/components/ProductGrid";
import { useI18n } from "@/lib/i18n";
import { trackCustomEvent } from "@/components/MetaPixel";

export default function HomePage() {
  const { locale, t } = useI18n();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".scroll-animate").forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="bg-white">

      {/* ══════════════════════════════════════════════
          HERO — Full-width banner (Shopify Dawn style)
          ══════════════════════════════════════════════ */}
      <section className="hero-banner bg-[#0F0F0F]">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1A1613] to-[#2C2520] opacity-95" />

        {/* Decorative soft glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#D4AF37]/5 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/3 blur-[120px] pointer-events-none" />

        {/* Gold top rule */}
        <div className="absolute top-0 inset-x-0 h-px bg-[#D4AF37]/40" />

        <div className="hero-banner__content">
          {/* Eyebrow */}
          <p className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-[#D4AF37]/70" />
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.32em] text-[#D4AF37]/90">
              {locale === "ar" ? "أفرشة فاخرة — الجزائر" : "Literie Premium — Algérie"}
            </span>
            <span className="h-px w-8 bg-[#D4AF37]/70" />
          </p>

          {/* Main headline */}
          <h1 className="hero-banner__heading text-balance">
            {t("hero.title")}
          </h1>

          {/* Subheading */}
          <p className="hero-banner__subheading text-balance">
            {t("hero.subtitle")}
          </p>

          {/* CTA buttons */}
          <div className={`flex flex-wrap items-center justify-center gap-4 ${locale === "ar" ? "flex-row-reverse" : ""}`}>
            <Link
              href="/products"
              className="btn btn-primary px-8 py-3.5 text-sm uppercase tracking-wider font-semibold"
              onClick={() => trackCustomEvent("CTAClick", { button: "ShopNow", section: "hero" })}
            >
              {locale === "ar" ? "تسوق الآن" : "Découvrir la collection"}
            </Link>
            <Link
              href="/contact"
              className="btn btn-outline-white px-8 py-3.5 text-sm uppercase tracking-wider font-semibold"
              onClick={() => trackCustomEvent("CTAClick", { button: "Contact", section: "hero" })}
            >
              {t("nav.contact")}
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-white">Scroll</span>
          <svg className="w-4 h-4 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TRUST BAR
          ══════════════════════════════════════════════ */}
      <section className="bg-[#FAF7F0] border-y border-[#E2D9C8]">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
                ar: "توصيل لكل الولايات",
                fr: "Livraison nationale",
              },
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                ar: "جودة مضمونة 100%",
                fr: "Qualité garantie",
              },
              {
                icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
                ar: "الدفع عند الاستلام",
                fr: "Paiement à la livraison",
              },
              {
                icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                ar: "إرجاع سهل ومجاني",
                fr: "Retours facilités",
              },
            ].map(({ icon, ar, fr }, i) => (
              <div key={i} className="trust-item py-2">
                <div className="trust-item__icon text-[#D4AF37]">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                  </svg>
                </div>
                <p className="trust-item__text text-stone-600">
                  {locale === "ar" ? ar : fr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED COLLECTIONS (Shopify Dawn grid)
          ══════════════════════════════════════════════ */}
      <section className="section scroll-animate">
        <div className="container">
          <div className="section-heading">
            <h2>{locale === "ar" ? "تسوق حسب الفئة" : "Parcourez nos collections"}</h2>
            <p className="text-stone-400 text-sm">
              {locale === "ar" ? "اكتشف تشكيلتنا لكل غرفة في بيتك" : "Salon, Chambre et plus — confort garanti"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {/* Collection tile 1 */}
            <Link href="/products?category=salon" className="collection-card group h-[380px] block">
              <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-900" />
              <div className="collection-card__overlay">
                <div>
                  <p className="text-[10px] font-sans text-white/60 uppercase tracking-widest mb-1">
                    {locale === "ar" ? "غرفة الجلوس" : "Salon"}
                  </p>
                  <h3 className="collection-card__title">
                    {locale === "ar" ? "تشكيلة الصالون" : "Collection Salon"}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-sans text-[#D4AF37] font-semibold">
                    {locale === "ar" ? "تسوق الآن" : "Découvrir"}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>

            {/* Collection tile 2 (tall) */}
            <Link href="/products?category=chambre" className="collection-card group h-[380px] sm:row-span-1 block">
              <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900" />
              <div className="collection-card__overlay">
                <div>
                  <p className="text-[10px] font-sans text-white/60 uppercase tracking-widest mb-1">
                    {locale === "ar" ? "غرفة النوم" : "Chambre"}
                  </p>
                  <h3 className="collection-card__title">
                    {locale === "ar" ? "تشكيلة غرفة النوم" : "Collection Chambre"}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-sans text-[#D4AF37] font-semibold">
                    {locale === "ar" ? "تسوق الآن" : "Découvrir"}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>

            {/* Collection tile 3 */}
            <Link href="/products?category=accessoires" className="collection-card group h-[380px] block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2C2520] to-stone-900" />
              <div className="collection-card__overlay">
                <div>
                  <p className="text-[10px] font-sans text-white/60 uppercase tracking-widest mb-1">
                    {locale === "ar" ? "إكسسوارات المنزل" : "Accessoires"}
                  </p>
                  <h3 className="collection-card__title">
                    {locale === "ar" ? "إكسسوارات وديكور" : "Accessoires & Déco"}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-sans text-[#D4AF37] font-semibold">
                    {locale === "ar" ? "تسوق الآن" : "Découvrir"}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED PRODUCTS
          ══════════════════════════════════════════════ */}
      <section className="section bg-[#FAF7F0] scroll-animate">
        <div className="container">
          <div className="section-heading">
            <h2>{t("home.featuredTitle")}</h2>
            <p className="text-stone-400 text-sm">
              {locale === "ar" ? "أبرز منتجاتنا المختارة خصيصاً لك" : "Notre sélection de pièces incontournables"}
            </p>
          </div>

          <div className="mt-10">
            <ProductGrid initialLimit={8} />
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="btn btn-primary px-10 py-3.5 text-sm uppercase tracking-[0.08em] font-semibold"
              onClick={() => trackCustomEvent("CTAClick", { button: "ViewAll", section: "featured" })}
            >
              {t("buttons.viewAll") || (locale === "ar" ? "عرض جميع المنتجات" : "Voir tous les produits")}
              <svg className={`w-4 h-4 ${locale === "ar" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BRAND STORY — Shopify "Rich text" section
          ══════════════════════════════════════════════ */}
      <section className="section scroll-animate">
        <div className="container-narrow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Stat tiles (left) */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "500+", label: locale === "ar" ? "منتج" : "Produits" },
                { value: "10K+", label: locale === "ar" ? "عميل راضٍ" : "Clients satisfaits" },
                { value: "4.8★", label: locale === "ar" ? "تقييم متوسط" : "Note moyenne" },
                { value: "58", label: locale === "ar" ? "ولاية تغطيها" : "Wilayas desservies" },
              ].map(({ value, label }) => (
                <div key={label}
                  className="bg-[#FAF7F0] border border-[#E2D9C8] p-6 flex flex-col gap-1 group hover:border-stone-900 transition-colors"
                >
                  <span className="font-sans text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">{value}</span>
                  <span className="text-xs font-sans font-medium text-stone-400 uppercase tracking-wide">{label}</span>
                </div>
              ))}
            </div>

            {/* Text (right) */}
            <div>
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-[#D4AF37] mb-4">
                {locale === "ar" ? "قصتنا" : "Notre Histoire"}
              </p>
              <h2 className="text-2xl md:text-3xl font-sans font-semibold text-stone-900 mb-5 leading-snug">
                {t("home.aboutTitle")}
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-8">
                {t("home.aboutDesc")}
              </p>
              <Link
                href="/contact"
                className="btn btn-secondary px-7 py-3 text-sm uppercase tracking-wider font-semibold"
              >
                {t("nav.contact")}
                <svg className={`w-4 h-4 ${locale === "ar" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA BANNER — Shopify "Image banner" section
          ══════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 bg-[#0F0F0F] overflow-hidden scroll-animate">
        <div className="absolute inset-0 bg-gradient-to-br from-black to-[#1A1613]" />
        <div className="absolute top-0 inset-x-0 h-px bg-[#D4AF37]/30" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-[#D4AF37]/30" />
        <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />

        <div className="container relative z-10 text-center max-w-2xl mx-auto">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-[#D4AF37] mb-5">
            {locale === "ar" ? "وصل جديد" : "Nouvelles Arrivées"}
          </p>
          <h2 className="text-3xl md:text-5xl font-sans font-bold text-white mb-6 leading-tight tracking-tight">
            {t("home.ctaTitle") || "ZAK SHOP"}
          </h2>
          <p className="text-stone-400 text-sm md:text-base mb-10 leading-relaxed">
            {t("home.ctaDesc")}
          </p>
          <div className={`flex flex-wrap items-center justify-center gap-4 ${locale === "ar" ? "flex-row-reverse" : ""}`}>
            <Link
              href="/products"
              className="btn btn-accent px-9 py-3.5 text-sm uppercase tracking-wider font-bold"
              onClick={() => trackCustomEvent("CTAClick", { button: "ViewAll", section: "cta_banner" })}
            >
              {locale === "ar" ? "اكتشف الكولكشن" : "Voir la collection"}
            </Link>
            <Link
              href="/contact"
              className="btn btn-outline-white px-9 py-3.5 text-sm uppercase tracking-wider font-semibold"
            >
              {t("nav.contact")}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}