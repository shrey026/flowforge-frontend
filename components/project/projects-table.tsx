"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MoreHorizontal, Trash2 } from "lucide-react";

import {
  DeleteProjectDialog,
  ProjectStatusControl,
} from "@/components/project/project-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/lib/api/projects";
import { canManageOrganization, type OrganizationRole } from "@/lib/api/organizations";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

// Shared by the header, rows and skeleton so the columns always line up.
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 px-4 md:grid-cols-[minmax(0,1fr)_9rem_7.5rem_1.75rem]";

interface ProjectsTableProps {
  projects: Project[];
  requesterRole: OrganizationRole;
  organizationId: string;
}

export function ProjectsTable({
  projects,
  requesterRole,
  organizationId,
}: ProjectsTableProps) {
  const canManage = canManageOrganization(requesterRole);

  return (
    <div>
      <ProjectsTableHeader />
      <ul>
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            canManage={canManage}
            organizationId={organizationId}
          />
        ))}
      </ul>
    </div>
  );
}

function ProjectsTableHeader() {
  return (
    <div
      aria-hidden="true"
      className={cn(ROW_GRID, "hidden h-9 border-b border-border md:grid")}
    >
      <span className="eyebrow">Project</span>
      <span className="eyebrow">Status</span>
      <span className="eyebrow">Updated</span>
      <span />
    </div>
  );
}

export function ProjectsTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading projects">
      <ProjectsTableHeader />
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={cn(ROW_GRID, "h-[60px] border-b border-border last:border-0")}
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="hidden h-3 w-16 md:block" />
          <Skeleton className="size-5" />
        </div>
      ))}
    </div>
  );
}

function ProjectRow({
  project,
  canManage,
  organizationId,
}: {
  project: Project;
  canManage: boolean;
  organizationId: string;
}) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const href = `/projects/${project.id}`;

  return (
    <li
      className={cn(ROW_GRID, "min-h-[60px] border-b border-border py-2.5 transition-colors duration-150 ease-out last:border-0 hover:bg-accent/50")}
    >
      <div className="min-w-0">
        <Link
          href={href}
          className="block truncate rounded-sm text-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {project.name}
        </Link>
        <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
          {project.description || "No description"}
        </p>
      </div>

      <ProjectStatusControl
        project={project}
        canManage={canManage}
        organizationId={organizationId}
      />

      <time
        dateTime={project.updatedAt}
        title={formatDate(project.updatedAt)}
        className="hidden truncate text-[13px] text-muted-foreground md:block"
      >
        {formatRelativeTime(project.updatedAt)}
      </time>

      {canManage ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${project.name}`}
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => router.push(href)}>
                <ArrowRight className="text-muted-foreground" />
                Open project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 />
                Delete project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteProjectDialog
            project={project}
            organizationId={organizationId}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      ) : (
        <Link
          href={href}
          aria-label={`Open ${project.name}`}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </li>
  );
}
