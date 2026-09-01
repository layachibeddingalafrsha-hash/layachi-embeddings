"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";

const deliveryStatusColors: Record<string, string> = {
  "En Préparation": "bg-yellow-100 text-yellow-800",
  "En Traitement": "bg-blue-100 text-blue-800",
  "Au Bureau": "bg-indigo-100 text-indigo-800",
  "Sortir en livraison": "bg-orange-100 text-orange-800",
  "En livraison": "bg-amber-100 text-amber-800",
  "Dispatcher": "bg-purple-100 text-purple-800",
  "Retour Fournisseur": "bg-red-100 text-red-800",
  "Récupérer": "bg-emerald-100 text-emerald-800",
  "Perdu": "bg-rose-100 text-rose-800",
};

const situationColors: Record<string, string> = {
  "EnCours": "bg-blue-50 text-blue-700",
  "Ne Réponde pas #1": "bg-orange-50 text-orange-700",
  "Ne Réponde pas #2": "bg-orange-50 text-orange-700",
  "Ne Réponde pas #3": "bg-red-50 text-red-700",
  "Annuler": "bg-red-50 text-red-700",
  "Annuler x3": "bg-red-100 text-red-800",
  "Attend Information": "bg-amber-50 text-amber-700",
  "Reporté": "bg-yellow-50 text-yellow-700",
  "Reporté Commune Erronée": "bg-yellow-100 text-yellow-800",
  "Reporté Wilaya Erronée": "bg-yellow-100 text-yellow-800",
  "BIZ": "bg-gray-50 text-gray-700",
  "Appel Tel": "bg-cyan-50 text-cyan-700",
  "SMS Envoyé": "bg-teal-50 text-teal-700",
  "Recouvert": "bg-green-100 text-green-800",
};

const orderStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  returned: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

interface ExpeditedOrder {
  _id: string;
  customerName: string;
  customerPhone: string;
  wilayaName: string;
  deliveryType: string;
  subtotal: number;
  shippingCost: number;
  bundleDiscount: number;
  total: number;
  status: string;
  tracking_number: string;
  delivery_status: string;
  delivery_situation: string;
  sent_to_delivery_at: string;
  items: any[];
  notes: string;
  createdAt: string;
}

export default function ExpeditedOrdersPage() {
  const [orders, setOrders] = useState<ExpeditedOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ExpeditedOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ecotrack/expedition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "list-expedited",
          page,
          limit: 20,
          search,
          deliveryStatus,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch expedited orders:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, deliveryStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Status updated to ${status}`);
        fetchOrders();
        setShowDetailModal(false);
      } else {
        showToast("Failed to update", "error");
      }
    } catch {
      showToast("Failed to update", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Expedited Orders</h1>
            <p className="text-sm font-medium text-gray-500">{total} orders sent to delivery</p>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-700">
            Shipping-company expedition actions are disabled
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name, phone, tracking..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <select
            value={deliveryStatus}
            onChange={(e) => { setDeliveryStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            title="Filter by delivery status"
          >
            <option value="">All Delivery Statuses</option>
            {Object.keys(deliveryStatusColors).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Tracking</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Avancement</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Situation</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Order Status</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Sent At</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 font-medium">Loading...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 font-medium">No expedited orders found</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-400 font-medium">{order.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs font-medium">
                        {order.wilayaName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {order.tracking_number}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${deliveryStatusColors[order.delivery_status] || "bg-gray-100 text-gray-600"}`}>
                          {order.delivery_status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${situationColors[order.delivery_situation] || "bg-gray-50 text-gray-600"}`}>
                          {order.delivery_situation || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${orderStatusColors[order.status] || "bg-gray-100"}`}>
                          {order.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">{order.total?.toLocaleString()} DZD</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                        {order.sent_to_delivery_at ? new Date(order.sent_to_delivery_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {/* Mark Delivered */}
                          {order.status !== "delivered" && (
                            <button
                              onClick={() => updateOrderStatus(order._id, "delivered")}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Mark Delivered"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          {/* Mark Returned */}
                          {order.status !== "returned" && order.status !== "delivered" && (
                            <button
                              onClick={() => updateOrderStatus(order._id, "returned")}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Mark Returned"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                            </button>
                          )}
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
              <p className="text-sm font-medium text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm font-medium border rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm font-medium border rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">Order Details</h2>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">Tracking: {selectedOrder.tracking_number}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600" title="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Tracking Badge */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Delivery Tracking</p>
                      <p className="font-mono font-extrabold text-lg text-indigo-700 mt-1">{selectedOrder.tracking_number}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${deliveryStatusColors[selectedOrder.delivery_status] || "bg-gray-100"}`}>
                        {selectedOrder.delivery_status || "Unknown"}
                      </span>
                      {selectedOrder.delivery_situation && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${situationColors[selectedOrder.delivery_situation] || "bg-gray-50 text-gray-600"}`}>
                          {selectedOrder.delivery_situation}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedOrder.sent_to_delivery_at && (
                    <p className="text-xs text-indigo-400 font-medium mt-2">
                      Sent: {new Date(selectedOrder.sent_to_delivery_at).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Customer & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Customer</p>
                    <p className="font-bold text-gray-900 mt-1">{selectedOrder.customerName}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                    <p className="font-bold text-gray-900 mt-1">{selectedOrder.wilayaName}</p>

                  </div>
                </div>

                {/* Status Management */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Order Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["confirmed", "shipped", "delivered", "returned"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateOrderStatus(selectedOrder._id, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedOrder.status === s
                            ? orderStatusColors[s]
                            : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Items ({selectedOrder.items?.length || 0})</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <p className="font-bold text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-500">
                            {item.selectedDimension && `Dimension: ${item.selectedDimension}`}
                            {item.selectedColor && ` | Color: ${item.selectedColor}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">{item.quantity} × {item.unitPrice?.toLocaleString()} DZD</p>
                          <p className="font-bold">{item.total?.toLocaleString()} DZD</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financials */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="font-semibold">{selectedOrder.subtotal?.toLocaleString()} DZD</span>
                  </div>
                  {selectedOrder.bundleDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">Bundle Discount</span>
                      <span className="font-semibold">-{selectedOrder.bundleDiscount.toLocaleString()} DZD</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Shipping ({selectedOrder.deliveryType === "to_home" ? "Home" : "Desk"})</span>
                    <span className="font-semibold">{selectedOrder.shippingCost?.toLocaleString()} DZD</span>
                  </div>
                  <div className="flex justify-between font-extrabold pt-2 border-t border-gray-300">
                    <span>Total</span>
                    <span>{selectedOrder.total?.toLocaleString()} DZD</span>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Notes</p>
                    <p className="text-sm mt-1">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
