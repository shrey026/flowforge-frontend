"use client";

import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { Plus } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canManageOrganization, type OrganizationRole } from "@/lib/api/organizations";
import { useCreateProject } from "@/lib/hooks/use-projects";

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

interface CreateProjectDialogProps {
  organizationId: string;
  requesterRole: OrganizationRole;
  /**
   * Pass `open` / `onOpenChange` to drive the dialog from elsewhere (the
   * header, the command palette). Left out, the dialog manages itself and
   * renders its own trigger button.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function CreateProjectDialog({
  organizationId,
  requesterRole,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: CreateProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const createProject = useCreateProject(organizationId);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  if (!canManageOrganization(requesterRole)) {
    return null;
  }

  const resetForm = () => {
    setName("");
    setDescription("");
    setNameError(null);
    createProject.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError("Project name is required.");
      return;
    }

    setNameError(null);

    const trimmedDescription = description.trim();

    createProject.mutate(
      {
        name: trimmedName,
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
      },
      {
        onSuccess: () => {
          handleOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger render={<Button />}>
          <Plus />
          New project
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Projects group related work for your team. You can change the
            details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (nameError) setNameError(null);
              }}
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? "project-name-error" : undefined}
              placeholder="Website redesign"
              autoFocus
            />
            {nameError && (
              <p id="project-name-error" className="text-xs text-destructive">
                {nameError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-description">
              Description
              <span className="font-normal text-muted-foreground">
                Optional
              </span>
            </Label>
            <Input
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this project for?"
            />
          </div>

          {createProject.isError && (
            <p role="alert" className="text-[13px] text-destructive">
              {getErrorMessage(
                createProject.error,
                "Couldn't create project."
              )}
            </p>
          )}

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={createProject.isPending}
                />
              }
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating…" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
