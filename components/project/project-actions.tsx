"use client";

import { isAxiosError } from "axios";
import { ChevronDown } from "lucide-react";

import {
  ProjectStatusIcon,
  ProjectStatusLabel,
  PROJECT_STATUSES,
  formatStatus,
} from "@/components/project/project-status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project, ProjectStatus } from "@/lib/api/projects";
import {
  useDeleteProject,
  useUpdateProject,
} from "@/lib/hooks/use-projects";

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

/**
 * Status of a project. Managers get a menu to change it; everyone else sees
 * it as plain text.
 */
export function ProjectStatusControl({
  project,
  canManage,
  organizationId,
}: {
  project: Pick<Project, "id" | "name" | "status">;
  canManage: boolean;
  organizationId: string;
}) {
  const updateProject = useUpdateProject(organizationId);

  if (!canManage) {
    return <ProjectStatusLabel status={project.status} />;
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              disabled={updateProject.isPending}
              aria-label={`Status of ${project.name}: ${formatStatus(project.status)}. Change status`}
              className="-ml-2 gap-1.5 px-2 font-normal text-foreground"
            />
          }
        >
          <ProjectStatusIcon status={project.status} />
          {updateProject.isPending ? "Updating…" : formatStatus(project.status)}
          <ChevronDown className="size-3 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
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
                <ProjectStatusIcon status={status} />
                {formatStatus(status)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {updateProject.isError && (
        <p role="alert" className="mt-1 max-w-40 text-xs text-destructive">
          {getErrorMessage(updateProject.error, "Couldn't update status.")}
        </p>
      )}
    </div>
  );
}

export function DeleteProjectDialog({
  project,
  organizationId,
  open,
  onOpenChange,
  onDeleted,
}: {
  project: Pick<Project, "id" | "name">;
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const deleteProject = useDeleteProject(organizationId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{project.name}</span>
            ? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deleteProject.isError && (
          <p role="alert" className="text-[13px] text-destructive">
            {getErrorMessage(deleteProject.error, "Couldn't delete project.")}
          </p>
        )}
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" disabled={deleteProject.isPending} />
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
                {
                  onSuccess: () => {
                    onOpenChange(false);
                    onDeleted?.();
                  },
                }
              )
            }
          >
            {deleteProject.isPending ? "Deleting…" : "Delete project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
