"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Building2,
  CornerDownLeft,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Kbd } from "@/components/ui/kbd";
import { ProjectStatusIcon, formatStatus } from "@/components/project/project-status";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import { useTheme } from "@/components/providers/theme-provider";
import type { ProjectStatus } from "@/lib/api/projects";
import { useLogout } from "@/lib/hooks/use-auth";
import { useProjects } from "@/lib/hooks/use-projects";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  keywords?: string;
  hint?: string;
  icon?: LucideIcon;
  projectStatus?: ProjectStatus;
  run: () => void;
}

interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

const MAX_PROJECT_RESULTS = 8;
const DEFAULT_PROJECT_RESULTS = 5;

function matchesQuery(item: CommandItem, tokens: string[]): boolean {
  const haystack = `${item.label} ${item.keywords ?? ""}`.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canCreateProject: boolean;
  onCreateProject: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  canCreateProject,
  onCreateProject,
}: CommandPaletteProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-black/60" />
        <DialogPrimitive.Popup
          className="fixed top-[12vh] left-1/2 z-50 flex max-h-[min(28rem,76vh)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden glass-popover rounded-2xl border text-popover-foreground transition duration-150 ease-out outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
        >
          <DialogPrimitive.Title className="sr-only">
            Command palette
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search for a page, project or action.
          </DialogPrimitive.Description>
          {/* Mounted only while open, so the query resets on every open. */}
          <CommandPaletteBody
            close={() => onOpenChange(false)}
            canCreateProject={canCreateProject}
            onCreateProject={onCreateProject}
          />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function CommandPaletteBody({
  close,
  canCreateProject,
  onCreateProject,
}: {
  close: () => void;
  canCreateProject: boolean;
  onCreateProject: () => void;
}) {
  const router = useRouter();
  const { organizations, activeOrganization, setActiveOrganization } =
    useOrganizationContext();
  const { projects } = useProjects(activeOrganization?.id);
  const { theme, toggleTheme } = useTheme();
  const { mutate: logout } = useLogout();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hasQuery = tokens.length > 0;

  const navigation: CommandItem[] = [
    {
      id: "nav-overview",
      label: "Go to Overview",
      keywords: "dashboard home",
      icon: LayoutDashboard,
      run: () => router.push("/dashboard"),
    },
    {
      id: "nav-projects",
      label: "Go to Projects",
      icon: FolderKanban,
      run: () => router.push("/projects"),
    },
    {
      id: "nav-tasks",
      label: "Go to Tasks",
      keywords: "board work",
      icon: ListChecks,
      run: () => router.push("/tasks"),
    },
    {
      id: "nav-members",
      label: "Go to Members",
      keywords: "team people roles",
      icon: Users,
      run: () => router.push("/members"),
    },
    {
      id: "nav-settings",
      label: "Go to Settings",
      keywords: "preferences account profile",
      icon: Settings,
      run: () => router.push("/settings"),
    },
  ];

  const actions: CommandItem[] = [
    ...(canCreateProject
      ? [
          {
            id: "action-create-project",
            label: "Create project",
            keywords: "new add",
            icon: Plus,
            run: onCreateProject,
          },
        ]
      : []),
    {
      id: "action-theme",
      label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      keywords: "appearance mode dark light toggle",
      icon: theme === "dark" ? Sun : Moon,
      run: toggleTheme,
    },
    {
      id: "action-logout",
      label: "Log out",
      keywords: "sign out",
      icon: LogOut,
      run: () => logout(),
    },
  ];

  const workspaces: CommandItem[] = organizations
    .filter((organization) => organization.id !== activeOrganization?.id)
    .map((organization) => ({
      id: `org-${organization.id}`,
      label: `Switch to ${organization.name}`,
      keywords: "organization workspace",
      icon: Building2,
      run: () => setActiveOrganization(organization),
    }));

  const projectItems: CommandItem[] = [...projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((project) => ({
      id: `project-${project.id}`,
      label: project.name,
      keywords: `${project.description ?? ""} project ${project.status}`,
      hint: formatStatus(project.status),
      projectStatus: project.status,
      run: () => router.push(`/projects/${project.id}`),
    }));

  const groups: CommandGroup[] = [
    {
      heading: "Projects",
      items: hasQuery
        ? projectItems
            .filter((item) => matchesQuery(item, tokens))
            .slice(0, MAX_PROJECT_RESULTS)
        : projectItems.slice(0, DEFAULT_PROJECT_RESULTS),
    },
    {
      heading: "Navigation",
      items: navigation.filter((item) => matchesQuery(item, tokens)),
    },
    {
      heading: "Actions",
      items: actions.filter((item) => matchesQuery(item, tokens)),
    },
    {
      heading: "Workspaces",
      items: workspaces.filter((item) => matchesQuery(item, tokens)),
    },
  ].filter((group) => group.items.length > 0);

  const flatItems = groups.flatMap((group) => group.items);
  const safeIndex = Math.min(activeIndex, Math.max(flatItems.length - 1, 0));
  const activeItem = flatItems[safeIndex];

  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [safeIndex, query]);

  const runItem = (item: CommandItem) => {
    close();
    item.run();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (flatItems.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((safeIndex + 1) % flatItems.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((safeIndex - 1 + flatItems.length) % flatItems.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(flatItems.length - 1);
    } else if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      runItem(activeItem);
    }
  };

  const indexById = new Map(flatItems.map((item, index) => [item.id, index]));

  return (
    <>
      <div className="flex h-12 shrink-0 items-center gap-2.5 border-b border-border px-4">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-palette-list"
          aria-autocomplete="list"
          aria-activedescendant={
            activeItem ? `command-${activeItem.id}` : undefined
          }
          aria-label="Search pages, projects and actions"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search projects or jump to…"
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        <Kbd>esc</Kbd>
      </div>

      <div
        ref={listRef}
        id="command-palette-list"
        role="listbox"
        aria-label="Results"
        className="min-h-0 flex-1 overflow-y-auto p-1.5"
      >
        {flatItems.length === 0 ? (
          <p className="px-3 py-10 text-center text-[13px] text-muted-foreground">
            No results for &ldquo;{query.trim()}&rdquo;
          </p>
        ) : (
          groups.map((group) => (
            <div
              key={group.heading}
              role="group"
              aria-label={group.heading}
              className="mb-1 last:mb-0"
            >
              <p className="eyebrow px-2.5 pt-2 pb-1" aria-hidden="true">
                {group.heading}
              </p>
              {group.items.map((item) => {
                const index = indexById.get(item.id) ?? 0;
                const isActive = index === safeIndex;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    id={`command-${item.id}`}
                    role="option"
                    aria-selected={isActive}
                    onMouseMove={() => {
                      if (!isActive) setActiveIndex(index);
                    }}
                    onClick={() => runItem(item)}
                    className={cn(
                      "flex h-9 cursor-default items-center gap-2.5 rounded-md px-2.5 text-[13px] text-foreground select-none",
                      isActive && "bg-accent"
                    )}
                  >
                    {item.projectStatus ? (
                      <ProjectStatusIcon status={item.projectStatus} />
                    ) : (
                      Icon && (
                        <Icon
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )
                    )}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.hint && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {item.hint}
                      </span>
                    )}
                    {isActive && (
                      <CornerDownLeft
                        className="size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div className="flex h-9 shrink-0 items-center gap-4 border-t border-border px-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          Navigate
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>↵</Kbd>
          Select
        </span>
        {activeOrganization && (
          <span className="ml-auto truncate">{activeOrganization.name}</span>
        )}
      </div>
    </>
  );
}
