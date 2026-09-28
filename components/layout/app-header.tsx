"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Building2, LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth, useLogout } from "@/lib/hooks/use-auth";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/members": "Members",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  const segment = `/${pathname.split("/").filter(Boolean)[0] ?? ""}`;
  return PAGE_TITLES[segment] ?? "FlowForge";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
  return initials.join("") || "?";
}

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                aria-label="Open navigation"
              />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <AppSidebar onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>

        <h1 className="text-sm font-semibold text-foreground">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Button
          variant="outline"
          size="sm"
          className="hidden items-center gap-1.5 text-muted-foreground sm:inline-flex"
        >
          <Building2 className="size-3.5" />
          My Workspace
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="h-9 gap-2 px-1.5 sm:px-2"
                aria-label="Open user menu"
              />
            }
          >
            <Avatar size="sm">
              <AvatarFallback>
                {user ? getInitials(user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
              {user?.name}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex flex-col gap-0.5 px-2 py-1.5">
              <span className="text-sm font-medium text-foreground">
                {user?.name}
              </span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {user?.email}
              </span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isLoggingOut}
              onClick={() => logout()}
            >
              <LogOut className="size-4" />
              {isLoggingOut ? "Logging out…" : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
