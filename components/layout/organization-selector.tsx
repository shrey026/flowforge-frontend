"use client";

import { Building2, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Organization } from "@/lib/api/organizations";
import { useOrganizationContext } from "@/components/providers/organization-provider";

function formatRole(role: Organization["role"]): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

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
      <Button
        variant="outline"
        size="sm"
        disabled
        className="hidden items-center gap-1.5 text-muted-foreground sm:inline-flex"
      >
        <Building2 className="size-3.5" />
        Loading…
      </Button>
    );
  }

  if (error) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="hidden items-center gap-1.5 text-destructive sm:inline-flex"
      >
        <Building2 className="size-3.5" />
        Couldn&apos;t load organizations
      </Button>
    );
  }

  if (organizations.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="hidden items-center gap-1.5 text-muted-foreground sm:inline-flex"
      >
        <Building2 className="size-3.5" />
        No organizations
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="hidden max-w-48 items-center gap-1.5 text-foreground sm:inline-flex"
          />
        }
      >
        <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">
          {activeOrganization?.name ?? "Select organization"}
        </span>
        <ChevronsUpDown className="size-3 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Organizations
        </div>
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
              className="flex-col items-start gap-0"
            >
              <span className="text-sm font-medium text-foreground">
                {organization.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRole(organization.role)}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
