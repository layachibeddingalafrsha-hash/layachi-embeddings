"use client";

import { useSession, signOut } from "next-auth/react";
import { useAdminI18n } from "@/lib/admin-i18n";

export default function AdminHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { data: session } = useSession();
  const { locale, setLocale, t } = useAdminI18n();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title={t("header.toggleMenu")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-bold text-gray-900">
              {t("header.welcome")}
            </h2>
            <p className="text-xs font-medium text-gray-500">
              {t("header.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
            <button
              onClick={() => setLocale("fr")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                locale === "fr"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLocale("en")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                locale === "en"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              EN
            </button>
          </div>

          {/* Notification bell */}
          <button
            className="relative p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title={t("header.notifications")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-gray-200" />

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">
                {session?.user?.name || t("header.admin")}
              </p>
              <p className="text-xs font-medium text-gray-400">{session?.user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">
                {(session?.user?.name || "A")[0].toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title={t("header.signOut")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
