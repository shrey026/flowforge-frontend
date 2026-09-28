"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@/lib/hooks/use-auth";

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-svh w-full">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border lg:block">
        <AppSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
