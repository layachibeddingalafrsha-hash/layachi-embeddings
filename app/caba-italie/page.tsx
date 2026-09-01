"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import Link from "next/link";
import { useAdminI18n } from "@/lib/admin-i18n";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  unreadMessages: number;
  totalStock: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  activeBundles: number;
  todayOrders: number;
  todayRevenue: number;
}

interface RevenueDay {
  date: string;
  revenue: number;
  orders: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  createdAt: string;
  wilayaName: string;
  itemCount: number;
}

interface TopProduct {
  _id: string;
  name: string;
  salesCount: number;
  stockQuantity: number;
  price: number;
  image: string;
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  pre_sent: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  sent: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  shipped: { bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  out_for_delivery: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  returned: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  cancelled: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
};

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [revenueByDay, setRevenueByDay] = useState<RevenueDay[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);
  const { t } = useAdminI18n();

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setStatusDistribution(data.statusDistribution || []);
        setRevenueByDay(data.revenueByDay || []);
        setTopProducts(data.topProducts || []);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Simple revenue chart using canvas
  useEffect(() => {
    if (!chartCanvasRef.current || revenueByDay.length === 0) return;
    const canvas = chartCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cleanup previous
    if (chartInstanceRef.current) {
      chartInstanceRef.current = null;
    }

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const values = revenueByDay.map((d) => d.revenue);
    const maxVal = Math.max(...values, 1);

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = "#9ca3af";
      ctx.font = "600 10px Poppins, sans-serif";
      ctx.textAlign = "right";
      const val = maxVal - (maxVal / 4) * i;
      ctx.fillText(val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toFixed(0), padding.left - 8, y + 4);
    }

    // Plot area fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.15)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0)");

    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    values.forEach((val, i) => {
      const x = padding.left + (chartW / Math.max(values.length - 1, 1)) * i;
      const y = padding.top + chartH - (val / maxVal) * chartH;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    values.forEach((val, i) => {
      const x = padding.left + (chartW / Math.max(values.length - 1, 1)) * i;
      const y = padding.top + chartH - (val / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    values.forEach((val, i) => {
      const x = padding.left + (chartW / Math.max(values.length - 1, 1)) * i;
      const y = padding.top + chartH - (val / maxVal) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X-axis labels (show a few)
    ctx.fillStyle = "#9ca3af";
    ctx.font = "600 9px Poppins, sans-serif";
    ctx.textAlign = "center";
    const step = Math.max(1, Math.floor(revenueByDay.length / 7));
    revenueByDay.forEach((d, i) => {
      if (i % step === 0 || i === revenueByDay.length - 1) {
        const x = padding.left + (chartW / Math.max(values.length - 1, 1)) * i;
        const date = new Date(d.date);
        ctx.fillText(`${date.getDate()}/${date.getMonth() + 1}`, x, h - padding.bottom + 20);
      }
    });

    chartInstanceRef.current = true;
  }, [revenueByDay]);

  const formatCurrency = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M DZD`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K DZD`;
    return `${n.toLocaleString()} DZD`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-sm font-medium text-gray-400 mt-1">{t("dashboard.subtitle")}</p>
        </div>

        {/* ── Primary Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            label={t("dashboard.totalRevenue")}
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            subtitle={`${t("dashboard.today")}: ${formatCurrency(stats?.todayRevenue ?? 0)}`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            gradient="from-emerald-500 to-emerald-600"
            loading={loading}
          />
          <StatCard
            label={t("dashboard.totalOrders")}
            value={stats?.totalOrders ?? 0}
            subtitle={`${t("dashboard.today")}: ${stats?.todayOrders ?? 0} | ${t("dashboard.pending")}: ${stats?.pendingOrders ?? 0}`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            gradient="from-blue-500 to-blue-600"
            loading={loading}
          />
          <StatCard
            label={t("dashboard.products")}
            value={stats?.totalProducts ?? 0}
            subtitle={t("dashboard.stockUnits", (stats?.totalStock ?? 0).toLocaleString())}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            gradient="from-violet-500 to-violet-600"
            loading={loading}
          />
          <StatCard
            label={t("dashboard.messages")}
            value={stats?.unreadMessages ?? 0}
            subtitle={t("dashboard.unreadMessages")}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            gradient="from-rose-500 to-rose-600"
            loading={loading}
          />
        </div>

        {/* ── Stock & Bundles Alert Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AlertCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
            label={t("dashboard.outOfStock")}
            value={stats?.outOfStockProducts ?? 0}
            color="red"
            loading={loading}
          />
          <AlertCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label={t("dashboard.lowStock")}
            value={stats?.lowStockProducts ?? 0}
            color="amber"
            loading={loading}
          />
          <AlertCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
            label={t("dashboard.activeBundles")}
            value={stats?.activeBundles ?? 0}
            color="emerald"
            loading={loading}
          />
        </div>

        {/* ── Revenue Chart + Order Status ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-900">{t("dashboard.revenueTrend")}</h2>
                <p className="text-xs font-medium text-gray-400 mt-0.5">{t("dashboard.last30Days")}</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {t("dashboard.revenue")}
              </div>
            </div>
            <div className="h-64">
              {loading ? (
                <div className="w-full h-full bg-gray-50 rounded-xl animate-pulse" />
              ) : revenueByDay.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                  {t("dashboard.noRevenueData")}
                </div>
              ) : (
                <canvas ref={chartCanvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">{t("dashboard.orderStatus")}</h2>
            <p className="text-xs font-medium text-gray-400 mb-5">{t("dashboard.distributionOverview")}</p>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : statusDistribution.length === 0 ? (
              <p className="text-sm text-gray-400 font-medium">{t("dashboard.noOrders")}</p>
            ) : (
              <div className="space-y-2.5">
                {statusDistribution.map((s) => {
                  const colors = statusColors[s.status] || { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
                  const total = statusDistribution.reduce((a: number, b: any) => a + b.count, 0);
                  const pct = total > 0 ? (s.count / total) * 100 : 0;
                  return (
                    <div key={s.status} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${colors.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${colors.dot} flex-shrink-0`} />
                      <span className={`text-xs font-bold ${colors.text} flex-1 capitalize`}>
                        {s.status.replace(/_/g, " ")}
                      </span>
                      <span className={`text-xs font-extrabold ${colors.text}`}>{s.count}</span>
                      <span className="text-[10px] font-semibold text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Top Products + Recent Orders ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Top Selling Products */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">{t("dashboard.topProducts")}</h2>
                <p className="text-xs font-medium text-gray-400 mt-0.5">{t("dashboard.bySalesCount")}</p>
              </div>
              <Link href="/admin/products" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                {t("dashboard.viewAll")}
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <p className="text-sm text-gray-400 font-medium py-8 text-center">{t("dashboard.noProducts")}</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-extrabold text-gray-500">
                      {i + 1}
                    </span>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs font-semibold text-gray-400">{p.price?.toLocaleString()} DZD</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-gray-900">{p.salesCount}</p>
                      <p className="text-[10px] font-semibold text-gray-400">{t("dashboard.sold")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">{t("dashboard.recentOrders")}</h2>
                <p className="text-xs font-medium text-gray-400 mt-0.5">{t("dashboard.latestOrders")}</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                {t("dashboard.viewAll")}
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">{t("dashboard.customer")}</th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">{t("dashboard.wilaya")}</th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">{t("dashboard.total")}</th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">{t("dashboard.status")}</th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">{t("dashboard.date")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-200 border-t-emerald-600" />
                        </div>
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                        {t("dashboard.noOrders")}
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => {
                      const colors = statusColors[order.status] || { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
                      return (
                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3.5">
                            <p className="font-bold text-gray-900">{order.customerName}</p>
                            <p className="text-xs font-medium text-gray-400">{order.customerPhone}</p>
                          </td>
                          <td className="px-6 py-3.5 font-semibold text-gray-600">{order.wilayaName}</td>
                          <td className="px-6 py-3.5 font-extrabold text-gray-900">{order.total?.toLocaleString()} DZD</td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${colors.bg} ${colors.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                              {order.status?.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-xs font-semibold text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ── Stat Card Component ── */
function StatCard({
  label,
  value,
  subtitle,
  icon,
  gradient,
  loading,
}: {
  label: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
          {loading ? (
            <div className="h-8 w-28 bg-gray-100 rounded-lg animate-pulse mt-2" />
          ) : (
            <p className="text-2xl font-extrabold text-gray-900 mt-1.5 tracking-tight">{value}</p>
          )}
          <p className="text-[11px] font-semibold text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ── Alert Card Component ── */
function AlertCard({
  icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "red" | "amber" | "emerald";
  loading: boolean;
}) {
  const colorMap = {
    red: { bg: "bg-red-50", text: "text-red-700", icon: "text-red-500", border: "border-red-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", icon: "text-amber-500", border: "border-amber-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500", border: "border-emerald-100" },
  };
  const c = colorMap[color];

  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl ${c.bg} border ${c.border}`}>
      <span className={c.icon}>{icon}</span>
      <span className={`text-sm font-bold ${c.text} flex-1`}>{label}</span>
      {loading ? (
        <div className="h-6 w-8 bg-white/50 rounded animate-pulse" />
      ) : (
        <span className={`text-xl font-extrabold ${c.text}`}>{value}</span>
      )}
    </div>
  );
}
