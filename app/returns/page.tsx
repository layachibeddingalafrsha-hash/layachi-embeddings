"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function ReturnsPage() {
  const { locale } = useI18n();
  const [dynamicContent, setDynamicContent] = useState<{ title: string; html: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pages?slug=returns")
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
            {locale === "ar" ? "سياسة الإرجاع والاستبدال" : "Politique de Retour et d'Échange"}
          </h1>
          <p className="text-gray-600 text-lg">
            {locale === "ar"
              ? "نحن نهتم برضاك الكامل عن مشترياتك"
              : "Nous nous soucions de votre satisfaction complète avec vos achats"}
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          {locale === "ar" ? (
            <>
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">شروط الإرجاع</h2>
                <ul className="space-y-3 text-gray-700">
                  <li>يمكنك إرجاع المنتج خلال <strong>14 يومًا</strong> من تاريخ الاستلام</li>
                  <li>يجب أن يكون المنتج في <strong>حالته الأصلية</strong> دون استخدام</li>
                  <li>الاحتفاظ بجميع <strong>العلامات والملصقات</strong> الأصلية</li>
                  <li>إرفاق <strong>فاتورة الشراء</strong> أو رقم الطلب</li>
                  <li>المنتج يجب أن يكون في <strong>العبوة الأصلية</strong></li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">عملية الإرجاع</h2>
                <ol className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold ml-4">1</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">الاتصال بنا</h3>
                      <p className="text-gray-600">اتصل بخدمة العملاء عبر الهاتف أو واتساب لطلب الإرجاع</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold ml-4">2</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">الحصول على موافقة الإرجاع</h3>
                      <p className="text-gray-600">سنراجع طلبك ونعطيك رقم موافقة الإرجاع (RMA)</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold ml-4">3</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">تعبئة المنتج</h3>
                      <p className="text-gray-600">قم بتعبئة المنتج في عبوته الأصلية مع رقم RMA</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold ml-4">4</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">إرسال المنتج</h3>
                      <p className="text-gray-600">سنرسل ممثلنا لاستلام المنتج من عنوانك</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold ml-4">5</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">الفحص والاسترداد</h3>
                      <p className="text-gray-600">بعد فحص المنتج، سيتم معالجة الاسترداد خلال 7-10 أيام عمل</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">سياسة الاستبدال</h2>
                <p className="text-gray-700 mb-4">إذا كنت ترغب في استبدال المنتج بمقاس أو لون مختلف:</p>
                <ul className="space-y-3 text-gray-700">
                  <li>الاستبدال <strong>مجاني</strong> إذا كان بسبب عيب في المنتج</li>
                  <li>يمكن استبدال المنتج <strong>مرة واحدة فقط</strong></li>
                  <li>يتم الاستبدال حسب <strong>توفر المنتج البديل</strong></li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">المنتجات غير القابلة للإرجاع</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>الوسائد والشراشف (لأسباب صحية)</li>
                  <li>المنتجات المستخدمة أو المغسولة</li>
                  <li>المنتجات بدون علامات أو ملصقات أصلية</li>
                  <li>المنتجات المخفضة أو في التخفيضات الموسمية</li>
                </ul>
              </div>

              <div className="bg-zak-black/10 rounded-lg p-6 border-r-4 border-zak-black">
                <h3 className="font-bold text-lg text-zak-black mb-2">هل تحتاج مساعدة؟</h3>
                <p className="text-gray-700 mb-4">فريق خدمة العملاء لدينا جاهز لمساعدتك في أي استفسارات حول الإرجاع أو الاستبدال.</p>
                <a href="/contact" className="btn btn-primary inline-block">اتصل بنا</a>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">Conditions de Retour</h2>
                <ul className="space-y-3 text-gray-700">
                  <li>Vous pouvez retourner le produit dans les <strong>14 jours</strong> suivant la réception</li>
                  <li>Le produit doit être dans son <strong>état d&apos;origine</strong> sans utilisation</li>
                  <li>Conserver toutes les <strong>étiquettes et labels</strong> d&apos;origine</li>
                  <li>Joindre la <strong>facture d&apos;achat</strong> ou le numéro de commande</li>
                  <li>Le produit doit être dans l&apos;<strong>emballage d&apos;origine</strong></li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">Processus de Retour</h2>
                <ol className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold mr-4">1</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Contactez-nous</h3>
                      <p className="text-gray-600">Appelez le service client par téléphone ou WhatsApp</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold mr-4">2</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Obtenir l&apos;Approbation de Retour</h3>
                      <p className="text-gray-600">Nous examinerons votre demande et vous donnerons un numéro RMA</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold mr-4">3</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Emballer le Produit</h3>
                      <p className="text-gray-600">Emballez le produit dans son emballage d&apos;origine avec le numéro RMA</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold mr-4">4</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Envoyer le Produit</h3>
                      <p className="text-gray-600">Nous enverrons notre représentant récupérer le produit à votre adresse</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-zak-black text-white rounded-full flex items-center justify-center font-bold mr-4">5</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Inspection et Remboursement</h3>
                      <p className="text-gray-600">Après inspection, le remboursement sera traité dans les 7-10 jours ouvrables</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">Politique d&apos;Échange</h2>
                <p className="text-gray-700 mb-4">Si vous souhaitez échanger le produit pour une taille ou une couleur différente:</p>
                <ul className="space-y-3 text-gray-700">
                  <li>L&apos;échange est <strong>gratuit</strong> s&apos;il est dû à un défaut du produit</li>
                  <li>Le produit peut être échangé <strong>une seule fois</strong></li>
                  <li>L&apos;échange se fait selon la <strong>disponibilité du produit de remplacement</strong></li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-zak-black mb-4">Produits Non Retournables</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>Oreillers et draps (pour des raisons d&apos;hygiène)</li>
                  <li>Produits utilisés ou lavés</li>
                  <li>Produits sans étiquettes ou labels d&apos;origine</li>
                  <li>Produits soldés ou en promotion saisonnière</li>
                </ul>
              </div>

              <div className="bg-zak-black/10 rounded-lg p-6 border-l-4 border-zak-black">
                <h3 className="font-bold text-lg text-zak-black mb-2">Besoin d&apos;Aide?</h3>
                <p className="text-gray-700 mb-4">Notre équipe du service client est prête à vous aider.</p>
                <a href="/contact" className="btn btn-primary inline-block">Contactez-nous</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
