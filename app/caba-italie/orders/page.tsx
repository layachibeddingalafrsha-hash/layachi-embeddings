"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { adminAPI, publicAPI } from "@/utils/api-client";
import stopdeskData from "@/app/stopdesk";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  pre_sent: "bg-indigo-100 text-indigo-800",
  sent: "bg-purple-100 text-purple-800",
  shipped: "bg-cyan-100 text-cyan-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  returned: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const allStatuses = [
  "pending", "confirmed", "pre_sent", "sent", "shipped",
  "out_for_delivery", "delivered", "returned", "cancelled",
];

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  wilayaName: string;
  address: string;
  deliveryType: string;
  subtotal: number;
  shippingCost: number;
  bundleDiscount: number;
  total: number;
  status: string;
  paymentStatus: string;
  notes: string;
  tracking_number?: string;
  delivery_status?: string;
  delivery_situation?: string;
  items: any[];
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Order detail / edit modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    customerName: "",
    customerPhone: "",
    address: "",
    commune: "",
    wilayaName: "",
    deliveryType: "",
    notes: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Create order modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productBundles, setProductBundles] = useState<Record<string, any[]>>({});
  const [createForm, setCreateForm] = useState({
    customerName: "",
    customerPhone: "",
    wilayaId: "",
    commune: "",
    address: "",
    deliveryType: "to_home",
    notes: "",
    items: [{ productId: "", quantity: "1", selectedDimension: "", selectedColor: "", unitPrice: "" }],
  });
  const [communeOptions, setCommuneOptions] = useState<string[]>([]);
  const [stopdeskOptions, setStopdeskOptions] = useState<string[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState("");
  const [cancelReason, setCancelReason] = useState("OTHER");
  const [cancelNotes, setCancelNotes] = useState("");

  // Edit modal - wilaya/commune/stopdesk state
  const [editWilayas, setEditWilayas] = useState<any[]>([]);
  const [editCommunes, setEditCommunes] = useState<string[]>([]);
  const [editStopdesks, setEditStopdesks] = useState<string[]>([]);
  const [editLoadingCommunes, setEditLoadingCommunes] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        search,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: string, extra?: any) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      if (res.ok) {
        showToast(`Order status updated to ${status}`);
        fetchOrders();
        if (showDetailModal) {
          setShowDetailModal(false);
        }
      } else {
        showToast("Failed to update status", "error");
      }
    } catch {
      showToast("Failed to update", "error");
    }
  };

  const openEditMode = async (order: Order) => {
    setEditForm({
      customerName: order.customerName || "",
      customerPhone: order.customerPhone || "",
      address: order.address || "",
      commune: (order as any).commune || "",
      wilayaName: order.wilayaName || "",
      deliveryType: order.deliveryType || "to_home",
      notes: order.notes || "",
    });
    setEditMode(true);
    // Load wilayas for edit dropdown
    try {
      const data = await adminAPI.shipping.list();
      setEditWilayas(data.wilayas || []);
      // Find the wilaya by name and load its communes/stopdesks
      const matchedWilaya = (data.wilayas || []).find((w: any) => w.name === order.wilayaName);
      if (matchedWilaya) {
        // Load communes
        try {
          const communes = await publicAPI.location.communes(matchedWilaya.code);
          setEditCommunes(Array.isArray(communes) ? communes : []);
        } catch { setEditCommunes([]); }
        // Load stopdesks (convert code to zero-padded string)
        const codeStr = String(matchedWilaya.code).padStart(2, '0');
        const wilayaStopdesks = stopdeskData.find((w: any) => w.wilaya_code === codeStr);
        setEditStopdesks(wilayaStopdesks?.stopdesks || []);
      }
    } catch {
      setEditWilayas([]);
    }
  };

  const handleEditWilayaChange = async (wilayaId: string) => {
    const selectedWilaya = editWilayas.find((w: any) => w._id === wilayaId);
    const wilayaName = selectedWilaya ? selectedWilaya.name : "";
    const wilayaCode = selectedWilaya?.code || "";
    setEditForm((prev) => ({ ...prev, wilayaName, commune: "" }));
    if (wilayaCode) {
      setEditLoadingCommunes(true);
      try {
        const communes = await publicAPI.location.communes(wilayaCode);
        setEditCommunes(Array.isArray(communes) ? communes : []);
      } catch { setEditCommunes([]); }
      setEditLoadingCommunes(false);
      // Load stopdesks (convert code to zero-padded string)
      const codeStr = String(wilayaCode).padStart(2, '0');
      const wilayaStopdesks = stopdeskData.find((w: any) => w.wilaya_code === codeStr);
      setEditStopdesks(wilayaStopdesks?.stopdesks || []);
    } else {
      setEditCommunes([]);
      setEditStopdesks([]);
    }
  };

  const saveOrderEdit = async () => {
    if (!selectedOrder) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        showToast("Order updated successfully");
        setEditMode(false);
        setShowDetailModal(false);
        fetchOrders();
      } else {
        showToast("Failed to save changes", "error");
      }
    } catch {
      showToast("Failed to save changes", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelSubmit = async () => {
    await updateOrderStatus(cancelOrderId, "cancelled", {
      cancellationReason: cancelReason,
      cancellationNotes: cancelNotes,
    });
    setShowCancelModal(false);
    setCancelReason("OTHER");
    setCancelNotes("");
  };

  // Create order functions
  const fetchWilayas = async () => {
    try {
      const data = await adminAPI.shipping.list();
      setWilayas(data.wilayas || []);
    } catch (error) {
      console.error('Failed to fetch wilayas:', error);
      showToast('Failed to load wilayas', 'error');
    }
  };

  const fetchProducts2 = async () => {
    try {
      const data = await adminAPI.products.list({ limit: 500 });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showToast('Failed to load products', 'error');
    }
  };

  const fetchBundles = async () => {
    try {
      const data = await adminAPI.bundles.list();
      const bundlesByProduct: Record<string, any[]> = {};
      data.bundles?.forEach((bundle: any) => {
        const pid = bundle.productId;
        if (!bundlesByProduct[pid]) bundlesByProduct[pid] = [];
        bundlesByProduct[pid].push(bundle);
      });
      setProductBundles(bundlesByProduct);
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
    }
  };

  const openCreateModal = async () => {
    setCreateForm({
      customerName: "",
      customerPhone: "",
      wilayaId: "",
      commune: "",
      address: "",
      deliveryType: "to_home",
      notes: "",
      items: [{ productId: "", quantity: "1", selectedDimension: "", selectedColor: "", unitPrice: "" }],
    });
    setCommuneOptions([]);
    setShowCreateModal(true);
    await Promise.all([fetchWilayas(), fetchProducts2(), fetchBundles()]);
  };

  const fetchCommuneOptions = async (wilayaId: string) => {
    if (!wilayaId) {
      setCommuneOptions([]);
      setStopdeskOptions([]);
      return;
    }
    setLoadingCommunes(true);
    try {
      // Get the wilaya code from the selected wilaya
      const selectedWilaya = wilayas.find((w: any) => w._id === wilayaId);
      const code = selectedWilaya?.code || "";
      if (code) {
        const communes = await publicAPI.location.communes(code);
        setCommuneOptions(Array.isArray(communes) ? communes : []);
        // Load stopdesks for this wilaya (convert code to zero-padded string)
        const codeStr = String(code).padStart(2, '0');
        const wilayaStopdesks = stopdeskData.find((w: any) => w.wilaya_code === codeStr);
        setStopdeskOptions(wilayaStopdesks?.stopdesks || []);
      } else {
        setCommuneOptions([]);
        setStopdeskOptions([]);
      }
    } catch (error) {
      console.error('Failed to fetch communes:', error);
      setCommuneOptions([]);
      setStopdeskOptions([]);
    } finally {
      setLoadingCommunes(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!createForm.customerName || !createForm.customerPhone || !createForm.wilayaId) {
      showToast("Fill all required fields", "error");
      return;
    }

    const validItems = createForm.items.filter((i) => i.productId);
    if (validItems.length === 0) {
      showToast("Add at least one item", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          items: validItems.map((i) => ({
            ...i,
            quantity: parseInt(i.quantity) || 1,
            unitPrice: i.unitPrice ? parseFloat(i.unitPrice) : undefined,
          })),
        }),
      });
      if (res.ok) {
        showToast("Order created");
        setShowCreateModal(false);
        fetchOrders();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to create", "error");
      }
    } catch {
      showToast("Failed to create order", "error");
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setCreateForm({
      ...createForm,
      items: [...createForm.items, { productId: "", quantity: "1", selectedDimension: "", selectedColor: "", unitPrice: "" }],
    });
  };

  const removeItem = (index: number) => {
    setCreateForm({
      ...createForm,
      items: createForm.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const items = [...createForm.items];
    (items[index] as any)[field] = value;

    // Auto-fill price when product is selected
    if (field === "productId" && value) {
      const product = products.find((p: any) => p._id === value);
      if (product) {
        items[index].unitPrice = String(product.price);
      }
    }

    setCreateForm({ ...createForm, items });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
            <p className="text-sm font-medium text-gray-500">{total} total orders</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openCreateModal} className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700">
              + New Order
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">All Statuses</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</option>
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
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Delivery</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Tracking</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 font-medium">Loading...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 font-medium">No orders found</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-400 font-medium">{order.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {order.wilayaName}{order.address && <><br />{order.address}</>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.deliveryType === "to_home" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                          {order.deliveryType === "to_home" ? "Home" : "Desk"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.items?.length || 0}</td>
                      <td className="px-4 py-3 font-bold">{order.total?.toLocaleString()} DZD</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || "bg-gray-100"}`}>
                          {order.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {order.tracking_number ? (
                          <span className="font-mono text-indigo-600 font-medium">
                            {order.tracking_number}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* View */}
                          <button
                            onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View/Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {/* Confirm */}
                          {order.status === "pending" && (
                            <button
                              onClick={() => updateOrderStatus(order._id, "confirmed")}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Confirm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          {/* Cancel */}
                          {order.status !== "cancelled" && order.status !== "delivered" && (
                            <button
                              onClick={() => { setCancelOrderId(order._id); setShowCancelModal(true); }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Cancel"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
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
                  <h2 className="text-lg font-extrabold text-gray-900">{editMode ? "Edit Order" : "Order Details"}</h2>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!editMode && (
                    <button
                      onClick={() => openEditMode(selectedOrder)}
                      className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Edit order"
                    >
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit
                    </button>
                  )}
                  <button onClick={() => { setShowDetailModal(false); setEditMode(false); }} className="text-gray-400 hover:text-gray-600" title="Close">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Delivery Tracking section */}
                {selectedOrder.tracking_number ? (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Delivery Tracking</p>
                    <p className="font-mono font-extrabold text-lg text-indigo-700 mt-1">{selectedOrder.tracking_number}</p>
                    {selectedOrder.delivery_status && (
                      <p className="text-sm text-indigo-600 mt-2">
                        Status: <span className="font-semibold">{selectedOrder.delivery_status}</span>
                      </p>
                    )}
                  </div>
                ) : null}

                {/* Customer - Editable */}
                {editMode ? (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase">Customer Information</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                        <input
                          type="text"
                          value={editForm.customerName}
                          onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Customer name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                        <input
                          type="text"
                          value={editForm.customerPhone}
                          onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                    {/* Delivery Type - BEFORE location */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Type</label>
                      <div className="flex gap-4">
                        <label className={`flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg border-2 transition-all ${editForm.deliveryType === 'to_home' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                          <input type="radio" name="editDeliveryType" value="to_home" checked={editForm.deliveryType === "to_home"} onChange={(e) => setEditForm({ ...editForm, deliveryType: e.target.value, commune: "" })} />
                          🏠 Home
                        </label>
                        <label className={`flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg border-2 transition-all ${editForm.deliveryType === 'to_desk' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                          <input type="radio" name="editDeliveryType" value="to_desk" checked={editForm.deliveryType === "to_desk"} onChange={(e) => setEditForm({ ...editForm, deliveryType: e.target.value, commune: "" })} />
                          📦 Stop-Desk
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Wilaya</label>
                        <select
                          value={editWilayas.find((w: any) => w.name === editForm.wilayaName)?._id || ""}
                          onChange={(e) => handleEditWilayaChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          title="Select wilaya"
                        >
                          <option value="">Select wilaya</option>
                          {editWilayas.map((w: any) => (
                            <option key={w._id} value={w._id}>{w.code} - {w.name}</option>
                          ))}
                        </select>
                      </div>
                      {editForm.deliveryType === "to_desk" ? (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Stop-Desk *</label>
                          <select
                            value={editForm.commune}
                            onChange={(e) => setEditForm({ ...editForm, commune: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={editLoadingCommunes}
                            title="Select stop-desk"
                          >
                            <option value="">{editLoadingCommunes ? "Loading..." : editStopdesks.length === 0 ? "No stop-desks available" : "Select stop-desk"}</option>
                            {editStopdesks.map((sd) => (
                              <option key={sd} value={sd}>{sd}</option>
                            ))}
                          </select>
                          {editStopdesks.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">{editStopdesks.length} stop-desks available</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Commune</label>
                          <select
                            value={editForm.commune}
                            onChange={(e) => setEditForm({ ...editForm, commune: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={editLoadingCommunes}
                            title="Select commune"
                          >
                            <option value="">{editLoadingCommunes ? "Loading..." : "Select commune"}</option>
                            {editCommunes.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    {/* Address - only for home delivery */}
                    {editForm.deliveryType === "to_home" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Delivery address"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Order notes"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Customer</p>
                      <p className="font-bold text-gray-900 mt-1">{selectedOrder.customerName}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                      <p className="font-bold text-gray-900 mt-1">{selectedOrder.wilayaName}</p>
                      {(selectedOrder as any).commune && <p className="text-sm text-gray-600">{(selectedOrder as any).commune}</p>}
                      {selectedOrder.address && <p className="text-sm text-gray-600">{selectedOrder.address}</p>}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Status</p>
                  <div className="flex flex-wrap gap-1">
                    {allStatuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          if (s === "cancelled") {
                            setCancelOrderId(selectedOrder._id);
                            setShowCancelModal(true);
                          } else {
                            updateOrderStatus(selectedOrder._id, s);
                          }
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          selectedOrder.status === s
                            ? statusColors[s]
                            : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {s.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-gray-500">
                            {item.selectedDimension && `Dimension: ${item.selectedDimension}`}{" "}
                            {item.selectedColor && `| Color: ${item.selectedColor}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p>{item.quantity} × {item.unitPrice?.toLocaleString()} DZD</p>
                          <p className="font-medium">{item.total?.toLocaleString()} DZD</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financials */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{selectedOrder.subtotal?.toLocaleString()} DZD</span>
                  </div>
                  {selectedOrder.bundleDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Bundle Discount</span>
                      <span>-{selectedOrder.bundleDiscount.toLocaleString()} DZD</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping ({selectedOrder.deliveryType === "to_home" ? "Home" : "Desk"})</span>
                    <span>{selectedOrder.shippingCost?.toLocaleString()} DZD</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-gray-300">
                    <span>Total</span>
                    <span>{selectedOrder.total?.toLocaleString()} DZD</span>
                  </div>
                </div>

                {/* Tracking */}
                {selectedOrder.tracking_number && (
                  <div>
                    <p className="text-xs text-gray-500">Tracking Number</p>
                    <p className="font-mono text-sm font-medium">{selectedOrder.tracking_number}</p>
                  </div>
                )}

                {/* Notes (view mode) */}
                {!editMode && selectedOrder.notes && (
                  <div>
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Edit mode footer */}
              {editMode && (
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveOrderEdit}
                    disabled={savingEdit}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="CLIENT_CANCELLED_BY_PHONE">Client Cancelled by Phone</option>
                    <option value="CLIENT_DID_NOT_RESPOND">Client Did Not Respond</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={cancelNotes}
                    onChange={(e) => setCancelNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCancelModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button onClick={handleCancelSubmit} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">Confirm Cancellation</button>
              </div>
            </div>
          </div>
        )}

        {/* Create Order Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">New Order</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600" title="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Customer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input type="text" value={createForm.customerName} onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input type="text" value={createForm.customerPhone} onChange={(e) => setCreateForm({ ...createForm, customerPhone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>

                {/* Delivery Type - BEFORE location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg border-2 transition-all ${createForm.deliveryType === 'to_home' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}">
                      <input type="radio" name="deliveryType" value="to_home" checked={createForm.deliveryType === "to_home"} onChange={(e) => setCreateForm({ ...createForm, deliveryType: e.target.value, commune: "" })} />
                      🏠 Home
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg border-2 transition-all ${createForm.deliveryType === 'to_desk' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}">
                      <input type="radio" name="deliveryType" value="to_desk" checked={createForm.deliveryType === "to_desk"} onChange={(e) => setCreateForm({ ...createForm, deliveryType: e.target.value, commune: "" })} />
                      📦 Stop-Desk
                    </label>
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wilaya *</label>
                    <select
                      value={createForm.wilayaId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCreateForm({ ...createForm, wilayaId: val, commune: "" });
                        fetchCommuneOptions(val);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">Select wilaya</option>
                      {wilayas.map((w: any) => (
                        <option key={w._id} value={w._id}>{w.code} - {w.name}</option>
                      ))}
                    </select>
                  </div>
                  {createForm.deliveryType === "to_desk" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stop-Desk *</label>
                      <select
                        value={createForm.commune}
                        onChange={(e) => setCreateForm({ ...createForm, commune: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        disabled={!createForm.wilayaId || loadingCommunes}
                      >
                        <option value="">
                          {loadingCommunes ? "Loading..." : !createForm.wilayaId ? "Select wilaya first" : stopdeskOptions.length === 0 ? "No stop-desks available" : "Select stop-desk"}
                        </option>
                        {stopdeskOptions.map((sd) => (
                          <option key={sd} value={sd}>{sd}</option>
                        ))}
                      </select>
                      {createForm.wilayaId && stopdeskOptions.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{stopdeskOptions.length} stop-desks available</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                      <select
                        value={createForm.commune}
                        onChange={(e) => setCreateForm({ ...createForm, commune: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        disabled={!createForm.wilayaId || loadingCommunes}
                      >
                        <option value="">{loadingCommunes ? "Loading..." : "Select commune"}</option>
                        {communeOptions.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {/* Address - only for home delivery */}
                {createForm.deliveryType === "to_home" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" value={createForm.address} onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Delivery address" />
                  </div>
                )}

                {/* Items */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Items</h3>
                  {createForm.items.map((item, i) => {
                    const selectedProduct = products.find((p: any) => p._id === item.productId);
                    const bundles = selectedProduct ? productBundles[selectedProduct._id] || [] : [];
                    const quantity = parseInt(item.quantity) || 0;
                    const applicableBundle = bundles
                      .filter((b: any) => b.active && b.quantity <= quantity)
                      .sort((a: any, b: any) => b.quantity - a.quantity)[0];
                    
                    return (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg mb-2 space-y-2">
                        <div className="flex gap-2">
                          <select
                            value={item.productId}
                            onChange={(e) => updateItem(i, "productId", e.target.value)}
                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Select product</option>
                            {products.map((p: any) => (
                              <option key={p._id} value={p._id}>{p.name} - {p.price} DZD</option>
                            ))}
                          </select>
                          <input type="number" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Qty" />
                          <input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", e.target.value)} className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Price" />
                          {createForm.items.length > 1 && (
                            <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-sm" title="Remove item">&times;</button>
                          )}
                        </div>
                        {selectedProduct && (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              {selectedProduct.dimensions?.length > 0 && (
                                <select value={item.selectedDimension} onChange={(e) => updateItem(i, "selectedDimension", e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-xs">
                                  <option value="">Dimension</option>
                                  {selectedProduct.dimensions.map((s: string) => <option key={s} value={s}>{s}</option>)}
                                </select>
                              )}
                              {selectedProduct.colors?.length > 0 && (
                                <select value={item.selectedColor} onChange={(e) => updateItem(i, "selectedColor", e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-xs">
                                  <option value="">Color</option>
                                  {selectedProduct.colors.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                </select>
                              )}
                            </div>
                            
                            {/* Bundle Offers */}
                            {bundles.length > 0 && (
                              <div className="text-xs space-y-1">
                                <p className="font-medium text-gray-600">Bundle Offers:</p>
                                {bundles.map((bundle: any) => (
                                  <div key={bundle._id} className={`flex items-center justify-between px-2 py-1 rounded ${applicableBundle?._id === bundle._id ? 'bg-emerald-100 text-emerald-700 font-medium' : 'bg-white text-gray-600'}`}>
                                    <span>Buy {bundle.quantity}+ items</span>
                                    <span className="font-semibold">-{bundle.discount} DZD</span>
                                  </div>
                                ))}
                                {applicableBundle && (
                                  <p className="text-emerald-600 font-medium">✓ Bundle discount applied: -{applicableBundle.discount} DZD</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={addItem} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">+ Add Item</button>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button onClick={handleCreateOrder} disabled={saving} className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  {saving ? "Creating..." : "Create Order"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
