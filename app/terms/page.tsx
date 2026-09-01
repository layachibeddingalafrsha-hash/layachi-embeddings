"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
  const { locale } = useI18n();
  const [dynamicContent, setDynamicContent] = useState<{ title: string; html: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pages?slug=terms")
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
            {locale === "ar" ? "الشروط والأحكام" : "Termes et Conditions"}
          </h1>
          <p className="text-gray-600 text-lg">
            {locale === "ar"
              ? "يرجى قراءة هذه الشروط بعناية قبل استخدام خدماتنا"
              : "Veuillez lire attentivement ces termes avant d'utiliser nos services"}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {locale === "ar" ? "آخر تحديث: ديسمبر 2024" : "Dernière mise à jour: Décembre 2024"}
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          {locale === "ar" ? (
            <>
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">1. قبول الشروط</h2>
                <p className="text-gray-700">
                  باستخدام موقع لعياشي للأفرشة (Layachi Bedding) للتسوق عبر الإنترنت، فإنك توافق على الالتزام بهذه الشروط والأحكام.
                  إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع أو خدماتنا.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">2. المنتجات والخدمات</h2>
                <ul className="space-y-3 text-gray-700 list-disc list-inside">
                  <li>نحن نبيع منتجات أثاث وأفرشة أصلية بنسبة 100%</li>
                  <li>جميع المنتجات المعروضة على الموقع تخضع للتوفر</li>
                  <li>نحتفظ بالحق في تغيير الأسعار في أي وقت دون إشعار مسبق</li>
                  <li>الصور المعروضة هي لأغراض التوضيح فقط وقد تختلف عن المنتج الفعلي قليلاً</li>
                  <li>نحتفظ بالحق في رفض أي طلب لأي سبب من الأسباب</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">3. الطلبات والدفع</h2>
                <p className="text-gray-700 mb-3">نقبل الدفع نقداً عند الاستلام (COD) فقط في جميع أنحاء الجزائر.</p>
                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                  <li>سيتم الاتصال بك لتأكيد طلبك عبر الهاتف أو واتساب</li>
                  <li>يجب تأكيد الطلب خلال 24 ساعة وإلا سيتم إلغاؤه تلقائياً</li>
                  <li>جميع الأسعار بالدينار الجزائري (DZD) وتشمل الضرائب</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">4. التوصيل</h2>
                <ul className="space-y-3 text-gray-700 list-disc list-inside">
                  <li>نقوم بالتوصيل إلى جميع ولايات الجزائر</li>
                  <li>مدة التوصيل: 2-7 أيام عمل حسب الموقع</li>
                  <li>التوصيل للمنزل: 200 دج — الاستلام من المكتب: 345 دج</li>
                  <li>نحن غير مسؤولين عن التأخير الناتج عن ظروف خارجة عن إرادتنا</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">5. الإرجاع والاستبدال</h2>
                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                  <li>فترة الإرجاع: 14 يوماً من تاريخ الاستلام</li>
                  <li>يجب أن يكون المنتج في حالته الأصلية مع جميع العلامات</li>
                  <li>لا يمكن إرجاع الوسائد والشراشف لأسباب صحية</li>
                  <li>المنتجات المخفضة غير قابلة للإرجاع</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">6. الخصوصية وحماية البيانات</h2>
                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                  <li>نجمع المعلومات الضرورية لمعالجة طلبك فقط</li>
                  <li>لن نشارك معلوماتك مع أطراف ثالثة دون موافقتك</li>
                  <li>نستخدم تدابير أمنية لحماية بياناتك</li>
                  <li>يمكنك طلب حذف بياناتك في أي وقت</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">7. تعديل الشروط</h2>
                <p className="text-gray-700">
                  نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. استمرارك في استخدام الموقع بعد التعديلات يعني موافقتك على الشروط المعدلة.
                </p>
              </div>

              <div className="bg-zak-black/10 rounded-lg p-6 border-r-4 border-zak-black">
                <h3 className="font-bold text-lg text-zak-black mb-2">اتصل بنا</h3>
                <p className="text-gray-700 mb-4">إذا كانت لديك أي أسئلة حول هذه الشروط والأحكام، يرجى مراسلتنا على contact@layachi-bedding.com:</p>
                <a href="/contact" className="btn btn-primary inline-block">اتصل بنا</a>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">1. Acceptation des Termes</h2>
                <p className="text-gray-700">
                  En utilisant le site Layachi Bedding, vous acceptez de vous conformer à ces termes et conditions.
                  Si vous n'acceptez pas ces termes, veuillez ne pas utiliser le site.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">2. Produits et Services</h2>
                <ul className="space-y-3 text-gray-700 list-disc list-inside">
                  <li>Nous vendons des meubles et literie premium 100% authentiques</li>
                  <li>Tous les produits sont sous réserve de disponibilité</li>
                  <li>Nous nous réservons le droit de modifier les prix sans préavis</li>
                  <li>Les images sont à titre indicatif seulement</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">3. Commandes et Paiement</h2>
                <p className="text-gray-700 mb-3">Nous acceptons uniquement le paiement à la livraison (COD).</p>
                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                  <li>Confirmation par téléphone ou WhatsApp obligatoire</li>
                  <li>Confirmation dans les 24h sinon annulation automatique</li>
                  <li>Tous les prix en DZD incluent les taxes</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">4. Livraison</h2>
                <ul className="space-y-3 text-gray-700 list-disc list-inside">
                  <li>Livraison dans toutes les wilayas d&apos;Algérie</li>
                  <li>Délai: 2-7 jours ouvrables</li>
                  <li>Domicile: 200 DZD — Bureau: 345 DZD</li>
                  <li>Non responsables des retards dus à des circonstances externes</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">5. Retours et Échanges</h2>
                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                  <li>Retour: 14 jours après réception</li>
                  <li>Produit en état d&apos;origine avec étiquettes</li>
                  <li>Oreillers et draps non retournables</li>
                  <li>Produits soldés non retournables</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">6. Confidentialité</h2>
                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                  <li>Collecte uniquement des informations nécessaires</li>
                  <li>Pas de partage avec des tiers sans consentement</li>
                  <li>Mesures de sécurité pour protéger vos données</li>
                  <li>Droit de suppression de vos données à tout moment</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">7. Modification des Termes</h2>
                <p className="text-gray-700">
                  Nous nous réservons le droit de modifier ces termes à tout moment. Votre utilisation continue signifie votre acceptation.
                </p>
              </div>

              <div className="bg-zak-black/10 rounded-lg p-6 border-l-4 border-zak-black">
                <h3 className="font-bold text-lg text-zak-black mb-2">Contactez-nous</h3>
                <p className="text-gray-700 mb-4">Pour toute question concernant ces termes, contactez-nous à contact@layachi-bedding.com :</p>
                <a href="/contact" className="btn btn-primary inline-block">Contactez-nous</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
