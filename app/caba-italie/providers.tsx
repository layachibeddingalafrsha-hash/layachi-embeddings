"use client";

import { SessionProvider } from "next-auth/react";
import { AdminI18nProvider } from "@/lib/admin-i18n";

export function AdminSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchOnWindowFocus={true} refetchInterval={0}>
      <AdminI18nProvider>{children}</AdminI18nProvider>
    </SessionProvider>
  );
}
