"use client";

import { Fragment, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import { useWorkspaceActions } from "@/components/providers/workspace-actions-provider";
import { useProjects } from "@/lib/hooks/use-projects";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/members": "Members",
  "/settings": "Settings",
};

interface Crumb {
  label: string;
  href?: string;
  /** Dropped on narrow screens, along with the separator that follows it. */
  collapsible?: boolean;
}

const subscribeToNothing = () => () => {};

/** True on Apple platforms, where the shortcut modifier is ⌘ rather than Ctrl. */
function useIsApplePlatform(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => /Mac|iPhone|iPad/i.test(navigator.platform),
    () => false
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const { activeOrganization } = useOrganizationContext();
  const { projects } = useProjects(activeOrganization?.id);
  const { openCommandPalette, openCreateProject, canCreateProject } =
    useWorkspaceActions();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isApple = useIsApplePlatform();

  const [section, detailId] = pathname.split("/").filter(Boolean);
  const sectionHref = `/${section ?? ""}`;
  const sectionTitle = PAGE_TITLES[sectionHref] ?? "FlowForge";

  const crumbs: Crumb[] = [];
  if (activeOrganization) {
    crumbs.push({ label: activeOrganization.name, collapsible: true });
  }
  if (sectionHref === "/projects" && detailId) {
    crumbs.push({ label: sectionTitle, href: sectionHref });
    crumbs.push({
      label:
        projects.find((project) => project.id === detailId)?.name ?? "Project",
    });
  } else {
    crumbs.push({ label: sectionTitle });
  }

  return (
    <header className="glass-bar sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b px-3 sm:px-5">
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
        <SheetContent
          side="left"
          className="w-64 gap-0 p-0"
          showCloseButton={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <AppSidebar onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-2 text-[13px]">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <Fragment key={`${crumb.label}-${index}`}>
                {index > 0 && (
                  <li
                    aria-hidden="true"
                    className={
                      crumbs[index - 1].collapsible
                        ? "hidden text-muted-foreground/50 sm:block"
                        : "text-muted-foreground/50"
                    }
                  >
                    /
                  </li>
                )}
                <li
                  aria-current={isLast ? "page" : undefined}
                  className={
                    isLast
                      ? "min-w-0 truncate font-medium text-foreground"
                      : crumb.collapsible
                        ? "hidden max-w-40 shrink-0 truncate text-muted-foreground sm:block"
                        : "shrink-0 text-muted-foreground"
                  }
                >
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="rounded-sm transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    crumb.label
                  )}
                </li>
              </Fragment>
            );
          })}
        </ol>
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={openCommandPalette}
          aria-keyshortcuts="Control+K Meta+K"
          className="mr-1 hidden h-8 w-56 items-center gap-2 glass-interactive rounded-md border px-2.5 text-[13px] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/35 md:flex"
        >
          <Search className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-left">Search or jump to…</span>
          <Kbd>{isApple ? "⌘K" : "Ctrl K"}</Kbd>
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label="Search"
          onClick={openCommandPalette}
        >
          <Search />
        </Button>

        {canCreateProject && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="New project"
                  onClick={openCreateProject}
                />
              }
            >
              <Plus />
            </TooltipTrigger>
            <TooltipContent>New project</TooltipContent>
          </Tooltip>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}
