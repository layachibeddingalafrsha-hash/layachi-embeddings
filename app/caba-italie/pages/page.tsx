"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { useAdminI18n } from "@/lib/admin-i18n";

interface PageData {
  slug: string;
  title_ar: string;
  title_fr: string;
  content_ar: string;
  content_fr: string;
  updatedAt?: string;
}

const PAGE_SLUGS = [
  { slug: "faq", label_ar: "الأسئلة الشائعة", label_fr: "FAQ" },
  { slug: "shipping", label_ar: "الشحن", label_fr: "Livraison" },
  { slug: "returns", label_ar: "الإرجاع والاستبدال", label_fr: "Retours & Échanges" },
  { slug: "terms", label_ar: "الشروط والأحكام", label_fr: "Termes & Conditions" },
];

export default function AdminPagesEditor() {
  const { t } = useAdminI18n();
  const [pages, setPages] = useState<Record<string, PageData>>({});
  const [activeSlug, setActiveSlug] = useState("faq");
  const [activeTab, setActiveTab] = useState<"ar" | "fr">("ar");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pages");
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, PageData> = {};
        for (const p of data.pages || []) {
          map[p.slug] = p;
        }
        // Ensure all pages exist in state even if not in DB
        for (const ps of PAGE_SLUGS) {
          if (!map[ps.slug]) {
            map[ps.slug] = {
              slug: ps.slug,
              title_ar: "",
              title_fr: "",
              content_ar: "",
              content_fr: "",
            };
          }
        }
        setPages(map);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleSave = async () => {
    const page = pages[activeSlug];
    if (!page) return;

    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      if (res.ok) {
        const data = await res.json();
        setPages((prev) => ({ ...prev, [activeSlug]: data.page }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving page:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof PageData, value: string) => {
    setPages((prev) => ({
      ...prev,
      [activeSlug]: { ...prev[activeSlug], [field]: value },
    }));
  };

  const currentPage = pages[activeSlug];
  const currentPageMeta = PAGE_SLUGS.find((p) => p.slug === activeSlug);

  // Toolbar actions for rich text
  const insertTag = (tag: string, attrs = "") => {
    const field = activeTab === "ar" ? "content_ar" : "content_fr";
    const textarea = document.getElementById(`editor-${field}`) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const openTag = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
    const closeTag = `</${tag}>`;
    const replacement = `${openTag}${selected}${closeTag}`;

    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    updateField(field, newValue);

    // Restore cursor
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + openTag.length;
      textarea.selectionEnd = start + openTag.length + selected.length;
    }, 0);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("pages.title")}
        </h1>
        <p className="text-gray-500 mt-1">{t("pages.subtitle")}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Page selector sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  {t("pages.selectPage")}
                </h2>
              </div>
              <nav className="p-2">
                {PAGE_SLUGS.map((ps) => (
                  <button
                    key={ps.slug}
                    onClick={() => { setActiveSlug(ps.slug); setPreviewMode(false); }}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all duration-150 ${
                      activeSlug === ps.slug
                        ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="text-sm font-medium">{ps.label_fr}</div>
                    <div className="text-xs text-gray-400 mt-0.5" dir="rtl">{ps.label_ar}</div>
                    {pages[ps.slug]?.updatedAt && (
                      <div className="text-[10px] text-gray-400 mt-1">
                        {new Date(pages[ps.slug].updatedAt!).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Editor area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Header with page name and actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-100 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {currentPageMeta?.label_fr}
                    <span className="text-gray-400 mx-2">—</span>
                    <span dir="rtl">{currentPageMeta?.label_ar}</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">/{activeSlug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      previewMode
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {previewMode ? t("pages.edit") : t("pages.preview")}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t("pages.saving")}
                      </>
                    ) : saveSuccess ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t("pages.saved")}
                      </>
                    ) : (
                      t("pages.save")
                    )}
                  </button>
                </div>
              </div>

              {/* Language tabs */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("ar")}
                  className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
                    activeTab === "ar"
                      ? "text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  🇩🇿 العربية
                </button>
                <button
                  onClick={() => setActiveTab("fr")}
                  className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
                    activeTab === "fr"
                      ? "text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  🇫🇷 Français
                </button>
              </div>

              <div className="p-6">
                {currentPage && !previewMode && (
                  <div className="space-y-5">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {activeTab === "ar" ? "عنوان الصفحة" : "Titre de la page"}
                      </label>
                      <input
                        type="text"
                        dir={activeTab === "ar" ? "rtl" : "ltr"}
                        value={activeTab === "ar" ? currentPage.title_ar : currentPage.title_fr}
                        onChange={(e) =>
                          updateField(activeTab === "ar" ? "title_ar" : "title_fr", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-semibold"
                        placeholder={activeTab === "ar" ? "أدخل العنوان..." : "Entrez le titre..."}
                      />
                    </div>

                    {/* HTML Toolbar */}
                    <div className="flex flex-wrap gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <button onClick={() => insertTag("h2", 'class="text-2xl font-bold text-zak-black mb-4"')} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold hover:bg-gray-100 transition-colors" title="Heading 2">H2</button>
                      <button onClick={() => insertTag("h3", 'class="text-xl font-semibold text-gray-900 mb-2"')} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold hover:bg-gray-100 transition-colors" title="Heading 3">H3</button>
                      <button onClick={() => insertTag("p", 'class="text-gray-700 mb-4 leading-relaxed"')} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-100 transition-colors" title="Paragraph">P</button>
                      <div className="w-px h-7 bg-gray-300 mx-1"></div>
                      <button onClick={() => insertTag("strong")} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold hover:bg-gray-100 transition-colors" title="Bold"><b>B</b></button>
                      <button onClick={() => insertTag("em")} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs italic hover:bg-gray-100 transition-colors" title="Italic"><i>I</i></button>
                      <button onClick={() => insertTag("u")} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs underline hover:bg-gray-100 transition-colors" title="Underline"><u>U</u></button>
                      <div className="w-px h-7 bg-gray-300 mx-1"></div>
                      <button onClick={() => insertTag("ul", 'class="list-disc list-inside space-y-2 text-gray-700 mb-4"')} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-100 transition-colors" title="Unordered List">UL</button>
                      <button onClick={() => insertTag("ol", 'class="list-decimal list-inside space-y-2 text-gray-700 mb-4"')} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-100 transition-colors" title="Ordered List">OL</button>
                      <button onClick={() => insertTag("li")} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-100 transition-colors" title="List Item">LI</button>
                      <div className="w-px h-7 bg-gray-300 mx-1"></div>
                      <button onClick={() => insertTag("div", 'class="bg-white rounded-lg shadow-md p-8 mb-8"')} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-100 transition-colors" title="Card Section">📦 Card</button>
                      <button onClick={() => insertTag("div", 'class="bg-zak-black/10 rounded-lg p-6 border-l-4 border-zak-black mb-4"')} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-100 transition-colors" title="Note Block">📌 Note</button>
                      <button onClick={() => {
                        const field = activeTab === "ar" ? "content_ar" : "content_fr";
                        const textarea = document.getElementById(`editor-${field}`) as HTMLTextAreaElement;
                        if (!textarea) return;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const url = prompt(activeTab === "ar" ? "أدخل الرابط:" : "Entrez l'URL:");
                        if (!url) return;
                        const selected = textarea.value.substring(start, end) || (activeTab === "ar" ? "رابط" : "lien");
                        const link = `<a href="${url}" class="text-zak-black underline hover:text-emerald-700">${selected}</a>`;
                        const newVal = textarea.value.substring(0, start) + link + textarea.value.substring(end);
                        updateField(field, newVal);
                      }} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-100 transition-colors" title="Link">🔗 Link</button>
                    </div>

                    {/* Content editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {activeTab === "ar" ? "محتوى الصفحة (HTML)" : "Contenu de la page (HTML)"}
                      </label>
                      <textarea
                        id={`editor-${activeTab === "ar" ? "content_ar" : "content_fr"}`}
                        dir={activeTab === "ar" ? "rtl" : "ltr"}
                        value={activeTab === "ar" ? currentPage.content_ar : currentPage.content_fr}
                        onChange={(e) =>
                          updateField(activeTab === "ar" ? "content_ar" : "content_fr", e.target.value)
                        }
                        rows={20}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm leading-relaxed"
                        placeholder={activeTab === "ar" ? "أدخل محتوى HTML هنا..." : "Entrez le contenu HTML ici..."}
                      />
                      <p className="text-xs text-gray-400 mt-1.5">
                        {activeTab === "ar"
                          ? "يمكنك استخدام وسوم HTML لتنسيق المحتوى. استخدم الأزرار أعلاه للمساعدة."
                          : "Vous pouvez utiliser des balises HTML pour formater le contenu. Utilisez les boutons ci-dessus."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Preview mode */}
                {currentPage && previewMode && (
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">{t("pages.previewLang")}:</span>
                      <button
                        onClick={() => setActiveTab("ar")}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          activeTab === "ar" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        العربية
                      </button>
                      <button
                        onClick={() => setActiveTab("fr")}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          activeTab === "fr" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        Français
                      </button>
                    </div>
                    <div
                      className="border border-gray-200 rounded-lg p-6 bg-gray-50 min-h-[400px]"
                      dir={activeTab === "ar" ? "rtl" : "ltr"}
                    >
                      <h1 className="text-3xl font-bold text-zak-black mb-6">
                        {activeTab === "ar" ? currentPage.title_ar : currentPage.title_fr}
                      </h1>
                      <div
                        className="prose prose-lg max-w-none space-y-6"
                        dangerouslySetInnerHTML={{
                          __html: activeTab === "ar" ? currentPage.content_ar : currentPage.content_fr,
                        }}
                      />
                    </div>
                  </div>
                )}

                {!currentPage && (
                  <div className="text-center py-12 text-gray-400">
                    {t("pages.selectPagePrompt")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
