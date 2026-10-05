"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { MoreHorizontal, Plus, UserMinus, Users } from "lucide-react";

import { Panel, SectionHeader } from "@/components/layout/page-header";
import { AddProjectMemberDialog } from "@/components/project/add-project-member-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { canManageOrganization, type OrganizationRole } from "@/lib/api/organizations";
import type { ProjectDetails, ProjectMemberSummary } from "@/lib/api/projects";
import { formatEnumLabel, getInitials } from "@/lib/format";
import { useOrganizationMembers } from "@/lib/hooks/use-organization-members";
import { useRemoveProjectMember } from "@/lib/hooks/use-projects";

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

export function ProjectMembers({ project }: { project: ProjectDetails }) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const canManage = canManageOrganization(project.requesterRole);

  // Project members carry no role of their own. The label shown on each row
  // is the person's organization role, looked up from the organization's
  // member list.
  const {
    members: organizationMembers,
    isLoading: isRolesLoading,
  } = useOrganizationMembers(project.organizationId);
  const roleByUserId = new Map(
    organizationMembers.map((member) => [member.userId, member.role])
  );

  const addButton = canManage && (
    <Button variant="ghost" size="sm" onClick={() => setAddDialogOpen(true)}>
      <Plus />
      Add member
    </Button>
  );

  return (
    <section aria-labelledby="project-members-heading">
      <SectionHeader
        title={<span id="project-members-heading">Project members</span>}
        meta={project.members.length}
        action={addButton}
        className="mb-2"
      />
      <Panel>
        {project.members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members assigned"
            description={
              canManage
                ? "Assign organization members to this project so they can work on it."
                : "An owner or admin can assign organization members to this project."
            }
            action={
              canManage && (
                <Button size="sm" onClick={() => setAddDialogOpen(true)}>
                  <Plus />
                  Add member
                </Button>
              )
            }
          />
        ) : (
          <ul>
            {project.members.map((member) => (
              <ProjectMemberRow
                key={member.id}
                member={member}
                projectId={project.id}
                projectName={project.name}
                role={roleByUserId.get(member.userId)}
                isRoleLoading={isRolesLoading}
                canManage={canManage}
              />
            ))}
          </ul>
        )}
      </Panel>

      {canManage && (
        <AddProjectMemberDialog
          project={project}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
        />
      )}
    </section>
  );
}

function ProjectMemberRow({
  member,
  projectId,
  projectName,
  role,
  isRoleLoading,
  canManage,
}: {
  member: ProjectMemberSummary;
  projectId: string;
  projectName: string;
  role: OrganizationRole | undefined;
  isRoleLoading: boolean;
  canManage: boolean;
}) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const removeMember = useRemoveProjectMember(projectId);

  return (
    <li className="flex min-h-[60px] items-center gap-3 border-b border-border px-4 py-2.5 transition-colors duration-150 ease-out last:border-0 hover:bg-accent/50">
      <Avatar>
        {member.user.avatarUrl && (
          <AvatarImage src={member.user.avatarUrl} alt="" />
        )}
        <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {member.user.name}
        </p>
        <p className="truncate text-[13px] text-muted-foreground">
          {member.user.email}
        </p>
      </div>

      {role ? (
        <span
          className={
            role === "MEMBER"
              ? "shrink-0 text-[13px] text-muted-foreground"
              : "shrink-0 text-[13px] text-foreground"
          }
        >
          {formatEnumLabel(role)}
        </span>
      ) : (
        isRoleLoading && <Skeleton className="h-3.5 w-12 shrink-0" />
      )}

      {canManage && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${member.user.name}`}
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  removeMember.reset();
                  setRemoveDialogOpen(true);
                }}
              >
                <UserMinus />
                Remove from project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove from project?</DialogTitle>
                <DialogDescription>
                  <span className="font-medium text-foreground">
                    {member.user.name}
                  </span>{" "}
                  will be removed from{" "}
                  <span className="font-medium text-foreground">
                    {projectName}
                  </span>
                  . They&apos;ll stay in the organization.
                </DialogDescription>
              </DialogHeader>
              {removeMember.isError && (
                <p role="alert" className="text-[13px] text-destructive">
                  {getErrorMessage(removeMember.error, "Couldn't remove member.")}
                </p>
              )}
              <DialogFooter>
                <DialogClose
                  render={
                    <Button variant="outline" disabled={removeMember.isPending} />
                  }
                >
                  Cancel
                </DialogClose>
                <Button
                  variant="destructive"
                  disabled={removeMember.isPending}
                  onClick={() =>
                    removeMember.mutate(
                      { userId: member.userId },
                      { onSuccess: () => setRemoveDialogOpen(false) }
                    )
                  }
                >
                  {removeMember.isPending ? "Removing…" : "Remove member"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </li>
  );
}
