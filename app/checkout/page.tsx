"use client";

import { useEffect, useRef, useState } from "react";
import { trackAddPaymentInfo, trackInitiateCheckout, trackPurchase } from "@/components/MetaPixel";
import { useI18n } from "@/lib/i18n";
import { publicAPI } from "@/utils/api-client";
import stopdeskData from "@/app/stopdesk";

interface CartItem {
  productId: string;
  sku: string;
  qty: number;
  size: string;
  color: string;
  productName?: string;
  price?: number;
}

interface Wilaya {
  code: string;
  name: string;
}

export default function CheckoutPage() {
  const { locale, t } = useI18n();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [stopdesks, setStopdesks] = useState<string[]>([]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    wilayaCode: "",
    commune: "",
    address: "",
    shippingMethod: "to_home",
    note: "",
  });

  const [subtotal, setSubtotal] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [error, setError] = useState("");
  const initiateCheckoutTracked = useRef(false);

  useEffect(() => {
    // Load items from localStorage
    const storedItems = localStorage.getItem("quickBuyItem");
    if (storedItems) {
      const parsed = JSON.parse(storedItems);
      setItems(parsed);
      fetchProductDetails(parsed);
    } else {
      setError("No items in cart");
      setLoading(false);
    }

    // Load wilayas
    fetchWilayas();

  }, []);

  useEffect(() => {
    if (loading || initiateCheckoutTracked.current || items.length === 0 || subtotal <= 0) {
      return;
    }

    const numItems = items.reduce((sum, item) => sum + item.qty, 0);
    if (numItems <= 0) {
      return;
    }

    initiateCheckoutTracked.current = true;
    trackInitiateCheckout(subtotal, numItems);
  }, [items, loading, subtotal]);

  useEffect(() => {
    // Update shipping price when wilaya or method changes
    if (form.wilayaCode && form.shippingMethod) {
      fetchShippingRate();
    }
  }, [form.wilayaCode, form.shippingMethod]);

  useEffect(() => {
    // Fetch communes when wilaya changes
    if (form.wilayaCode) {
      fetchCommunes(form.wilayaCode);
      // Load stopdesks for this wilaya (convert code to zero-padded string)
      const codeStr = String(form.wilayaCode).padStart(2, '0');
      const wilayaStopdesks = stopdeskData.find((w: any) => w.wilaya_code === codeStr);
      setStopdesks(wilayaStopdesks?.stopdesks || []);
    } else {
      setCommunes([]);
      setStopdesks([]);
      setForm((prev) => ({ ...prev, commune: "" }));
    }
  }, [form.wilayaCode]);

  useEffect(() => {
    // Reset commune/stopdesk selection when shipping method changes
    setForm((prev) => ({ ...prev, commune: "" }));
  }, [form.shippingMethod]);

  async function fetchProductDetails(cartItems: CartItem[]) {
    try {
      // Fetch actual product details for each item
      const data = await publicAPI.products.list({ limit: 100 });
      const products = data.products || [];
      
      const detailedItems = cartItems.map((item) => {
        const product = products.find((p: any) => p._id === item.productId);
        
        if (product) {
          return {
            ...item,
            productName: product.name,
            price: product.price
          };
        }
        
        return {
          ...item,
          productName: 'Product',
          price: 0
        };
      });

      // Calculate subtotal from actual product prices
      let total = 0;
      detailedItems.forEach((item) => {
        total += (item.price || 0) * item.qty;
      });
      
      setItems(detailedItems);
      setSubtotal(total);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      setError("Failed to load product details");
      setLoading(false);
    }
  }

  async function fetchWilayas() {
    try {
      const wilayas = await publicAPI.location.wilayas();
      setWilayas(wilayas);
    } catch (error) {
      console.error("Failed to fetch wilayas:", error);
    }
  }

  async function fetchCommunes(wilayaCode: string) {
    try {
      setLoadingCommunes(true);
      setForm((prev) => ({ ...prev, commune: "" }));
      console.log("Fetching communes for wilaya code:", wilayaCode);
      const communes = await publicAPI.location.communes(wilayaCode);
      console.log("Received communes:", communes);
      setCommunes(Array.isArray(communes) ? communes : []);
    } catch (error) {
      console.error("Failed to fetch communes:", error);
      setCommunes([]);
    } finally {
      setLoadingCommunes(false);
    }
  }

  async function fetchShippingRate() {
    try {
      setLoadingShipping(true);
      const data = await publicAPI.shipping.getRate(form.wilayaCode, form.shippingMethod as 'to_home' | 'to_desk');
      
      if (data.price !== undefined) {
        setShippingPrice(data.price);
      } else {
        console.error("Shipping price not found in response:", data);
      }
    } catch (error) {
      console.error("Failed to fetch shipping rate:", error);
      setShippingPrice(0);
    } finally {
      setLoadingShipping(false);
    }
  }

  async function validateStock(): Promise<boolean> {
    try {
      // Validate stock for all items before submission
      for (const item of items) {
        const products = await publicAPI.products.list({ limit: 100 });
        const product = products.products?.find((p: any) => p._id === item.productId);

        if (!product) {
          setError(`Product not found`);
          return false;
        }

        // Check MongoDB in_stock and stock_quantity fields first
        if (typeof product.in_stock === 'boolean' && typeof product.stock_quantity === 'number') {
          if (!product.in_stock) {
            setError(`${product.name} is currently out of stock. Please remove it from your cart.`);
            return false;
          }

          if (product.stock_quantity <= 0) {
            setError(`${product.name} is currently out of stock. Please remove it from your cart.`);
            return false;
          }

          if (product.stock_quantity < item.qty) {
            setError(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.qty}`);
            return false;
          }
        } else {
          // Fallback to variant stock checking
          const variant = product.variants?.find((v: any) => v.sku === item.sku);
          if (!variant || variant.stock < item.qty) {
            setError(`Insufficient stock for ${product.name}`);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Stock validation failed:", error);
      setError("Unable to verify product availability. Please try again.");
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Validate form fields
      const needsAddress = form.shippingMethod === "to_home";
      if (!form.fullName || !form.phone || !form.wilayaCode || !form.commune || (needsAddress && !form.address)) {
        throw new Error(locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs obligatoires');
      }

      // Validate stock availability
      const stockValid = await validateStock();
      if (!stockValid) {
        setSubmitting(false);
        return;
      }

      // Store consent
      if (consent) {
        localStorage.setItem("analytics_consent", "true");
      }

      // Track AddPaymentInfo before submitting the order
      await trackAddPaymentInfo(total, { phone: form.phone, email: form.email });

      const data = await publicAPI.orders.create({
        items,
        ...form,
      });

      const numItems = items.reduce((sum, item) => sum + item.qty, 0);

      // Track purchase before redirect so Meta receives the order reliably
      const purchaseEventId = await trackPurchase(data.orderId, data.total, numItems, {
        phone: form.phone,
        email: form.email || undefined,
      });

      // Clear cart
      localStorage.removeItem("quickBuyItem");

      // Redirect to thank you page with order details for tracking
      window.location.href = `/order/thank-you?orderId=${data.orderId}&total=${data.total}&numItems=${numItems}&eventId=${purchaseEventId}`;
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  const total = subtotal + shippingPrice;

  if (loading) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">{t('checkout.title')}</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <a href="/products" className="btn btn-primary">
            {locale === 'ar' ? 'متابعة التسوق' : 'Continuer vos achats'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-secondary p-6 rounded-lg">
            <h2 className="font-semibold text-lg mb-4">{t('checkout.yourOrder')}</h2>
            <div className="space-y-3 mb-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-gray-200 pb-2 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {item.productName || `${locale === 'ar' ? 'منتج' : 'Produit'} ${idx + 1}`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {locale === 'ar' ? 'المقاس:' : 'Dimension:'} <span className="font-medium">{item.size}</span>
                      {' • '}
                      {locale === 'ar' ? 'اللون:' : 'Couleur:'} <span className="font-medium">{item.color}</span>
                      {' • '}
                      {locale === 'ar' ? 'الكمية:' : 'Qté:'} <span className="font-medium">{item.qty}</span>
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-lacoste-green">
                      {((item.price || 0) * item.qty).toLocaleString()} {locale === 'ar' ? 'دج' : 'DZD'}
                    </p>
                    {item.qty > 1 && (
                      <p className="text-xs text-gray-500">
                        {(item.price || 0).toLocaleString()} × {item.qty}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>{t('checkout.subtotal')}:</span>
                <span className="font-semibold">{subtotal.toLocaleString()} {locale === 'ar' ? 'دج' : 'DZD'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{t('checkout.shipping')}:</span>
                {loadingShipping ? (
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {locale === 'ar' ? 'جاري الحساب...' : 'Calcul...'}
                  </span>
                ) : (
                  <span className="font-semibold">
                    {shippingPrice > 0 ? `${shippingPrice.toLocaleString()} ${locale === 'ar' ? 'دج' : 'DZD'}` : (locale === 'ar' ? 'حدد الولاية' : 'Sélectionnez la wilaya')}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>{t('checkout.total')}:</span>
                <span>{total.toLocaleString()} {locale === 'ar' ? 'دج' : 'DZD'}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-semibold text-lg mb-4">{locale === 'ar' ? 'معلومات العميل' : 'Informations client'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('checkout.fullName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="input"
                  placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Entrez votre nom complet'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('checkout.phoneNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input"
                  placeholder="+213..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (optionnel)'}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder={locale === 'ar' ? 'your@email.com' : 'votre@email.com'}
                />
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-semibold text-lg mb-4">{t('checkout.shippingInfo')}</h2>
            
            <div className="space-y-4">
              {/* Shipping Method - FIRST */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {locale === 'ar' ? 'طريقة الشحن' : 'Méthode de livraison'} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between cursor-pointer p-3 border-2 rounded-lg transition-all ${
                    form.shippingMethod === "to_home" 
                      ? 'border-lacoste-green bg-lacoste-green/5' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="to_home"
                        checked={form.shippingMethod === "to_home"}
                        onChange={(e) => setForm({ ...form, shippingMethod: e.target.value })}
                        className="w-4 h-4 text-lacoste-green"
                      />
                      <div>
                        <p className="font-medium">{locale === 'ar' ? 'التوصيل للمنزل' : 'Livraison à domicile'}</p>
                        <p className="text-xs text-gray-500">{locale === 'ar' ? 'التوصيل إلى عنوانك' : 'Livraison à votre adresse'}</p>
                      </div>
                    </div>
                    {form.wilayaCode && form.shippingMethod === "to_home" && shippingPrice > 0 && (
                      <span className="text-sm font-semibold text-lacoste-green">
                        {shippingPrice.toLocaleString()} {locale === 'ar' ? 'دج' : 'DZD'}
                      </span>
                    )}
                  </label>
                  <label className={`flex items-center justify-between cursor-pointer p-3 border-2 rounded-lg transition-all ${
                    form.shippingMethod === "to_desk" 
                      ? 'border-lacoste-green bg-lacoste-green/5' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="to_desk"
                        checked={form.shippingMethod === "to_desk"}
                        onChange={(e) => setForm({ ...form, shippingMethod: e.target.value })}
                        className="w-4 h-4 text-lacoste-green"
                      />
                      <div>
                        <p className="font-medium">{locale === 'ar' ? 'الاستلام من المكتب' : 'Retrait au bureau (Stop-Desk)'}</p>
                        <p className="text-xs text-gray-500">{locale === 'ar' ? 'استلم من أقرب نقطة' : 'Retrait au point relais le plus proche'}</p>
                      </div>
                    </div>
                    {form.wilayaCode && form.shippingMethod === "to_desk" && shippingPrice > 0 && (
                      <span className="text-sm font-semibold text-lacoste-green">
                        {shippingPrice.toLocaleString()} {locale === 'ar' ? 'دج' : 'DZD'}
                      </span>
                    )}
                  </label>
                </div>
              </div>

              {/* Wilaya */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('checkout.wilaya')} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.wilayaCode}
                  onChange={(e) => setForm({ ...form, wilayaCode: e.target.value })}
                  className="input"
                  title={t('checkout.wilaya')}
                >
                  <option value="">{locale === 'ar' ? 'اختر الولاية' : 'Sélectionner une wilaya'}</option>
                  {wilayas.map((wilaya) => (
                    <option key={wilaya.code} value={wilaya.code}>
                      {wilaya.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Commune (to_home) or Stop-Desk (to_desk) */}
              {form.shippingMethod === "to_desk" ? (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'ar' ? 'نقطة الاستلام' : 'Point de retrait (Stop-Desk)'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.commune}
                    onChange={(e) => setForm({ ...form, commune: e.target.value })}
                    className="input disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!form.wilayaCode}
                    title={locale === 'ar' ? 'نقطة الاستلام' : 'Stop-Desk'}
                  >
                    <option value="">
                      {!form.wilayaCode
                        ? (locale === 'ar' ? 'اختر الولاية أولاً' : 'Sélectionnez d\'abord une wilaya')
                        : stopdesks.length === 0
                        ? (locale === 'ar' ? 'لا توجد نقاط استلام لهذه الولاية' : 'Aucun stop-desk pour cette wilaya')
                        : (locale === 'ar' ? 'اختر نقطة الاستلام' : 'Sélectionner un stop-desk')}
                    </option>
                    {stopdesks.map((sd) => (
                      <option key={sd} value={sd}>{sd}</option>
                    ))}
                  </select>
                  {form.wilayaCode && stopdesks.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stopdesks.length} {locale === 'ar' ? 'نقطة استلام متاحة' : 'stop-desks disponibles'}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'ar' ? 'البلدية' : 'Commune'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.commune}
                    onChange={(e) => setForm({ ...form, commune: e.target.value })}
                    className="input disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!form.wilayaCode || loadingCommunes}
                    title={locale === 'ar' ? 'البلدية' : 'Commune'}
                  >
                    <option value="">
                      {!form.wilayaCode
                        ? (locale === 'ar' ? 'اختر الولاية أولاً' : 'Sélectionnez d\'abord une wilaya')
                        : loadingCommunes
                        ? (locale === 'ar' ? 'جاري التحميل...' : 'Chargement...')
                        : (locale === 'ar' ? 'اختر البلدية' : 'Sélectionner une commune')}
                    </option>
                    {communes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {communes.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {communes.length} {locale === 'ar' ? 'بلدية متاحة' : 'communes disponibles'}
                    </p>
                  )}
                </div>
              )}

              {/* Address - only for home delivery */}
              {form.shippingMethod === "to_home" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('checkout.address')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder={locale === 'ar' ? 'أدخل عنوان التوصيل الكامل' : 'Entrez votre adresse complète de livraison'}
                  ></textarea>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">{t('checkout.notes')} {locale === 'ar' ? '(اختياري)' : '(optionnel)'}</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder={locale === 'ar' ? 'أي تعليمات خاصة؟' : 'Des instructions spéciales?'}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <label className={`flex items-start cursor-pointer ${locale === 'ar' ? 'space-x-reverse gap-3' : 'gap-3'}`}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-600">
                {locale === 'ar' 
                  ? 'أوافق على جمع واستخدام بياناتي لأغراض التحليل والتسويق. خصوصيتك مهمة بالنسبة لنا.'
                  : 'Je consens à la collecte et à l\'utilisation de mes données à des fins d\'analyse et de marketing. Votre vie privée est importante pour nous.'
                }
              </span>
            </label>
          </div>

          {/* Payment */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-semibold text-lg mb-2">{t('checkout.paymentMethod')}</h2>
            <p className="text-gray-600 mb-4">{t('checkout.cashOnDelivery')}</p>
            <p className="text-sm text-gray-500">
              {locale === 'ar'
                ? 'سيتم تحصيل الدفع عند تسليم طلبك.'
                : 'Le paiement sera collecté lors de la livraison de votre commande.'
              }
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full text-lg py-4 disabled:opacity-50"
          >
            {submitting ? (locale === 'ar' ? 'جاري المعالجة...' : 'Traitement...') : `${t('checkout.placeOrder')} - ${total.toLocaleString()} ${locale === 'ar' ? 'دج' : 'DZD'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
