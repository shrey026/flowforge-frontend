"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/lib/hooks/use-auth";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-emerald-50/60 via-background to-background">
      <header className="flex items-center justify-between border-b bg-card px-6 py-4">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            F
          </span>
          FlowForge
        </div>
        <Button
          variant="outline"
          onClick={() => logout()}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out…" : "Logout"}
        </Button>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">
            Welcome, {user.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
      </main>
    </div>
  );
}
