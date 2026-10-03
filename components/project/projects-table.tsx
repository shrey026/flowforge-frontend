"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { ChevronsUpDown, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project, ProjectStatus } from "@/lib/api/projects";
import { canManageOrganization, type OrganizationRole } from "@/lib/api/organizations";
import {
  useDeleteProject,
  useUpdateProject,
} from "@/lib/hooks/use-projects";

const PROJECT_STATUSES: ProjectStatus[] = [
  "PLANNING",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
];

function formatStatus(status: ProjectStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function statusBadgeVariant(
  status: ProjectStatus
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "ACTIVE") return "default";
  if (status === "COMPLETED") return "secondary";
  if (status === "ARCHIVED") return "destructive";
  return "outline";
}

function formatCreatedDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden sm:table-cell">Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            canManage={canManage}
            organizationId={organizationId}
          />
        ))}
      </TableBody>
    </Table>
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateProject = useUpdateProject(organizationId);
  const deleteProject = useDeleteProject(organizationId);

  return (
    <TableRow>
      <TableCell className="font-medium text-foreground">
        {project.name}
        <p className="mt-0.5 truncate text-xs text-muted-foreground sm:hidden">
          {project.description || "—"}
        </p>
      </TableCell>

      <TableCell className="hidden max-w-xs truncate text-muted-foreground sm:table-cell">
        {project.description || "—"}
      </TableCell>

      <TableCell>
        {canManage ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updateProject.isPending}
                  className="gap-1"
                />
              }
            >
              {updateProject.isPending
                ? "Updating…"
                : formatStatus(project.status)}
              <ChevronsUpDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={project.status}
                onValueChange={(value) =>
                  updateProject.mutate({
                    projectId: project.id,
                    input: { status: value as ProjectStatus },
                  })
                }
              >
                {PROJECT_STATUSES.map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                    {formatStatus(status)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant={statusBadgeVariant(project.status)}>
            {formatStatus(project.status)}
          </Badge>
        )}
        {updateProject.isError && (
          <p className="mt-1 max-w-40 text-xs text-destructive">
            {getErrorMessage(updateProject.error, "Couldn't update status.")}
          </p>
        )}
      </TableCell>

      <TableCell className="hidden text-muted-foreground md:table-cell">
        {formatCreatedDate(project.createdAt)}
      </TableCell>

      <TableCell className="text-right">
        {canManage && (
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${project.name}`}
                />
              }
            >
              <Trash2 className="size-4" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete project?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {project.name}? This cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              {deleteProject.isError && (
                <p className="text-sm text-destructive">
                  {getErrorMessage(
                    deleteProject.error,
                    "Couldn't delete project."
                  )}
                </p>
              )}
              <DialogFooter>
                <DialogClose
                  render={
                    <Button
                      variant="outline"
                      disabled={deleteProject.isPending}
                    />
                  }
                >
                  Cancel
                </DialogClose>
                <Button
                  variant="destructive"
                  disabled={deleteProject.isPending}
                  onClick={() =>
                    deleteProject.mutate(
                      { projectId: project.id },
                      { onSuccess: () => setDeleteDialogOpen(false) }
                    )
                  }
                >
                  {deleteProject.isPending ? "Deleting…" : "Delete project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </TableCell>
    </TableRow>
  );
}
