"use client";

import { useState } from "react";
import { CircleAlert, Search, SearchX, Users } from "lucide-react";

import { PageHeader, Panel } from "@/components/layout/page-header";
import {
  MembersTable,
  MembersTableSkeleton,
} from "@/components/organization/members-table";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs, type FilterTabOption } from "@/components/ui/filter-tabs";
import { Input } from "@/components/ui/input";
import type { OrganizationRole } from "@/lib/api/organizations";
import { useAuth } from "@/lib/hooks/use-auth";
import { useOrganizationMembers } from "@/lib/hooks/use-organization-members";

type RoleFilter = "ALL" | OrganizationRole;

const ROLE_FILTERS: { value: OrganizationRole; label: string }[] = [
  { value: "OWNER", label: "Owners" },
  { value: "ADMIN", label: "Admins" },
  { value: "MEMBER", label: "Members" },
];

export default function MembersPage() {
  const { user } = useAuth();
  const { activeOrganization, isLoading: isOrganizationLoading } =
    useOrganizationContext();
  const {
    members,
    requesterRole,
    isLoading,
    error,
    refetch,
  } = useOrganizationMembers(activeOrganization?.id);

  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredMembers = members.filter((member) => {
    if (roleFilter !== "ALL" && member.role !== roleFilter) return false;
    if (!normalizedQuery) return true;
    return (
      member.name.toLowerCase().includes(normalizedQuery) ||
      member.email.toLowerCase().includes(normalizedQuery)
    );
  });

  const filterOptions: FilterTabOption<RoleFilter>[] = [
    { value: "ALL", label: "All", count: members.length },
    ...ROLE_FILTERS.map(({ value, label }) => ({
      value,
      label,
      count: members.filter((member) => member.role === value).length,
    })),
  ];

  const showToolbar =
    Boolean(activeOrganization) && !isLoading && !error && members.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Members"
        description={
          activeOrganization
            ? `People with access to ${activeOrganization.name}, and what they can do.`
            : "Manage members and their roles in this organization."
        }
      />

      {showToolbar && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-end sm:justify-between">
          <FilterTabs
            aria-label="Filter members by role"
            options={filterOptions}
            value={roleFilter}
            onValueChange={setRoleFilter}
            className="sm:flex-1"
          />
          <div className="relative sm:mb-1.5 sm:w-56">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter members"
              aria-label="Filter members by name or email"
              className="pl-8"
            />
          </div>
        </div>
      )}

      <Panel>
        {!activeOrganization ? (
          isOrganizationLoading ? (
            <MembersTableSkeleton />
          ) : (
            <EmptyState
              icon={Users}
              title="No organization selected"
              description="Select an organization to view its members."
            />
          )
        ) : isLoading ? (
          <MembersTableSkeleton />
        ) : error ? (
          <EmptyState
            icon={CircleAlert}
            title="Couldn't load members"
            description="Something went wrong while fetching this organization's members."
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members yet"
            description="This organization doesn't have any members yet."
          />
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No matching members"
            description="Nothing matches the current filters."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRoleFilter("ALL");
                  setQuery("");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <MembersTable
            members={filteredMembers}
            requesterRole={requesterRole ?? "MEMBER"}
            currentUserId={user?.id ?? null}
            organizationId={activeOrganization.id}
          />
        )}
      </Panel>
    </div>
  );
}
