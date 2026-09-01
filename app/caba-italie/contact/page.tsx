"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";

interface Message {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  createdAt: string;
}

export default function ContactPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        unreadOnly: String(unreadOnly),
      });
      const res = await fetch(`/api/admin/messages?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAs = async (id: string, field: "isRead" | "isReplied", value: boolean) => {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (res.ok) {
        showToast("Updated");
        setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, [field]: value } : m)));
      }
    } catch {
      showToast("Failed", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Deleted");
        fetchMessages();
      }
    } catch {
      showToast("Failed", "error");
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      // Auto-mark as read
      const msg = messages.find((m) => m._id === id);
      if (msg && !msg.isRead) {
        markAs(id, "isRead", true);
      }
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500">{total} total messages</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1); }}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            Unread only
          </label>
        </div>

        {/* Messages List */}
        <div className="space-y-2">
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center text-gray-400">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center text-gray-400">No messages found</div>
          ) : (
            messages.map((msg) => (
              <div key={msg._id} className={`bg-white rounded-xl border transition-colors ${!msg.isRead ? "border-emerald-300 bg-emerald-50/30" : "border-gray-200"}`}>
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(msg._id)}
                >
                  {/* Unread dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${!msg.isRead ? "bg-emerald-500" : "bg-transparent"}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${!msg.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                        {msg.name}
                      </p>
                      {msg.isReplied && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">Replied</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {msg.subject || msg.message?.substring(0, 80)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === msg._id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === msg._id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 pt-3">
                      <div>
                        <p className="text-xs text-gray-400">Name</p>
                        <p className="text-sm font-medium">{msg.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-sm">{msg.email}</p>
                      </div>
                      {msg.phone && (
                        <div>
                          <p className="text-xs text-gray-400">Phone</p>
                          <p className="text-sm">{msg.phone}</p>
                        </div>
                      )}
                      {msg.subject && (
                        <div>
                          <p className="text-xs text-gray-400">Subject</p>
                          <p className="text-sm">{msg.subject}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">Message</p>
                      <p className="text-sm bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{msg.message}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {!msg.isRead ? (
                        <button onClick={() => markAs(msg._id, "isRead", true)} className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 font-medium">
                          Mark Read
                        </button>
                      ) : (
                        <button onClick={() => markAs(msg._id, "isRead", false)} className="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium">
                          Mark Unread
                        </button>
                      )}
                      {!msg.isReplied ? (
                        <button onClick={() => markAs(msg._id, "isReplied", true)} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">
                          Mark Replied
                        </button>
                      ) : (
                        <button onClick={() => markAs(msg._id, "isReplied", false)} className="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium">
                          Unmark Replied
                        </button>
                      )}
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${msg.subject || "Your message"}`}
                        className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium"
                      >
                        Reply via Email
                      </a>
                      <div className="flex-1" />
                      <button onClick={() => handleDelete(msg._id)} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
