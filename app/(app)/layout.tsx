"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { OrganizationProvider } from "@/components/providers/organization-provider";
import { WorkspaceActionsProvider } from "@/components/providers/workspace-actions-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/hooks/use-auth";

/** Mirrors the real shell so the session check doesn't flash an empty page. */
function AppShellSkeleton() {
  return (
    <div
      className="flex h-svh w-full overflow-hidden"
      role="status"
      aria-label="Loading workspace"
    >
      <div className="glass-sidebar hidden w-60 shrink-0 flex-col border-r lg:flex">
        <div className="flex h-12 items-center px-4">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex flex-col gap-3 px-4 pt-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-3 w-16" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 items-center border-b border-border px-5">
          <Skeleton className="h-3.5 w-40" />
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-7 w-64" />
          <Skeleton className="mt-3 h-3.5 w-80 max-w-full" />
          <Skeleton className="mt-10 h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

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
    return <AppShellSkeleton />;
  }

  return (
    <OrganizationProvider>
      <TooltipProvider>
        <WorkspaceActionsProvider>
          <div className="flex h-svh w-full overflow-hidden">
            <aside className="glass-sidebar hidden w-60 shrink-0 border-r lg:block">
              <AppSidebar />
            </aside>

            {/* The column scrolls as a whole so content passes beneath the
                sticky header, which is what makes its glass read as glass. */}
            <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
              <AppHeader />
              <main className="flex-1">
                <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </WorkspaceActionsProvider>
      </TooltipProvider>
    </OrganizationProvider>
  );
}
