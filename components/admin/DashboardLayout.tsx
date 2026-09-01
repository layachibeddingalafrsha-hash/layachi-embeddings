"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth is enforced by middleware — no need to block rendering on useSession().
  // AdminHeader internally calls useSession() for display (user name, etc.)
  // and handles the loading case gracefully.

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:ml-64">
        <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
