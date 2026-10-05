"use client";

import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { Check, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectDetails } from "@/lib/api/projects";
import { formatEnumLabel, getInitials } from "@/lib/format";
import { useOrganizationMembers } from "@/lib/hooks/use-organization-members";
import { useAddProjectMember } from "@/lib/hooks/use-projects";
import { cn } from "@/lib/utils";

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

type DialogProject = Pick<
  ProjectDetails,
  "id" | "name" | "organizationId" | "members"
>;

interface AddProjectMemberDialogProps {
  project: DialogProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProjectMemberDialog({
  project,
  open,
  onOpenChange,
}: AddProjectMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>
            Choose someone from your organization to add to{" "}
            <span className="font-medium text-foreground">{project.name}</span>.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so search and selection reset each time. */}
        <AddProjectMemberForm
          project={project}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddProjectMemberForm({
  project,
  onDone,
}: {
  project: DialogProject;
  onDone: () => void;
}) {
  const {
    members: organizationMembers,
    isLoading,
    error,
    refetch,
  } = useOrganizationMembers(project.organizationId);
  const addMember = useAddProjectMember(project.id);

  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const assignedUserIds = new Set(project.members.map((member) => member.userId));

  const normalizedQuery = query.trim().toLowerCase();
  const candidates = organizationMembers
    .filter(
      (member) =>
        !normalizedQuery ||
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.email.toLowerCase().includes(normalizedQuery)
    )
    // People who can still be added come first, then alphabetical.
    .sort((a, b) => {
      const aAssigned = assignedUserIds.has(a.userId);
      const bAssigned = assignedUserIds.has(b.userId);
      if (aAssigned !== bAssigned) return aAssigned ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

  const everyoneAssigned =
    organizationMembers.length > 0 &&
    organizationMembers.every((member) => assignedUserIds.has(member.userId));

  // Guards against a selection that became invalid, e.g. the same person was
  // added from another tab while this dialog was open.
  const canSubmit =
    selectedUserId !== null &&
    !assignedUserIds.has(selectedUserId) &&
    !addMember.isPending;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || selectedUserId === null) return;

    addMember.mutate({ userId: selectedUserId }, { onSuccess: onDone });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
          aria-label="Search organization members"
          className="pl-8"
          autoFocus
        />
      </div>

      <div className="h-64 overflow-y-auto rounded-lg border border-(color:--border-glass)">
        {isLoading ? (
          <div role="status" aria-label="Loading organization members">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex h-[52px] items-center gap-3 border-b border-(color:--border-glass) px-3 last:border-0"
              >
                <Skeleton className="size-6 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
          >
            <p className="text-[13px] text-muted-foreground">
              Couldn&apos;t load organization members.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : candidates.length === 0 ? (
          <p className="flex h-full items-center justify-center px-6 text-center text-[13px] text-muted-foreground">
            {normalizedQuery
              ? "No organization members match your search."
              : "This organization has no members to add."}
          </p>
        ) : (
          <div role="radiogroup" aria-label="Organization members">
            {candidates.map((member) => {
              const isAssigned = assignedUserIds.has(member.userId);
              const isSelected = selectedUserId === member.userId;

              return (
                <label
                  key={member.userId}
                  className={cn(
                    "flex min-h-[52px] items-center gap-3 border-b border-(color:--border-glass) px-3 py-2 transition-colors duration-150 ease-out last:border-0 has-focus-visible:bg-accent",
                    isAssigned
                      ? "cursor-not-allowed"
                      : "cursor-pointer hover:bg-accent/60",
                    isSelected && "bg-accent hover:bg-accent"
                  )}
                >
                  <input
                    type="radio"
                    name="project-member"
                    value={member.userId}
                    checked={isSelected}
                    disabled={isAssigned || addMember.isPending}
                    onChange={() => setSelectedUserId(member.userId)}
                    className="sr-only"
                  />
                  <Avatar size="sm" className={cn(isAssigned && "opacity-50")}>
                    {member.avatarUrl && (
                      <AvatarImage src={member.avatarUrl} alt="" />
                    )}
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <span className={cn("min-w-0 flex-1", isAssigned && "opacity-50")}>
                    <span className="block truncate text-[13px] font-medium text-foreground">
                      {member.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {member.email}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs text-muted-foreground",
                      isAssigned && "opacity-50"
                    )}
                  >
                    {formatEnumLabel(member.role)}
                  </span>
                  <span className="flex w-11 shrink-0 justify-end text-xs text-muted-foreground">
                    {isAssigned ? (
                      "Added"
                    ) : isSelected ? (
                      <Check className="size-4 text-brand" aria-hidden="true" />
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {everyoneAssigned && !error && (
        <p className="text-xs text-muted-foreground">
          Everyone in this organization is already on the project.
        </p>
      )}

      {addMember.isError && (
        <p role="alert" className="text-[13px] text-destructive">
          {getErrorMessage(addMember.error, "Couldn't add member.")}
        </p>
      )}

      <DialogFooter className="mt-2">
        <DialogClose
          render={
            <Button
              type="button"
              variant="outline"
              disabled={addMember.isPending}
            />
          }
        >
          Cancel
        </DialogClose>
        <Button type="submit" disabled={!canSubmit}>
          {addMember.isPending ? "Adding…" : "Add member"}
        </Button>
      </DialogFooter>
    </form>
  );
}
