"use client";

import { useState } from "react";
import { CircleAlert, FolderKanban, Plus, Search, SearchX } from "lucide-react";

import { PageHeader, Panel } from "@/components/layout/page-header";
import {
  PROJECT_STATUSES,
  formatStatus,
} from "@/components/project/project-status";
import {
  ProjectsTable,
  ProjectsTableSkeleton,
} from "@/components/project/projects-table";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import { useWorkspaceActions } from "@/components/providers/workspace-actions-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs, type FilterTabOption } from "@/components/ui/filter-tabs";
import { Input } from "@/components/ui/input";
import type { ProjectStatus } from "@/lib/api/projects";
import { useProjects } from "@/lib/hooks/use-projects";

type StatusFilter = "ALL" | ProjectStatus;

export default function ProjectsPage() {
  const { activeOrganization, isLoading: isOrganizationLoading } =
    useOrganizationContext();
  const { projects, isLoading, error, refetch } = useProjects(
    activeOrganization?.id
  );
  const { openCreateProject, canCreateProject } = useWorkspaceActions();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredProjects = projects.filter((project) => {
    if (statusFilter !== "ALL" && project.status !== statusFilter) return false;
    if (!normalizedQuery) return true;
    return (
      project.name.toLowerCase().includes(normalizedQuery) ||
      (project.description ?? "").toLowerCase().includes(normalizedQuery)
    );
  });

  const filterOptions: FilterTabOption<StatusFilter>[] = [
    { value: "ALL", label: "All", count: projects.length },
    ...PROJECT_STATUSES.map((status) => ({
      value: status,
      label: formatStatus(status),
      count: projects.filter((project) => project.status === status).length,
    })),
  ];

  const isFiltering = statusFilter !== "ALL" || normalizedQuery !== "";
  const showToolbar =
    Boolean(activeOrganization) && !isLoading && !error && projects.length > 0;

  const createButton = canCreateProject && (
    <Button onClick={openCreateProject}>
      <Plus />
      New project
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Projects"
        description={
          activeOrganization
            ? `Everything ${activeOrganization.name} is working on.`
            : "Organize and track your team's projects."
        }
        actions={createButton}
      />

      {showToolbar && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-end sm:justify-between">
          <FilterTabs
            aria-label="Filter projects by status"
            options={filterOptions}
            value={statusFilter}
            onValueChange={setStatusFilter}
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
              placeholder="Filter projects"
              aria-label="Filter projects by name"
              className="pl-8"
            />
          </div>
        </div>
      )}

      <Panel>
        {!activeOrganization ? (
          isOrganizationLoading ? (
            <ProjectsTableSkeleton />
          ) : (
            <EmptyState
              icon={FolderKanban}
              title="No organization selected"
              description="Select an organization to view its projects."
            />
          )
        ) : isLoading ? (
          <ProjectsTableSkeleton />
        ) : error ? (
          <EmptyState
            icon={CircleAlert}
            title="Couldn't load projects"
            description="Something went wrong while fetching this organization's projects."
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description={
              canCreateProject
                ? "Create your first project to start organizing your team's work."
                : "Projects created by an owner or admin will appear here."
            }
            action={
              canCreateProject && (
                <Button size="sm" onClick={openCreateProject}>
                  <Plus />
                  Create project
                </Button>
              )
            }
          />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No matching projects"
            description="Nothing matches the current filters."
            action={
              isFiltering && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setQuery("");
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <ProjectsTable
            projects={filteredProjects}
            requesterRole={activeOrganization.role}
            organizationId={activeOrganization.id}
          />
        )}
      </Panel>
    </div>
  );
}
