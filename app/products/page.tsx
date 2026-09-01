"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useI18n } from "@/lib/i18n";
import { trackSearch, trackCustomEvent } from "@/components/MetaPixel";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  description: string;
  variants: any[];
  in_stock?: boolean;
  stock_quantity?: number;
}

interface Category {
  _id: string;
  name: string;
  slug?: string;  // Optional since it might not exist
  name_ar?: string;
  name_fr?: string;
  description?: string;
  description_ar?: string;
  description_fr?: string;
  image?: string;
}

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale, t } = useI18n();

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>("topSelling");
  const limit = 12; // Changed from 16 to 12 for better grid layout

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        const categoriesData = Array.isArray(data) ? data : data.categories || [];
        console.log('📂 Categories loaded:', categoriesData.map((c: Category) => ({
          id: c._id,
          name: c.name,
          slug: c.slug
        })));
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const sortParam = searchParams.get("sort");
    const categoryParam = searchParams.get("category"); // This will be category _id
    if (sortParam) {
      setSortBy(sortParam);
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: sortBy,
      });

      if (selectedCategory) {
        params.set("category", selectedCategory);
      }

      console.log('🔄 Fetching products:', {
        selectedCategory,
        page,
        sortBy,
        apiUrl: `/api/products?${params.toString()}`
      });

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      console.log('✅ Products received:', {
        total: data.total,
        productsCount: data.products?.length,
        currentPage: data.page
      });

      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    console.log('🔘 Category clicked:', {
      clickedId: categoryId,
      currentSelected: selectedCategory,
      willToggle: selectedCategory === categoryId
    });

    // Toggle category: if clicking the same category, clear it
    const newCategory = selectedCategory === categoryId ? "" : categoryId;

    console.log('🔄 Setting new category:', newCategory);

    // Track category filter event
    const categoryName = categories.find(c => c._id === categoryId)?.name || categoryId;
    trackSearch(newCategory ? categoryName : "All Categories", { content_category: categoryName });
    trackCustomEvent("CategoryFilter", { category_id: newCategory, category_name: categoryName, action: newCategory ? "filter" : "clear" });

    setSelectedCategory(newCategory);
    setPage(1);

    const params = new URLSearchParams(window.location.search);
    if (newCategory) {
      params.set("category", newCategory); // Use category _id
    } else {
      params.delete("category");
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (sort: string) => {
    trackCustomEvent("SortChange", { sort_by: sort, page: "products" });
    setSortBy(sort);
    setPage(1);

    const params = new URLSearchParams(window.location.search);
    params.set("sort", sort);
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sortBy, selectedCategory]);

  const getCategoryName = (category: Category) => {
    if (locale === "ar" && category.name_ar) return category.name_ar;
    if (locale === "fr" && category.name_fr) return category.name_fr;
    return category.name;
  };

  const totalPages = Math.ceil(total / limit);
  const inStockCount = products.filter(p => p.in_stock !== false && (p.stock_quantity ?? 0) > 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="relative bg-[#0F0F0F] text-white py-16 lg:py-20 overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1A1613] to-[#2C2520] opacity-95" />
        
        {/* Decorative soft glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-white/3 blur-[100px] pointer-events-none" />

        {/* Gold top rule */}
        <div className="absolute top-0 inset-x-0 h-px bg-[#D4AF37]/40" />

        <div className="container relative z-10 text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <p className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-6 bg-[#D4AF37]/70" />
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.32em] text-[#D4AF37]/90">
                Layachi Bedding
              </span>
              <span className="h-px w-6 bg-[#D4AF37]/70" />
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4 text-white">
              {t("nav.products")}
            </h1>
            <p className="text-lg font-sans font-light tracking-wide text-white/70 max-w-xl mx-auto">
              {locale === "ar"
                ? "اكتشف مجموعتنا الواسعة من المنتجات عالية الجودة"
                : "Découvrez notre large gamme de produits de haute qualité"
              }
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{total}</span> {locale === "ar" ? "منتج" : "produits"}
              {inStockCount > 0 && (
                <span className="ml-2 text-green-600">
                  • {inStockCount} {locale === "ar" ? "متوفر" : "en stock"}
                </span>
              )}
            </div>
            {selectedCategory && (
              <div className="flex items-center gap-2 px-3 py-1 bg-zak-black/10 rounded-full text-sm">
                <span className="text-zak-black font-medium">
                  {getCategoryName(categories.find(c => c._id === selectedCategory) || {} as Category)}
                </span>
                <button
                  onClick={() => handleCategoryChange("")}
                  className="text-zak-black hover:text-zak-black-dark"
                  title={locale === "ar" ? "إزالة الفلتر" : "Retirer le filtre"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-gray-600 whitespace-nowrap">
              {locale === "ar" ? "ترتيب حسب:" : "Trier par:"}
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="input py-2 px-3 text-sm"
              aria-label={locale === "ar" ? "ترتيب المنتجات" : "Trier les produits"}
            >
              <option value="topSelling">
                {locale === "ar" ? "الأكثر مبيعاً" : "Meilleures ventes"}
              </option>
              <option value="newest">
                {locale === "ar" ? "الأحدث" : "Plus récents"}
              </option>
              <option value="priceLowToHigh">
                {locale === "ar" ? "السعر: من الأقل للأعلى" : "Prix: croissant"}
              </option>
              <option value="priceHighToLow">
                {locale === "ar" ? "السعر: من الأعلى للأقل" : "Prix: décroissant"}
              </option>
              <option value="nameAZ">
                {locale === "ar" ? "الاسم: أ-ي" : "Nom: A-Z"}
              </option>
            </select>
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-zak-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-700">
                {locale === "ar" ? "تصفية حسب الفئة" : "Filtrer par catégorie"}
              </h3>
              {selectedCategory && (
                <button
                  onClick={() => handleCategoryChange("")}
                  className="ml-auto text-xs text-zak-black hover:text-zak-black-dark font-medium"
                >
                  {locale === "ar" ? "مسح الفلتر" : "Effacer"}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryChange(category._id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category._id
                      ? "bg-zak-black text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {getCategoryName(category)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-200 h-80"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="max-w-md mx-auto">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {locale === "ar"
                      ? "لم يتم العثور على منتجات"
                      : "Aucun produit trouvé"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {selectedCategory
                      ? (locale === "ar"
                        ? "لا توجد منتجات في هذه الفئة حالياً"
                        : "Aucun produit dans cette catégorie pour le moment")
                      : (locale === "ar"
                        ? "لا توجد منتجات متاحة حالياً"
                        : "Aucun produit disponible pour le moment")
                    }
                  </p>
                  {selectedCategory && (
                    <button
                      onClick={() => handleCategoryChange("")}
                      className="btn btn-primary"
                    >
                      {locale === "ar" ? "عرض جميع المنتجات" : "Voir tous les produits"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  {/* Page Info */}
                  <div className="text-sm text-gray-600">
                    {locale === "ar"
                      ? `عرض ${((page - 1) * limit) + 1} - ${Math.min(page * limit, total)} من ${total}`
                      : `Affichage ${((page - 1) * limit) + 1} - ${Math.min(page * limit, total)} sur ${total}`
                    }
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                      title={locale === "ar" ? "الصفحة الأولى" : "Première page"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      {locale === "ar" ? "السابق" : "Précédent"}
                    </button>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition ${page === pageNum
                                ? "bg-zak-black text-white shadow-md"
                                : "border border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Mobile page indicator */}
                    <div className="sm:hidden px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium">
                      {page} / {totalPages}
                    </div>

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      {locale === "ar" ? "التالي" : "Suivant"}
                    </button>

                    <button
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                      title={locale === "ar" ? "الصفحة الأخيرة" : "Dernière page"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container py-12"><div className="text-center">Loading...</div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
