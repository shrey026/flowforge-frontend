"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Plus,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { OrganizationSelector } from "@/components/layout/organization-selector";
import { UserMenu } from "@/components/layout/user-menu";
import { ProjectStatusIcon } from "@/components/project/project-status";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import { useWorkspaceActions } from "@/components/providers/workspace-actions-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/lib/hooks/use-projects";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Members", href: "/members", icon: Users },
] as const;

const MAX_SIDEBAR_PROJECTS = 7;

// Matches the item's own route and its sub-routes (e.g. "/projects/123"),
// but never a sibling route — "/members" must never match "/projects".
// A plain `pathname.startsWith(href)` would wrongly match "/projects"
// against a hypothetical "/projects-archive" route; anchoring on the exact
// path or a "/"-terminated prefix avoids that class of bug entirely.
function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const ITEM_CLASSES =
  "group/nav relative flex h-7 items-center gap-2 rounded-md px-2 text-[13px] text-muted-foreground transition-colors duration-150 ease-out outline-none hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40";

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        ITEM_CLASSES,
        isActive && "bg-sidebar-accent font-medium text-foreground"
      )}
    >
      {/* Accent marker on the sidebar edge; the row itself stays quiet. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 -left-2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-brand transition-opacity duration-150 ease-out",
          isActive ? "opacity-100" : "opacity-0"
        )}
      />
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors duration-150 ease-out",
          isActive
            ? "text-foreground"
            : "text-muted-foreground/80 group-hover/nav:text-foreground"
        )}
        aria-hidden="true"
      />
      {label}
    </Link>
  );
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { activeOrganization, isLoading: isOrganizationLoading } =
    useOrganizationContext();
  const {
    projects,
    isLoading: isProjectsLoading,
    error: projectsError,
  } = useProjects(activeOrganization?.id);
  const { openCreateProject, canCreateProject } = useWorkspaceActions();

  const openProjects = projects
    .filter((project) => project.status !== "ARCHIVED")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const visibleProjects = openProjects.slice(0, MAX_SIDEBAR_PROJECTS);
  const hiddenProjectCount = projects.length - visibleProjects.length;

  return (
    <div className="flex h-full flex-col text-sidebar-foreground">
      <div className="flex h-12 shrink-0 items-center px-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Logo />
        </Link>
      </div>

      <div className="px-2 pb-3">
        <OrganizationSelector />
      </div>

      <nav
        aria-label="Workspace"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-4"
      >
        <p className="eyebrow px-2 pt-2 pb-1.5">Workspace</p>
        <ul className="flex flex-col gap-px">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavItem
                {...item}
                isActive={isNavItemActive(pathname, item.href)}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between pr-1 pl-2">
          <p className="eyebrow py-1.5">Projects</p>
          {canCreateProject && (
            <button
              type="button"
              onClick={() => {
                onNavigate?.();
                openCreateProject();
              }}
              aria-label="New project"
              className="flex size-5 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-150 ease-out outline-none hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {isOrganizationLoading || isProjectsLoading ? (
          <div className="flex flex-col gap-px" aria-hidden="true">
            {[72, 96, 60].map((width) => (
              <div key={width} className="flex h-7 items-center gap-2 px-2">
                <Skeleton className="size-3.5 rounded-full" />
                <Skeleton className="h-3" style={{ width }} />
              </div>
            ))}
          </div>
        ) : projectsError ? (
          <p className="px-2 py-1 text-xs text-muted-foreground">
            Couldn&apos;t load projects
          </p>
        ) : visibleProjects.length === 0 ? (
          <p className="px-2 py-1 text-xs text-muted-foreground">
            {projects.length === 0 ? "No projects yet" : "No open projects"}
          </p>
        ) : (
          <ul className="flex flex-col gap-px">
            {visibleProjects.map((project) => {
              const href = `/projects/${project.id}`;
              const isActive = pathname === href;

              return (
                <li key={project.id}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      ITEM_CLASSES,
                      isActive && "bg-sidebar-accent text-foreground"
                    )}
                  >
                    <ProjectStatusIcon status={project.status} />
                    <span className="truncate">{project.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {hiddenProjectCount > 0 && visibleProjects.length > 0 && (
          <Link
            href="/projects"
            onClick={onNavigate}
            className={cn(ITEM_CLASSES, "mt-px text-xs")}
          >
            View all {projects.length}
          </Link>
        )}
      </nav>

      <div className="flex shrink-0 flex-col gap-px border-t border-(color:--border-glass) p-2">
        <NavItem
          href="/settings"
          label="Settings"
          icon={Settings}
          isActive={isNavItemActive(pathname, "/settings")}
          onNavigate={onNavigate}
        />
        <UserMenu onNavigate={onNavigate} />
      </div>
    </div>
  );
}
