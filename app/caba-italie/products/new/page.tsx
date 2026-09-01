"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/admin/DashboardLayout";

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string;
  images: string[];
  variants: { sku: string; size: string; color: string; stock: number; price?: number; description?: string }[];
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

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Variant inputs
  const [newDimension, setNewDimension] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newDetailKey, setNewDetailKey] = useState("");
  const [newDetailValue, setNewDetailValue] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    if (form.images.length >= 10) {
      showToast("Maximum 10 images", "error");
      return;
    }
    setForm({ ...form, images: [...form.images, newImageUrl.trim()] });
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const addDimension = () => {
    if (!newDimension.trim() || form.dimensions.includes(newDimension.trim())) return;
    setForm({ ...form, dimensions: [...form.dimensions, newDimension.trim()] });
    setNewDimension("");
  };

  const removeDimension = (index: number) => {
    setForm({ ...form, dimensions: form.dimensions.filter((_, i) => i !== index) });
  };

  const addColor = () => {
    if (!newColor.trim() || form.colors.includes(newColor.trim())) return;
    setForm({ ...form, colors: [...form.colors, newColor.trim()] });
    setNewColor("");
  };

  const removeColor = (index: number) => {
    setForm({ ...form, colors: form.colors.filter((_, i) => i !== index) });
  };

  const addTag = () => {
    if (!newTag.trim() || form.tags.includes(newTag.trim())) return;
    setForm({ ...form, tags: [...form.tags, newTag.trim()] });
    setNewTag("");
  };

  const removeTag = (index: number) => {
    setForm({ ...form, tags: form.tags.filter((_, i) => i !== index) });
  };

  const addDetail = () => {
    if (!newDetailKey.trim() || !newDetailValue.trim()) return;
    setForm({ ...form, details: [...form.details, { key: newDetailKey.trim(), value: newDetailValue.trim() }] });
    setNewDetailKey("");
    setNewDetailValue("");
  };

  const removeDetail = (index: number) => {
    setForm({ ...form, details: form.details.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug || !form.price) {
      showToast("Name, slug, and price are required", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
          stock_quantity: parseInt(form.stock_quantity) || 0,
        }),
      });

      if (res.ok) {
        showToast("Product created successfully");
        setTimeout(() => {
          router.push("/admin/products");
        }, 1500);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to create product", "error");
      }
    } catch {
      showToast("Failed to create product", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
            <p className="text-sm text-gray-500">Add a new product to your store</p>
          </div>
          <button
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            ← Back to Products
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., Premium Mattress"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., premium-mattress"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                placeholder="Product description..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (DZD) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compare At Price (DZD)</label>
                <input
                  type="number"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Images</h2>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addImageUrl()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Image URL"
                />
              </div>
              <button onClick={addImageUrl} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                Add URL
              </button>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer inline-block ${uploading ? "opacity-50" : ""}`}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </label>
              </div>
            </div>
            {form.images.length > 0 && (
              <div className="grid grid-cols-5 gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt={`Product ${i + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dimensions */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Dimensions</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDimension}
                onChange={(e) => setNewDimension(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addDimension()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g., 140x190, 160x200"
              />
              <button onClick={addDimension} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                Add
              </button>
            </div>
            {form.dimensions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.dimensions.map((dimension, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {dimension}
                    <button onClick={() => removeDimension(i)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Colors</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addColor()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g., Red, Blue, Black"
              />
              <button onClick={addColor} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                Add
              </button>
            </div>
            {form.colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.colors.map((color, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {color}
                    <button onClick={() => removeColor(i)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g., summer, casual, new"
              />
              <button onClick={addTag} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {tag}
                    <button onClick={() => removeTag(i)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDetailKey}
                onChange={(e) => setNewDetailKey(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Key (e.g., Material)"
              />
              <input
                type="text"
                value={newDetailValue}
                onChange={(e) => setNewDetailValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addDetail()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Value (e.g., Memory Foam)"
              />
              <button onClick={addDetail} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                Add
              </button>
            </div>
            {form.details.length > 0 && (
              <div className="space-y-2">
                {form.details.map((detail, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm"><strong>{detail.key}:</strong> {detail.value}</span>
                    <button onClick={() => removeDetail(i)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Options</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.topSelling}
                  onChange={(e) => setForm({ ...form, topSelling: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                />
                Top Selling
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.in_stock}
                  onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                />
                In Stock
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => router.push("/admin/products")}
              className="px-6 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
