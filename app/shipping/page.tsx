"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function ShippingPage() {
  const { locale } = useI18n();
  const [dynamicContent, setDynamicContent] = useState<{ title: string; html: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pages?slug=shipping")
      .then((res) => res.json())
      .then((data) => {
        if (data.page) {
          const title = locale === "ar" ? data.page.title_ar : data.page.title_fr;
          const html = locale === "ar" ? data.page.content_ar : data.page.content_fr;
          if (html && html.trim().length > 0) {
            setDynamicContent({ title, html });
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  // Dynamic content from DB
  if (dynamicContent) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-zak-black mb-4">
              {dynamicContent.title}
            </h1>
          </div>
          <div
            className="prose prose-lg max-w-none space-y-6"
            dir={locale === "ar" ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{ __html: dynamicContent.html }}
          />
        </div>
      </div>
    );
  }

  // Fallback: original static content
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-zak-black mb-4">
            {locale === "ar" ? "سياسة الشحن" : "Politique de Livraison"}
          </h1>
          <p className="text-gray-600 text-lg">
            {locale === "ar"
              ? "معلومات مفصلة حول عملية الشحن والتوصيل"
              : "Informations détaillées sur le processus d'expédition et de livraison"}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          {locale === "ar" ? (
            <>
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">مناطق التوصيل</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  نقوم بالتوصيل إلى جميع ولايات الجزائر. نضمن وصول منتجاتك بأمان وفي الوقت المحدد.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">مدة التوصيل</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-zak-black mt-1 ml-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>الجزائر العاصمة ووهران:</strong> 2-3 أيام عمل</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-zak-black mt-1 ml-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>المدن الكبرى الأخرى:</strong> 3-5 أيام عمل</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-zak-black mt-1 ml-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>المناطق النائية:</strong> 5-7 أيام عمل</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">تكاليف الشحن</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع التوصيل</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التكلفة</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">التوصيل للمنزل</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">200 دج</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">الاستلام من المكتب</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">345 دج</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-4">* قد تختلف التكاليف حسب الولاية والبلدية</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">عملية الشحن</h2>
                <ol className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold ml-4">1</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">تأكيد الطلب</h3>
                      <p className="text-gray-600">سنتصل بك خلال 24 ساعة لتأكيد طلبك والعنوان</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold ml-4">2</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">التحضير والتغليف</h3>
                      <p className="text-gray-600">نقوم بتحضير طلبك وتغليفه بعناية لضمان سلامة المنتج</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold ml-4">3</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">الشحن</h3>
                      <p className="text-gray-600">نرسل الطلب عبر شركة الشحن الموثوقة</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold ml-4">4</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">التسليم</h3>
                      <p className="text-gray-600">سيتم تسليم الطلب إلى عنوانك أو المكتب المحدد</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-zak-black/10 rounded-lg p-6 border-r-4 border-zak-black">
                <h3 className="font-bold text-lg text-zak-black mb-2">ملاحظة هامة</h3>
                <p className="text-gray-700">
                  يرجى التأكد من صحة رقم الهاتف والعنوان عند تقديم الطلب لضمان التواصل السريع والتسليم الناجح.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">Zones de Livraison</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Nous livrons dans toutes les wilayas d&apos;Algérie. Nous garantissons que vos produits arrivent en toute sécurité et à temps.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">Délai de Livraison</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-zak-black mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Alger et Oran:</strong> 2-3 jours ouvrables</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-zak-black mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Autres grandes villes:</strong> 3-5 jours ouvrables</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-zak-black mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Zones éloignées:</strong> 5-7 jours ouvrables</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">Frais de Livraison</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de Livraison</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coût</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Livraison à domicile</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">200 DZD</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Retrait au bureau</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">345 DZD</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-4">* Les coûts peuvent varier selon la wilaya</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">Processus d&apos;Expédition</h2>
                <ol className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold mr-4">1</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Confirmation de Commande</h3>
                      <p className="text-gray-600">Nous vous contacterons dans les 24 heures pour confirmer votre commande et l&apos;adresse</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold mr-4">2</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Préparation et Emballage</h3>
                      <p className="text-gray-600">Nous préparons et emballons soigneusement votre commande</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold mr-4">3</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Expédition</h3>
                      <p className="text-gray-600">Nous envoyons la commande via une société de livraison fiable</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold mr-4">4</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Livraison</h3>
                      <p className="text-gray-600">La commande sera livrée à votre adresse ou au bureau spécifié</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-zak-black/10 rounded-lg p-6 border-l-4 border-zak-black">
                <h3 className="font-bold text-lg text-zak-black mb-2">Note Importante</h3>
                <p className="text-gray-700">
                  Veuillez vous assurer de l&apos;exactitude du numéro de téléphone et de l&apos;adresse lors de la passation de la commande.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
