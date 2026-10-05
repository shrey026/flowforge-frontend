import type { ReactNode } from "react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pt-6 pb-20">
        <div className="w-full max-w-[22.5rem]">
          <div className="mb-6">
            <h1 className="text-2xl leading-8 font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="glass-surface rounded-2xl border p-5">
            {children}
          </div>

          <p className="mt-5 text-[13px] text-muted-foreground">{footer}</p>
        </div>
      </main>
    </div>
  );
}
