"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";

export default function ShippingPage() {
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [searchWilaya, setSearchWilaya] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [importing, setImporting] = useState<string | null>(null);

  // Inline editing
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchWilayas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shipping");
      if (res.ok) {
        const data = await res.json();
        setWilayas(data.wilayas || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWilayas();
  }, [fetchWilayas]);

  const handleInlineEdit = async (id: string, field: string, value: any) => {
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (res.ok) {
        showToast("Updated successfully");
        setWilayas((prev) => prev.map((w) => (w._id === id ? { ...w, [field]: value } : w)));
      } else {
        showToast("Update failed", "error");
      }
    } catch {
      showToast("Update failed", "error");
    }
    setEditingCell(null);
  };

  const handleDeliveryImport = async (action: string) => {
    setImporting(action);
    try {
      const res = await fetch("/api/admin/ecotrack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Import completed");
        fetchWilayas();
      } else {
        showToast(data.error || "Import failed", "error");
      }
    } catch {
      showToast("Import failed", "error");
    } finally {
      setImporting(null);
    }
  };

  const filteredWilayas = wilayas.filter((w) =>
    w.name?.toLowerCase().includes(searchWilaya.toLowerCase()) ||
    String(w.code)?.includes(searchWilaya)
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shipping Management</h1>
            <p className="text-sm text-gray-500">Manage wilayas and delivery rates</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleDeliveryImport("import-wilayas")}
              disabled={!!importing}
              className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {importing === "import-wilayas" ? "Importing..." : "Import Wilayas"}
            </button>
            <button
              onClick={() => handleDeliveryImport("test")}
              disabled={!!importing}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {importing === "test" ? "Testing..." : "Test Delivery API"}
            </button>
          </div>
        </div>

        {/* Wilayas Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4">
            <input
              type="text"
              placeholder="Search wilayas..."
              value={searchWilaya}
              onChange={(e) => setSearchWilaya(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Code</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Home Delivery (DZD)</th>
                  <th className="px-4 py-3 text-left font-medium">Stop-Desk (DZD)</th>
                  <th className="px-4 py-3 text-left font-medium">Active</th>
                  <th className="px-4 py-3 text-left font-medium">Home Enabled</th>
                  <th className="px-4 py-3 text-left font-medium">Desk Enabled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                ) : filteredWilayas.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No wilayas found</td></tr>
                ) : (
                  filteredWilayas.map((w) => (
                    <tr key={w._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{w.code}</td>
                      <td className="px-4 py-3">{w.name}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {editingCell?.id === w._id && editingCell?.field === "shipping_price_home" ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleInlineEdit(w._id, "shipping_price_home", Number(editValue))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleInlineEdit(w._id, "shipping_price_home", Number(editValue)); if (e.key === "Escape") setEditingCell(null); }}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => { setEditingCell({ id: w._id, field: "shipping_price_home" }); setEditValue(String(w.shipping_price_home || 0)); }}
                            className="cursor-text hover:bg-yellow-50 px-2 py-1 rounded"
                          >
                            {w.shipping_price_home || 0}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {editingCell?.id === w._id && editingCell?.field === "shipping_price_desk" ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleInlineEdit(w._id, "shipping_price_desk", Number(editValue))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleInlineEdit(w._id, "shipping_price_desk", Number(editValue)); if (e.key === "Escape") setEditingCell(null); }}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => { setEditingCell({ id: w._id, field: "shipping_price_desk" }); setEditValue(String(w.shipping_price_desk || 0)); }}
                            className="cursor-text hover:bg-yellow-50 px-2 py-1 rounded"
                          >
                            {w.shipping_price_desk || 0}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleInlineEdit(w._id, "is_active", !w.is_active)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${w.is_active ? "bg-emerald-500" : "bg-gray-300"}`}
                          title="Toggle active"
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${w.is_active ? "left-5" : "left-0.5"}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleInlineEdit(w._id, "delivery_to_home", !w.delivery_to_home)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${w.delivery_to_home !== false ? "bg-emerald-500" : "bg-gray-300"}`}
                          title="Toggle home delivery"
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${w.delivery_to_home !== false ? "left-5" : "left-0.5"}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleInlineEdit(w._id, "delivery_to_desk", !w.delivery_to_desk)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${w.delivery_to_desk !== false ? "bg-emerald-500" : "bg-gray-300"}`}
                          title="Toggle desk delivery"
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${w.delivery_to_desk !== false ? "left-5" : "left-0.5"}`} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
