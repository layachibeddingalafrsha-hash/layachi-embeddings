"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFaqsAr: FAQItem[] = [
  { question: "كيف يمكنني تقديم طلب؟", answer: "يمكنك تصفح منتجاتنا، اختيار المنتج المطلوب، والنقر على 'اشتري الآن'. سيتم توجيهك إلى صفحة الدفع حيث يمكنك إدخال معلومات الشحن الخاصة بك." },
  { question: "ما هي طرق الدفع المتاحة؟", answer: "نقدم حاليًا الدفع عند الاستلام (COD). سيتم تحصيل المبلغ عند تسليم الطلب إلى عنوانك." },
  { question: "كم من الوقت يستغرق التوصيل؟", answer: "عادةً ما يستغرق التوصيل من 2 إلى 5 أيام عمل حسب موقعك. سنتصل بك لتأكيد الطلب وموعد التسليم." },
  { question: "هل يمكنني إرجاع أو استبدال المنتج؟", answer: "نعم، يمكنك إرجاع أو استبدال المنتج خلال 14 يومًا من تاريخ الاستلام بشرط أن يكون المنتج في حالته الأصلية مع العبوة." },
  { question: "كيف يمكنني تتبع طلبي؟", answer: "سنتصل بك عبر الهاتف لتأكيد الطلب وإعلامك بحالة الشحن. يمكنك أيضًا الاتصال بنا في أي وقت للاستفسار عن طلبك." },
  { question: "ما هي تكاليف الشحن؟", answer: "تختلف تكاليف الشحن حسب الولاية ونوع التوصيل (توصيل للمنزل أو استلام من المكتب). سيتم عرض التكلفة الدقيقة عند إتمام الطلب." },
  { question: "هل المنتجات أصلية؟", answer: "نعم، جميع منتجاتنا أصلية 100% ونضمن جودتها. نعمل مع موردين موثوقين لضمان حصولك على أفضل المنتجات." },
  { question: "كيف يمكنني معرفة الأبعاد المناسبة؟", answer: "يمكنك الاتصال بنا عبر واتساب أو الهاتف، وسنساعدك في اختيار الأبعاد المناسبة بناءً على المساحة المتوفرة لديك." },
  { question: "هل تقدمون خصومات؟", answer: "نعم، نقدم عروض وخصومات موسمية. تابعنا على وسائل التواصل الاجتماعي للبقاء على اطلاع بأحدث العروض." },
  { question: "كيف يمكنني التواصل مع خدمة العملاء؟", answer: "يمكنك التواصل معنا عبر صفحة الاتصال، عبر البريد الإلكتروني contact@layachi-bedding.com، أو عبر واتساب. نحن متاحون للإجابة على استفساراتك." },
];

const defaultFaqsFr: FAQItem[] = [
  { question: "Comment puis-je passer une commande ?", answer: "Vous pouvez parcourir nos produits, sélectionner le produit souhaité et cliquer sur 'Acheter maintenant'. Vous serez dirigé vers la page de paiement où vous pourrez saisir vos informations de livraison." },
  { question: "Quels sont les modes de paiement disponibles ?", answer: "Nous proposons actuellement le paiement à la livraison (COD). Le montant sera collecté lors de la livraison de votre commande à votre adresse." },
  { question: "Combien de temps prend la livraison ?", answer: "La livraison prend généralement de 2 à 5 jours ouvrables selon votre emplacement. Nous vous contacterons pour confirmer la commande et la date de livraison." },
  { question: "Puis-je retourner ou échanger un produit ?", answer: "Oui, vous pouvez retourner ou échanger un produit dans les 14 jours suivant la réception, à condition que le produit soit dans son état d'origine avec l'emballage." },
  { question: "Comment puis-je suivre ma commande ?", answer: "Nous vous contacterons par téléphone pour confirmer la commande et vous informer de l'état de l'expédition. Vous pouvez également nous contacter à tout moment pour vous renseigner sur votre commande." },
  { question: "Quels sont les frais de livraison ?", answer: "Les frais de livraison varient selon la wilaya et le type de livraison (livraison à domicile ou retrait au bureau). Le coût exact sera affiché lors de la finalisation de la commande." },
  { question: "Les produits sont-ils authentiques ?", answer: "Oui, tous nos produits sont 100% authentiques et nous garantissons leur qualité. Nous travaillons avec des fournisseurs fiables pour vous assurer les meilleurs produits." },
  { question: "Comment puis-je connaître les dimensions appropriées ?", answer: "Vous pouvez nous contacter via WhatsApp ou par téléphone, et nous vous aiderons à choisir les dimensions appropriées en fonction de votre espace." },
  { question: "Offrez-vous des réductions ?", answer: "Oui, nous proposons des offres et des réductions saisonnières. Suivez-nous sur les réseaux sociaux pour rester informé de nos dernières offres." },
  { question: "Comment puis-je contacter le service client ?", answer: "Vous pouvez nous contacter via la page de contact, par e-mail à contact@layachi-bedding.com ou via WhatsApp. Nous sommes disponibles pour répondre à vos questions." },
];

export default function FAQPage() {
  const { locale } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [dynamicContent, setDynamicContent] = useState<{ title: string; html: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pages?slug=faq")
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

  const faqs = locale === "ar" ? defaultFaqsAr : defaultFaqsFr;

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  // If dynamic content from DB exists, render it
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
          <div className="mt-12 text-center bg-zak-black/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-zak-black mb-4">
              {locale === "ar" ? "لم تجد إجابة لسؤالك؟" : "Vous n'avez pas trouvé de réponse ?"}
            </h2>
            <p className="text-gray-600 mb-6">
              {locale === "ar"
                ? "فريق خدمة العملاء لدينا جاهز لمساعدتك"
                : "Notre équipe du service client est prête à vous aider"}
            </p>
            <a href="/contact" className="btn btn-primary inline-block">
              {locale === "ar" ? "اتصل بنا" : "Contactez-nous"}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: original static FAQ accordion
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-zak-black mb-4">
            {locale === "ar" ? "الأسئلة الشائعة" : "Questions Fréquentes"}
          </h1>
          <p className="text-gray-600 text-lg">
            {locale === "ar"
              ? "إجابات على الأسئلة الأكثر شيوعًا حول منتجاتنا وخدماتنا"
              : "Réponses aux questions les plus courantes sur nos produits et services"}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-800 pr-4">{faq.question}</h3>
                <svg
                  className={`w-6 h-6 text-zak-black flex-shrink-0 transition-transform ${openIndex === index ? "transform rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 pt-2 text-gray-600 leading-relaxed border-t border-gray-100">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-zak-black/5 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-zak-black mb-4">
            {locale === "ar" ? "لم تجد إجابة لسؤالك؟" : "Vous n'avez pas trouvé de réponse ?"}
          </h2>
          <p className="text-gray-600 mb-6">
            {locale === "ar"
              ? "فريق خدمة العملاء لدينا جاهز لمساعدتك"
              : "Notre équipe du service client est prête à vous aider"}
          </p>
          <a href="/contact" className="btn btn-primary inline-block">
            {locale === "ar" ? "اتصل بنا" : "Contactez-nous"}
          </a>
        </div>
      </div>
    </div>
  );
}
