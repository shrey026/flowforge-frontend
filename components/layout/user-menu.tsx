"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, Moon, Settings, Sun } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth, useLogout } from "@/lib/hooks/use-auth";
import { formatEnumLabel, getInitials } from "@/lib/format";

/** Account row pinned to the bottom of the sidebar. */
export function UserMenu({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const { activeOrganization } = useOrganizationContext();
  const { theme, toggleTheme } = useTheme();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        className="flex h-11 w-full items-center gap-2.5 rounded-md px-2 text-left transition-colors duration-150 ease-out outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring/40 aria-expanded:bg-sidebar-accent"
      >
        <Avatar size="sm">
          {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
          <AvatarFallback>{user ? getInitials(user.name) : "?"}</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] leading-4 font-medium text-foreground">
            {user?.name}
          </span>
          {activeOrganization && (
            <span className="truncate text-[11px] leading-4 text-muted-foreground">
              {formatEnumLabel(activeOrganization.role)}
            </span>
          )}
        </span>
        <ChevronsUpDown
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="min-w-56">
        <div className="flex flex-col gap-0.5 px-2 py-1.5">
          <span className="truncate text-[13px] font-medium text-foreground">
            {user?.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {user?.email}
          </span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            onNavigate?.();
            router.push("/settings");
          }}
        >
          <Settings className="text-muted-foreground" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="text-muted-foreground" />
          ) : (
            <Moon className="text-muted-foreground" />
          )}
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onClick={() => logout()}
        >
          <LogOut />
          {isLoggingOut ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
