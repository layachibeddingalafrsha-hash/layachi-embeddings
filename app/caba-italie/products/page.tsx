"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/admin/DashboardLayout";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: any[];
  dimensions: string[];
  colors: string[];
  tags: string[];
  featured: boolean;
  active: boolean;
  topSelling: boolean;
  in_stock: boolean;
  stock_quantity: number;
  salesCount: number;
  description: string;
  details: any;
  bundles?: any[];
  createdAt: string;
}

interface Bundle {
  _id: string;
  quantity: number;
  discount: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string;
  images: string[];
  variants: { sku: string; dimension: string; color: string; stock: number; price?: number; description?: string }[];
  dimensions: string[];
  colors: string[];
  tags: string[];
  details: { key: string; value: string }[];
  featured: boolean;
  active: boolean;
  topSelling: boolean;
  in_stock: boolean;
  stock_quantity: string;
}

const emptyForm: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compareAtPrice: "",
  images: [],
  variants: [],
  dimensions: [],
  colors: [],
  tags: [],
  details: [],
  featured: false,
  active: true,
  topSelling: false,
  in_stock: true,
  stock_quantity: "0",
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Bundle state
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [bundleForm, setBundleForm] = useState({ quantity: "", discount: "", active: true, startDate: "", endDate: "" });
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [bundleProductId, setBundleProductId] = useState<string | null>(null);

  // Variant inputs
  const [newDimension, setNewDimension] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newDetailKey, setNewDetailKey] = useState("");
  const [newDetailValue, setNewDetailValue] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 10 - form.images.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) {
      showToast("Maximum 10 images", "error");
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];

    for (const file of toUpload) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          uploaded.push(data.url);
        } else {
          const err = await res.json();
          showToast(err.error || "Upload failed", "error");
        }
      } catch {
        showToast("Upload failed", "error");
      }
    }

    if (uploaded.length > 0) {
      setForm({ ...form, images: [...form.images, ...uploaded] });
      showToast(`${uploaded.length} image(s) uploaded`);
    }
    setUploading(false);
    e.target.value = "";
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", search });
      const res = await fetch(`/api/admin/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreate = () => {
    router.push("/admin/products/new");
  };

  const openEdit = async (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      images: product.images || [],
      variants: product.variants || [],
      dimensions: product.dimensions || [],
      colors: product.colors || [],
      tags: product.tags || [],
      details: product.details
        ? (Array.isArray(product.details)
            ? product.details
            : Object.entries(product.details).map(([key, value]) => ({ key, value: String(value) })))
        : [],
      featured: product.featured,
      active: product.active,
      topSelling: product.topSelling,
      in_stock: product.in_stock,
      stock_quantity: String(product.stock_quantity || 0),
    });

    // Fetch bundles
    try {
      const res = await fetch(`/api/admin/products/${product._id}/bundles`);
      if (res.ok) {
        const data = await res.json();
        setBundles(data.bundles || []);
      }
    } catch {}

    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      showToast("Name and price are required", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct._id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
          stock_quantity: parseInt(form.stock_quantity) || 0,
        }),
      });

      if (res.ok) {
        showToast(editingProduct ? "Product updated" : "Product created");
        setShowModal(false);
        fetchProducts();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Product deleted");
        fetchProducts();
      } else {
        showToast("Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await fetch(`/api/admin/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      fetchProducts();
    } catch {}
  };

  // Bundle handlers
  const openBundleModal = (productId: string, bundle?: Bundle) => {
    setBundleProductId(productId);
    setEditingBundle(bundle || null);
    setBundleForm({
      quantity: bundle ? String(bundle.quantity) : "",
      discount: bundle ? String(bundle.discount) : "",
      active: bundle ? bundle.active : true,
      startDate: bundle?.startDate ? new Date(bundle.startDate).toISOString().slice(0, 10) : "",
      endDate: bundle?.endDate ? new Date(bundle.endDate).toISOString().slice(0, 10) : "",
    });
    setShowBundleModal(true);
  };

  const handleSaveBundle = async () => {
    if (!bundleForm.quantity || !bundleForm.discount) {
      showToast("Quantity and discount are required", "error");
      return;
    }

    try {
      const url = editingBundle
        ? `/api/admin/bundles/${editingBundle._id}`
        : `/api/admin/products/${bundleProductId}/bundles`;
      const method = editingBundle ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundleForm),
      });

      if (res.ok) {
        showToast(editingBundle ? "Bundle updated" : "Bundle created");
        setShowBundleModal(false);

        // Refresh bundles
        if (bundleProductId) {
          const bRes = await fetch(`/api/admin/products/${bundleProductId}/bundles`);
          if (bRes.ok) {
            const data = await bRes.json();
            setBundles(data.bundles || []);
          }
        }
      }
    } catch {
      showToast("Failed to save bundle", "error");
    }
  };

  const handleDeleteBundle = async (bundleId: string) => {
    if (!confirm("Delete this bundle offer?")) return;
    try {
      await fetch(`/api/admin/bundles/${bundleId}`, { method: "DELETE" });
      setBundles((prev) => prev.filter((b) => b._id !== bundleId));
      showToast("Bundle deleted");
    } catch {
      showToast("Failed to delete bundle", "error");
    }
  };

  const discount =
    form.compareAtPrice && form.price
      ? Math.round(((parseFloat(form.compareAtPrice) - parseFloat(form.price)) / parseFloat(form.compareAtPrice)) * 100)
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
              toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500">{total} total products</p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            + Add Product
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <input
            type="text"
            placeholder="Search products by name, slug, or tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Image</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Price</th>
                  <th className="px-4 py-3 text-left font-medium">Stock</th>
                  <th className="px-4 py-3 text-left font-medium">Dimensions</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Sales</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No products found</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEdit(product)}
                          className="font-medium text-gray-900 hover:text-emerald-600"
                        >
                          {product.name}
                        </button>
                        <p className="text-xs text-gray-400">{product.slug}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{product.price?.toLocaleString()} DZD</span>
                        {product.compareAtPrice && (
                          <span className="block text-xs text-gray-400 line-through">
                            {product.compareAtPrice.toLocaleString()} DZD
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            product.in_stock
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.stock_quantity ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {product.dimensions?.join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            product.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{product.salesCount || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleActive(product)}
                            className={`p-1.5 rounded ${
                              product.active
                                ? "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                                : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                            }`}
                            title={product.active ? "Deactivate" : "Activate"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {product.active ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Product Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? "Edit Product" : "New Product"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600" title="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Name & Slug */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setForm({
                          ...form,
                          name,
                          slug: editingProduct ? form.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Pricing</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Price (DZD) *</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Compare-at Price</label>
                      <input
                        type="number"
                        value={form.compareAtPrice}
                        onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Discount</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                        {discount > 0 ? `${discount}% off` : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Stock Management</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs text-blue-700">
                        <p className="font-medium mb-1">Stock Management Tips:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                          <li>If you use variants, stock is managed per variant below</li>
                          <li>Overall stock quantity will be calculated from all variants</li>
                          <li>Uncheck "In Stock" to mark product as out of stock</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.in_stock}
                        onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-medium">In Stock</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 font-medium">Overall Quantity:</label>
                      <input
                        type="number"
                        value={form.stock_quantity}
                        onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Qty"
                      />
                      {form.variants.length > 0 && (
                        <span className="text-xs text-gray-500">
                          (Variants total: {form.variants.reduce((sum, v) => sum + (v.stock || 0), 0)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dimensions */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Dimensions</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.dimensions.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-sm rounded">
                        {s}
                        <button onClick={() => setForm({ ...form, dimensions: form.dimensions.filter((_, j) => j !== i) })} className="text-gray-400 hover:text-red-500" title="Remove dimension">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDimension}
                      onChange={(e) => setNewDimension(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newDimension.trim()) {
                          e.preventDefault();
                          setForm({ ...form, dimensions: [...form.dimensions, newDimension.trim()] });
                          setNewDimension("");
                        }
                      }}
                      placeholder="Add dimension"
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm flex-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newDimension.trim()) {
                          setForm({ ...form, dimensions: [...form.dimensions, newDimension.trim()] });
                          setNewDimension("");
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-100 text-sm rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Colors</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.colors.map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-sm rounded">
                        {c}
                        <button onClick={() => setForm({ ...form, colors: form.colors.filter((_, j) => j !== i) })} className="text-gray-400 hover:text-red-500" title="Remove color">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newColor.trim()) {
                          e.preventDefault();
                          setForm({ ...form, colors: [...form.colors, newColor.trim()] });
                          setNewColor("");
                        }
                      }}
                      placeholder="Add color"
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm flex-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newColor.trim()) {
                          setForm({ ...form, colors: [...form.colors, newColor.trim()] });
                          setNewColor("");
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-100 text-sm rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Variants */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Product Variants
                    {form.variants.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        ({form.variants.length} variant{form.variants.length !== 1 ? 's' : ''})
                      </span>
                    )}
                  </h3>
                  
                  {form.dimensions.length > 0 && form.colors.length > 0 && (
                    <div className="mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const newVariants: any[] = [];
                          for (const dimension of form.dimensions) {
                            for (const color of form.colors) {
                              const existing = form.variants.find(
                                (v) => v.dimension === dimension && v.color === color
                              );
                              if (!existing) {
                                newVariants.push({
                                  sku: `${form.slug || "P"}-${dimension}-${color.charAt(0)}`.toUpperCase(),
                                  dimension,
                                  color,
                                  stock: 0,
                                  price: undefined,
                                  description: '',
                                });
                              }
                            }
                          }
                          if (newVariants.length > 0) {
                            setForm({ ...form, variants: [...form.variants, ...newVariants] });
                            showToast(`Generated ${newVariants.length} new variant(s)`, "success");
                          } else {
                            showToast("All variants already exist", "error");
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Generate All Variants ({form.dimensions.length} × {form.colors.length} = {form.dimensions.length * form.colors.length})
                      </button>
                      <p className="text-xs text-gray-500 mt-1.5 text-center">
                        Creates combinations from all dimensions and colors above
                      </p>
                    </div>
                  )}

                  {form.variants.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {form.variants.map((v, i) => (
                        <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md border border-gray-200">
                                <span className="text-xs font-semibold text-gray-700">{v.dimension}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs font-semibold text-gray-700">{v.color}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono">{v.sku}</span>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm(`Remove variant ${v.dimension}/${v.color}?`)) {
                                  setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) });
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="Remove variant"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-medium text-gray-600 mb-1 uppercase tracking-wide">
                                Stock Quantity *
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={v.stock}
                                onChange={(e) => {
                                  const updated = [...form.variants];
                                  updated[i] = { ...updated[i], stock: parseInt(e.target.value) || 0 };
                                  setForm({ ...form, variants: updated });
                                }}
                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-medium text-gray-600 mb-1 uppercase tracking-wide">
                                Price Override (DZD)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={v.price || ''}
                                onChange={(e) => {
                                  const updated = [...form.variants];
                                  updated[i] = { 
                                    ...updated[i], 
                                    price: e.target.value ? parseFloat(e.target.value) : undefined 
                                  };
                                  setForm({ ...form, variants: updated });
                                }}
                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                                placeholder="Default price"
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="block text-[10px] font-medium text-gray-600 mb-1 uppercase tracking-wide">
                              Variant Description
                            </label>
                            <textarea
                              value={v.description || ''}
                              onChange={(e) => {
                                const updated = [...form.variants];
                                updated[i] = { ...updated[i], description: e.target.value };
                                setForm({ ...form, variants: updated });
                              }}
                              rows={2}
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none bg-white"
                              placeholder={`Specific details for ${v.dimension}/${v.color} variant...`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium mb-1">No variants yet</p>
                      <p className="text-xs text-gray-500">
                        Add sizes and colors above, then click "Generate All Variants"
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {t}
                        <button onClick={() => setForm({ ...form, tags: form.tags.filter((_, j) => j !== i) })} className="hover:text-red-500" title="Remove tag">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newTag.trim()) {
                          e.preventDefault();
                          setForm({ ...form, tags: [...form.tags, newTag.trim()] });
                          setNewTag("");
                        }
                      }}
                      placeholder="Add tag"
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm flex-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTag.trim()) {
                          setForm({ ...form, tags: [...form.tags, newTag.trim()] });
                          setNewTag("");
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-100 text-sm rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Product Images ({form.images.length}/10)
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="" className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200 shadow-sm" />
                        <button
                          onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          title="Remove image"
                        >
                          &times;
                        </button>
                        {i === 0 && (
                          <div className="absolute bottom-1 left-1 right-1 bg-emerald-500 text-white text-[9px] font-semibold px-1 py-0.5 rounded text-center">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {form.images.length < 10 && (
                    <div className="space-y-3">
                      {/* Cloudinary file upload - Primary method */}
                      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        uploading 
                          ? "border-emerald-500 bg-emerald-50" 
                          : "border-gray-300 hover:border-emerald-500 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-blue-50"
                      }`}>
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <svg className="w-8 h-8 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="text-sm font-medium text-emerald-600">Uploading to cloud...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center mb-2">
                              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              <span className="text-emerald-600">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">JPG, PNG, WebP, GIF (max 30MB each)</p>
                            <p className="text-[10px] text-gray-400 mt-1">Upload up to {10 - form.images.length} more image{10 - form.images.length !== 1 ? 's' : ''}</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                          aria-label="Upload product images"
                        />
                      </label>

                      {/* URL fallback */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="Or paste image URL"
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                          aria-label="Image URL"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newImageUrl.trim()) {
                              setForm({ ...form, images: [...form.images, newImageUrl.trim()] });
                              setNewImageUrl("");
                            }
                          }}
                          className="px-4 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200 font-medium"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Details (Key-Value)</h3>
                  {form.details.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {form.details.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{d.key}:</span>
                          <span>{d.value}</span>
                          <button onClick={() => setForm({ ...form, details: form.details.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600 ml-auto text-xs" title="Remove detail">&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDetailKey}
                      onChange={(e) => setNewDetailKey(e.target.value)}
                      placeholder="Key"
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-1/3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <input
                      type="text"
                      value={newDetailValue}
                      onChange={(e) => setNewDetailValue(e.target.value)}
                      placeholder="Value"
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm flex-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newDetailKey.trim() && newDetailValue.trim()) {
                          setForm({
                            ...form,
                            details: [...form.details, { key: newDetailKey.trim(), value: newDetailValue.trim() }],
                          });
                          setNewDetailKey("");
                          setNewDetailValue("");
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-100 text-sm rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Flags */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Flags</h3>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.topSelling}
                        onChange={(e) => setForm({ ...form, topSelling: e.target.checked })}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Top Selling
                    </label>
                  </div>
                </div>

                {/* Bundle Offers (edit mode only) */}
                {editingProduct && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Bundle Offers</h3>
                    <div className="space-y-2 mb-2">
                      {bundles.map((bundle) => (
                        <div key={bundle._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                          <div>
                            Buy <span className="font-semibold">{bundle.quantity}</span> → Save{" "}
                            <span className="font-semibold">{bundle.discount} DZD</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${bundle.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                              {bundle.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openBundleModal(editingProduct._id, bundle)}
                              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                              title="Edit bundle"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBundle(bundle._id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                              title="Delete bundle"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => openBundleModal(editingProduct._id)}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      + Add Bundle Offer
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bundle Modal */}
        {showBundleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingBundle ? "Edit Bundle Offer" : "New Bundle Offer"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Quantity</label>
                  <input
                    type="number"
                    value={bundleForm.quantity}
                    onChange={(e) => setBundleForm({ ...bundleForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (DZD)</label>
                  <input
                    type="number"
                    value={bundleForm.discount}
                    onChange={(e) => setBundleForm({ ...bundleForm, discount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={bundleForm.active}
                    onChange={(e) => setBundleForm({ ...bundleForm, active: e.target.checked })}
                    className="rounded border-gray-300 text-emerald-600"
                  />
                  Active
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={bundleForm.startDate}
                      onChange={(e) => setBundleForm({ ...bundleForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      value={bundleForm.endDate}
                      onChange={(e) => setBundleForm({ ...bundleForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowBundleModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button onClick={handleSaveBundle} className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                  {editingBundle ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
