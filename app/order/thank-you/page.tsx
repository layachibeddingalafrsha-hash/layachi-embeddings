"use client";

import { trackPurchase } from "@/components/MetaPixel";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const orderId = searchParams.get("orderId");
  const total = searchParams.get("total");
  const numItems = searchParams.get("numItems");
  const eventId = searchParams.get("eventId"); // Event ID from checkout page
  const [printMode, setPrintMode] = useState(false);
  const [purchaseTracked, setPurchaseTracked] = useState(false);

  const isArabic = locale === "ar";

  // Track purchase event only if not already tracked (no eventId from checkout)
  useEffect(() => {
    if (orderId && total && !purchaseTracked) {
      // If eventId exists, the purchase was already tracked on checkout page
      // Only track here as a fallback if eventId is missing
      if (!eventId) {
        const totalValue = parseFloat(total);
        const itemCount = numItems ? parseInt(numItems) : 1;
        
        // Track client-side Purchase event as fallback
        trackPurchase(orderId, totalValue, itemCount);
        
        if (process.env.NEXT_PUBLIC_META_DEBUG === "true") {
          console.log("Thank-you page: Fallback Purchase tracking (no eventId from checkout)");
        }
      } else {
        if (process.env.NEXT_PUBLIC_META_DEBUG === "true") {
          console.log("Thank-you page: Skipping duplicate Purchase tracking (eventId already exists:", eventId, ")");
        }
      }
      
      setPurchaseTracked(true);
    }
  }, [orderId, total, numItems, eventId, purchaseTracked]);

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  return (
    <div className="container py-12">
      <div className={`max-w-2xl mx-auto ${printMode ? "print:block" : ""}`}>
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-primary mb-4">
            {isArabic ? "شكراً على طلبك!" : "Merci pour votre commande !"}
          </h1>

          {orderId && (
            <div className="bg-secondary p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-1">{isArabic ? "رقم الطلب" : "N° de commande"}</p>
              <p className="text-xl font-mono font-semibold">{orderId}</p>
            </div>
          )}

          <p className="text-gray-600 mb-6">
            {isArabic
              ? "تم تسجيل طلبك بنجاح. سوف يتصل بكم فريق الموقع لتأكيد الطلبية."
              : "Votre commande a été enregistrée avec succès. Notre équipe vous appellera pour la confirmer."}
          </p>

          <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 ${isArabic ? "text-right" : "text-left"}`}>
            <h2 className="font-semibold mb-2">{isArabic ? "ماذا بعد؟" : "Prochaines étapes"}</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <svg className={`w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 ${isArabic ? "ml-2" : "mr-2"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>
                  {isArabic
                    ? "سوف سيتصل بكم فريق الموقع لتأكيد الطلبية"
                    : "Notre équipe vous appellera pour confirmer la commande."}
                </span>
              </li>
              <li className="flex items-start">
                <svg className={`w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 ${isArabic ? "ml-2" : "mr-2"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>
                  {isArabic
                    ? "عدم الرد على المكالمة = الغاء الطلبية"
                    : "Sans réponse à l’appel = commande annulée."}
                </span>
              </li>
              <li className="flex items-start">
                <svg className={`w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 ${isArabic ? "ml-2" : "mr-2"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>
                  {isArabic
                    ? "كل زبون له الحق في فتح الطلبية لتأكد قبل الدفع"
                    : "Chaque client a le droit d’ouvrir le colis pour vérifier avant de payer."}
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
            <button
              onClick={handlePrint}
              className="btn btn-secondary"
            >
              {isArabic ? "طباعة الطلب" : "Imprimer la commande"}
            </button>
            <Link href="/products" className="btn btn-primary">
              {isArabic ? "متابعة التسوق" : "Continuer vos achats"}
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t text-sm text-gray-500">
            <p>
              {isArabic
                ? "تحتاج مساعدة؟ تواصل معنا في أي وقت."
                : "Besoin d’aide ? Contactez-nous à tout moment."}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="container py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zak-black mx-auto"></div>
        </div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
