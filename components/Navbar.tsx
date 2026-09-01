"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { trackCustomEvent } from "@/components/MetaPixel";
import Logo from "./Logo";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { locale, setLocale, t } = useI18n();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    const next = locale === "ar" ? "fr" : "ar";
    trackCustomEvent("LanguageSwitch", { from: locale, to: next });
    setLocale(next);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <>
      {/* Main header */}
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,.08)]" : "border-b border-[#E2D9C8]"
        }`}
      >
        <div className="container">
          <div className={`flex items-center h-[60px] md:h-[68px] ${locale === "ar" ? "flex-row-reverse" : ""}`}>

            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center gap-3 hover:opacity-90 transition-opacity">
              <Logo width={48} height={48} />
              <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-stone-900 hidden sm:block">
                LAYACHI <span className="font-sans font-light text-stone-500 text-[0.6em] ml-1 tracking-[0.2em] align-middle">BEDDING</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className={`hidden md:flex items-center gap-10 ml-auto mr-auto ${locale === "ar" ? "flex-row-reverse" : ""}`}>
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="link-animated text-sm font-sans font-medium text-stone-600 hover:text-stone-900 transition-colors py-1"
                  onClick={() => trackCustomEvent("NavClick", { link: href })}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className={`flex items-center gap-1 ml-auto md:ml-0 ${locale === "ar" ? "mr-auto md:mr-0" : ""}`}>
              <button
                onClick={toggleLanguage}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold
                           text-stone-500 hover:text-stone-900 hover:border-stone-300 border border-transparent
                           transition-all rounded-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {locale === "ar" ? "FR" : "AR"}
              </button>

              <button className="icon-btn" aria-label="Search">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                </svg>
              </button>

              <button
                className="md:hidden icon-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <div className={`absolute top-0 ${locale === "ar" ? "right-0" : "left-0"} h-full w-[280px] bg-white shadow-2xl flex flex-col`}>
            <div className="flex items-center justify-between px-5 h-[60px] border-b border-[#E2D9C8]">
              <span className="font-sans text-lg font-bold text-stone-900">
                LAYACHI <span className="font-light text-stone-400">BEDDING</span>
              </span>
              <button className="icon-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Fermer le menu">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between px-5 py-4 text-sm font-sans font-medium
                             text-stone-800 hover:bg-[#FAF7F0] border-b border-[#F0EAE0]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                  <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-[#E2D9C8]">
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-sans
                           font-medium border border-stone-300 text-stone-700 hover:border-stone-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {locale === "ar" ? "Passer en Français" : "التبديل إلى العربية"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}