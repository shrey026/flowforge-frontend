"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Members", href: "/members", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

// Matches the item's own route and its sub-routes (e.g. "/projects/123"),
// but never a sibling route — "/members" must never match "/projects".
// A plain `pathname.startsWith(href)` would wrongly match "/projects"
// against a hypothetical "/projects-archive" route; anchoring on the exact
// path or a "/"-terminated prefix avoids that class of bug entirely.
function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar px-3 py-4">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2 px-2 text-base font-semibold tracking-tight text-sidebar-foreground"
      >
        <span className="flex size-7 items-center justify-center rounded-md bg-emerald-600 text-xs font-bold text-white">
          F
        </span>
        FlowForge
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
