"use client";

import { trackPurchase, trackViewContent, trackAddToCart, trackInitiateCheckout, trackCustomEvent, trackFindLocation } from "@/components/MetaPixel";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BundleOfferCard from "@/components/BundleOfferCard";
import ShopifyCheckoutForm from "@/components/ShopifyCheckoutForm";
import ShopifyOrderSummary from "@/components/ShopifyOrderSummary";
import stopdeskData from "@/app/stopdesk";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: Array<{
    sku: string;
    dimension: string;
    color: string;
    stock: number;
    image?: string;
  }>;
  dimensions: string[];
  colors: string[];
}

interface Wilaya {
  _id: string;
  code: string;
  name: string;
  shipping_price_home?: number;
  shipping_price_desk?: number;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDimension, setSelectedDimension] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { locale, t } = useI18n();
  const router = useRouter();

  // Checkout form states
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<string[]>([]);
  const [stopdesks, setStopdesks] = useState<string[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    wilayaId: "",
    commune: "",
    deliveryType: "to_home",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const checkoutRef = useRef<HTMLDivElement>(null);
  const variantsRef = useRef<HTMLDivElement>(null);

  // Bundle offers state
  const [bundles, setBundles] = useState<any[]>([]);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<any>(null);
  const [selectedBundleVariants, setSelectedBundleVariants] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/slug/${params.slug}`);
        if (!res.ok) {
          router.replace("/not-found");
          return;
        }
        const data = await res.json();
        setProduct(data);

        // Set defaults
        if (data.dimensions.length > 0) setSelectedDimension(data.dimensions[0]);
        if (data.colors.length > 0) setSelectedColor(data.colors[0]);

        // Track ViewContent - now handles both client pixel and server Conversions API with event_id
        trackViewContent(data._id, data.name, data.price);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        router.replace("/not-found");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
    fetchWilayas();
  }, [params.slug]);

  // Fetch bundles when product is loaded
  useEffect(() => {
    if (product?._id) {
      fetchBundles(product._id);
    }
  }, [product?._id]);

  async function fetchBundles(productId: string) {
    try {
      setLoadingBundles(true);
      const res = await fetch(`/api/products/${productId}/bundles?active=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBundles(data.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch bundles:", error);
    } finally {
      setLoadingBundles(false);
    }
  }

  const handleBundleSelect = (bundle: any, variants: any[]) => {
    setSelectedBundle(bundle);
    // Only update variants if they're provided (non-empty)
    if (variants && variants.length > 0) {
      setSelectedBundleVariants(variants);
    }
    // Set quantity to bundle quantity
    setQuantity(Math.min(bundle.quantity, 10));
  };

  // Fetch shipping rate when wilaya or delivery type changes
  useEffect(() => {
    if (form.wilayaId && form.deliveryType) {
      fetchShippingRate();
    } else {
      setShippingCost(0);
    }
  }, [form.wilayaId, form.deliveryType]);

  // Fetch communes and stopdesks when wilaya changes
  useEffect(() => {
    if (form.wilayaId && wilayas.length > 0) {
      fetchCommunes(form.wilayaId);
      
      // Find wilaya by ID to get its code
      const selectedWilaya = wilayas.find(w => String(w._id) === String(form.wilayaId));
      
      if (selectedWilaya && selectedWilaya.code) {
        // Match wilaya code with stopdesk wilaya_code (convert to strings for comparison)
        const wilayaCode = String(selectedWilaya.code).padStart(2, '0');
        const wilayaStopdesks = stopdeskData.find(w => w.wilaya_code === wilayaCode);
        
        if (wilayaStopdesks && wilayaStopdesks.stopdesks) {
          console.log(`✓ Loaded ${wilayaStopdesks.stopdesks.length} stopdesks for ${selectedWilaya.name}`);
          setStopdesks(wilayaStopdesks.stopdesks);
        } else {
          console.log(`✗ No stopdesks found for ${selectedWilaya.name} (code: ${wilayaCode})`);
          setStopdesks([]);
        }
      } else {
        setStopdesks([]);
      }
    } else {
      setCommunes([]);
      setStopdesks([]);
      setForm(prev => ({ ...prev, commune: '' }));
    }
  }, [form.wilayaId, wilayas]);

  // Reset commune when delivery type changes
  useEffect(() => {
    setForm(prev => ({ ...prev, commune: '' }));
  }, [form.deliveryType]);

  async function fetchWilayas() {
    try {
      const res = await fetch("/api/wilayas");
      if (!res.ok) throw new Error('Failed to fetch wilayas');

      const data = await res.json();
      const wilayasArray = Array.isArray(data) ? data : [];
      setWilayas(wilayasArray);
    } catch (error) {
      console.error("Failed to fetch wilayas:", error);
    }
  }

  async function fetchCommunes(wilayaId: string) {
    try {
      setLoadingCommunes(true);
      setForm(prev => ({ ...prev, commune: '' }));
      // Find the wilaya to get its code
      const selectedWilaya = wilayas.find(w => w._id === wilayaId);
      const code = selectedWilaya?.code || '';
      if (code) {
        const res = await fetch(`/api/communes?wilayaId=${encodeURIComponent(code)}`);
        if (res.ok) {
          const data = await res.json();
          setCommunes(Array.isArray(data) ? data : []);
        } else {
          setCommunes([]);
        }
      } else {
        setCommunes([]);
      }
    } catch (error) {
      console.error('Failed to fetch communes:', error);
      setCommunes([]);
    } finally {
      setLoadingCommunes(false);
    }
  }

  async function fetchShippingRate() {
    if (!form.wilayaId || !form.deliveryType) return;

    try {
      setLoadingShipping(true);

      const res = await fetch(
        `/api/shipping-rate?wilayaId=${encodeURIComponent(form.wilayaId)}&method=${encodeURIComponent(form.deliveryType)}`
      );

      if (!res.ok) {
        console.error("Failed to fetch shipping rate:", res.status);
        setLoadingShipping(false);
        return;
      }

      const data = await res.json();

      if (typeof data.price === 'number') {
        setShippingCost(data.price);
      } else {
        setShippingCost(0);
      }
    } catch (error) {
      console.error("Failed to fetch shipping rate:", error);
      setShippingCost(0);
    } finally {
      setLoadingShipping(false);
    }
  }

  function validateForm() {
    const newErrors: { [key: string]: string } = {};

    if (!form.customerName.trim()) {
      newErrors.customerName = locale === 'ar' ? 'الاسم مطلوب' : 'Le nom est requis';
    }

    if (!form.customerPhone.trim()) {
      newErrors.customerPhone = locale === 'ar' ? 'رقم الهاتف مطلوب' : 'Le numéro de téléphone est requis';
    }

    if (!form.wilayaId) {
      newErrors.wilayaId = locale === 'ar' ? 'الولاية مطلوبة' : 'La wilaya est requise';
    }

    if (!form.commune) {
      newErrors.commune = locale === 'ar' ? 'البلدية مطلوبة' : 'La commune est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmitOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setErrors({});

    if (!validateForm()) {
      setError(locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs requis');
      return;
    }

    if (!product) return;

    setSubmitting(true);

    try {
      // Build items array - if bundle is selected, use bundle variants
      let items: any[] = [];

      if (selectedBundle) {
        // Validate bundle variants are set and match bundle quantity
        if (selectedBundleVariants.length === 0) {
          setError(locale === 'ar'
            ? 'يرجى تحديد المتغيرات للحزمة المحددة'
            : 'Veuillez sélectionner les variantes pour le bundle sélectionné'
          );
          setSubmitting(false);
          return;
        }

        if (selectedBundleVariants.length !== selectedBundle.quantity) {
          setError(locale === 'ar'
            ? 'يرجى تحديد جميع المتغيرات للحزمة المحددة'
            : 'Veuillez sélectionner toutes les variantes pour le bundle sélectionné'
          );
          setSubmitting(false);
          return;
        }

        // Aggregate variants by dimension and color
        const variantMap = new Map<string, { dimension: string, color: string, qty: number }>();

        selectedBundleVariants.forEach((variant) => {
          const key = `${variant.dimension}|||${variant.color}`;
          if (variantMap.has(key)) {
            variantMap.get(key)!.qty += 1;
          } else {
            variantMap.set(key, {
              dimension: variant.dimension,
              color: variant.color,
              qty: 1
            });
          }
        });

        // Create items from aggregated variants
        items = Array.from(variantMap.values()).map((variantData) => {
          const variantObj = product.variants.find(
            (v) => v.dimension === variantData.dimension && v.color === variantData.color
          );

          return {
            productId: product._id,
            productName: product.name,
            unitPrice: product.price,
            sku: variantObj?.sku || `${product._id}-${variantData.dimension}-${variantData.color}`,
            qty: variantData.qty,
            selectedDimension: variantData.dimension,
            selectedColor: variantData.color,
          };
        });
      } else {
        // Regular single item order
        items = [{
          productId: product._id,
          productName: product.name,
          unitPrice: product.price,
          sku: selectedVariant?.sku || `${product._id}-default`,
          qty: quantity,
          selectedDimension: selectedDimension,
          selectedColor: selectedColor,
        }];
      }

      const subtotal = product.price * (selectedBundle ? selectedBundle.quantity : quantity);
      const total = subtotal - bundleDiscount + shippingCost;

      const requestData = {
        items,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        wilayaId: form.wilayaId,
        commune: form.commune,
        deliveryType: form.deliveryType,
        subtotal,
        shippingCost,
        total,
      };

      // Print request data to console
      console.log("Order Form Request:", requestData);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (locale === 'ar' ? 'فشل في إنشاء الطلب' : 'Échec de la commande'));
      }

      // Track purchase with user data for better attribution
      const numItems = selectedBundle ? selectedBundle.quantity : quantity;
      const purchaseEventId = await trackPurchase(data.orderId, total, numItems, {
        phone: form.customerPhone,
      });

      // Pass event_id to thank-you page to prevent duplicate tracking
      router.push(`/order/thank-you?orderId=${data.orderId}&total=${total}&numItems=${numItems}&eventId=${purchaseEventId}`);
    } catch (err: any) {
      setError(err.message || (locale === 'ar' ? 'فشل في إنشاء الطلب' : 'Échec de la commande'));
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const scrollToCheckout = () => {
    // Track AddToCart when user clicks to finalize order
    if (product) {
      const qty = selectedBundle ? selectedBundle.quantity : quantity;
      trackAddToCart(product._id, product.price * qty, qty);
      trackInitiateCheckout(product.price * qty, qty);
      trackCustomEvent("ScrollToCheckout", {
        product_id: product._id,
        product_name: product.name,
        value: product.price * qty,
        quantity: qty,
        has_bundle: !!selectedBundle,
      });
    }
    checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h1>
          <button
            onClick={() => router.replace("/")}
            className="text-emerald-600 hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const currency = locale === 'ar' ? 'دج' : 'DZD';
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const selectedVariant = product.variants.find(
    (v) => v.dimension === selectedDimension && v.color === selectedColor
  );

  // Find best matching bundle for current quantity
  const findBestBundle = (bundles: any[], qty: number) => {
    const now = new Date();

    const validBundles = bundles.filter((bundle) => {
      if (!bundle.active) return false;
      if (bundle.quantity > qty) return false;

      if (bundle.startDate && new Date(bundle.startDate) > now) return false;
      if (bundle.endDate && new Date(bundle.endDate) < now) return false;

      return true;
    });

    validBundles.sort((a, b) => b.quantity - a.quantity);
    return validBundles[0] || null;
  };

  const bestBundle = findBestBundle(bundles, quantity);
  const bundleDiscount = bestBundle ? bestBundle.discount : 0;
  const subtotal = product.price * quantity;
  const total = subtotal - bundleDiscount + shippingCost;

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="relative w-full rounded-lg overflow-hidden mb-4 bg-gray-light">
            {/* Main Image - Native img for dynamic sizing */}
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-auto block"
            />

            {/* Discount Badge */}
            {discount > 0 && (
              <div className={`absolute top-2 ${locale === 'ar' ? 'left-2' : 'right-2'} bg-red-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg z-10`}>
                -{discount}%
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedImage(idx); trackCustomEvent("ImageThumbnailClick", { image_index: idx, product_id: product._id }); }}
                  className={`relative h-20 rounded-md overflow-hidden border-2 flex items-center justify-center bg-gray-100 ${selectedImage === idx ? "border-primary" : "border-transparent"
                    }`}
                  aria-label={`${t('product.viewImage')} ${idx + 1}`}
                  title={`${t('product.viewImage')} ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-primary">
              {product.price.toLocaleString()} {currency}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-red-500 line-through">
                  {product.compareAtPrice.toLocaleString()} {currency}
                </span>
                <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 mb-6 whitespace-pre-line">{product.description}</p>

          {/* Variant Selection Section - with ref for scrolling */}
          <div ref={variantsRef} className="transition-all duration-300">
            {/* Dimension Selection */}
            {product.dimensions.length > 0 && (
              <div className="mb-6">
                <label className="block font-semibold mb-2">
                  {locale === 'ar' ? 'المقاس:' : 'Dimension:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.dimensions.map((dimension) => (
                    <button
                      key={dimension}
                      onClick={() => { setSelectedDimension(dimension); trackCustomEvent("SelectDimension", { dimension, product_id: product._id, product_name: product.name }); }}
                      className={`px-4 py-2 border rounded-md transition ${selectedDimension === dimension
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 hover:border-primary"
                        }`}
                      aria-label={`${locale === 'ar' ? 'اختر المقاس' : 'Sélectionner la dimension'} ${dimension}`}
                    >
                      {dimension}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block font-semibold mb-2">
                  {locale === 'ar' ? 'اللون:' : 'Couleur:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => { setSelectedColor(color); trackCustomEvent("SelectColor", { color, product_id: product._id, product_name: product.name }); }}
                      className={`px-4 py-2 border rounded-md transition ${selectedColor === color
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 hover:border-primary"
                        }`}
                      aria-label={`${locale === 'ar' ? 'اختر اللون' : 'Sélectionner la couleur'} ${color}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label htmlFor="quantity" className="block font-semibold mb-2">
              {locale === 'ar' ? 'الكمية:' : 'Quantité:'}
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={10}
              value={quantity}
              onChange={(e) => {
                const newQuantity = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                setQuantity(newQuantity);
                // Clear selected bundle if quantity changes manually
                if (selectedBundle && newQuantity !== selectedBundle.quantity) {
                  setSelectedBundle(null);
                }
              }}
              className="input w-24"
              title={locale === 'ar' ? 'الكمية' : 'Quantité'}
              placeholder="1"
            />
          </div>

          {/* Bundle Offers */}
          {bundles.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-lg">
                {t('bundle.title')}
              </h3>
              {selectedBundle && (
                <div className="mb-3 p-3 bg-zak-black/10 border border-zak-black rounded-lg">
                  <p className="text-sm text-zak-black font-medium">
                    {t('bundle.bundleSelected')}: {selectedBundle.quantity} {locale === 'ar' ? 'قطعة' : 'pièces'} - {selectedBundle.discount.toLocaleString()} {currency} {locale === 'ar' ? 'توفير' : 'économisés'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('bundle.selectVariants')}
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {bundles.map((bundle) => (
                  <BundleOfferCard
                    key={bundle._id}
                    bundle={bundle}
                    productPrice={product.price}
                    productCompareAtPrice={product.compareAtPrice}
                    currentQuantity={quantity}
                    isSelected={selectedBundle?._id === bundle._id}
                    onSelect={handleBundleSelect}
                    availableDimensions={product.dimensions}
                    availableColors={product.colors}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Scroll to COD Form Button */}
          <button
            onClick={scrollToCheckout}
            className="btn btn-primary w-full text-lg mb-3"
          >
            {locale === 'ar' ? 'إتمام الطلب' : 'Finaliser la commande'}
          </button>

          <p className="text-sm text-gray-600 text-center">
            {locale === 'ar'
              ? 'انتقل للأسفل لإتمام الطلب'
              : 'Faites défiler vers le bas pour finaliser'
            }
          </p>
        </div>
      </div>

      {/* Shopify-style COD Form Section */}
      <div ref={checkoutRef} className="mt-16 bg-gray-50 py-12">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {locale === 'ar' ? 'إتمام الطلب' : 'Finaliser la commande'}
              </h2>
              <p className="text-gray-600">
                {locale === 'ar'
                  ? 'أكمل طلبك بسهولة وأمان - الدفع عند الاستلام'
                  : 'Finalisez votre commande en toute simplicité - Paiement à la livraison'
                }
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Checkout Form - Left Side */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 lg:p-10">
                  <form onSubmit={handleSubmitOrder}>
                    <ShopifyCheckoutForm
                      form={form}
                      errors={errors}
                      wilayas={wilayas}
                      communes={communes}
                      stopdesks={stopdesks}
                      loadingCommunes={loadingCommunes}
                      loadingShipping={loadingShipping}
                      onChange={(field, value) => {
                        setForm({ ...form, [field]: value });
                        // Track form field interactions
                        if (field === 'wilayaId' && value) {
                          const wilayaName = wilayas.find(w => w._id === value)?.name || value;
                          trackFindLocation(wilayaName);
                          trackCustomEvent("SelectWilaya", { wilaya: wilayaName });
                        }
                        if (field === 'deliveryType') {
                          trackCustomEvent("SelectDeliveryType", { delivery_type: value });
                        }
                      }}
                      locale={locale}
                      t={t}
                    />

                    {/* Submit Button */}
                    <div className="mt-10 pt-8 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={submitting || loadingShipping}
                        className="w-full bg-zak-black text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-zak-black-soft transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            {locale === 'ar' ? 'جاري المعالجة...' : 'Traitement en cours...'}
                          </span>
                        ) : (
                          locale === 'ar' ? 'تأكيد الطلب' : 'Confirmer la commande'
                        )}
                      </button>
                      <p className="mt-4 text-center text-sm text-gray-500">
                        {locale === 'ar'
                          ? 'بالضغط على "تأكيد الطلب"، أنت توافق على شروطنا وأحكامنا'
                          : 'En cliquant sur "Confirmer la commande", vous acceptez nos conditions générales'
                        }
                      </p>
                    </div>
                  </form>
                </div>
              </div>

              {/* Order Summary - Right Side */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <ShopifyOrderSummary
                    items={
                      selectedBundle && selectedBundleVariants.length > 0
                        ? selectedBundleVariants.map((variant) => {
                          const variantObj = product.variants.find(
                            (v) => v.dimension === variant.dimension && v.color === variant.color
                          );
                          return {
                            productId: product._id,
                            productName: product.name,
                            unitPrice: product.price,
                            sku: variantObj?.sku || `${product._id}-${variant.dimension}-${variant.color}`,
                            qty: 1,
                            selectedDimension: variant.dimension,
                            selectedColor: variant.color,
                            image: product.images[0],
                          };
                        })
                        : [{
                          productId: product._id,
                          productName: product.name,
                          unitPrice: product.price,
                          sku: selectedVariant?.sku || `${product._id}-default`,
                          qty: quantity,
                          selectedDimension: selectedDimension,
                          selectedColor: selectedColor,
                          image: product.images[0],
                        }]
                    }
                    subtotal={subtotal}
                    bundleDiscount={bundleDiscount}
                    shippingCost={shippingCost}
                    loadingShipping={loadingShipping}
                    currency={currency}
                    locale={locale}
                    t={t}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
