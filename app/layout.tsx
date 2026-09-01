import type { Metadata, Viewport } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import MetaPixel from "@/components/MetaPixel";
import { I18nProvider, translations } from "@/lib/i18n";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL 
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin 
  : "https://www.layachi-bedding.com";
const SITE_NAME = "Layachi Bedding";
const SITE_TAGLINE = "للأفرشة | Literie Premium";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "ياشي للأفرشة — أفضل وجهة للأفرشة والأثاث المنزلي بجودة عالية بأسعار مناسبة. توصيل سريع لجميع ولايات الجزائر. Layachi Bedding — La meilleure destination literie en Algérie.",
  keywords:
    "layachi bedding, ياشي للأفرشة, أفرشة جزائر, literie algérie, meubles algérie, boutique en ligne algérie, livraison algérie, ياشي-بيدينج, bedding algeria, furniture algeria, layachi-bedding",
  authors: [{ name: "Layachi Bedding" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: { ar: "/", fr: "/" },
  },
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    alternateLocale: "fr_DZ",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "ياشي للأفرشة — متجر الأفرشة الأول في الجزائر. جودة عالية, توصيل سريع, أسعار تنافسية.",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Layachi Bedding — Literie Premium Algérie" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description:
      "ياشي للأفرشة — أفرشة فاخرة, توصيل سريع لجميع ولايات الجزائر. Livraison rapide partout en Algérie.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg",  type: "image/svg+xml" },
      { url: "/favicon.ico",  sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      className={`${montserrat.variable} ${cormorant.variable}`}
      dir="rtl"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Italiana&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { --font-italiana: 'Italiana', Georgia, serif; }`,
          }}
        />
      </head>
      <body>
        <I18nProvider initialLocale="ar" translations={translations}>
          {/* Schema.org Structured Data — Layachi Bedding */}
          <Script
            id="schema-org"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "FurnitureStore",
                    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.layachi-bedding.com"}/#store`,
                    name: "Layachi Bedding",
                    alternateName: "ياشي للأفرشة",
                    url:  process.env.NEXT_PUBLIC_SITE_URL || "https://www.layachi-bedding.com",
                    description: "متجر الأفرشة الأول في الجزائر — أفرشة وأثاث عالي الجودة بأسعار تنافسية. La meilleure boutique de literie en Algérie.",
                    image: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.layachi-bedding.com"}/og-image.jpg`,
                    priceRange: "$$",
                    currenciesAccepted: "DZD",
                    paymentAccepted: "Cash, Livraison contre remboursement",
                    areaServed: "DZ",
                    inLanguage: ["ar", "fr"],
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: "4.8",
                      reviewCount: "1240",
                    }
                  },
                  {
                    "@type": "WebSite",
                    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.layachi-bedding.com"}/#website`,
                    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.layachi-bedding.com",
                    name: "Layachi Bedding",
                    potentialAction: {
                      "@type": "SearchAction",
                      target: {
                        "@type": "EntryPoint",
                        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.layachi-bedding.com"}/products?q={search_term_string}`,
                      },
                      "query-input": "required name=search_term_string",
                    },
                  },
                ],
              }),
            }}
          />

          <MetaPixel />
          <ConditionalLayout>{children}</ConditionalLayout>
        </I18nProvider>
      </body>
    </html>
  );
}
