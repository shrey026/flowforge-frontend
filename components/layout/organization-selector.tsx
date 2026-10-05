"use client";

import { ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import { formatEnumLabel, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

function OrganizationGlyph({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-foreground text-[10px] leading-none font-semibold text-background"
    >
      {getInitials(name).charAt(0)}
    </span>
  );
}

const ROW_CLASSES =
  "flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-[13px]";

/** Workspace switcher shown at the top of the sidebar. */
export function OrganizationSelector() {
  const {
    organizations,
    activeOrganization,
    setActiveOrganization,
    isLoading,
    error,
  } = useOrganizationContext();

  if (isLoading) {
    return (
      <div className={ROW_CLASSES} role="status" aria-label="Loading organizations">
        <Skeleton className="size-5" />
        <Skeleton className="h-3.5 w-28" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(ROW_CLASSES, "text-destructive")} role="alert">
        Couldn&apos;t load organizations
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className={cn(ROW_CLASSES, "text-muted-foreground")}>
        No organizations
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Switch organization"
        className={cn(
          ROW_CLASSES,
          "glass-interactive border font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        )}
      >
        {activeOrganization && (
          <OrganizationGlyph name={activeOrganization.name} />
        )}
        <span className="min-w-0 flex-1 truncate">
          {activeOrganization?.name ?? "Select organization"}
        </span>
        <ChevronsUpDown
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <div className="eyebrow px-2 pt-1.5 pb-1">Organizations</div>
        <DropdownMenuRadioGroup
          value={activeOrganization?.id}
          onValueChange={(value) => {
            const organization = organizations.find(
              (item) => item.id === value
            );
            if (organization) {
              setActiveOrganization(organization);
            }
          }}
        >
          {organizations.map((organization) => (
            <DropdownMenuRadioItem
              key={organization.id}
              value={organization.id}
              className="gap-2"
            >
              <OrganizationGlyph name={organization.name} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-foreground">
                  {organization.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatEnumLabel(organization.role)}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
